import { useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Bell, Key, User, Eye, EyeOff } from 'lucide-react'
import toast from 'react-hot-toast'

type Tab = 'profile' | 'notifications' | 'api'

export default function SettingsPage() {
  const { profile, refreshProfile } = useAuth()
  const [tab, setTab] = useState<Tab>('profile')
  const [saving, setSaving] = useState(false)
  const [showKey, setShowKey] = useState(false)

  const [prof, setProf] = useState({
    name: profile?.name ?? '',
    notification_email: profile?.notification_email ?? '',
    whatsapp: profile?.whatsapp ?? '',
    phone: profile?.phone ?? '',
  })
  const [notif, setNotif] = useState({
    email_notif:    true,
    whatsapp_notif: profile?.plan === 'paid',
  })
  const [apiKey, setApiKey] = useState(profile?.custom_api_key ?? '')

  const saveProfile = async () => {
    if (!profile) return
    setSaving(true)
    await supabase.from('users').update(prof).eq('id', profile.id)
    await refreshProfile()
    toast.success('Profile updated')
    setSaving(false)
  }

  const saveApiKey = async () => {
    if (!profile) return
    await supabase.from('users').update({ custom_api_key: apiKey || null }).eq('id', profile.id)
    toast.success(apiKey ? 'Custom API key saved' : 'Reverted to platform API key')
  }

  const TABS: { id: Tab; icon: any; label: string }[] = [
    { id: 'profile',       icon: User, label: 'Profile' },
    { id: 'notifications', icon: Bell, label: 'Notifications' },
    { id: 'api',           icon: Key,  label: 'API Key' },
  ]

  return (
    <div className="p-6 md:p-8 space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your account and preferences.</p>
      </div>

      <div className="flex gap-1 border-b border-white/6 pb-0 -mb-6">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t.id ? 'border-brand-500 text-brand-300' : 'border-transparent text-slate-400 hover:text-white'}`}>
            <t.icon className="w-4 h-4" /> {t.label}
          </button>
        ))}
      </div>

      <div className="pt-6">
        {/* Profile tab */}
        {tab === 'profile' && (
          <div className="card p-6 space-y-4 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
              <input value={prof.name} onChange={e => setProf(p => ({ ...p, name: e.target.value }))} className="input" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number</label>
              <input value={prof.phone} onChange={e => setProf(p => ({ ...p, phone: e.target.value }))} className="input" placeholder="+91 98765 43210" />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">WhatsApp number</label>
              <input value={prof.whatsapp} onChange={e => setProf(p => ({ ...p, whatsapp: e.target.value }))} className="input" placeholder="+91 98765 43210" />
            </div>
            <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Save Profile'}
            </button>
          </div>
        )}

        {/* Notifications tab */}
        {tab === 'notifications' && (
          <div className="card p-6 space-y-5 max-w-xl">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Notification email</label>
              <input value={prof.notification_email} onChange={e => setProf(p => ({ ...p, notification_email: e.target.value }))} className="input" type="email" />
              <p className="text-xs text-slate-500 mt-1">Lead notifications will be sent to this email.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-4 bg-surface-800/40 rounded-xl">
                <div>
                  <p className="text-sm font-medium text-white">Email notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">Get an email for every new booking</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" checked={notif.email_notif} onChange={e => setNotif(n => ({ ...n, email_notif: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-6 bg-surface-700 peer-checked:bg-brand-600 rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
                </label>
              </div>

              <div className={`flex items-center justify-between p-4 bg-surface-800/40 rounded-xl ${profile?.plan === 'free' ? 'opacity-60' : ''}`}>
                <div>
                  <p className="text-sm font-medium text-white">WhatsApp notifications</p>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {profile?.plan === 'free' ? '🔒 Pro plan only' : 'Get a WhatsApp message for every new booking'}
                  </p>
                </div>
                <label className={`relative inline-flex items-center ${profile?.plan === 'free' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                  <input type="checkbox" disabled={profile?.plan === 'free'} checked={notif.whatsapp_notif} onChange={e => setNotif(n => ({ ...n, whatsapp_notif: e.target.checked }))} className="sr-only peer" />
                  <div className="w-10 h-6 bg-surface-700 peer-checked:bg-brand-600 rounded-full transition-colors peer-checked:after:translate-x-4 after:content-[''] after:absolute after:top-1 after:left-1 after:bg-white after:rounded-full after:h-4 after:w-4 after:transition-transform" />
                </label>
              </div>
            </div>

            <button onClick={saveProfile} disabled={saving} className="btn-primary text-sm">
              {saving ? 'Saving…' : 'Save Notification Settings'}
            </button>
          </div>
        )}

        {/* API tab */}
        {tab === 'api' && (
          <div className="card p-6 space-y-4 max-w-xl">
            <div className="bg-surface-800/40 rounded-xl p-4 text-sm">
              <p className="font-medium text-white mb-1">Platform API Status</p>
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-emerald-400 text-xs font-medium">Active</span>
              </div>
              <p className="text-slate-400 text-xs mt-2">You're currently using AppointBook's shared API key. If we go under maintenance, add your own key below.</p>
            </div>

            {profile?.plan === 'paid' ? (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Custom API Key <span className="text-slate-500">(optional)</span></label>
                  <div className="relative">
                    <input value={apiKey} onChange={e => setApiKey(e.target.value)}
                      type={showKey ? 'text' : 'password'} placeholder="sk-…"
                      className="input pr-10 font-mono text-xs" />
                    <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white">
                      {showKey ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">Leave empty to use the platform key.</p>
                </div>
                <button onClick={saveApiKey} className="btn-primary text-sm">Save API Key</button>
              </>
            ) : (
              <div className="bg-brand-500/10 border border-brand-500/20 rounded-xl p-4">
                <p className="text-brand-300 font-medium text-xs mb-1">🔒 Custom API key is a Pro feature</p>
                <p className="text-xs text-slate-400 mb-2">Add your own API key to ensure uninterrupted service during platform maintenance.</p>
                <a href="/dashboard/billing" className="text-xs text-brand-400 hover:text-brand-300">Upgrade to Pro →</a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
