import { useEffect, useState } from 'react'
import { supabase, Appointment, AppStatus } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { ChevronLeft, ChevronRight, X, Phone, Mail, Clock, StickyNote } from 'lucide-react'
import toast from 'react-hot-toast'

type ViewMode = 'month' | 'week' | 'day'

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December']
const STATUS_COLORS: Record<AppStatus, string> = {
  pending:   'bg-amber-500/80 text-white',
  confirmed: 'bg-emerald-500/80 text-white',
  cancelled: 'bg-red-500/60 text-white line-through',
}

function EventDetail({ appt, onClose, onUpdate }: { appt: Appointment; onClose: () => void; onUpdate: (a: Appointment) => void }) {
  const [notes, setNotes]   = useState(appt.notes ?? '')
  const [status, setStatus] = useState<AppStatus>(appt.status)
  const [saving, setSaving] = useState(false)

  const save = async () => {
    setSaving(true)
    await supabase.from('appointments').update({ notes, status }).eq('id', appt.id)
    onUpdate({ ...appt, notes, status }); toast.success('Saved'); setSaving(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-white">{appt.customer_name}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{(appt as any).services?.name ?? 'Appointment'}</p>
          </div>
          <button onClick={onClose} className="btn-ghost p-1.5 flex-shrink-0"><X className="w-4 h-4" /></button>
        </div>

        <div className="space-y-2.5 text-sm text-slate-300">
          <div className="flex items-center gap-2"><Clock className="w-4 h-4 text-slate-500" />{appt.preferred_date} at {appt.preferred_time}</div>
          <div className="flex items-center gap-2"><Phone className="w-4 h-4 text-slate-500" />{appt.customer_phone}</div>
          <div className="flex items-center gap-2"><Mail className="w-4 h-4 text-slate-500" />{appt.customer_email}</div>
          {appt.message && <div className="text-xs text-slate-400 bg-surface-800/50 rounded-lg p-3">{appt.message}</div>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Status</label>
          <select value={status} onChange={e => setStatus(e.target.value as AppStatus)} className="input text-sm">
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            <StickyNote className="w-3.5 h-3.5 inline mr-1" />Private Notes
          </label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} rows={3}
            placeholder="Add notes…" className="input resize-none text-sm" />
        </div>

        <button onClick={save} disabled={saving} className="btn-primary w-full justify-center text-sm">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const { profile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<ViewMode>('month')
  const [current, setCurrent] = useState(new Date())
  const [selected, setSelected] = useState<Appointment | null>(null)

  useEffect(() => {
    if (!profile) return
    supabase.from('appointments').select('*, services(name)').eq('user_id', profile.id)
      .then(({ data }) => { setAppointments(data ?? []); setLoading(false) })
  }, [profile])

  const updateAppt = (updated: Appointment) =>
    setAppointments(prev => prev.map(a => a.id === updated.id ? updated : a))

  // Month grid
  const year = current.getFullYear(), month = current.getMonth()
  const firstDay = new Date(year, month, 1).getDay()
  const daysInMonth = new Date(year, month + 1, 0).getDate()
  const cells = Array.from({ length: firstDay + daysInMonth }, (_, i) =>
    i < firstDay ? null : i - firstDay + 1
  )

  const apptsByDate = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2,'0')}-${String(day).padStart(2,'0')}`
    return appointments.filter(a => a.preferred_date === dateStr)
  }

  const prevMonth = () => setCurrent(new Date(year, month - 1, 1))
  const nextMonth = () => setCurrent(new Date(year, month + 1, 1))
  const today = new Date()

  if (loading) return (
    <div className="p-6 md:p-8">
      <div className="shimmer h-8 w-48 rounded-xl mb-6" />
      <div className="card p-6 grid grid-cols-7 gap-2">
        {Array.from({ length: 35 }).map((_, i) => <div key={i} className="shimmer h-20 rounded-lg" />)}
      </div>
    </div>
  )

  return (
    <div className="p-6 md:p-8 space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Calendar</h1>
          <p className="text-slate-400 text-sm mt-0.5">{appointments.length} total bookings</p>
        </div>
        {/* Legend */}
        <div className="flex items-center gap-3 text-xs text-slate-400">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Pending</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Confirmed</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-red-500" />Cancelled</span>
        </div>
      </div>

      {/* Calendar controls */}
      <div className="card overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-white/6">
          <button onClick={prevMonth} className="btn-ghost p-2"><ChevronLeft className="w-4 h-4" /></button>
          <div className="flex items-center gap-4">
            <h2 className="text-base font-semibold text-white">{MONTHS[month]} {year}</h2>
            <button onClick={() => setCurrent(new Date())} className="text-xs text-brand-400 hover:text-brand-300 transition">Today</button>
          </div>
          <button onClick={nextMonth} className="btn-ghost p-2"><ChevronRight className="w-4 h-4" /></button>
        </div>

        {/* Day names */}
        <div className="grid grid-cols-7 border-b border-white/5">
          {['Sun','Mon','Tue','Wed','Thu','Fri','Sat'].map(d => (
            <div key={d} className="py-2.5 text-center text-xs font-medium text-slate-500">{d}</div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7">
          {cells.map((day, i) => {
            if (!day) return <div key={i} className="min-h-[90px] border-b border-r border-white/4 bg-surface-950/30" />
            const dayAppts = apptsByDate(day)
            const isToday = year === today.getFullYear() && month === today.getMonth() && day === today.getDate()
            return (
              <div key={i} className="min-h-[90px] border-b border-r border-white/4 p-1.5 hover:bg-white/2 transition-colors">
                <span className={`text-xs font-medium w-6 h-6 flex items-center justify-center rounded-full mb-1 ${isToday ? 'bg-brand-600 text-white' : 'text-slate-400'}`}>
                  {day}
                </span>
                <div className="space-y-0.5">
                  {dayAppts.slice(0, 3).map(a => (
                    <button key={a.id} onClick={() => setSelected(a)}
                      className={`w-full text-left text-[10px] px-1.5 py-0.5 rounded truncate font-medium ${STATUS_COLORS[a.status]}`}>
                      {a.preferred_time} {a.customer_name}
                    </button>
                  ))}
                  {dayAppts.length > 3 && <p className="text-[10px] text-slate-500 px-1">+{dayAppts.length - 3} more</p>}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {selected && (
        <EventDetail appt={selected} onClose={() => setSelected(null)} onUpdate={a => { updateAppt(a); setSelected(a) }} />
      )}
    </div>
  )
}
