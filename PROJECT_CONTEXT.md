# Adision — Master Project & System Context

> **Official Positioning:** Performance-driven Community Advertising Marketplace  
> **Launch Distribution Channel:** WhatsApp Groups & Channels  
> **Tagline:** *"Reach the right communities"*  
> **Brand Identity:** Designed & Owned by **Rektina** (`rektina.com`)  
> **Live Production Domain:** `https://adision.xyz` (Vercel)  
> **Document Version:** 1.1.0 (Live Launch Edition)

---

## 1. Executive Summary & Core Value Proposition

**Adision** connects businesses and advertisers seeking targeted reach with verified owners of digital communities (starting with WhatsApp Groups & Channels in Nigeria).

### The Two-Sided Marketplace
```
┌─────────────────────────────────────────┐          ┌─────────────────────────────────────────┐
│           DEMAND (Advertisers)          │          │       SUPPLY (Community Partners)       │
├─────────────────────────────────────────┤          ├─────────────────────────────────────────┤
│ • Small businesses, startups, creators  │          │ • WhatsApp Group & Channel Admins       │
│ • Frustration: manual DMing, scam risk, │  ──────> │ • Frustration: large audience but zero │
│   zero click analytics, no placement    │  ADISION │   organized/predictable monetization    │
│   verification.                         │  <────── │ • Value: steady ad jobs, auto tracking, │
│ • Value: 1-click campaign, verified     │          │   guaranteed payouts to bank wallet.    │
│   reach, unique click tracking reports. │          │                                         │
└─────────────────────────────────────────┘          └─────────────────────────────────────────┘
```

---

## 2. Infrastructure & Hosting Architecture

- **Hosting Platform:** **Vercel** (`https://adision.xyz`)
- **Framework:** **Next.js 15.5.25** (App Router, Node.js runtime)
- **Database & Auth:** **Supabase** (PostgreSQL 15, Supabase Auth, Row Level Security, RPC functions)
- **Payment Gateway:** **PocketFi** (`pocketfi.ng`) — Live collections via hosted checkout and dynamic virtual accounts.
- **Styling & Design System:** Tailwind CSS, Lucide Icons, Plus Jakarta Sans typography.
- **Brand Identity:** Powered and designed by **Rektina**. Logo stored at `/brand/rektina-logo.jpg`.

---

## 3. Core Operational Flows

### A. Advertiser Campaign & Checkout Flow (PocketFi)
1. Advertiser logs in and navigates to `/advertiser/campaigns/new`.
2. Fills campaign details (Title, Category, WhatsApp Ad Copy, Banner URL, Destination Link, CTA).
3. Selects an outcome-based package (Starter fixed ₦7,000, Corporate ₦350/signup, or Gold Salesman ₦750/customer).
4. Clicks **"Proceed to Payment"**:
   - The server initiates a checkout session with PocketFi (`POST /api/v1/checkout/request`).
   - The user is **immediately redirected to PocketFi's official hosted checkout page** (`https://pocketfi.ng/checkout/PFI|...`).
   - On PocketFi, the advertiser pays via **Debit Card**, **Direct Bank Transfer** (SafeHaven/Kuda with countdown timer), or **USSD**.
5. Once paid, PocketFi redirects back to `https://adision.xyz/advertiser?ref=...&payment_id=...`.
6. The dashboard automatically confirms the payment server-to-server (`/api/campaigns/confirm-payment`) and updates the campaign to `ACTIVE` and `PAID`.
7. Real-time background webhook confirmation is also handled at `/api/webhooks/pocketfi` with cryptographic SHA-512 HMAC verification.

### B. Authentication & Password Recovery Flow
- **Registration:** [`/signup`](/signup) supports multi-role onboarding (`advertiser` vs `community`).
- **Login:** [`/login`](/login) routes users directly to their respective portals (`/admin`, `/advertiser`, or `/partner`).
- **Password Reset:**
  - Users click **"Forgot password?"** on `/login`.
  - Enter email on [`/forgot-password`](/forgot-password).
  - Supabase Auth sends an email with a recovery link.
  - Users set a new password on [`/reset-password`](/reset-password) via `supabase.auth.updateUser`.
- **Waitlist Migration:** Waitlist submissions did not collect passwords. Waitlist users simply visit `/signup` to set their password and begin using the platform.

### C. Community Partner Verification & Payout Flow
1. Group/Channel owners register at `/signup?role=community`.
2. Submit their community at `/partner/communities` (Group/Channel name, category, member count, invite link).
3. Admins review and approve at `/admin/communities`.
4. Once campaigns are active, admins assign ads at `/admin/campaigns`, auto-generating unique tracked links (`/r/[code]`).
5. Partners broadcast the message, copy their tracked link, and submit screenshot proof at `/partner/assignments`.
6. Admins verify proof at `/admin/proofs`, triggering atomic wallet payouts (`approve_proof_and_credit_partner`).
7. Partners request bank withdrawals to any Nigerian bank at `/partner/wallet`.

---

## 4. Admin Portals & Tools

- **Main Admin Dashboard:** `/admin`
- **Live User Directory:** `/admin/users` — Directory of all registered live advertisers and community partners with 1-click WhatsApp messaging and CSV export.
- **Waitlist Database:** `/admin/waitlist` — Original pre-launch waitlist leads with 1-click phone copying and CSV export.
- **Community Approval Queue:** `/admin/communities`
- **Campaign Matchmaking & Assignments:** `/admin/campaigns`
- **Placement Proof Review:** `/admin/proofs`
- **Partner Withdrawal Desk:** `/admin/withdrawals`

---

## 5. Security & Cybersecurity Architecture

1. **Row Level Security (RLS):** Enabled on all 11 PostgreSQL tables in Supabase.
2. **Double-Entry Escrow Ledger:** Immutable financial records in `ledger_transactions` with ACID transaction guarantees.
3. **Bot & Click Fraud Protection:** SHA-256 IP/User-Agent hashing and rate limiting on redirect links (`/r/[code]`).
4. **Webhook Cryptography:** SHA-512 HMAC signature verification on all incoming PocketFi events.
5. **No Fake Simulation in Production:** Strict `NODE_ENV === 'production'` security guard ensures no unauthorized balance manipulation.

---

## 6. SEO & Discoverability

- **Canonical URL:** `https://adision.xyz`
- **Sitemap:** `https://adision.xyz/sitemap.xml`
- **Robots Policy:** `https://adision.xyz/robots.txt`
- **Metadata:** OpenGraph, Twitter Cards, Plus Jakarta Sans font optimization, Rektina author attribution.
- **Search Console:** Configured for rapid 24-48h indexing by Googlebot.

---

## 7. Current Project Status & Completed Milestones

- [x] Production domain `adision.xyz` active with HTTPS on Vercel.
- [x] Full removal of Cloudflare artifacts and clean package dependencies.
- [x] Live PocketFi hosted checkout integration with automated return settlement.
- [x] Forgot Password and Reset Password flows active.
- [x] Rektina brand ownership badges and official logo added.
- [x] Separate `/admin/users` directory for live registered platform users.
- [x] Pre-launch waitlist converted to live launch gateway.
- [x] 0 build or TypeScript compilation errors across all 44 routes.
