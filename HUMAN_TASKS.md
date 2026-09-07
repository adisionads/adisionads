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
  - `000_FULL_SETUP.sql` — Master idempotent migration combining the full marketplace schema (profiles, communities, campaigns, tracking, double-entry escrow ledger, wallets, payouts) AND the waitlist in a single file.

---

## Immediate Action: Running the SQL in Supabase

You can choose either of these two options in your Supabase SQL Editor:

### Option A: Waitlist Only (Takes 30 seconds)
If you just want the waitlist live immediately:
1. Open Supabase (`rgivzqyqcrhqafcxbvfd`) $\rightarrow$ Click **SQL Editor** on the left menu.
2. Copy the entire content of [`supabase/migrations/002_waitlist_schema.sql`](file:///c:/Users/1LUV/Documents/Coding%20projects/Adision/supabase/migrations/002_waitlist_schema.sql).
3. Paste and click **Run**.
4. The `public.waitlist` table will be created with country, email, phone, and RLS policies.

### Option B: Full Platform Setup (Recommended — Takes 60 seconds)
If you want the entire platform ready (Waitlist + Marketplace + Escrow Wallets + Campaigns + Tracking):
1. Open Supabase $\rightarrow$ Click **SQL Editor**.
2. Copy the entire content of [`supabase/migrations/000_FULL_SETUP.sql`](file:///c:/Users/1LUV/Documents/Coding%20projects/Adision/supabase/migrations/000_FULL_SETUP.sql).
3. Paste and click **Run**.
4. This sets up all 11 tables, extensions, enums, RLS policies, and atomic stored procedures.

---

## Where Will You See the Waitlist Signups?

You have **two permanent places** to view, manage, and contact everyone who joins:

### 1. In Your Supabase Dashboard (Raw Database & Spreadsheet View)
- Go to [supabase.com](https://supabase.com) and select your project.
- Click **Table Editor** on the left menu (the grid/table icon).
- Click on `waitlist`.
- You will see a live spreadsheet with every person's `full_name`, `email`, `phone` (WhatsApp), `country`, `role`, `company_or_community_name`, `estimated_reach_or_budget`, `position`, `referral_code`, and `created_at`.
- You can search, filter, edit records, or click **Export to CSV**.

### 2. In the Adision Admin Portal
- Visit: `https://adisionads.vercel.app/admin/waitlist` (or locally at `http://localhost:3000/admin/waitlist`).
- Click **VIP Waitlist** from the Admin dashboard.
- Live features:
  - **KPI Cards:** Live counts of Advertisers, Community Partners, and Countries.
  - **Search & Filter:** Search by name, WhatsApp number, email, or country.
  - **Copy WhatsApp Numbers:** 1-click copies all phone numbers formatted for WhatsApp broadcasts.
  - **Export CSV:** 1-click downloads a formatted spreadsheet for your records.

---

## Vercel Environment Variables Configuration

Ensure these are added in your Vercel Dashboard (**Settings** $\rightarrow$ **Environment Variables**) and trigger a redeploy:

```env
NEXT_PUBLIC_APP_URL=https://adisionads.vercel.app

NEXT_PUBLIC_SUPABASE_URL=https://rgivzqyqcrhqafcxbvfd.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXZ6cXlxY3JocWFmY3hidmZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODgzNzI0MzQsImV4cCI6MjEwMzk0ODQzNH0.8-Ckw8fIODKDgWEhI-YPbG4pJambmpq10AqQJUoldCo
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXZ6cXlxY3JocWFmY3hidmZkIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc4ODM3MjQzNCwiZXhwIjoyMTAzOTQ4NDM0fQ.D9kiv4z8Z9Y4723JTt-yRkVs7cTRTejQjPwkvSz-FcU

CLICK_HASH_SALT=adision_prod_hash_salt_9283748291
```

*(Your local `.env.local` has already been populated with these exact credentials).*

---

## Storage Buckets (Optional for Media Placements)
When ready for proof screenshots and verification:
- Go to **Storage** in Supabase.
- Create bucket: `proof-uploads` (Public).
- Create bucket: `verification-docs` (Private).
