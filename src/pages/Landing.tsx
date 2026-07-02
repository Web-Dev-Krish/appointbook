import { Link } from 'react-router-dom'
import { CalendarCheck, QrCode, Bell, BarChart3, Zap, Shield, ChevronDown, Star, ArrowRight, Check } from 'lucide-react'
import { useState } from 'react'

const features = [
  { icon: QrCode,        title: 'QR Code & Link',       desc: 'Instant shareable booking link and QR code for your business. Print it, share it, embed it anywhere.' },
  { icon: Bell,          title: 'Instant Notifications', desc: 'Email and WhatsApp alerts the moment a customer books — never miss a lead again.' },
  { icon: CalendarCheck, title: 'Visual Calendar',       desc: 'Beautiful calendar view of all appointments. Confirm, reschedule, add notes — all in one place.' },
  { icon: BarChart3,     title: 'Leads Dashboard',       desc: 'See every inquiry in a clean dashboard. Filter, export, and track conversions over time.' },
  { icon: Zap,           title: 'Instant Setup',         desc: 'Go live in under 3 minutes. No technical knowledge needed. Just sign up and share your link.' },
  { icon: Shield,        title: 'White-label Branding',  desc: 'Upload your logo, pick your color. Your customers see your brand, not ours.' },
]

const steps = [
  { n: '01', title: 'Create your account', desc: 'Sign up free in 30 seconds with email or Google.' },
  { n: '02', title: 'Set up your page',    desc: 'Add your services, availability, and branding.' },
  { n: '03', title: 'Share your link',     desc: 'Send your unique URL or let customers scan your QR code.' },
  { n: '04', title: 'Get bookings',        desc: 'Receive real-time notifications and manage everything from your dashboard.' },
]

const faqs = [
  { q: 'Is the free plan really free?', a: 'Yes. The free plan is completely free forever. We show Google Ads on your booking page to cover costs, and our watermark appears on your QR code.' },
  { q: 'How do WhatsApp notifications work?', a: 'WhatsApp notifications are available on the paid plan. You enter your WhatsApp number and we send you a message every time a new appointment is booked.' },
  { q: 'Can I use my own logo?', a: 'Yes — on the paid plan you can upload your own logo and remove all AppointBook branding from your booking page and QR code.' },
  { q: 'Is there a limit on bookings?', a: 'Free plan allows up to 50 leads per month. Paid plan is unlimited.' },
  { q: 'Can I cancel anytime?', a: 'Absolutely. Cancel your paid subscription anytime. You keep access until the end of the billing period.' },
]

function FAQ({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border border-white/8 rounded-xl overflow-hidden">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between gap-4 px-5 py-4 text-left text-sm font-medium text-slate-200 hover:bg-white/5 transition">
        <span>{q}</span>
        <ChevronDown className={`w-4 h-4 flex-shrink-0 text-slate-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="px-5 pb-4 text-sm text-slate-400 leading-relaxed border-t border-white/5">{a}</div>}
    </div>
  )
}

export default function Landing() {
  return (
    <div className="min-h-screen bg-surface-950">
      {/* Nav */}
      <nav className="fixed top-0 inset-x-0 z-50 border-b border-white/6 bg-surface-950/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4 text-white" />
            </div>
            <span className="font-semibold text-white tracking-tight">AppointBook</span>
          </Link>
          <div className="hidden md:flex items-center gap-6 text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition">Features</a>
            <a href="#pricing"  className="hover:text-white transition">Pricing</a>
            <Link to="/blog"    className="hover:text-white transition">Blog</Link>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/login"    className="btn-ghost text-sm">Log in</Link>
            <Link to="/register" className="btn-primary text-sm">Get started free</Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-40 pb-28 px-6 text-center relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-10%,rgba(99,102,241,0.15),transparent)]" />
        <div className="relative max-w-4xl mx-auto">
          <div className="inline-flex items-center gap-2 mb-6 rounded-full border border-brand-500/30 bg-brand-500/10 px-4 py-1.5 text-xs font-medium text-brand-300">
            <Star className="w-3 h-3 fill-current" />
            Smart appointment booking for every business
          </div>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white mb-6 leading-[1.08]">
            Bookings on autopilot.<br />
            <span className="text-brand-400">Zero hassle.</span>
          </h1>
          <p className="text-lg text-slate-400 mb-10 max-w-xl mx-auto leading-relaxed">
            Create your booking page in minutes. Share a link or QR code. Get appointments, leads, and real-time notifications — all in one dashboard.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/register" className="btn-primary px-8 py-3 text-base rounded-xl">
              Start for free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/book/demo" className="btn-secondary px-8 py-3 text-base rounded-xl">
              See a live demo
            </Link>
          </div>
          <p className="mt-4 text-xs text-slate-500">No credit card required · Free plan forever</p>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-brand-400 font-medium mb-3">HOW IT WORKS</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Up and running in minutes</h2>
          </div>
          <div className="grid md:grid-cols-4 gap-6">
            {steps.map(s => (
              <div key={s.n} className="card p-6 relative">
                <span className="text-4xl font-bold text-brand-500/20 mb-4 block">{s.n}</span>
                <h3 className="font-semibold text-white mb-2 text-sm">{s.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-brand-400 font-medium mb-3">FEATURES</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Everything you need, nothing you don't</h2>
          </div>
          <div className="grid md:grid-cols-3 gap-5">
            {features.map(f => (
              <div key={f.title} className="card p-6 hover:border-brand-500/30 transition-colors group">
                <div className="w-10 h-10 rounded-xl bg-brand-600/20 flex items-center justify-center mb-4 group-hover:bg-brand-600/30 transition-colors">
                  <f.icon className="w-5 h-5 text-brand-400" />
                </div>
                <h3 className="font-semibold text-white mb-2 text-sm">{f.title}</h3>
                <p className="text-xs text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="py-24 px-6 border-t border-white/5">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-xs tracking-widest text-brand-400 font-medium mb-3">PRICING</p>
            <h2 className="text-3xl md:text-4xl font-bold text-white">Simple, honest pricing</h2>
            <p className="text-slate-400 mt-3 text-sm">Start free. Upgrade when you're ready.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Free */}
            <div className="card p-8">
              <p className="text-xs text-slate-400 font-medium tracking-wider mb-3">FREE</p>
              <div className="text-4xl font-bold text-white mb-1">₹0<span className="text-base font-normal text-slate-400">/mo</span></div>
              <p className="text-sm text-slate-400 mb-8">Forever free. No card needed.</p>
              <ul className="space-y-3 mb-8">
                {['1 booking page','Up to 50 leads/month','URL + QR code','Email notifications','AppointBook branding','Ads on booking page'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-secondary w-full justify-center">Get started free</Link>
            </div>
            {/* Paid */}
            <div className="card p-8 border-brand-500/40 bg-brand-600/5 relative overflow-hidden">
              <div className="absolute top-4 right-4 badge badge-blue text-xs">Popular</div>
              <p className="text-xs text-brand-300 font-medium tracking-wider mb-3">PRO</p>
              <div className="text-4xl font-bold text-white mb-1">₹499<span className="text-base font-normal text-slate-400">/mo</span></div>
              <p className="text-sm text-slate-400 mb-8">Everything in Free, plus:</p>
              <ul className="space-y-3 mb-8">
                {['Unlimited leads','No ads on booking page','Custom logo & branding','Clean QR (your logo)','WhatsApp notifications','CSV export','Priority support','Custom API key'].map(f => (
                  <li key={f} className="flex items-center gap-3 text-sm text-slate-300">
                    <Check className="w-4 h-4 text-brand-400 flex-shrink-0" />{f}
                  </li>
                ))}
              </ul>
              <Link to="/register" className="btn-primary w-full justify-center">Upgrade to Pro</Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-12">
            <p className="text-xs tracking-widest text-brand-400 font-medium mb-3">FAQ</p>
            <h2 className="text-3xl font-bold text-white">Common questions</h2>
          </div>
          <div className="space-y-3">
            {faqs.map(f => <FAQ key={f.q} {...f} />)}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-white/5">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Ready to fill your calendar?</h2>
          <p className="text-slate-400 mb-8 text-sm">Join hundreds of businesses using AppointBook to manage their appointments.</p>
          <Link to="/register" className="btn-primary px-10 py-3.5 text-base rounded-xl">
            Create free account <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/5 py-10 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-sm text-slate-500">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-3 h-3 text-white" />
            </div>
            <span className="text-slate-400 font-medium">AppointBook</span>
          </div>
          <div className="flex items-center gap-6">
            <Link to="/blog"           className="hover:text-slate-300 transition">Blog</Link>
            <Link to="/privacy-policy" className="hover:text-slate-300 transition">Privacy</Link>
            <Link to="/terms"          className="hover:text-slate-300 transition">Terms</Link>
            <Link to="/login"          className="hover:text-slate-300 transition">Login</Link>
          </div>
          <p>© {new Date().getFullYear()} AppointBook. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}
