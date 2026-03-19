import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * Typeform Webhook Edge Function
 *
 * Receives Typeform form submissions, stores them in bwc_applications,
 * and sends a confirmation email via Resend.
 *
 * Typeform hidden field "email" must be configured to accept URL param.
 * Answer field refs: full_name, instagram_handle, membership_tier, referral_source
 */

serve(async (req: Request) => {
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    const rawBody = await req.text();

    // Verify Typeform signature
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    if (webhookSecret) {
      const signature = req.headers.get("typeform-signature") ?? "";
      const encoder = new TextEncoder();
      const key = await crypto.subtle.importKey(
        "raw",
        encoder.encode(webhookSecret),
        { name: "HMAC", hash: "SHA-256" },
        false,
        ["sign"],
      );
      const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(rawBody));
      const hash = btoa(String.fromCharCode(...new Uint8Array(sig)));
      const expected = `sha256=${hash}`;

      if (signature !== expected) {
        console.error("Typeform signature verification failed");
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 400,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const payload = JSON.parse(rawBody);
    const formResponse = payload?.form_response;

    if (!formResponse) {
      return new Response(JSON.stringify({ error: "Missing form_response" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const answers = formResponse?.answers ?? [];
    const hidden = formResponse?.hidden ?? {};

    // Extract email from hidden field (pre-filled from capture-lead)
    const email = (hidden?.email as string)?.toLowerCase()?.trim() ?? extractAnswer(answers, "email") ?? "";

    if (!email) {
      console.error("No email found in submission");
      return new Response(JSON.stringify({ error: "No email in submission" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Extract answers with optional chaining — never crash on missing fields
    const fullName = extractAnswer(answers, "full_name") ?? "";
    const instagramHandle = extractAnswer(answers, "instagram_handle") ?? "";
    const membershipTier = extractAnswer(answers, "membership_tier") ?? "";
    const referralSource = extractAnswer(answers, "referral_source") ?? "";

    // Insert into bwc_applications
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    const { error: insertError } = await supabase
      .from("bwc_applications")
      .insert({
        email,
        full_name: fullName,
        instagram_handle: instagramHandle,
        membership_tier: membershipTier,
        referral_source: referralSource,
        status: "pending",
      });

    if (insertError) {
      console.error("Failed to insert application:", insertError);
      return new Response(JSON.stringify({ error: "Failed to save application" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Send confirmation email via Resend
    await sendConfirmationEmail(email, fullName, membershipTier);

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("typeform-webhook error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

// deno-lint-ignore no-explicit-any
function extractAnswer(answers: any[], ref: string): string | undefined {
  const answer = answers?.find((a) => a?.field?.ref === ref);
  if (!answer) return undefined;

  const email = answer?.email as string | undefined;
  const text = answer?.text as string | undefined;
  const choice = answer?.choice?.label as string | undefined;
  const url = answer?.url as string | undefined;

  return email ?? text ?? choice ?? url ?? undefined;
}

async function sendConfirmationEmail(email: string, name: string, tier: string): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "BOS Watch Club <hello@boswatchclub.com>";

  if (!resendKey) {
    console.error("RESEND_API_KEY not set — skipping confirmation email");
    return;
  }

  const firstName = name?.split(" ")?.[0] || "there";
  const tierLine = tier ? `You've applied for our <strong>${tier}</strong> membership.` : "";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
      <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">We've received your application</h1>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Hey ${firstName},
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Thank you for applying to BOS Watch Club. ${tierLine}
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Our team reviews every application personally. You'll hear back from us soon.
      </p>
      <p style="font-size: 14px; color: #666; margin-top: 32px;">
        — The BOS Watch Club Team
      </p>
    </div>
  `;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${resendKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: fromEmail,
        to: email,
        subject: "We've received your BWC application",
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend confirmation email failed:", res.status, errBody);
    }
  } catch (err) {
    console.error("Failed to send confirmation email:", err);
  }
}
