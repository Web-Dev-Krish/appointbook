import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, Appointment } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Users, CalendarCheck, Clock, XCircle, Copy, QrCode, ExternalLink, TrendingUp } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

function StatCard({ icon: Icon, label, value, color }: any) {
  return (
    <div className="card p-5 flex items-center gap-4">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${color}`}>
        <Icon className="w-5 h-5" />
      </div>
      <div>
        <p className="text-xs text-slate-400 mb-0.5">{label}</p>
        <p className="text-2xl font-bold text-white">{value}</p>
      </div>
    </div>
  )
}

export default function DashboardHome() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [qrUrl, setQrUrl] = useState('')

  const bookingUrl = `${window.location.origin}/book/${profile?.slug}`

  useEffect(() => {
    if (!profile) return
    supabase.from('appointments').select('*, services(name)').eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setAppointments(data ?? []); setLoading(false) })

    QRCode.toDataURL(bookingUrl, { width: 200, margin: 2, color: { dark: '#ffffff', light: '#0f172a' } })
      .then(setQrUrl)
  }, [profile])

  const today = new Date().toISOString().split('T')[0]
  const stats = {
    total:     appointments.length,
    today:     appointments.filter(a => a.preferred_date === today).length,
    pending:   appointments.filter(a => a.status === 'pending').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
  }

  const copyLink = () => { navigator.clipboard.writeText(bookingUrl); toast.success('Link copied!') }

  const downloadQR = () => {
    const a = document.createElement('a')
    a.href = qrUrl; a.download = `${profile?.slug}-qr.png`; a.click()
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Welcome back, {profile?.name?.split(' ')[0]} 👋</h1>
        <p className="text-slate-400 text-sm mt-1">Here's what's happening with your bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Users}         label="Total Leads"       value={stats.total}     color="bg-brand-500/15 text-brand-400" />
        <StatCard icon={CalendarCheck} label="Today's Bookings"  value={stats.today}     color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Clock}         label="Pending"           value={stats.pending}   color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={XCircle}       label="Cancelled"         value={stats.cancelled} color="bg-red-500/15 text-red-400" />
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Booking link card */}
        <div className="card p-6 lg:col-span-2 space-y-4">
          <div className="flex items-center gap-2 mb-1">
            <ExternalLink className="w-4 h-4 text-brand-400" />
            <h2 className="font-semibold text-white text-sm">Your Booking Page</h2>
          </div>
          <div className="flex items-center gap-2 bg-surface-800/60 rounded-xl px-4 py-2.5 border border-white/8">
            <span className="text-sm text-slate-300 truncate flex-1">{bookingUrl}</span>
            <button onClick={copyLink} className="btn-ghost p-1.5 flex-shrink-0"><Copy className="w-4 h-4" /></button>
          </div>
          <div className="flex gap-3 flex-wrap">
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn-secondary text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Preview
            </a>
            <Link to="/dashboard/booking-page" className="btn-secondary text-xs">Edit Page</Link>
            {qrUrl && (
              <button onClick={downloadQR} className="btn-secondary text-xs">
                <QrCode className="w-3.5 h-3.5" /> Download QR
              </button>
            )}
          </div>
        </div>

        {/* QR code */}
        <div className="card p-6 flex flex-col items-center justify-center gap-3">
          {qrUrl
            ? <img src={qrUrl} alt="QR Code" className="w-32 h-32 rounded-xl" />
            : <div className="w-32 h-32 shimmer rounded-xl" />
          }
          {profile?.plan === 'free' && (
            <div className="text-center">
              <p className="text-xs text-slate-500">AppointBook</p>
              <Link to="/dashboard/billing" className="text-xs text-brand-400 hover:text-brand-300">
                Upgrade to add your logo →
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Recent leads */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <h2 className="font-semibold text-white text-sm flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-brand-400" /> Recent Leads
          </h2>
          <Link to="/dashboard/leads" className="text-xs text-brand-400 hover:text-brand-300">View all →</Link>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex items-center gap-4">
                <div className="shimmer w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-2"><div className="shimmer h-3 w-32 rounded" /><div className="shimmer h-2 w-24 rounded" /></div>
                <div className="shimmer h-5 w-16 rounded-full" />
              </div>
            ))
          ) : appointments.slice(0, 5).length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">
              <CalendarCheck className="w-8 h-8 mx-auto mb-3 text-slate-600" />
              No leads yet. Share your booking link to get started!
            </div>
          ) : appointments.slice(0, 5).map(a => (
            <div key={a.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                {a.customer_name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">{a.customer_name}</p>
                <p className="text-xs text-slate-500">{a.preferred_date} · {a.preferred_time}</p>
              </div>
              <span className={`badge ${a.status === 'confirmed' ? 'badge-green' : a.status === 'cancelled' ? 'badge-red' : 'badge-yellow'}`}>
                {a.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
