-- ╔══════════════════════════════════════════════════════════╗
-- ║         AppointBook — Supabase SQL Schema               ║
-- ║   Run this in: Supabase Dashboard → SQL Editor          ║
-- ╚══════════════════════════════════════════════════════════╝

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ─── USERS ────────────────────────────────────────────────────────────────────
create table if not exists public.users (
  id                       uuid primary key references auth.users(id) on delete cascade,
  email                    text not null,
  name                     text,
  role                     text not null default 'user' check (role in ('user','admin')),
  plan                     text not null default 'free' check (plan in ('free','paid')),
  slug                     text unique,
  business_name            text,
  logo_url                 text,
  description              text,
  phone                    text,
  whatsapp                 text,
  notification_email       text,
  razorpay_subscription_id text,
  custom_api_key           text,
  created_at               timestamptz default now()
);
alter table public.users enable row level security;
create policy "Users can view and update own profile"
  on public.users for all using (auth.uid() = id);
create policy "Admins can view all users"
  on public.users for select using (
    exists (select 1 from public.users where id = auth.uid() and role = 'admin')
  );

-- ─── SERVICES ─────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.users(id) on delete cascade,
  name             text not null,
  duration_minutes integer not null default 30,
  price            numeric,
  description      text,
  created_at       timestamptz default now()
);
alter table public.services enable row level security;
create policy "Users manage own services" on public.services for all using (auth.uid() = user_id);
create policy "Public read services" on public.services for select using (true);

-- ─── AVAILABILITY ─────────────────────────────────────────────────────────────
create table if not exists public.availability (
  id           uuid primary key default uuid_generate_v4(),
  user_id      uuid references public.users(id) on delete cascade,
  day_of_week  integer not null check (day_of_week between 0 and 6),
  open_time    text not null default '09:00',
  close_time   text not null default '18:00',
  is_active    boolean default true,
  unique (user_id, day_of_week)
);
alter table public.availability enable row level security;
create policy "Users manage own availability" on public.availability for all using (auth.uid() = user_id);
create policy "Public read availability" on public.availability for select using (true);

-- ─── APPOINTMENTS ─────────────────────────────────────────────────────────────
create table if not exists public.appointments (
  id               uuid primary key default uuid_generate_v4(),
  user_id          uuid references public.users(id) on delete cascade,
  customer_name    text not null,
  customer_email   text not null,
  customer_phone   text not null,
  service_id       uuid references public.services(id) on delete set null,
  preferred_date   date not null,
  preferred_time   text not null,
  message          text,
  status           text not null default 'pending' check (status in ('pending','confirmed','cancelled')),
  notes            text,
  created_at       timestamptz default now()
);
alter table public.appointments enable row level security;
create policy "Users manage own appointments" on public.appointments for all using (auth.uid() = user_id);
create policy "Anyone can insert appointments" on public.appointments for insert with check (true);

-- ─── BLOG POSTS ───────────────────────────────────────────────────────────────
create table if not exists public.blog_posts (
  id               uuid primary key default uuid_generate_v4(),
  title            text not null,
  slug             text unique not null,
  content          text,
  cover_image_url  text,
  category         text,
  tags             text[],
  meta_title       text,
  meta_description text,
  og_image_url     text,
  is_published     boolean default false,
  published_at     timestamptz,
  created_at       timestamptz default now()
);
alter table public.blog_posts enable row level security;
create policy "Public read published posts" on public.blog_posts for select using (is_published = true);
create policy "Admins manage blog" on public.blog_posts for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ─── SITE SETTINGS ────────────────────────────────────────────────────────────
create table if not exists public.site_settings (
  key        text primary key,
  value      text,
  updated_at timestamptz default now()
);
alter table public.site_settings enable row level security;
create policy "Public read settings" on public.site_settings for select using (true);
create policy "Admins manage settings" on public.site_settings for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- Seed default settings
insert into public.site_settings (key, value) values
  ('paid_price_monthly',  '499'),
  ('paid_price_annual',   '4999'),
  ('free_lead_limit',     '50'),
  ('api_status',          'active'),
  ('adsense_enabled',     'true'),
  ('adsense_publisher_id',''),
  ('razorpay_key_id',     ''),
  ('site_name',           'AppointBook'),
  ('support_email',       'support@appointbook.com')
on conflict (key) do nothing;

-- ─── SPONSORED ADS ────────────────────────────────────────────────────────────
create table if not exists public.sponsored_ads (
  id         uuid primary key default uuid_generate_v4(),
  title      text not null,
  image_url  text,
  target_url text not null,
  start_at   timestamptz not null,
  end_at     timestamptz not null,
  is_active  boolean default true,
  created_at timestamptz default now()
);
alter table public.sponsored_ads enable row level security;
create policy "Public read active ads" on public.sponsored_ads for select using (is_active = true);
create policy "Admins manage ads" on public.sponsored_ads for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ─── LEGAL CONTENT ────────────────────────────────────────────────────────────
create table if not exists public.legal_content (
  type       text primary key check (type in ('privacy','terms')),
  content    text,
  updated_at timestamptz default now()
);
alter table public.legal_content enable row level security;
create policy "Public read legal" on public.legal_content for select using (true);
create policy "Admins manage legal" on public.legal_content for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ─── API USAGE ────────────────────────────────────────────────────────────────
create table if not exists public.api_usage (
  id             uuid primary key default uuid_generate_v4(),
  user_id        uuid references public.users(id) on delete cascade,
  key_type       text check (key_type in ('platform','custom')),
  requests_count integer default 1,
  date           date default current_date,
  unique (user_id, date)
);
alter table public.api_usage enable row level security;
create policy "Users view own usage" on public.api_usage for select using (auth.uid() = user_id);
create policy "Admins view all usage" on public.api_usage for all using (
  exists (select 1 from public.users where id = auth.uid() and role = 'admin')
);

-- ─── AUTO-CREATE USER PROFILE ON SIGNUP ──────────────────────────────────────
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer as $$
begin
  insert into public.users (id, email, name, role, plan)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email,'@',1)),
    'user',
    'free'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
