# ADISION — Human Action Items & External Account Setup

> **Note:** This document tracks the external credentials, free accounts, and manual configuration items that **you (the founder / human operator)** will need to set up for ADISION. We will keep this updated as we build.

---

## 📋 Free Accounts Setup Checklist

### 1. GitHub Repository
- [x] Initialize git and push to GitHub remote (`https://github.com/adisionads/website.git`)
- [ ] Connect repository to Vercel for continuous deployment (Free)

### 2. Supabase (Database, Auth, Storage) — 100% Free
- [ ] Sign up at [supabase.com](https://supabase.com) (Free Tier).
- [ ] Create a new project named `adision-db`.
- [ ] Go to **Project Settings > API** and copy:
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (Keep secret! Used for backend ledger & webhooks).
- [ ] (Optional) In **Authentication > Providers**, enable Email and Phone/WhatsApp OTP when ready.

### 3. PaymentPoint (Payment Gateway & Dynamic Virtual Accounts)
- [ ] Sign up for a business/merchant account at [paymentpoint.co](https://paymentpoint.co).
- [ ] Complete basic verification to unlock Sandbox & Live API credentials.
- [ ] Copy from Merchant Dashboard:
  - `PAYMENTPOINT_API_KEY`
  - `PAYMENTPOINT_BEARER_TOKEN`
  - `PAYMENTPOINT_BUSINESS_ID`
  - `PAYMENTPOINT_WEBHOOK_SECRET` (For verifying incoming payment alerts).

### 4. Resend (Transactional Email) — 100% Free
- [ ] Sign up at [resend.com](https://resend.com).
- [ ] Generate an API Key: `RESEND_API_KEY`.
- [ ] (Optional) Add your domain (e.g. `adision.co` or similar) to send emails from `notifications@yourdomain.com`, or use default testing domain.

### 5. Vercel (Hosting & Edge Deployment) — 100% Free
- [ ] Sign up at [vercel.com](https://vercel.com) using your GitHub account.
- [ ] Import the `adisionads/website` repo.
- [ ] Paste your environment variables into Vercel Project Settings when deploying.

---

## 🔑 `.env.local` Credentials Template

When you obtain the keys above, we will put them into your local `.env.local` file (which is git-ignored and never shared publicly):

```env
# APP CONFIG
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SUPABASE (Database, Auth, Storage)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# PAYMENTPOINT (Payment Gateway)
PAYMENTPOINT_API_KEY=your_paymentpoint_api_key
PAYMENTPOINT_BEARER_TOKEN=your_paymentpoint_bearer_token
PAYMENTPOINT_BUSINESS_ID=your_paymentpoint_business_id
PAYMENTPOINT_WEBHOOK_SECRET=your_paymentpoint_secret

# RESEND (Transactional Email)
RESEND_API_KEY=your_resend_api_key

# SECURITY SALT FOR CLICK HASHING
CLICK_HASH_SALT=your_random_secure_salt_string_here
```

---

## 👥 Supply-Side Pre-Seeding (Business Task)
- [ ] Identify 20–50 high-quality WhatsApp groups (Campus, Tech, Jobs, Fashion, Crypto) to be the inaugural verified partners during Beta testing.
- [ ] Prepare standard WhatsApp onboarding message for community admins.

