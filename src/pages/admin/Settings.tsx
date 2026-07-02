import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Save, Globe } from 'lucide-react'
import toast from 'react-hot-toast'

async function getSetting(key: string) {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
  return data?.value ?? ''
}
async function setSetting(key: string, value: string) {
  await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
}

export default function AdminSettings() {
  const [form, setForm] = useState({
    site_name: 'AppointBook', support_email: '', from_email: '',
    whatsapp_sender: '', twilio_sid: '', twilio_token: '',
  })
  const [saving, setSaving] = useState(false)
  const up = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  useEffect(() => {
    Promise.all(['site_name','support_email','from_email','whatsapp_sender','twilio_sid'].map(k => getSetting(k)))
      .then(([sn, se, fe, ws, ts]) => setForm(f => ({ ...f, site_name: sn||f.site_name, support_email: se, from_email: fe, whatsapp_sender: ws, twilio_sid: ts })))
  }, [])

  const save = async () => {
    setSaving(true)
    await Promise.all(Object.entries(form).map(([k, v]) => setSetting(k, v)))
    toast.success('Settings saved')
    setSaving(false)
  }

  const sections = [
    {
      title: '🌐 Platform',
      fields: [
        { key: 'site_name',      label: 'Platform name',    placeholder: 'AppointBook' },
        { key: 'support_email',  label: 'Support email',    placeholder: 'support@appointbook.com', type: 'email' },
      ]
    },
    {
      title: '📧 Email (Resend)',
      fields: [
        { key: 'from_email', label: 'From email address', placeholder: 'noreply@appointbook.com', type: 'email' },
      ]
    },
    {
      title: '💬 WhatsApp (Twilio)',
      fields: [
        { key: 'whatsapp_sender', label: 'WhatsApp sender number', placeholder: '+14155238886' },
        { key: 'twilio_sid',      label: 'Twilio Account SID',     placeholder: 'ACxxxxxxxxxxxxxxxx' },
        { key: 'twilio_token',    label: 'Twilio Auth Token',      placeholder: '••••••••••', type: 'password' },
      ]
    },
  ]

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Global Settings</h1>
        <p className="text-slate-400 text-sm mt-0.5">Platform-wide configuration for email, WhatsApp, and branding.</p>
      </div>

      {sections.map(s => (
        <div key={s.title} className="card p-6 space-y-4">
          <h2 className="font-semibold text-white text-sm border-b border-white/6 pb-3">{s.title}</h2>
          {s.fields.map(f => (
            <div key={f.key}>
              <label className="block text-xs font-medium text-slate-400 mb-1.5">{f.label}</label>
              <input value={(form as any)[f.key]} onChange={e => up(f.key, e.target.value)}
                type={f.type ?? 'text'} placeholder={f.placeholder} className="input" />
            </div>
          ))}
        </div>
      ))}

      <div className="card p-5 flex items-start gap-3 text-xs text-slate-400">
        <Globe className="w-4 h-4 text-brand-400 mt-0.5 flex-shrink-0" />
        <div>
          <p className="font-medium text-white mb-1">Webhook endpoints</p>
          <p>Razorpay: <code className="text-brand-300">{window.location.origin}/api/razorpay/webhook</code></p>
          <p className="mt-1">These are handled server-side. Make sure your hosting environment has the correct env variables set.</p>
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary">
        <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save Settings'}
      </button>
    </div>
  )
}
