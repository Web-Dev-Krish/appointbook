import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import {
  CalendarCheck, LayoutDashboard, Users, DollarSign,
  Megaphone, FileText, Shield, Settings, ArrowLeft
} from 'lucide-react'

const nav = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard',  end: true },
  { to: '/admin/users',    icon: Users,            label: 'Users' },
  { to: '/admin/plans',    icon: DollarSign,       label: 'Plans & Pricing' },
  { to: '/admin/ads',      icon: Megaphone,        label: 'Ads Manager' },
  { to: '/admin/blog',     icon: FileText,         label: 'Blog' },
  { to: '/admin/legal',    icon: Shield,           label: 'Legal Pages' },
  { to: '/admin/settings', icon: Settings,         label: 'Settings' },
]

export default function AdminLayout() {
  const { profile } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      <aside className="flex flex-col h-full bg-surface-900 border-r border-amber-500/10 w-64 flex-shrink-0">
        {/* Logo */}
        <div className="p-5 border-b border-amber-500/10">
          <div className="flex items-center gap-2.5 mb-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/20 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-amber-400" />
            </div>
            <div>
              <span className="font-semibold text-white text-sm block">AppointBook</span>
              <span className="text-[10px] text-amber-400 font-medium">ADMIN PANEL</span>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {nav.map(item => (
            <NavLink key={item.to} to={item.to} end={item.end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition
                ${isActive ? 'bg-amber-500/15 text-amber-300' : 'text-slate-400 hover:bg-white/5 hover:text-white'}`
              }>
              <item.icon className="w-4 h-4 flex-shrink-0" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* Back to dashboard */}
        <div className="p-4 border-t border-amber-500/10">
          <button onClick={() => navigate('/dashboard')}
            className="flex items-center gap-2 text-sm text-slate-500 hover:text-white transition w-full px-3 py-2">
            <ArrowLeft className="w-4 h-4" /> Back to Dashboard
          </button>
          <div className="mt-3 flex items-center gap-2 px-3">
            <div className="w-7 h-7 rounded-full bg-amber-500/20 flex items-center justify-center text-xs font-bold text-amber-300">
              {profile?.name?.charAt(0)?.toUpperCase()}
            </div>
            <div>
              <p className="text-xs font-medium text-white">{profile?.name}</p>
              <p className="text-[10px] text-amber-400">Super Admin</p>
            </div>
          </div>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
