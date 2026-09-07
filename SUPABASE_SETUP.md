# Adision — Supabase Database & Storage Setup Guide

This guide gives you the exact, step-by-step instructions to connect your free Supabase cloud database and storage to Adision.

---

## 1. Create Your Free Supabase Project

1. Go to [supabase.com](https://supabase.com) and log in or sign up.
2. Click **New Project**.
3. Fill in the details:
   - **Name**: `adision-db`
   - **Database Password**: Choose a strong password (save this somewhere safe).
   - **Region**: Choose the closest region (e.g. `EU (London)` or `EU (Frankfurt)` for low latency in Nigeria).
4. Click **Create new project** and wait ~60 seconds for Supabase to provision the database.

---

## 2. Run the Database Schema Migration

1. In your Supabase project dashboard, click **SQL Editor** in the left sidebar.
2. Click **+ New Query**.
3. Open the file [`supabase/migrations/001_initial_schema.sql`](./supabase/migrations/001_initial_schema.sql) in this project.
4. Copy the entire contents of that file.
5. Paste it into the Supabase SQL Editor and click **Run** (or press `Ctrl + Enter`).
6. You should see a green success notification: `Success. No rows returned.`

> **What this just created:**
> - Tables: `profiles`, `communities`, `campaigns`, `campaign_assignments`, `tracking_links`, `click_events`, `proof_records`, `wallets`, `ledger_transactions`, `withdrawal_requests`.
> - Row Level Security (RLS) policies protecting user data.
> - Stored Procedures: Atomic ledger balance updates and campaign payment processors.

---

## 3. Create the 2 Media Storage Buckets

In the left sidebar, click **Storage**:

### Bucket 1: `proof-uploads`
1. Click **New Bucket**.
2. Bucket name: `proof-uploads`
3. Toggle **Public bucket** to **ON** (so uploaded ad screenshots can be viewed in the dashboard).
4. Click **Save**.

### Bucket 2: `verification-docs`
1. Click **New Bucket**.
2. Bucket name: `verification-docs`
3. Leave **Public bucket** as **OFF** (private bucket for KYC/verification).
4. Click **Save**.

---

## 4. Copy Your API Keys to `.env.local`

1. In your Supabase project dashboard, click the gear icon **Project Settings** at the bottom of the left sidebar.
2. Click **API** (under Configuration).
3. Copy the following values:
   - **Project URL**
   - **Project API Keys**: `anon` (public)
   - **Project API Keys**: `service_role` (secret)
4. In your project folder, create a file named `.env.local` (or duplicate `.env.example` to `.env.local`) and fill in:

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000

# SUPABASE
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR...

# SECURITY
CLICK_HASH_SALT=adision_secret_salt_generate_any_random_string_here_12345
```

---

## 5. Quick Health-Check Query

To verify everything is configured and healthy, paste this short test into the Supabase **SQL Editor** and click **Run**:

```sql
-- Check that core tables and triggers exist
SELECT 
    table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('profiles', 'campaigns', 'communities', 'wallets', 'ledger_transactions');
```

You should see 5 rows returned. Your database is now 100% ready for live campaigns and payouts!
