# AppointBook 🗓️

**Smart appointment booking SaaS for every business.**

---

## 🚀 Setup in 5 Steps

### Step 1 — Create Supabase Project

1. Go to [supabase.com](https://supabase.com) → Create new project
2. Go to **SQL Editor** → paste the full contents of `supabase-schema.sql` → Run
3. Go to **Authentication → Providers** → Enable **Google OAuth** (add your Google Client ID + Secret)
4. Copy your **Project URL** and **anon public key** from Settings → API

### Step 2 — Configure Environment

```bash
cp .env.example .env.local
# Fill in your VITE_SUPABASE_URL and VITE_SUPABASE_ANON
```

### Step 3 — Install & Run

```bash
npm install
npm run dev
```

Visit `http://localhost:5173`

### Step 4 — Make Yourself Admin

After creating your first account, run this in Supabase SQL Editor:
```sql
update public.users set role = 'admin' where email = 'your@email.com';
```
Then visit `/admin` to access the admin panel.

### Step 5 — Configure Services in Admin Panel

- `/admin/plans` → Set Razorpay keys and pricing
- `/admin/settings` → Set email (Resend) and WhatsApp (Twilio) credentials
- `/admin/ads` → Add your Google AdSense Publisher ID
- `/admin/legal` → Customize Privacy Policy and Terms

---

## 📁 Project Structure

```
src/
├── lib/
│   ├── supabase.ts      # Supabase client + all TypeScript types
│   └── auth.tsx         # Auth context (useAuth hook)
├── pages/
│   ├── Landing.tsx      # Marketing homepage
│   ├── Login.tsx        # Login with email + Google
│   ├── Register.tsx     # 2-step onboarding registration
│   ├── Booking.tsx      # Public booking page /book/:slug
│   ├── BlogList.tsx     # Public blog list
│   ├── BlogPost.tsx     # Blog post detail
│   ├── Legal.tsx        # Privacy Policy
│   ├── Terms.tsx        # Terms & Conditions
│   ├── dashboard/
│   │   ├── Layout.tsx   # Dashboard sidebar layout
│   │   ├── Home.tsx     # Overview with stats + QR
│   │   ├── Leads.tsx    # Lead table with filters + notes
│   │   ├── Calendar.tsx # Visual calendar with event popup
│   │   ├── BookingPage.tsx # Booking page builder + availability
│   │   ├── Settings.tsx # Profile, notifications, API key
│   │   └── Billing.tsx  # Plan management + Razorpay
│   └── admin/
│       ├── Layout.tsx   # Admin sidebar
│       ├── Dashboard.tsx # Platform stats
│       ├── Users.tsx    # User management
│       ├── Plans.tsx    # Pricing + Razorpay + API status
│       ├── Ads.tsx      # AdSense + sponsored ads scheduler
│       ├── Blog.tsx     # Blog post editor
│       ├── Legal.tsx    # Privacy & Terms editor
│       └── Settings.tsx # Global platform settings
├── styles/globals.css   # Tailwind + custom components
└── App.tsx              # Route definitions
```

---

## ✨ Features

| Feature | Free | Pro |
|---------|------|-----|
| Booking page + QR | ✅ | ✅ |
| Email notifications | ✅ | ✅ |
| Up to 50 leads/month | ✅ | — |
| Unlimited leads | — | ✅ |
| Ads on booking page | ✅ (shown) | ✅ (removed) |
| Custom logo | — | ✅ |
| WhatsApp notifications | — | ✅ |
| CSV export | — | ✅ |
| Custom API key | — | ✅ |

---

## 💳 Payments (Razorpay)

1. Create account at [razorpay.com](https://razorpay.com)
2. Get your **Key ID** and **Key Secret**
3. Enter them in `/admin/plans`
4. Add webhook URL: `https://yourdomain.com/api/razorpay/webhook`

---

## 📧 Email Notifications (Resend)

1. Sign up at [resend.com](https://resend.com)
2. Verify your domain
3. Get API key → add to `.env.local` as `RESEND_API_KEY`
4. Enter from email in `/admin/settings`

---

## 💬 WhatsApp Notifications (Twilio)

1. Sign up at [twilio.com](https://twilio.com)
2. Set up WhatsApp Sandbox or Business API
3. Add credentials in `/admin/settings`

---

## 🚢 Deploy to Vercel

```bash
npm run build
# Then connect your GitHub repo to Vercel
# Add all .env.local variables in Vercel dashboard
```

---

## 🔒 Make First Admin

```sql
-- Run in Supabase SQL Editor after signing up
update public.users
set role = 'admin'
where email = 'your-email@example.com';
```

---

Built with React + Vite + Supabase + Tailwind CSS + Razorpay
