import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/auth'
import { Check, CreditCard, Zap, Shield } from 'lucide-react'
import toast from 'react-hot-toast'

declare global { interface Window { Razorpay: any } }

export default function BillingPage() {
  const { profile, refreshProfile } = useAuth()
  const [pricing, setPricing] = useState({ monthly: 499, annual: 4999 })
  const [razorpayKey, setRazorpayKey] = useState('')
  const [loading, setLoading] = useState(false)
  const [cycle, setCycle] = useState<'monthly' | 'annual'>('monthly')

  useEffect(() => {
    supabase.from('site_settings').select('key,value').in('key', ['razorpay_key_id', 'paid_price_monthly', 'paid_price_annual'])
      .then(({ data }) => {
        const m = Object.fromEntries((data ?? []).map((r: any) => [r.key, r.value]))
        if (m.razorpay_key_id)      setRazorpayKey(m.razorpay_key_id)
        if (m.paid_price_monthly)   setPricing(p => ({ ...p, monthly: Number(m.paid_price_monthly) }))
        if (m.paid_price_annual)    setPricing(p => ({ ...p, annual:  Number(m.paid_price_annual) }))
      })
  }, [])

  const handleUpgrade = async () => {
    if (!profile) return
    setLoading(true)

    // Load Razorpay script
    if (!window.Razorpay) {
      await new Promise<void>((res, rej) => {
        const s = document.createElement('script')
        s.src = 'https://checkout.razorpay.com/v1/checkout.js'
        s.onload = () => res(); s.onerror = () => rej()
        document.head.appendChild(s)
      })
    }

    const amount = cycle === 'monthly' ? pricing.monthly : pricing.annual

    const options = {
      key:         razorpayKey || 'rzp_test_placeholder',
      amount:      amount * 100,   // paise
      currency:    'INR',
      name:        'AppointBook',
      description: `Pro Plan — ${cycle}`,
      prefill: { name: profile.name, email: profile.email, contact: profile.phone ?? '' },
      theme: { color: '#6366f1' },
      handler: async (response: any) => {
        // After successful payment, mark user as paid
        await supabase.from('users').update({
          plan: 'paid',
          razorpay_subscription_id: response.razorpay_payment_id
        }).eq('id', profile.id)
        await refreshProfile()
        toast.success('🎉 You\'re now on the Pro plan!')
        setLoading(false)
      },
      modal: { ondismiss: () => setLoading(false) }
    }

    try {
      const rz = new window.Razorpay(options)
      rz.open()
    } catch {
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    }
  }

  const isPaid = profile?.plan === 'paid'

  const proFeatures = [
    'Unlimited leads (Free: 50/month)',
    'No ads on your booking page',
    'Custom logo & branding',
    'Clean QR code with your logo',
    'WhatsApp notifications',
    'CSV export',
    'Custom API key support',
    'Priority email support',
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Billing</h1>
        <p className="text-slate-400 text-sm mt-0.5">Manage your subscription and plan.</p>
      </div>

      {/* Current plan */}
      <div className="card p-6 flex items-center gap-5">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isPaid ? 'bg-brand-600/20' : 'bg-white/8'}`}>
          {isPaid ? <Zap className="w-6 h-6 text-brand-400" /> : <Shield className="w-6 h-6 text-slate-400" />}
        </div>
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-400">Current plan</p>
          <p className="text-xl font-bold text-white mt-0.5">{isPaid ? '⚡ Pro Plan' : 'Free Plan'}</p>
          {isPaid && profile?.razorpay_subscription_id && (
            <p className="text-xs text-slate-500 mt-1">Payment ID: {profile.razorpay_subscription_id}</p>
          )}
        </div>
        {isPaid && (
          <span className="badge badge-green">Active</span>
        )}
      </div>

      {/* Upgrade section */}
      {!isPaid && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Billing cycle toggle */}
          <div className="md:col-span-2 flex justify-center">
            <div className="inline-flex items-center gap-1 bg-surface-800/60 rounded-xl p-1 border border-white/8">
              {(['monthly', 'annual'] as const).map(c => (
                <button key={c} onClick={() => setCycle(c)}
                  className={`px-5 py-2 rounded-lg text-sm font-medium transition ${cycle === c ? 'bg-brand-600 text-white' : 'text-slate-400 hover:text-white'}`}>
                  {c === 'monthly' ? 'Monthly' : 'Annual (save 16%)'}
                </button>
              ))}
            </div>
          </div>

          {/* Free card */}
          <div className="card p-6">
            <p className="text-xs text-slate-400 font-medium tracking-wider mb-3">CURRENT — FREE</p>
            <div className="text-4xl font-bold text-white mb-1">₹0<span className="text-base font-normal text-slate-400">/mo</span></div>
            <p className="text-sm text-slate-400 mb-6">Basic features to get started.</p>
            <ul className="space-y-2.5">
              {['1 booking page','Up to 50 leads/month','Email notifications','AppointBook branding'].map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-400">
                  <Check className="w-4 h-4 text-slate-600 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
          </div>

          {/* Pro card */}
          <div className="card p-6 border-brand-500/40 bg-brand-600/5">
            <p className="text-xs text-brand-300 font-medium tracking-wider mb-3">UPGRADE TO PRO</p>
            <div className="text-4xl font-bold text-white mb-1">
              ₹{cycle === 'monthly' ? pricing.monthly : Math.round(pricing.annual / 12)}
              <span className="text-base font-normal text-slate-400">/mo</span>
            </div>
            {cycle === 'annual' && (
              <p className="text-xs text-emerald-400 mb-1">Billed ₹{pricing.annual}/year — save ₹{pricing.monthly * 12 - pricing.annual}</p>
            )}
            <p className="text-sm text-slate-400 mb-6">Everything you need to grow.</p>
            <ul className="space-y-2.5 mb-6">
              {proFeatures.map(f => (
                <li key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                  <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />{f}
                </li>
              ))}
            </ul>
            <button onClick={handleUpgrade} disabled={loading} className="btn-primary w-full justify-center">
              <CreditCard className="w-4 h-4" />
              {loading ? 'Opening payment…' : `Upgrade to Pro — ₹${cycle === 'monthly' ? pricing.monthly : pricing.annual}/${cycle === 'monthly' ? 'mo' : 'yr'}`}
            </button>
            <p className="text-xs text-slate-500 text-center mt-3">Secure payment via Razorpay. Cancel anytime.</p>
          </div>
        </div>
      )}

      {isPaid && (
        <div className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm">Pro Features Active</h2>
          <div className="grid sm:grid-cols-2 gap-3">
            {proFeatures.map(f => (
              <div key={f} className="flex items-center gap-2.5 text-sm text-slate-300">
                <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />{f}
              </div>
            ))}
          </div>
          <div className="border-t border-white/6 pt-4">
            <p className="text-xs text-slate-500">To cancel or modify your subscription, contact support at support@appointbook.com</p>
          </div>
        </div>
      )}
    </div>
  )
}
