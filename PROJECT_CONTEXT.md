# ADISION PROJECT & PAYMENT CONTEXT (MASTER REFERENCE)

> **For Any AI Assistant Reading This:**  
> This file contains the complete, unabridged technical and business context for **Adision** (`adision.xyz`). Read this file at the start of any conversation to immediately understand the entire system state, payment architecture, bug history, and pending tasks.

---

## 1. Project Overview & Business Model
* **Product Name:** Adision (Owned by Rektina | Founded by Aquila.script & Marvel Develops)
* **Domain:** [adision.xyz](https://adision.xyz)
* **What it is:** Nigeria's #1 performance advertising marketplace connecting businesses with verified WhatsApp Groups and WhatsApp Channels.
* **Two Core User Types:**
  1. **Advertisers:** Fund their wallet or pay for campaign packages to broadcast flyers/ad copy across targeted Nigerian WhatsApp communities with tracked link clicks and screenshot proof.
  2. **Community Partners (WhatsApp Group Admins):** Register their groups, get verified by admins, accept broadcast tasks, post the ad in their groups, upload timestamped screenshot proof, and withdraw earnings to any Nigerian bank.
* **Staff Admins:** Verify groups, assign campaigns, approve screenshot proof, and approve partner bank withdrawals.

---

## 2. Tech Stack & Infrastructure
* **Framework:** Next.js 15.5+ (App Router), React 19, TypeScript
* **Styling:** Tailwind CSS (Dark/Light mode support)
* **Database & Auth:** Supabase (PostgreSQL with Row Level Security and service role admin)
* **Hosting:** Vercel (`adision.xyz`)
* **Payment Gateway:** **PocketFi** (`api.pocketfi.ng/api/v1`) — Nigerian fintech gateway supporting Debit Card, Direct Bank Transfer, and USSD.

---

## 3. PocketFi Payment Architecture & Credentials

### Environment Variables (`.env.local` & Vercel Production)
```env
NEXT_PUBLIC_APP_URL=https://adision.xyz
POCKETFI_PUBLIC_KEY=47370|O9Xefnl1rNsF7tCiOzl0lN0FfLGJR0mQHfipO4Gm6a801d8c
POCKETFI_SECRET_KEY=4daa62c1ef37467f2bcf9592f36f07f86918113ea864efc038bd5fac96ab7afb
POCKETFI_BUSINESS_ID=30833
POCKETFI_ENV=live
```
> **CRITICAL TOKEN DETAIL:**  
> PocketFi uses Laravel Sanctum tokens in the format `<id>|<hash>` (e.g. `47370|...`). The client in `src/lib/pocketfi/client.ts` automatically detects the token containing `|` to use as the `Authorization: Bearer <token>` header. Passing the 64-character hex secret key will result in `{"message": "Unauthenticated."}`.

### Payment Endpoints
1. **Initialize Wallet Funding:** `POST /api/wallet/fund`
   - Accepts `{ amount: number }` (min. ₦10).
   - Generates unique reference `wlt_<timestamp>_<random>`.
   - Calls PocketFi `POST /api/v1/checkout/request`.
   - **Records a `PENDING` deposit in `ledger_transactions`** with the PocketFi `payment_id` (e.g. `PFI|6011030885`).
   - Returns `{ checkoutUrl, payment_id, reference, amount }` and redirects user to PocketFi.
2. **Auto-Sync / Reconcile:** `POST /api/wallet/sync` & `GET /api/wallet/sync`
   - Automatically executed on Advertiser Dashboard mount/refresh.
   - Finds all `PENDING` deposits for the user in `ledger_transactions`.
   - Calls PocketFi `POST /api/v1/checkout/confirm` with `{ payment_id }`.
   - If PocketFi returns `success` / `completed`:
     - Updates user's `wallets.available_balance` atomically.
     - Updates `ledger_transactions.status = 'COMPLETED'`.
     - Returns updated balance.
3. **Manual Check Status:** `POST /api/wallet/confirm-funding`
   - For modal dialog "I Have Completed Transfer — Check Status" button.
   - Reconciles payment and marks pending transaction completed.
4. **Universal Campaign Confirmation:** `POST /api/campaigns/confirm-payment`
   - Universal return endpoint for PocketFi redirect (`?payment_id=PFI|...`).
   - Checks if `payment_id` belongs to a campaign; if not, automatically credits the user's wallet instead of throwing "Campaign not found".
5. **PocketFi Server Webhook:** `POST /api/webhooks/pocketfi`
   - **Status:** ALREADY ACTIVE AND CONFIGURED in the PocketFi merchant dashboard.
   - Cryptographically verified with SHA-512 HMAC signature using `POCKETFI_SECRET_KEY`.
   - If `reference` starts with `wlt_`: marks `PENDING` deposit `COMPLETED` and updates wallet.
   - If campaign: executes PostgreSQL RPC `process_campaign_payment` to activate campaign and fund escrow.

---

## 4. History of Past Bugs & How They Were Resolved

### Bug 1: PocketFi Strips Custom URL Parameters
* **Problem:** PocketFi discards custom query parameters on redirect (e.g. `ref=wlt_...` or `type=deposit`). PocketFi ONLY appends `?payment_id=PFI|...` to the redirect link.
* **Fix:** All return handlers now take `paymentId` and dynamically check whether it belongs to a campaign or a wallet deposit in the database.

### Bug 2: Delay When Returning Manually From Bank Transfer
* **Problem:** When paying by bank transfer in a bank app, users often close the browser and open `adision.xyz` manually without URL parameters.
* **Fix:** We implemented `/api/wallet/sync`. Every time the user opens or refreshes the dashboard, Adision queries PocketFi for any pending deposits and auto-credits the balance.

### Bug 3: The Idempotency Bug (Found & Fixed)
* **Problem:** In `/api/wallet/confirm-funding` and `/api/webhooks/pocketfi`, the code checked:
  `select('id').eq('reference_type', 'POCKETFI_DEPOSIT').ilike('description', %paymentKey%).maybeSingle()`
  WITHOUT checking `.eq('status', 'COMPLETED')`.
  Because `/api/wallet/fund` had already created a `PENDING` row, this query matched the `PENDING` row, thought the deposit was already finished, and exited without updating the wallet!
* **Fix:** Updated the check to `.eq('status', 'COMPLETED')`. If a `PENDING` row exists, it updates that pending row to `COMPLETED` and adds the funds to `wallets.available_balance`.

### Bug 4: React Hydration Error #418
* **Problem:** `WhatsAppMockup.tsx` called `new Date().toLocaleTimeString()` in the render body. The server (UTC) and client (WAT GMT+1) rendered different text, throwing React error 418.
* **Fix:** Replaced with static `'09:41'` (standard smartphone mockup time). Also added `isMounted` guard to `Navbar.tsx` and timezone consistency to `formatDate`.

### Bug 5: Mobile Horizontal Overflow
* **Problem:** Wide 6-column tables and default viewports allowed side-scrolling on phones.
* **Fix:** 
  - Added `overflow-x: hidden; max-width: 100vw; width: 100%;` in `globals.css` and `layout.tsx`.
  - Added responsive mobile cards (`block md:hidden`) on both Advertiser and Partner dashboards so tables are replaced with native mobile cards on phones.

---

## 5. Current Live Account State (Founder Test Account)
* **Email:** `marvellousadepoju79@gmail.com`
* **User ID:** `baaed9cc-6661-4f44-b9b0-a0d0eb31179b`
* **Role:** `ADVERTISER`
* **Wallet ID:** `a171eef9-85e5-4d64-9118-58f2fab62479`
* **Wallet Balance:** ₦76.00
* **Campaigns in DB:**
  - `dc8eeecd-134d-4bf0-b1cd-0781559d428b`: Title "test" (Budget: ₦50, Status: ACTIVE, Payment: PAID)
  - `19e13ec4-436d-45dd-a595-750aa351f857`: Title "oijggh" (Budget: ₦11, Status: ACTIVE, Payment: PAID)

---

## 6. Campaign Packages State
1. **Founder Test (₦11):** Temporary test package for founder testing (`pkg_test_11`).
2. **Starter (₦7,000):** Fixed 14-day + 1 bonus day broadcast package for WhatsApp reach.
3. **Corporate (₦350/signup):** Performance package with user-defined target signups.
4. **Gold Salesman (₦750/paying customer):** Performance package with user-defined customer target.
> *Note:* The Founder Test package can be removed from `src/lib/constants.ts` once testing is finished.

---

## 7. Immediate Next Steps For Tomorrow
1. **Automated End-to-End Test:**
   - Log in as advertiser.
   - Click "Fund Wallet" $\rightarrow$ select ₦10 or ₦11 $\rightarrow$ pay via PocketFi.
   - Verify that the wallet balance updates automatically on screen without ANY manual database updates or terminal scripts.
2. **PocketFi Webhook Verification:**
   - In PocketFi Dashboard $\rightarrow$ Settings $\rightarrow$ Webhooks, verify URL is `https://adision.xyz/api/webhooks/pocketfi`.
3. **Launch Ops:**
   - Submit `sitemap.xml` in Google Search Console.
   - Broadcast to waitlist users from `adision.xyz/admin/waitlist`.
