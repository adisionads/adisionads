# Adision Referral System Specification & Architecture Plan

> **Document Version:** 1.0.0  
> **Status:** Planned / Architecture Phase  
> **Target Audience:** Adision Engineering, Founders (Aquila.script & Marvel Develops), and Product Strategy

---

## 1. Executive Summary & Growth Strategy

Adision operates a two-sided marketplace in Nigeria: **Advertisers (Demand)** and **WhatsApp Community Admins (Supply)**. 

Because Nigerian WhatsApp group admins are deeply networked in peer admin groups, a built-in referral system provides the highest ROI, lowest customer acquisition cost (CAC), and fastest viral loop for the platform.

```
Existing Group Admin ──(Shares WhatsApp Link)──> Peer Group Admin
                                                       │
                                                       ▼
                                            Registers Community
                                                       │
                                                       ▼
                                            Adision Admin Verifies
                                                       │
                                                       ▼
                                            Completes 1st Broadcast
                                                       │
                                                       ▼
                                       ┌───────────────────────────────┐
                                       │ ₦500 Wallet Credit to Referrer │
                                       │    100% Zero-Fraud Escrow     │
                                       └───────────────────────────────┘
```

---

## 2. Dual Referral Tracks

To serve both sides of the marketplace, the system features two distinct reward paths:

### Track A: Community Partner $\rightarrow$ Community Partner (Primary Viral Loop)
* **Who refers**: Verified WhatsApp Group / Channel Admins.
* **Who is invited**: Other WhatsApp Group / Channel Admins.
* **Qualifying Event**: The referred admin registers their community, gets verified by Adision, and **completes their first sponsored broadcast with approved screenshot proof**.
* **Reward**: **₦500** credited directly to the referrer's Adision wallet.
* **Why it's fraud-proof**: No reward is paid for empty registrations. A real ad must be broadcasted and verified by Adision staff.

### Track B: Advertiser $\rightarrow$ Advertiser (B2B Demand Loop)
* **Who refers**: Existing advertisers, brand marketers, or founders.
* **Who is invited**: Other businesses, e-commerce sellers, or course creators.
* **Qualifying Event**: The referred advertiser creates their account and **funds their wallet with ₦5,000+ or launches their first campaign**.
* **Reward**: **₦1,000 Campaign Credit** to the referrer and **₦500 Welcome Bonus** to the new advertiser.
* **Why it works**: Subsidizes initial customer acquisition while locking in committed ad spend.

---

## 3. User Experience & One-Tap WhatsApp Virality

### 3.1 Custom Referral Links & Codes
* Every user automatically receives a unique referral code upon signup:
  * Format: `adision.xyz/signup?ref=MARVEL79` or short-link `adision.xyz/r/MARVEL79`.
  * Stored in cookies/localStorage for **30 days** so attribution is never lost if the user signs up later.

### 3.2 One-Tap WhatsApp Share Button
Inside the Partner and Advertiser Dashboards, users see a prominent **"Earn ₦500 per Community"** card with a direct WhatsApp share button:

> **Pre-filled WhatsApp Broadcast Copy:**  
> *"Hey bro! 👋 If you manage an active WhatsApp group or channel, check out Adision. They connect groups with paying Nigerian businesses for flyer broadcasts, with instant bank withdrawals to OPay/PalmPay/Kuda.  
> Register your group with my link here: https://adision.xyz/signup?ref=MARVEL79"*

### 3.3 Dashboard Referral Hub (`/partner/referrals` & `/advertiser/referrals`)
* **Stats Cards**:
  * Total Friends Invited
  * Qualified & Active (Completed 1st task)
  * Total Referral Earnings (₦)
* **Live Referral Tracking Table**:
  * Referral Name / Obfuscated Phone (e.g. `Adewale (*0812***)`)
  * Role (`Partner` / `Advertiser`)
  * Date Joined
  * Status Badge (`Registered` $\rightarrow$ `Verified` $\rightarrow$ `Completed 1st Ad` $\rightarrow$ `Rewarded ₦500`)

---

## 4. Database Schema (Supabase PostgreSQL)

```sql
-- 1. Add referral tracking columns to profiles
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by_code TEXT REFERENCES profiles(referral_code),
ADD COLUMN IF NOT EXISTS referred_by_id UUID REFERENCES profiles(id);

-- Generate random 8-character unique referral code for all users
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := UPPER(SUBSTRING(MD5(RANDOM()::TEXT || CLOCK_TIMESTAMP()::TEXT) FROM 1 FOR 8));
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_generate_referral_code
BEFORE INSERT ON profiles
FOR EACH ROW EXECUTE FUNCTION generate_referral_code();

-- 2. Dedicated Referrals Table
CREATE TABLE IF NOT EXISTS referral_conversions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referral_track TEXT NOT NULL CHECK (referral_track IN ('PARTNER', 'ADVERTISER')),
  status TEXT NOT NULL DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'QUALIFIED', 'REWARDED', 'DISQUALIFIED')),
  reward_amount NUMERIC NOT NULL DEFAULT 500,
  qualifying_event_type TEXT CHECK (qualifying_event_type IN ('FIRST_PROOF_APPROVED', 'FIRST_CAMPAIGN_FUNDED')),
  qualifying_event_id UUID, -- References campaign_id or proof_id
  reward_ledger_tx_id UUID REFERENCES ledger_transactions(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  qualified_at TIMESTAMPTZ,
  rewarded_at TIMESTAMPTZ,
  CONSTRAINT unique_referred_user UNIQUE (referred_user_id)
);

-- 3. Indexes for fast lookup
CREATE INDEX IF NOT EXISTS idx_referral_conversions_referrer ON referral_conversions(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referral_conversions_status ON referral_conversions(status);
```

---

## 5. Automated Reward Settlement Engine

### Step-by-Step Execution:
1. **When an Admin approves a screenshot proof** (`/api/admin/proofs/review`):
   ```ts
   // After proof is approved and partner assignment is marked COMPLETED:
   await checkAndRewardPartnerReferral(partnerUserId, proofId);
   ```
2. **The Settlement Function**:
   * Checks if this is the partner's **first completed assignment**.
   * Checks if `referral_conversions` has a `PENDING` row for this `referred_user_id`.
   * Atomically:
     * Updates `referral_conversions` status to `REWARDED`.
     * Credits `500` to the referrer's `wallets.available_balance`.
     * Inserts an entry into `ledger_transactions`:
       * `transaction_type`: `REFERRAL_REWARD`
       * `direction`: `CREDIT`
       * `amount`: `500`
       * `description`: `Referral reward for verified partner ${referredName}`.

---

## 6. Strict Anti-Fraud & Abuse Protections

1. **Zero Fake Accounts Payout**:
   * Rewards are strictly blocked at registration. A referred user must undergo community verification and successfully broadcast a live ad before any money moves.
2. **Self-Referral IP & Device Lock**:
   * IP addresses, browser fingerprint, and bank account numbers are verified. If Referrer and Referee share the same bank account number or IP subnet on submission, the conversion is flagged for admin review.
3. **Weekly Velocity Limit**:
   * Standard accounts can earn a maximum of **₦15,000/week** (30 successful referrals) before requiring manual staff authorization.
4. **Idempotent Database Locks**:
   * Double-spend protection via PostgreSQL `CONSTRAINT unique_referred_user` ensures one referee can never trigger multiple rewards.

---

## 7. Phased Implementation Roadmap

| Phase | Milestone | Deliverables |
| :--- | :--- | :--- |
| **Phase 1: DB & Tracking** | Data Foundation | Supabase tables (`referral_conversions`), referral code auto-generation, cookie capture on `/signup?ref=...`. |
| **Phase 2: Partner UI** | Referral Hub & Sharing | "Invite an Admin" card in Partner Dashboard with pre-filled WhatsApp share link and referral earnings counter. |
| **Phase 3: Automated Escrow** | Trigger Integration | Connect `/api/admin/proofs/review` and `/api/wallet/fund` to automatically credit referrers upon first completed ad. |
| **Phase 4: Admin Controls** | Oversight & Auditing | Admin tab in `/admin/users` to review referral velocity, top promoters, and flag suspicious duplicate IPs. |

---

*Authored for Adision Production Launch Strategy. Document stored permanently in repository root.*
