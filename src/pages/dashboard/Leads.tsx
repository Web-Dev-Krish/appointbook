import { useEffect, useState } from 'react'
import { supabase, Appointment, AppStatus } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Search, Download, Filter, StickyNote, X, Check, Phone, Mail, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS: AppStatus[] = ['pending', 'confirmed', 'cancelled']

function StatusBadge({ status }: { status: AppStatus }) {
  const cls = status === 'confirmed' ? 'badge-green' : status === 'cancelled' ? 'badge-red' : 'badge-yellow'
  return <span className={`badge ${cls}`}>{status}</span>
}

function NoteModal({ appt, onClose, onSave }: { appt: Appointment; onClose: () => void; onSave: (notes: string) => void }) {
  const [notes, setNotes] = useState(appt.notes ?? '')
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="card w-full max-w-md p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-semibold text-white text-sm">Notes — {appt.customer_name}</h3>
          <button onClick={onClose} className="btn-ghost p-1.5"><X className="w-4 h-4" /></button>
        </div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          rows={6} placeholder="Add private notes about this lead…" className="input resize-none text-sm" />
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary text-xs">Cancel</button>
          <button onClick={() => { onSave(notes); onClose() }} className="btn-primary text-xs">
            <Check className="w-3.5 h-3.5" /> Save Notes
          </button>
        </div>
      </div>
    </div>
  )
}

export default function LeadsPage() {
  const { profile } = useAuth()
  const [leads, setLeads]     = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch]   = useState('')
  const [filterStatus, setFilterStatus] = useState<AppStatus | 'all'>('all')
  const [noteAppt, setNoteAppt] = useState<Appointment | null>(null)

  const load = () => {
    if (!profile) return
    supabase.from('appointments').select('*, services(name)').eq('user_id', profile.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setLeads(data ?? []); setLoading(false) })
  }
  useEffect(load, [profile])

  const updateStatus = async (id: string, status: AppStatus) => {
    await supabase.from('appointments').update({ status }).eq('id', id)
    setLeads(l => l.map(x => x.id === id ? { ...x, status } : x))
    toast.success(`Marked as ${status}`)
  }

  const saveNotes = async (id: string, notes: string) => {
    await supabase.from('appointments').update({ notes }).eq('id', id)
    setLeads(l => l.map(x => x.id === id ? { ...x, notes } : x))
    toast.success('Notes saved')
  }

  const exportCSV = () => {
    const rows = [['Name','Email','Phone','Service','Date','Time','Status','Message','Notes']]
    filtered.forEach(a => rows.push([a.customer_name,a.customer_email,a.customer_phone,(a as any).services?.name??'',a.preferred_date,a.preferred_time,a.status,a.message??'',a.notes??'']))
    const blob = new Blob([rows.map(r => r.map(c => `"${c}"`).join(',')).join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'leads.csv'; a.click()
  }

  const filtered = leads.filter(l => {
    const matchSearch = !search || l.customer_name.toLowerCase().includes(search.toLowerCase()) || l.customer_phone.includes(search)
    const matchStatus = filterStatus === 'all' || l.status === filterStatus
    return matchSearch && matchStatus
  })

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Leads</h1>
          <p className="text-slate-400 text-sm mt-0.5">{leads.length} total appointments</p>
        </div>
        {profile?.plan === 'paid' && (
          <button onClick={exportCSV} className="btn-secondary text-sm self-start">
            <Download className="w-4 h-4" /> Export CSV
          </button>
        )}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name or phone…" className="input pl-9" />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <select value={filterStatus} onChange={e => setFilterStatus(e.target.value as any)} className="input pl-9 pr-8">
            <option value="all">All Status</option>
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase()+s.slice(1)}</option>)}
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-medium">Customer</th>
                <th className="px-5 py-3.5 text-left font-medium hidden md:table-cell">Service</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Date & Time</th>
                <th className="px-5 py-3.5 text-left font-medium">Status</th>
                <th className="px-5 py-3.5 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i}><td colSpan={5} className="px-5 py-4">
                    <div className="shimmer h-4 rounded w-full" />
                  </td></tr>
                ))
              ) : filtered.length === 0 ? (
                <tr><td colSpan={5} className="px-5 py-16 text-center text-slate-500">
                  No leads found.
                </td></tr>
              ) : filtered.map(a => (
                <tr key={a.id} className="hover:bg-white/2 transition">
                  <td className="px-5 py-4">
                    <p className="font-medium text-white">{a.customer_name}</p>
                    <div className="flex items-center gap-3 mt-1 text-xs text-slate-500">
                      <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{a.customer_phone}</span>
                      <span className="flex items-center gap-1 hidden sm:flex"><Mail className="w-3 h-3" />{a.customer_email}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4 hidden md:table-cell text-slate-300 text-xs">{(a as any).services?.name ?? '—'}</td>
                  <td className="px-5 py-4 hidden lg:table-cell text-slate-300 text-xs">
                    <div className="flex items-center gap-1"><Clock className="w-3 h-3" />{a.preferred_date} · {a.preferred_time}</div>
                  </td>
                  <td className="px-5 py-4">
                    <select value={a.status} onChange={e => updateStatus(a.id, e.target.value as AppStatus)}
                      className="text-xs bg-transparent border border-white/10 rounded-lg px-2 py-1 text-slate-300 cursor-pointer hover:border-brand-500/50 transition">
                      {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                  <td className="px-5 py-4">
                    <button onClick={() => setNoteAppt(a)} className="btn-ghost text-xs p-1.5 flex items-center gap-1">
                      <StickyNote className="w-3.5 h-3.5" />
                      {a.notes ? 'Edit note' : 'Add note'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {noteAppt && (
        <NoteModal appt={noteAppt} onClose={() => setNoteAppt(null)}
          onSave={(notes) => saveNotes(noteAppt.id, notes)} />
      )}
    </div>
  )
}
