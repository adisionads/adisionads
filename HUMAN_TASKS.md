# Adision — Quick Founder Guide

- **Live Website:** [adisionads.vercel.app](https://adisionads.vercel.app)
- **Admin Waitlist Desk:** [adisionads.vercel.app/admin/waitlist](https://adisionads.vercel.app/admin/waitlist)
- **Supabase Project:** `rgivzqyqcrhqafcxbvfd`

---

## ⚠️ Action Items for You (Founder)

### 1. Re-record PocketFi Selfie Video (2 minutes)
- Go to: [pocketfi.ng/compliance](https://pocketfi.ng/compliance)
- PocketFi rejected the previous selfie video because it wasn't clear enough.
- Re-record a clear selfie video at **Step 5** so they approve live business payouts.

### 2. Add PocketFi Keys to Vercel
In your **Vercel Dashboard** $\rightarrow$ **Settings** $\rightarrow$ **Environment Variables**, add:

```env
POCKETFI_SECRET_KEY=4daa62c1ef37467f2bcf9592f36f07f86918113ea864efc038bd5fac96ab7afb
POCKETFI_PUBLIC_KEY=47370|O9Xefnl1rNsF7tCiOzl0lN0FfLGJR0mQHfipO4Gm6a801d8c
POCKETFI_BUSINESS_ID=30833
POCKETFI_ENV=live
```

---

## 👥 How to View Your Waitlist Signups

You have **2 places** to view your real registrations:
1. **Adision Admin Desk:** [adisionads.vercel.app/admin/waitlist](https://adisionads.vercel.app/admin/waitlist)
   - Group Owners and Advertisers are in **two separate tables**.
   - 1-click **"Copy Group Admins WhatsApp"** or **"Copy Advertisers WhatsApp"**.
   - 1-click **Export CSV**.
2. **Supabase Table:** In your Supabase Dashboard $\rightarrow$ **Table Editor** $\rightarrow$ `waitlist`.

---

## 🚀 Next Features to Build (When You Return)

1. **WhatsApp Group Registration Flow (`/partner/communities`):** Form for group admins to submit their WhatsApp invite links and details.
2. **Admin Group Approval Desk (`/admin/communities`):** 1-click Approve / Reject submitted communities.
3. **Campaign Matchmaking (`/admin/campaigns`):** Assign paid campaigns to verified WhatsApp groups.
4. **Proof Review & Payouts (`/admin/proofs`):** Admin reviews screenshot proof $\rightarrow$ clicks approve $\rightarrow$ releases funds to partner's bank wallet.
