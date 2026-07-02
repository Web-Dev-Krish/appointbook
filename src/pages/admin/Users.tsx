import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Search, ShieldCheck, ShieldOff, Trash2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminUsers() {
  const [users, setUsers]   = useState<any[]>([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'free' | 'paid'>('all')
  const [loading, setLoading] = useState(true)

  const load = () =>
    supabase.from('users').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setUsers(data ?? []); setLoading(false) })

  useEffect(() => { load() }, [])

  const changePlan = async (id: string, plan: 'free' | 'paid') => {
    await supabase.from('users').update({ plan }).eq('id', id)
    setUsers(u => u.map(x => x.id === id ? { ...x, plan } : x))
    toast.success(`Plan updated to ${plan}`)
  }

  const deleteUser = async (id: string) => {
    if (!confirm('Delete this user and all their data?')) return
    await supabase.from('appointments').delete().eq('user_id', id)
    await supabase.from('services').delete().eq('user_id', id)
    await supabase.from('availability').delete().eq('user_id', id)
    await supabase.from('users').delete().eq('id', id)
    setUsers(u => u.filter(x => x.id !== id))
    toast.success('User deleted')
  }

  const filtered = users.filter(u => {
    const q = search.toLowerCase()
    const matchSearch = !q || u.name?.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q)
    const matchFilter = filter === 'all' || u.plan === filter
    return matchSearch && matchFilter
  })

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Users</h1>
        <p className="text-slate-400 text-sm mt-0.5">{users.length} registered users</p>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search name or email…" className="input pl-9" />
        </div>
        <select value={filter} onChange={e => setFilter(e.target.value as any)} className="input w-auto">
          <option value="all">All Plans</option>
          <option value="free">Free</option>
          <option value="paid">Paid</option>
        </select>
      </div>

      <div className="card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-white/6 text-xs text-slate-500 uppercase tracking-wider">
                <th className="px-5 py-3.5 text-left font-medium">User</th>
                <th className="px-5 py-3.5 text-left font-medium hidden md:table-cell">Business</th>
                <th className="px-5 py-3.5 text-left font-medium hidden lg:table-cell">Joined</th>
                <th className="px-5 py-3.5 text-left font-medium">Plan</th>
                <th className="px-5 py-3.5 text-left font-medium hidden sm:table-cell">API Key</th>
                <th className="px-5 py-3.5 text-left font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {loading ? Array.from({ length: 6 }).map((_, i) => (
                <tr key={i}><td colSpan={6} className="px-5 py-4"><div className="shimmer h-4 rounded w-full" /></td></tr>
              )) : filtered.map(u => (
                <tr key={u.id} className="hover:bg-white/2 transition">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                        {u.name?.charAt(0)?.toUpperCase() ?? '?'}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white text-sm">{u.name}</p>
                        <p className="text-xs text-slate-500 truncate">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 hidden md:table-cell text-slate-300 text-xs">{u.business_name ?? '—'}</td>
                  <td className="px-5 py-3.5 hidden lg:table-cell text-slate-500 text-xs">{new Date(u.created_at).toLocaleDateString()}</td>
                  <td className="px-5 py-3.5">
                    <select value={u.plan} onChange={e => changePlan(u.id, e.target.value as any)}
                      className="text-xs bg-transparent border border-white/10 rounded-lg px-2 py-1 text-slate-300 cursor-pointer hover:border-brand-500/50 transition">
                      <option value="free">free</option>
                      <option value="paid">paid</option>
                    </select>
                  </td>
                  <td className="px-5 py-3.5 hidden sm:table-cell">
                    {u.custom_api_key
                      ? <span className="badge bg-purple-500/15 text-purple-400">Custom</span>
                      : <span className="badge bg-white/8 text-slate-500">Platform</span>
                    }
                  </td>
                  <td className="px-5 py-3.5">
                    <button onClick={() => deleteUser(u.id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
