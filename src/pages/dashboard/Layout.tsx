import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../lib/auth'
import {
  CalendarCheck, LayoutDashboard, Users, Calendar,
  Settings, CreditCard, LogOut, Globe, Menu, X, Bell
} from 'lucide-react'
import { useState } from 'react'

const nav = [
  { to: '/dashboard',              icon: LayoutDashboard, label: 'Overview' },
  { to: '/dashboard/leads',        icon: Users,           label: 'Leads' },
  { to: '/dashboard/calendar',     icon: Calendar,        label: 'Calendar' },
  { to: '/dashboard/booking-page', icon: Globe,           label: 'Booking Page' },
  { to: '/dashboard/settings',     icon: Settings,        label: 'Settings' },
  { to: '/dashboard/billing',      icon: CreditCard,      label: 'Billing' },
]

export default function DashboardLayout() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)

  const handleSignOut = async () => { await signOut(); navigate('/login') }

  const Sidebar = () => (
    <aside className="flex flex-col h-full bg-surface-900 border-r border-white/6 w-64 flex-shrink-0">
      {/* Logo */}
      <div className="p-5 border-b border-white/6">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
            <CalendarCheck className="w-4 h-4 text-white" />
          </div>
          <span className="font-semibold text-white text-sm">AppointBook</span>
        </div>
      </div>

      {/* Plan badge */}
      <div className="px-4 py-3 border-b border-white/6">
        <span className={profile?.plan === 'paid' ? 'badge badge-blue' : 'badge bg-white/8 text-slate-400'}>
          {profile?.plan === 'paid' ? '⚡ Pro Plan' : 'Free Plan'}
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-3 space-y-0.5">
        {nav.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/dashboard'}
            className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}>
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
          </NavLink>
        ))}
        {profile?.role === 'admin' && (
          <NavLink to="/admin" className="sidebar-link text-amber-400 hover:text-amber-300 hover:bg-amber-500/10">
            <Bell className="w-4 h-4 flex-shrink-0" /> Admin Panel
          </NavLink>
        )}
      </nav>

      {/* User + signout */}
      <div className="p-4 border-t border-white/6">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 rounded-full bg-brand-600/30 flex items-center justify-center text-xs font-semibold text-brand-300">
            {profile?.name?.charAt(0)?.toUpperCase() ?? 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-white truncate">{profile?.name}</p>
            <p className="text-xs text-slate-500 truncate">{profile?.email}</p>
          </div>
        </div>
        <button onClick={handleSignOut} className="btn-ghost w-full justify-start text-red-400 hover:text-red-300 hover:bg-red-500/10 text-xs">
          <LogOut className="w-3.5 h-3.5" /> Sign out
        </button>
      </div>
    </aside>
  )

  return (
    <div className="flex h-screen bg-surface-950 overflow-hidden">
      {/* Desktop sidebar */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <div className="relative z-10 flex w-64">
            <Sidebar />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile topbar */}
        <div className="md:hidden flex items-center justify-between px-4 h-14 border-b border-white/6 bg-surface-900">
          <button onClick={() => setMobileOpen(true)} className="btn-ghost p-2">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm font-semibold text-white">AppointBook</span>
          </div>
          <div className="w-9" />
        </div>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
