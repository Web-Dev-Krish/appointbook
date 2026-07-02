import { createClient } from '@supabase/supabase-js'

// ── Replace these with your actual Supabase project values ──────────────────
const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || 'https://your-project.supabase.co'
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON || 'your-anon-key'
// ────────────────────────────────────────────────────────────────────────────

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON)

// ── Types ────────────────────────────────────────────────────────────────────
export type Plan = 'free' | 'paid'
export type AppStatus = 'pending' | 'confirmed' | 'cancelled'
export type Role = 'user' | 'admin'

export interface UserProfile {
  id: string
  email: string
  name: string
  role: Role
  plan: Plan
  slug: string
  business_name: string
  logo_url?: string
  description?: string
  phone?: string
  whatsapp?: string
  notification_email?: string
  razorpay_subscription_id?: string
  custom_api_key?: string
  created_at: string
}

export interface Service {
  id: string
  user_id: string
  name: string
  duration_minutes: number
  price?: number
  description?: string
}

export interface Availability {
  id: string
  user_id: string
  day_of_week: number   // 0=Sun … 6=Sat
  open_time: string     // "09:00"
  close_time: string    // "18:00"
  is_active: boolean
}

export interface Appointment {
  id: string
  user_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_id?: string
  services?: Service
  preferred_date: string
  preferred_time: string
  message?: string
  status: AppStatus
  notes?: string
  created_at: string
}

export interface BlogPost {
  id: string
  title: string
  slug: string
  content: string
  cover_image_url?: string
  category?: string
  tags?: string[]
  meta_title?: string
  meta_description?: string
  is_published: boolean
  published_at?: string
  created_at: string
}

export interface SponsoredAd {
  id: string
  title: string
  image_url?: string
  target_url: string
  start_at: string
  end_at: string
  is_active: boolean
}
