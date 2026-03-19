# BOS Watch Club — Membership Application Backend

## Architecture

```
Visitor (website)
  └─ clicks "Apply Now" → capture-lead edge function
       ├─ saves email to bwc_leads
       └─ returns Typeform URL with ?email= prefilled

Typeform submission
  └─ webhook fires → typeform-webhook edge function
       ├─ validates signature (HMAC SHA-256)
       ├─ saves application to bwc_applications (status: pending)
       └─ sends confirmation email via Resend

Admin review
  └─ POST → review-application edge function
       ├─ validates ADMIN_SECRET
       ├─ updates bwc_applications (status: approved/rejected, reviewed_at)
       └─ sends approval or rejection email via Resend
```

## Setup

### 1. Environment Variables

Copy `.env.example` and fill in your values:

```bash
cp .env.example .env
```

Required variables for edge functions:

| Variable | Source |
|---|---|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API (auto-injected in production) |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API → service_role (auto-injected in production) |
| `WEBHOOK_SECRET` | Typeform → Connect → Webhooks → signing secret |
| `ADMIN_SECRET` | Generate your own (e.g. `openssl rand -hex 32`) |
| `RESEND_API_KEY` | [resend.com](https://resend.com) → API Keys |
| `FROM_EMAIL` | Your verified Resend sender (e.g. `BOS Watch Club <hello@boswatchclub.com>`) |
| `TYPEFORM_URL` | Your Typeform form URL (e.g. `https://form.typeform.com/to/XXXXX`) |

### 2. Run Migrations

Migrations must be applied in order. They create two tables:

1. `bwc_leads` — email capture from the website CTA
2. `bwc_applications` — full Typeform submissions with review status

```bash
# If using Supabase CLI with local dev:
supabase db push

# Or apply manually in order via Supabase SQL Editor:
# 1. supabase/migrations/20260319000001_create_bwc_leads.sql
# 2. supabase/migrations/20260319000002_create_bwc_applications.sql
```

### 3. Deploy Edge Functions

```bash
supabase functions deploy capture-lead
supabase functions deploy typeform-webhook
supabase functions deploy review-application
```

Set secrets for the deployed functions:

```bash
supabase secrets set \
  WEBHOOK_SECRET="your-typeform-webhook-secret" \
  ADMIN_SECRET="your-admin-secret" \
  RESEND_API_KEY="re_your-resend-api-key" \
  FROM_EMAIL="BOS Watch Club <hello@boswatchclub.com>" \
  TYPEFORM_URL="https://form.typeform.com/to/XXXXX"
```

> **Note:** `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` are automatically injected by Supabase in production. You do NOT need to set them via `supabase secrets set`.

### 4. Configure Typeform Hidden Field

Your Typeform must have a **hidden field** called `email` that accepts a URL parameter:

1. Open your form in Typeform
2. Go to **Create** panel → click **+** → select **Hidden Fields**
3. Add a field named `email`
4. This allows the form to receive the pre-filled email via URL: `https://form.typeform.com/to/XXXXX?email=user@example.com`

When `capture-lead` returns the Typeform URL, it appends `?email=user@example.com` so the applicant's email is automatically carried through.

### 5. Add Typeform Webhook

1. Open your form in Typeform
2. Go to **Connect** → **Webhooks**
3. Click **Add a webhook**
4. Set the URL to: `https://<your-project-ref>.supabase.co/functions/v1/typeform-webhook`
5. Copy the **Signing secret** and set it as `WEBHOOK_SECRET` in your Supabase secrets
6. Toggle the webhook **ON**

**Typeform answer field refs** — your form questions must use these `ref` values so the webhook can parse them:

| Field ref | Question type | Maps to |
|---|---|---|
| `full_name` | Short Text | `bwc_applications.full_name` |
| `email` | Email (or hidden field) | `bwc_applications.email` |
| `instagram_handle` | Short Text | `bwc_applications.instagram_handle` |
| `membership_tier` | Multiple Choice (Founder / Enthusiast / Collector / Patron) | `bwc_applications.membership_tier` |
| `referral_source` | Short Text | `bwc_applications.referral_source` |

To set a ref: click a question → go to the question settings → **Ref** field.

## Testing with curl

### capture-lead

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/capture-lead \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{"email": "test@example.com"}'
```

Expected response:
```json
{"url": "https://form.typeform.com/to/XXXXX?email=test%40example.com"}
```

### typeform-webhook

This endpoint is called by Typeform automatically. To test manually (without signature verification, only works if `WEBHOOK_SECRET` is not set):

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/typeform-webhook \
  -H "Content-Type: application/json" \
  -d '{
    "form_response": {
      "hidden": {"email": "test@example.com"},
      "answers": [
        {"field": {"ref": "full_name"}, "text": "John Doe"},
        {"field": {"ref": "instagram_handle"}, "text": "@johndoe"},
        {"field": {"ref": "membership_tier"}, "choice": {"label": "Founder"}},
        {"field": {"ref": "referral_source"}, "text": "Instagram"}
      ]
    }
  }'
```

Expected response:
```json
{"received": true}
```

### review-application (approve)

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/review-application \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{
    "application_id": "<uuid-from-bwc_applications>",
    "action": "approve",
    "admin_secret": "your-admin-secret"
  }'
```

Expected response:
```json
{"application": {"id": "...", "status": "approved", "reviewed_at": "...", ...}}
```

### review-application (reject)

```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/review-application \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <your-anon-key>" \
  -d '{
    "application_id": "<uuid-from-bwc_applications>",
    "action": "reject",
    "admin_secret": "your-admin-secret"
  }'
```

Expected response:
```json
{"application": {"id": "...", "status": "rejected", "reviewed_at": "...", ...}}
```

## Local Development

To test edge functions locally:

```bash
# Start Supabase locally
supabase start

# Serve functions (reads from supabase/.env or .env)
supabase functions serve

# Functions are available at http://localhost:54321/functions/v1/<function-name>
```

## Stack

- **Edge Functions:** TypeScript + Deno (Supabase Edge Runtime)
- **Database:** Supabase (PostgreSQL) with RLS
- **Email:** Resend (plain fetch, no SDK)
- **Forms:** Typeform with hidden fields + webhooks
- **Client:** Supabase JS v2 (service role key only)
