import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CalendarCheck, Mail, Lock, User, Chrome, Building } from 'lucide-react'
import toast from 'react-hot-toast'

export default function RegisterPage() {
  const nav = useNavigate()
  const [step, setStep]   = useState(1)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', email: '', password: '',
    business_name: '', phone: '', description: '',
  })

  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const handleGoogle = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (step === 1) { setStep(2); return }
    setLoading(true)
    const slug = form.business_name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const { data, error } = await supabase.auth.signUp({ email: form.email, password: form.password })
    if (error) { toast.error(error.message); setLoading(false); return }
    if (data.user) {
      await supabase.from('users').insert({
        id: data.user.id,
        email: form.email,
        name: form.name,
        business_name: form.business_name,
        phone: form.phone,
        description: form.description,
        slug: `${slug}-${Math.random().toString(36).slice(2, 6)}`,
        plan: 'free',
        role: 'user',
        notification_email: form.email,
      })
    }
    toast.success('Account created! Please verify your email.')
    nav('/dashboard')
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-surface-950">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2.5 mb-6">
            <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-semibold text-white">AppointBook</span>
          </Link>
          <h1 className="text-2xl font-bold text-white">Create your account</h1>
          <p className="text-slate-400 text-sm mt-1">Free forever. No credit card needed.</p>
        </div>

        {/* Step indicators */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2].map(s => (
            <div key={s} className={`h-1.5 w-12 rounded-full transition-colors ${step >= s ? 'bg-brand-500' : 'bg-white/10'}`} />
          ))}
        </div>

        <div className="card p-6">
          {step === 1 && (
            <>
              <button onClick={handleGoogle} className="btn-secondary w-full justify-center gap-3 mb-4">
                <Chrome className="w-4 h-4" /> Continue with Google
              </button>
              <div className="flex items-center gap-3 text-xs text-slate-500 mb-4">
                <div className="flex-1 h-px bg-white/8" /> or <div className="flex-1 h-px bg-white/8" />
              </div>
            </>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {step === 1 && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Full name</label>
                  <div className="relative"><User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.name} onChange={e => up('name', e.target.value)} required placeholder="Your name" className="input pl-9" /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Email</label>
                  <div className="relative"><Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.email} onChange={e => up('email', e.target.value)} type="email" required placeholder="you@example.com" className="input pl-9" /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Password</label>
                  <div className="relative"><Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.password} onChange={e => up('password', e.target.value)} type="password" required placeholder="Min 8 characters" minLength={8} className="input pl-9" /></div>
                </div>
                <button type="submit" className="btn-primary w-full justify-center">Continue →</button>
              </>
            )}
            {step === 2 && (
              <>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Business name</label>
                  <div className="relative"><Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                    <input value={form.business_name} onChange={e => up('business_name', e.target.value)} required placeholder="My Business" className="input pl-9" /></div>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Phone number</label>
                  <input value={form.phone} onChange={e => up('phone', e.target.value)} placeholder="+91 98765 43210" className="input" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Short description <span className="text-slate-500">(optional)</span></label>
                  <textarea value={form.description} onChange={e => up('description', e.target.value)}
                    placeholder="What does your business do?" rows={3} className="input resize-none" />
                </div>
                <div className="flex gap-3">
                  <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 justify-center">Back</button>
                  <button type="submit" disabled={loading} className="btn-primary flex-1 justify-center">
                    {loading ? 'Creating…' : 'Create account'}
                  </button>
                </div>
              </>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-slate-500 mt-5">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
        <p className="text-center text-xs text-slate-600 mt-3">
          By creating an account you agree to our{' '}
          <Link to="/terms" className="underline hover:text-slate-400">Terms</Link> and{' '}
          <Link to="/privacy-policy" className="underline hover:text-slate-400">Privacy Policy</Link>
        </p>
      </div>
    </div>
  )
}
