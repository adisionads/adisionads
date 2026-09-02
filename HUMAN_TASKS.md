# Adision Human Tasks and Setup Guide

Project Adision Community Advertising Marketplace
Status Architecture and Prototype Ready
Cost Free Tier Supported

---

## Checklist External Accounts and API Keys

### 1 Supabase Database Auth and Media Storage
- Sign up or log in at supabase.com
- Create a new project named adision-db
- Go to Project Settings then API and copy these keys
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
- Open SQL Editor in Supabase
  Copy contents of supabase/migrations/001_initial_schema.sql
  Paste and click Run
- Go to Storage in Supabase
  Create public bucket named proof-uploads
  Create private bucket named verification-docs

---

### 2 PaymentPoint Virtual Accounts and Settlement
- Sign up for a merchant account at paymentpoint.co
- Complete business profile onboarding
- Go to Dashboard then Developer API Settings and copy these keys
  PAYMENTPOINT_API_KEY
  PAYMENTPOINT_BEARER_TOKEN
  PAYMENTPOINT_BUSINESS_ID
  PAYMENTPOINT_WEBHOOK_SECRET
- Set Webhook URL in PaymentPoint dashboard
  Production URL https://your-domain.vercel.app/api/webhooks/paymentpoint

---

### 3 Resend Transactional Email
- Sign up at resend.com
- Go to API Keys and create a new key named RESEND_API_KEY
- Optional add and verify your custom domain or use default testing domain

---

### 4 Vercel Free Hosting
- Log in to vercel.com with your GitHub account
- Import your adision repository
- Add all environment variables to Vercel project settings
- Click Deploy

---

## Local Environment File Setup

Create a file named .env.local in the project root folder

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

PAYMENTPOINT_API_KEY=your_paymentpoint_api_key
PAYMENTPOINT_BEARER_TOKEN=your_paymentpoint_bearer_token
PAYMENTPOINT_BUSINESS_ID=your_paymentpoint_business_id
PAYMENTPOINT_WEBHOOK_SECRET=your_paymentpoint_secret

RESEND_API_KEY=your_resend_api_key

CLICK_HASH_SALT=adision_random_secret_salt_12345
```

---

## Community Pre Seeding Tasks

Before launching ads
- Find 20 to 50 active WhatsApp Group and Channel admins
- Focus on Tech Students Finance and Wholesale groups
- Prepare short onboarding message with guaranteed payouts
- Verify that groups have active chats and not just ghost members
