import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Key, AlertTriangle, CheckCircle, WifiOff } from 'lucide-react'
import toast from 'react-hot-toast'

type SettingRow = { key: string; value: string }

async function getSetting(key: string): Promise<string> {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
  return data?.value ?? ''
}
async function setSetting(key: string, value: string) {
  await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
}

export default function AdminPlans() {
  const [monthly, setMonthly]         = useState('499')
  const [annual, setAnnual]           = useState('4999')
  const [rzKey, setRzKey]             = useState('')
  const [rzSecret, setRzSecret]       = useState('')
  const [rzWebhook, setRzWebhook]     = useState('')
  const [apiStatus, setApiStatus]     = useState<'active' | 'maintenance'>('active')
  const [freeLimit, setFreeLimit]     = useState('50')
  const [saving, setSaving]           = useState(false)

  useEffect(() => {
    Promise.all([
      getSetting('paid_price_monthly'),
      getSetting('paid_price_annual'),
      getSetting('razorpay_key_id'),
      getSetting('razorpay_webhook_secret'),
      getSetting('api_status'),
      getSetting('free_lead_limit'),
    ]).then(([m, a, rk, rw, as_, fl]) => {
      if (m)  setMonthly(m)
      if (a)  setAnnual(a)
      if (rk) setRzKey(rk)
      if (rw) setRzWebhook(rw)
      if (as_) setApiStatus(as_ as any)
      if (fl) setFreeLimit(fl)
    })
  }, [])

  const saveAll = async () => {
    setSaving(true)
    await Promise.all([
      setSetting('paid_price_monthly', monthly),
      setSetting('paid_price_annual', annual),
      setSetting('razorpay_key_id', rzKey),
      setSetting('razorpay_webhook_secret', rzWebhook),
      setSetting('api_status', apiStatus),
      setSetting('free_lead_limit', freeLimit),
    ])
    toast.success('Settings saved')
    setSaving(false)
  }

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Plans & Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Configure pricing, Razorpay, and API status.</p>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Pricing */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">💰 Pricing</h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Pro plan — Monthly price (₹)</label>
            <input value={monthly} onChange={e => setMonthly(e.target.value)} type="number" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Pro plan — Annual price (₹)</label>
            <input value={annual} onChange={e => setAnnual(e.target.value)} type="number" className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Free plan lead limit (per month)</label>
            <input value={freeLimit} onChange={e => setFreeLimit(e.target.value)} type="number" className="input" />
          </div>
        </div>

        {/* Razorpay */}
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">
            <Key className="w-4 h-4 inline mr-1.5 text-brand-400" />Razorpay Configuration
          </h2>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Key ID</label>
            <input value={rzKey} onChange={e => setRzKey(e.target.value)} placeholder="rzp_live_…" className="input font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Webhook Secret</label>
            <input value={rzWebhook} onChange={e => setRzWebhook(e.target.value)} type="password" placeholder="whsec_…" className="input font-mono text-xs" />
          </div>
          <div className="bg-surface-800/40 rounded-xl p-3 text-xs text-slate-400">
            <strong className="text-white">Webhook URL to set in Razorpay:</strong><br />
            <code className="text-brand-300 break-all">{window.location.origin}/api/razorpay/webhook</code>
          </div>
        </div>

        {/* API Status */}
        <div className="card p-6 space-y-4 lg:col-span-2">
          <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">🔌 Platform API Status</h2>
          <p className="text-xs text-slate-400">Control whether AppointBook's shared API key is active or under maintenance. If set to maintenance, users are prompted to add their own API key.</p>
          <div className="grid sm:grid-cols-2 gap-3">
            <button onClick={() => setApiStatus('active')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition ${apiStatus === 'active' ? 'border-emerald-500/50 bg-emerald-500/10' : 'border-white/8 hover:border-white/20'}`}>
              <CheckCircle className={`w-5 h-5 ${apiStatus === 'active' ? 'text-emerald-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${apiStatus === 'active' ? 'text-emerald-300' : 'text-slate-400'}`}>Active</p>
                <p className="text-xs text-slate-500">API is live and working normally</p>
              </div>
            </button>
            <button onClick={() => setApiStatus('maintenance')}
              className={`flex items-center gap-3 p-4 rounded-xl border transition ${apiStatus === 'maintenance' ? 'border-amber-500/50 bg-amber-500/10' : 'border-white/8 hover:border-white/20'}`}>
              <WifiOff className={`w-5 h-5 ${apiStatus === 'maintenance' ? 'text-amber-400' : 'text-slate-500'}`} />
              <div className="text-left">
                <p className={`text-sm font-medium ${apiStatus === 'maintenance' ? 'text-amber-300' : 'text-slate-400'}`}>Under Maintenance</p>
                <p className="text-xs text-slate-500">Users will be prompted to use own key</p>
              </div>
            </button>
          </div>
          {apiStatus === 'maintenance' && (
            <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
              <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              Warning: Platform API is currently set to maintenance. Free plan users without a custom key will see limited functionality.
            </div>
          )}
        </div>
      </div>

      <button onClick={saveAll} disabled={saving} className="btn-primary">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save All Settings'}
      </button>
    </div>
  )
}
