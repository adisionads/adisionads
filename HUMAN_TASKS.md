# Adision Human Tasks and Setup Guide

Project Adision Community Advertising Marketplace
Status Live on Vercel Build Working
Next Phase Real Database Setup and Environment Keys

---

## What Has Been Completed
- Vercel build successfully compiling and live
- All fake metrics and fabricated numbers removed from website and dashboards
- WhatsApp live preview hidden for now to keep experience clean
- Backend security and webhook signature verification implemented
- Clean empty states added so dashboards are ready for real data

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

### 4 Vercel Environment Configuration
- Open your project on vercel.com
- Go to Settings then Environment Variables
- Add the keys from your Supabase and PaymentPoint dashboards
- Redeploy to connect live services

---

## Local Environment File Template

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

Before launching public ads
- Find 20 to 50 active WhatsApp Group and Channel admins
- Focus on Tech Students Finance and Wholesale groups
- Prepare short onboarding message with guaranteed payouts
- Verify that groups have active chats and not just ghost members
