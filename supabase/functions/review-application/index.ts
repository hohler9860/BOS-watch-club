import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { application_id, action, admin_secret } = await req.json();

    // Validate admin secret
    const expectedSecret = Deno.env.get("ADMIN_SECRET");
    if (!expectedSecret || admin_secret !== expectedSecret) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (!application_id) {
      return new Response(JSON.stringify({ error: "application_id is required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action !== "approve" && action !== "reject") {
      return new Response(JSON.stringify({ error: "action must be 'approve' or 'reject'" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Update application status
    const newStatus = action === "approve" ? "approved" : "rejected";
    const { data: application, error: updateError } = await supabase
      .from("bwc_applications")
      .update({
        status: newStatus,
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", application_id)
      .select()
      .single();

    if (updateError || !application) {
      console.error("Failed to update application:", updateError);
      return new Response(JSON.stringify({ error: "Application not found or update failed" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send appropriate email
    if (action === "approve") {
      await sendApprovalEmail(application.email, application.full_name);
    } else {
      await sendRejectionEmail(application.email, application.full_name);
    }

    return new Response(JSON.stringify({ application }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("review-application error:", err);
    return new Response(JSON.stringify({ error: "Internal server error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

async function sendApprovalEmail(email: string, name: string): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "BOS Watch Club <hello@boswatchclub.com>";

  if (!resendKey) {
    console.error("RESEND_API_KEY not set — skipping approval email");
    return;
  }

  const firstName = name?.split(" ")?.[0] || "there";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
      <h1 style="font-size: 24px; font-weight: 600; margin-bottom: 8px;">Welcome to BOS Watch Club</h1>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        ${firstName},
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        We're pleased to let you know that your application to BOS Watch Club has been accepted.
        You're now part of Boston's premier community of watch enthusiasts and collectors.
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        <strong>What happens next:</strong>
      </p>
      <ul style="font-size: 15px; line-height: 1.9; color: #333; padding-left: 20px;">
        <li>You'll receive a separate email with your access code and account setup instructions</li>
        <li>Use the access code to create your password and complete onboarding</li>
        <li>Once activated, you'll have full access to events, the member dashboard, and our community</li>
      </ul>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        We look forward to welcoming you at our next gathering.
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
        subject: "Welcome to BOS Watch Club 🎉",
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend approval email failed:", res.status, errBody);
    }
  } catch (err) {
    console.error("Failed to send approval email:", err);
  }
}

async function sendRejectionEmail(email: string, name: string): Promise<void> {
  const resendKey = Deno.env.get("RESEND_API_KEY");
  const fromEmail = Deno.env.get("FROM_EMAIL") ?? "BOS Watch Club <hello@boswatchclub.com>";

  if (!resendKey) {
    console.error("RESEND_API_KEY not set — skipping rejection email");
    return;
  }

  const firstName = name?.split(" ")?.[0] || "there";

  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 520px; margin: 0 auto; color: #1a1a2e;">
      <h1 style="font-size: 22px; font-weight: 600; margin-bottom: 8px;">Your BWC Application</h1>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        ${firstName},
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Thank you for your interest in BOS Watch Club. After careful consideration,
        we're unable to offer a membership spot at this time.
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        Our membership is highly curated and spots are limited. This doesn't close
        the door — we encourage you to follow us on Instagram for public events
        and to reapply in the future as new openings become available.
      </p>
      <p style="font-size: 15px; line-height: 1.7; color: #333;">
        We appreciate your interest in what we're building.
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
        subject: "Your BWC Application",
        html,
      }),
    });

    if (!res.ok) {
      const errBody = await res.text();
      console.error("Resend rejection email failed:", res.status, errBody);
    }
  } catch (err) {
    console.error("Failed to send rejection email:", err);
  }
}
