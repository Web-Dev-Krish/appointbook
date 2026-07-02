import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Users, CalendarCheck, DollarSign, TrendingUp, Key, Zap } from 'lucide-react'

function StatCard({ icon: Icon, label, value, sub, color }: any) {
  return (
    <div className="card p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${color}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
      {sub && <p className="text-xs text-slate-500 mt-1">{sub}</p>}
    </div>
  )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalUsers: 0, freeUsers: 0, paidUsers: 0,
    totalLeads: 0, customKeyUsers: 0,
  })
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      supabase.from('users').select('id,plan,custom_api_key,name,email,created_at').order('created_at', { ascending: false }),
      supabase.from('appointments').select('id', { count: 'exact', head: true }),
    ]).then(([users, appts]) => {
      const u = users.data ?? []
      setStats({
        totalUsers:     u.length,
        freeUsers:      u.filter((x: any) => x.plan === 'free').length,
        paidUsers:      u.filter((x: any) => x.plan === 'paid').length,
        totalLeads:     appts.count ?? 0,
        customKeyUsers: u.filter((x: any) => x.custom_api_key).length,
      })
      setRecentUsers(u.slice(0, 8))
      setLoading(false)
    })
  }, [])

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-slate-400 text-sm mt-0.5">Platform-wide overview.</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard icon={Users}         label="Total Users"        value={stats.totalUsers}     color="bg-brand-500/15 text-brand-400" />
        <StatCard icon={Zap}           label="Pro Users"          value={stats.paidUsers}      sub={`${stats.freeUsers} on free plan`} color="bg-amber-500/15 text-amber-400" />
        <StatCard icon={CalendarCheck} label="Total Leads"        value={stats.totalLeads}     color="bg-emerald-500/15 text-emerald-400" />
        <StatCard icon={Key}           label="Custom API Keys"    value={stats.customKeyUsers} sub="using their own key" color="bg-purple-500/15 text-purple-400" />
        <StatCard icon={TrendingUp}    label="Platform API Users" value={stats.totalUsers - stats.customKeyUsers} color="bg-cyan-500/15 text-cyan-400" />
        <StatCard icon={DollarSign}    label="Paid Conversions"   value={`${stats.totalUsers ? Math.round(stats.paidUsers / stats.totalUsers * 100) : 0}%`} color="bg-rose-500/15 text-rose-400" />
      </div>

      {/* Recent users */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6">
          <h2 className="font-semibold text-white text-sm">Recent Signups</h2>
        </div>
        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="px-6 py-3.5 flex items-center gap-4">
                <div className="shimmer w-8 h-8 rounded-full" />
                <div className="flex-1 space-y-1.5">
                  <div className="shimmer h-3 w-32 rounded" />
                  <div className="shimmer h-2.5 w-48 rounded" />
                </div>
                <div className="shimmer h-5 w-12 rounded-full" />
              </div>
            ))
          ) : recentUsers.map(u => (
            <div key={u.id} className="px-6 py-3.5 flex items-center gap-4">
              <div className="w-8 h-8 rounded-full bg-brand-600/20 flex items-center justify-center text-xs font-semibold text-brand-300 flex-shrink-0">
                {u.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white">{u.name}</p>
                <p className="text-xs text-slate-500">{u.email}</p>
              </div>
              <div className="flex items-center gap-2">
                {u.custom_api_key && <span className="badge bg-purple-500/15 text-purple-400 text-[10px]">Custom Key</span>}
                <span className={u.plan === 'paid' ? 'badge badge-blue' : 'badge bg-white/8 text-slate-400'}>
                  {u.plan}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
