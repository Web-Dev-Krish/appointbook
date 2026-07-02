import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { supabase, UserProfile, Service, Availability } from '../lib/supabase'
import { CalendarCheck, Clock, Phone, Mail, User, MessageSquare, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'

const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday']

function genSlots(open: string, close: string, duration: number): string[] {
  const slots: string[] = []
  let [h, m] = open.split(':').map(Number)
  const [eh, em] = close.split(':').map(Number)
  while (h * 60 + m + duration <= eh * 60 + em) {
    slots.push(`${String(h).padStart(2,'0')}:${String(m).padStart(2,'0')}`)
    m += duration; if (m >= 60) { h += Math.floor(m/60); m %= 60 }
  }
  return slots
}

export default function BookingPage() {
  const { slug } = useParams<{ slug: string }>()
  const [biz, setBiz]           = useState<UserProfile | null>(null)
  const [services, setServices] = useState<Service[]>([])
  const [avail, setAvail]       = useState<Availability[]>([])
  const [loading, setLoading]   = useState(true)
  const [submitted, setSubmitted] = useState(false)

  const [form, setForm] = useState({
    customer_name: '', customer_email: '', customer_phone: '',
    service_id: '', preferred_date: '', preferred_time: '', message: ''
  })

  useEffect(() => {
    if (!slug) return
    Promise.all([
      supabase.from('users').select('*').eq('slug', slug).single(),
      supabase.from('services').select('*'),
      supabase.from('availability').select('*').eq('is_active', true),
    ]).then(([u, s, a]) => {
      if (u.data) {
        setBiz(u.data)
        setServices((s.data ?? []).filter((x: Service) => x.user_id === u.data.id))
        setAvail((a.data ?? []).filter((x: Availability) => x.user_id === u.data.id))
      }
    }).finally(() => setLoading(false))
  }, [slug])

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const selectedSvc = services.find(s => s.id === form.service_id)
  const selectedDayAvail = form.preferred_date
    ? avail.find(a => a.day_of_week === new Date(form.preferred_date + 'T00:00:00').getDay())
    : null
  const slots = selectedDayAvail && selectedSvc
    ? genSlots(selectedDayAvail.open_time, selectedDayAvail.close_time, selectedSvc.duration_minutes)
    : []

  const availDays = avail.map(a => a.day_of_week)
  const isDateDisabled = (dateStr: string) => {
    const day = new Date(dateStr + 'T00:00:00').getDay()
    return !availDays.includes(day)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!biz) return
    if (isDateDisabled(form.preferred_date)) { toast.error('This date is not available'); return }
    const { error } = await supabase.from('appointments').insert({
      ...form, user_id: biz.id, status: 'pending'
    })
    if (error) { toast.error('Booking failed. Please try again.'); return }
    setSubmitted(true)
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950">
      <div className="w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full animate-spin" />
    </div>
  )

  if (!biz) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 text-center px-4">
      <div><h1 className="text-2xl font-bold text-white mb-2">Page not found</h1>
      <p className="text-slate-400">This booking page doesn't exist or has been removed.</p></div>
    </div>
  )

  if (submitted) return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 px-4">
      <div className="text-center max-w-sm">
        <div className="w-16 h-16 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-emerald-400" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-3">Booking Request Sent!</h2>
        <p className="text-slate-400 text-sm leading-relaxed">
          Thank you! <strong className="text-white">{biz.business_name}</strong> will confirm your appointment soon.
          You'll receive a confirmation on your provided contact details.
        </p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-950 py-12 px-4">
      {/* Header */}
      <div className="max-w-lg mx-auto mb-8 text-center">
        {biz.logo_url
          ? <img src={biz.logo_url} alt="logo" className="w-16 h-16 object-contain rounded-2xl mx-auto mb-4" />
          : <div className="w-16 h-16 rounded-2xl bg-brand-600/20 flex items-center justify-center mx-auto mb-4">
              <CalendarCheck className="w-8 h-8 text-brand-400" />
            </div>
        }
        <h1 className="text-2xl font-bold text-white">{biz.business_name}</h1>
        {biz.description && <p className="text-slate-400 text-sm mt-2 leading-relaxed">{biz.description}</p>}
      </div>

      <div className="max-w-lg mx-auto card p-6 md:p-8">
        <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <CalendarCheck className="w-5 h-5 text-brand-400" /> Book an Appointment
        </h2>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Service */}
          {services.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Select service</label>
              <select value={form.service_id} onChange={e => up('service_id', e.target.value)} required className="input">
                <option value="">Choose a service…</option>
                {services.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.duration_minutes} min{s.price ? ` · ₹${s.price}` : ''})
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date */}
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Preferred date</label>
            <input type="date" value={form.preferred_date} onChange={e => { up('preferred_date', e.target.value); up('preferred_time', '') }}
              min={new Date().toISOString().split('T')[0]} required className="input" />
            {form.preferred_date && isDateDisabled(form.preferred_date) && (
              <p className="text-red-400 text-xs mt-1">
                {biz.business_name} is closed on {DAYS[new Date(form.preferred_date+'T00:00:00').getDay()]}s. Please pick another date.
              </p>
            )}
          </div>

          {/* Time slots */}
          {slots.length > 0 && (
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-2">Available times</label>
              <div className="grid grid-cols-4 gap-2">
                {slots.map(sl => (
                  <button key={sl} type="button" onClick={() => up('preferred_time', sl)}
                    className={`py-2 rounded-lg text-xs font-medium border transition ${form.preferred_time === sl ? 'bg-brand-600 border-brand-500 text-white' : 'border-white/10 text-slate-400 hover:border-brand-500/50 hover:text-white'}`}>
                    {sl}
                  </button>
                ))}
              </div>
            </div>
          )}
          {form.preferred_date && !isDateDisabled(form.preferred_date) && slots.length === 0 && (
            <p className="text-xs text-slate-500">
              <Clock className="w-3 h-3 inline mr-1" />Select a service first to see available time slots.
            </p>
          )}

          <div className="border-t border-white/5 pt-4 space-y-4">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Your details</p>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
              <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.customer_name} onChange={e => up('customer_name', e.target.value)} required placeholder="Your full name" className="input pl-9" /></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number</label>
              <div className="relative"><Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.customer_phone} onChange={e => up('customer_phone', e.target.value)} required placeholder="+91 98765 43210" className="input pl-9" /></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Email address</label>
              <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input value={form.customer_email} onChange={e => up('customer_email', e.target.value)} type="email" required placeholder="you@example.com" className="input pl-9" /></div>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Message <span className="text-slate-600">(optional)</span></label>
              <div className="relative"><MessageSquare className="absolute left-3 top-3 w-4 h-4 text-slate-500" />
                <textarea value={form.message} onChange={e => up('message', e.target.value)}
                  placeholder="Any specific requirements or questions?" rows={3} className="input pl-9 resize-none" /></div>
            </div>
          </div>

          <button type="submit" className="btn-primary w-full justify-center py-3 text-sm">
            Request Appointment
          </button>
        </form>
      </div>

      {/* Free plan watermark */}
      {biz.plan === 'free' && (
        <p className="text-center text-xs text-slate-600 mt-6">
          Powered by <a href="/" className="text-brand-500 hover:text-brand-400">AppointBook</a> · Free plan
        </p>
      )}
    </div>
  )
}
