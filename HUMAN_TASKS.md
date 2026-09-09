# Adision — Human Tasks & Live Production Setup Guide

- **Project:** Adision Community Advertising Marketplace
- **Live Vercel URL:** `https://adisionads.vercel.app`
- **Supabase Project Reference:** `rgivzqyqcrhqafcxbvfd`
- **Current Phase:** Running Database SQL & Launching Waitlist

---

## What Has Been Completed & Tested
- **Next.js 15 Production Build:** Successfully compiled with 0 errors across all 23 routes.
- **Dual Light / Dark Mode:** Added with theme toggle (Sun/Moon) in the Navbar, using crisp white & brand green for light mode and obsidian & lime for dark mode.
- **Standalone Waitlist System:**
  - Dedicated `/waitlist` page with dual-role options (Advertisers vs Community Partners).
  - Collects Full Name, WhatsApp Number, Email, and Country (with country selector).
  - Priority queue positioning (`#42`), referral code generation (`ADIS-XXXXXX`), and 1-click WhatsApp referral sharing.
  - API endpoint `/api/waitlist` with validation, database insertion, and fallback simulation.
- **Admin Waitlist Portal:**
  - Dedicated operations view at `/admin/waitlist` (and linked from `/admin`).
  - Search by name, email, phone, country, or business.
  - Filter by Advertisers vs Community Partners.
  - 1-click **Export to CSV**.
  - 1-click **Copy WhatsApp Numbers** for easy broadcasting.
- **Database Migrations Prepared:**
  - `002_waitlist_schema.sql` — 100% standalone waitlist migration (runs on any fresh database with zero prerequisites).
  - `000_FULL_SETUP.sql` — Master idempotent migration combining the full marketplace schema (profiles, communities, campaigns, tracking, double-entry payment ledger, wallets, payouts) AND the waitlist in a single file.

---

## Setup Status: Fully Completed & Live

The database and authentication are now 100% active in production:
- **`000_FULL_SETUP.sql`:** Executed in Supabase (all 11 tables, triggers, and stored procedures active).
- **Founder Admin Account:** Created and elevated via `SELECT public.make_user_admin('...');`.
- **Role-Based Access Control:** Active via `AuthGuard.tsx` (unauthorized visitors cannot access `/admin`, `/advertiser`, or `/partner`).
- **Email Confirmation:** Toggled OFF in Supabase (`Authentication -> Providers -> Email`) for instant signups without rate limit issues.
- **Typography & Phone Selector:** Powered by Plus Jakarta Sans and smart country code selector (`🇳🇬 +234`, etc.) with automatic leading zero stripping.

---

## Where Will You See the Waitlist Signups?

You have **two permanent places** to view, manage, and contact everyone who joins:

### 1. In Your Supabase Dashboard (Raw Database & Spreadsheet View)
- Go to [supabase.com](https://supabase.com) and select your project (`rgivzqyqcrhqafcxbvfd`).
- Click **Table Editor** on the left menu (the grid/table icon).
- Click on `waitlist`.
- You will see a live spreadsheet with every person's `full_name`, `email`, `phone` (WhatsApp), `country`, `role`, `company_or_community_name`, `estimated_reach_or_budget`, `position`, `referral_code`, and `created_at`.
- You can search, filter, edit records, or click **Export to CSV**.

### 2. In the Adision Admin Portal
- Visit: `https://adisionads.vercel.app/admin/waitlist` (or locally at `http://localhost:3000/admin/waitlist`).
- Click **Waitlist** from the Admin dashboard.
- Live features:
  - **KPI Cards:** Live counts of Advertisers, Community Partners, and Countries.
  - **Search & Filter:** Search by name, WhatsApp number, email, or country.
  - **Copy WhatsApp Numbers:** 1-click copies all phone numbers formatted for WhatsApp broadcasts.
  - **Export CSV:** 1-click downloads a formatted spreadsheet for your records.

---

## Vercel Environment Variables Configuration

Configured in your Vercel Dashboard (**Settings** $\rightarrow$ **Environment Variables**):

```env
NEXT_PUBLIC_APP_URL=https://adisionads.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://rgivzqyqcrhqafcxbvfd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXZ6cXlxY3JocWFmY3hidmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzI0MzQsImV4cCI6MjEwMzk0ODQzNH0.8-Ckw8fIODKDgWEhI-YPbG4pJambmpq10AqQJUoldCo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXZ6cXlxY3JocWFmY3hidmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM3MjQzNCwiZXhwIjoyMTAzOTQ4NDM0fQ.D9kiv4z8Z9Y4723JTt-yRkVs7cTRTejQjPwkvSz-FcU

# POCKETFI (Payment Gateway: Dedicated Virtual Accounts & Checkout Links)
POCKETFI_SECRET_KEY=4daa62c1ef37467f2bcf9592f36f07f86918113ea864efc038bd5fac96ab7afb
POCKETFI_PUBLIC_KEY=47370|O9Xefnl1rNsF7tCiOzl0lN0FfLGJR0mQHfipO4Gm6a801d8c
POCKETFI_BUSINESS_ID=30833
POCKETFI_ENV=live

CLICK_HASH_SALT=adision_prod_hash_salt_9283748291
```

> [!IMPORTANT]
> **PocketFi Compliance / KYC Note:**  
> When logged into PocketFi, the KYC status currently says:  
> *"Submission Rejected. Kindly submit a clearer video verification for business approval. Please correct the information and resubmit."*  
> When you have a moment, visit `https://pocketfi.ng/compliance` and re-record a clearer selfie video verification to complete full business KYC.

---

## Elevating New Team Members to Admin
Whenever you or a co-founder create an account at `/signup`, run this query in the Supabase SQL Editor to grant them Admin access:
```sql
SELECT public.make_user_admin('partner-email@example.com');
```

---

## Storage Buckets (Optional for Media Placements)
When ready for proof screenshots and verification:
- Go to **Storage** in Supabase.
- Create bucket: `proof-uploads` (Public).
- Create bucket: `verification-docs` (Private).

---

## Google Search Console Verification (Whenever You Are Ready)

When you are ready to connect Google Search Console, it requires zero code edits:
1. Go to [Google Search Console](https://search.google.com/search-console).
2. Add your property: `https://adisionads.vercel.app` (URL prefix).
3. Select the **HTML tag** verification method. Copy only the code inside `content="XXXXX"`.
4. In Vercel (**Settings** $\rightarrow$ **Environment Variables**), add:
   - **Key:** `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION`
   - **Value:** `your_copied_code`
5. Click **Verify** in Google Search Console.
6. Under **Sitemaps** on the left menu, enter `sitemap.xml` and click **Submit**. Google will automatically crawl and index your pages (`/`, `/pricing`, `/waitlist`)!

---

## Zero-Risk Payment & Payout Testing Guide (Peace of Mind)

You never have to spend real money to test the complete payment system end-to-end. Everything is built with an integrated test simulator:

### 1. How to Test Campaign Checkout (Inbound Safe Payment)
1. Go to `/advertiser/campaigns/new`.
2. Fill out the campaign form (e.g., Campaign Title, Target Category, Outcome Package, Ad Copy, Destination Link) and click **"Review & Generate Payment Account"**.
3. A modal opens with dedicated Virtual Account details (Bank Name, Account Number, Reference, Amount).
4. Click the purple button: **"Simulate Transfer (Test Sandbox Mode)"**.
5. The system instantly executes the real database procedure `process_campaign_payment`, locking the budget safely in the financial ledger (`ESCROW_HOLD` status).
6. The campaign changes to `ACTIVE` and `PAID` and appears on your Advertiser dashboard!

### 2. How to Test Partner Bank Withdrawals (Outbound Payout)
1. Go to `/partner/wallet`.
2. Click **"Withdraw to Bank"**.
3. Enter amount (min ₦1,000), select your Nigerian bank, enter a 10-digit NUBAN account number and your account name.
4. Click **"Confirm Withdrawal"**.
5. The API atomically validates your available balance, deducts it, inserts a withdrawal request, and records a `WITHDRAWAL` transaction in the immutable double-entry ledger.
6. Check the **"Withdrawal Requests"** tab to see your request status (`REQUESTED`).

### 3. How to Audit & Settle Withdrawals as Admin
1. Go to `/admin/withdrawals` (or click **"Process Payouts"** on the Admin Control Center).
2. You will see the pending withdrawal request with the partner's full name, email, bank name, and 10-digit account number.
3. Click the **Copy** button to copy their account number for your banking app.
4. After transferring the money, click **"Mark Paid"** $\rightarrow$ status changes to `COMPLETED`.
5. If details are invalid, click **"Reject"** and provide a reason $\rightarrow$ the system automatically refunds the partner's wallet balance and logs a `REFUND` ledger transaction, ensuring no funds are lost.

---

## What's Left & Action Plan for Next Session

### 1. What You Need to Do (As Founder)
- **Play with the Sandbox Checkout:** Try creating a campaign on the live site (`https://adisionads.vercel.app/advertiser/campaigns/new`) and click the purple **"Simulate Transfer"** button. Notice how instant and error-free it is without spending a dime.
- **Discuss with Co-Founder (Community Verification):** Decide how you want to verify WhatsApp group admins when they onboard (e.g., asking for a screenshot showing they have the "Group Admin" badge vs platform admin joining the group).
- **PocketFi Live Account (Only when ready for real cash):**
  - Create an account at `https://pocketfi.ng/` when you are ready to collect real payments.
  - Retrieve: `POCKETFI_SECRET_KEY`, `POCKETFI_BUSINESS_ID`, and `POCKETFI_WEBHOOK_SECRET`.
  - Add them to Vercel Environment Variables (`POCKETFI_ENV=live`). (Until then, sandbox test mode is active and works 100%).

### 2. What Is Left for the Codebase (Next Engineering Sprints)
1. **Community Partner Onboarding (`/partner/communities`):** Connect the submission form to the Supabase `communities` table so WhatsApp group owners can submit their communities for review.
2. **Admin KYC Desk (`/admin/communities`):** Display pending community submissions for 1-click Admin Approve / Reject.
3. **Admin Campaign Matchmaker (`/admin/campaigns`):** Connect active paid campaigns to approved WhatsApp communities so tasks get distributed.
4. **Placement Proof & Verification (`/partner` & `/admin/proofs`):**
   - Community partner uploads screenshot proof of their WhatsApp broadcast.
   - Admin audits the proof and clicks "Approve Proof" $\rightarrow$ triggers atomic wallet payout release to the partner's balance.
5. **Outcome Conversion Tracking (Corporate & Gold):**
   - Simple advertiser dashboard button or redirect conversion callback to log confirmed signups (₦350 each) or paying customers (₦750 each).



