import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Copy, Download, ExternalLink, Upload, Plus, Trash2, QrCode } from 'lucide-react'
import toast from 'react-hot-toast'
import QRCode from 'qrcode'

export default function BookingPageMgr() {
  const { profile, refreshProfile } = useAuth()
  const [qrUrl, setQrUrl] = useState('')
  const [services, setServices] = useState<any[]>([])
  const [avail, setAvail]       = useState<any[]>([])
  const [saving, setSaving]     = useState(false)
  const [bizForm, setBizForm] = useState({ business_name: '', description: '', phone: '' })
  const [newSvc, setNewSvc] = useState({ name: '', duration_minutes: 30, price: '' })

  const bookingUrl = `${window.location.origin}/book/${profile?.slug}`

  const DAYS = [
    { id: 0, label: 'Sunday' }, { id: 1, label: 'Monday' }, { id: 2, label: 'Tuesday' },
    { id: 3, label: 'Wednesday' }, { id: 4, label: 'Thursday' }, { id: 5, label: 'Friday' }, { id: 6, label: 'Saturday' },
  ]

  useEffect(() => {
    if (!profile) return
    setBizForm({ business_name: profile.business_name ?? '', description: profile.description ?? '', phone: profile.phone ?? '' })
    supabase.from('services').select('*').eq('user_id', profile.id).then(({ data }) => setServices(data ?? []))
    supabase.from('availability').select('*').eq('user_id', profile.id).then(({ data }) => setAvail(data ?? []))
    QRCode.toDataURL(bookingUrl, { width: 300, margin: 2, color: { dark: '#ffffff', light: '#0f172a' } }).then(setQrUrl)
  }, [profile])

  const saveBizInfo = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('users').update(bizForm).eq('id', profile.id)
    await refreshProfile()
    toast.success('Business info updated')
    setSaving(false)
  }

  const addService = async () => {
    if (!profile || !newSvc.name) return
    const { data } = await supabase.from('services').insert({ ...newSvc, price: newSvc.price ? Number(newSvc.price) : null, user_id: profile.id }).select().single()
    if (data) setServices(s => [...s, data])
    setNewSvc({ name: '', duration_minutes: 30, price: '' })
    toast.success('Service added')
  }

  const delService = async (id: string) => {
    await supabase.from('services').delete().eq('id', id)
    setServices(s => s.filter(x => x.id !== id))
    toast.success('Service removed')
  }

  const toggleDay = async (dayId: number, checked: boolean) => {
    if (!profile) return
    if (checked) {
      const { data } = await supabase.from('availability').insert({ user_id: profile.id, day_of_week: dayId, open_time: '09:00', close_time: '18:00', is_active: true }).select().single()
      if (data) setAvail(a => [...a, data])
    } else {
      await supabase.from('availability').delete().eq('user_id', profile.id).eq('day_of_week', dayId)
      setAvail(a => a.filter(x => x.day_of_week !== dayId))
    }
  }

  const updateAvailTime = async (id: string, field: string, value: string) => {
    await supabase.from('availability').update({ [field]: value }).eq('id', id)
    setAvail(a => a.map(x => x.id === id ? { ...x, [field]: value } : x))
  }

  const downloadQR = () => {
    const a = document.createElement('a'); a.href = qrUrl; a.download = `${profile?.slug}-qr.png`; a.click()
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Booking Page</h1>
        <p className="text-slate-400 text-sm mt-0.5">Customize your public booking page and manage availability.</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left — forms */}
        <div className="lg:col-span-2 space-y-6">
          {/* Business info */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">Business Information</h2>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Business name</label>
              <input value={bizForm.business_name} onChange={e => setBizForm(f => ({ ...f, business_name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Description</label>
              <textarea value={bizForm.description} onChange={e => setBizForm(f => ({ ...f, description: e.target.value }))} rows={3} className="input resize-none" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone</label>
              <input value={bizForm.phone} onChange={e => setBizForm(f => ({ ...f, phone: e.target.value }))} className="input" />
            </div>
            {profile?.plan === 'paid' && (
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Logo</label>
                <div className="border-2 border-dashed border-white/10 rounded-xl p-6 text-center hover:border-brand-500/40 transition cursor-pointer">
                  <Upload className="w-6 h-6 text-slate-500 mx-auto mb-2" />
                  <p className="text-xs text-slate-400">Click to upload your logo (PNG/SVG)</p>
                </div>
              </div>
            )}
            {profile?.plan === 'free' && (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4 text-sm">
                <p className="text-brand-300 font-medium text-xs mb-1">🔒 Custom logo is a Pro feature</p>
                <Link to="/dashboard/billing" className="text-xs text-brand-400 hover:text-brand-300">Upgrade to Pro →</Link>
              </div>
            )}
            <button onClick={saveBizInfo} disabled={saving} className="btn-primary text-sm">{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>

          {/* Services */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">Services</h2>
            {services.map(s => (
              <div key={s.id} className="flex items-center gap-3 p-3 bg-surface-800/40 rounded-xl">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white">{s.name}</p>
                  <p className="text-xs text-slate-400">{s.duration_minutes} min{s.price ? ` · ₹${s.price}` : ''}</p>
                </div>
                <button onClick={() => delService(s.id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            <div className="grid grid-cols-3 gap-2">
              <input value={newSvc.name} onChange={e => setNewSvc(n => ({ ...n, name: e.target.value }))} placeholder="Service name" className="input col-span-3 sm:col-span-1" />
              <input value={newSvc.duration_minutes} onChange={e => setNewSvc(n => ({ ...n, duration_minutes: Number(e.target.value) }))} type="number" placeholder="Duration (min)" className="input" />
              <input value={newSvc.price} onChange={e => setNewSvc(n => ({ ...n, price: e.target.value }))} placeholder="Price (₹)" className="input" />
            </div>
            <button onClick={addService} className="btn-secondary text-sm self-start">
              <Plus className="w-4 h-4" /> Add Service
            </button>
          </div>

          {/* Availability */}
          <div className="card p-6 space-y-4">
            <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">Availability</h2>
            {DAYS.map(d => {
              const dayAvail = avail.find(a => a.day_of_week === d.id)
              return (
                <div key={d.id} className="flex items-center gap-4">
                  <label className="flex items-center gap-2 w-32 cursor-pointer">
                    <input type="checkbox" checked={!!dayAvail} onChange={e => toggleDay(d.id, e.target.checked)}
                      className="w-4 h-4 accent-brand-500" />
                    <span className="text-sm text-slate-300">{d.label}</span>
                  </label>
                  {dayAvail && (
                    <div className="flex items-center gap-2 flex-1">
                      <input type="time" value={dayAvail.open_time} onChange={e => updateAvailTime(dayAvail.id, 'open_time', e.target.value)} className="input py-1.5 text-xs w-28" />
                      <span className="text-slate-500 text-xs">to</span>
                      <input type="time" value={dayAvail.close_time} onChange={e => updateAvailTime(dayAvail.id, 'close_time', e.target.value)} className="input py-1.5 text-xs w-28" />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>

        {/* Right — QR + link */}
        <div className="space-y-5">
          <div className="card p-6 flex flex-col items-center gap-4">
            <QrCode className="w-5 h-5 text-brand-400" />
            <h3 className="text-sm font-semibold text-white -mt-2">Your QR Code</h3>
            {qrUrl ? <img src={qrUrl} alt="QR" className="w-48 h-48 rounded-xl" /> : <div className="shimmer w-48 h-48 rounded-xl" />}
            {profile?.plan === 'free' && (
              <p className="text-xs text-slate-500 text-center">AppointBook watermark</p>
            )}
            <button onClick={downloadQR} className="btn-primary w-full justify-center text-sm">
              <Download className="w-4 h-4" /> Download QR (PNG)
            </button>
          </div>

          <div className="card p-5 space-y-3">
            <p className="text-xs font-medium text-slate-400">Your booking link</p>
            <div className="flex items-center gap-2 bg-surface-800/60 rounded-xl px-3 py-2.5 border border-white/8">
              <span className="text-xs text-slate-300 truncate flex-1">{bookingUrl}</span>
              <button onClick={() => { navigator.clipboard.writeText(bookingUrl); toast.success('Copied!') }} className="flex-shrink-0">
                <Copy className="w-4 h-4 text-slate-400 hover:text-white transition" />
              </button>
            </div>
            <a href={bookingUrl} target="_blank" rel="noreferrer" className="btn-secondary w-full justify-center text-xs">
              <ExternalLink className="w-3.5 h-3.5" /> Open Preview
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
