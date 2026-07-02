import { useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { Shield, Save, Clock } from 'lucide-react'
import toast from 'react-hot-toast'

type LegalType = 'privacy' | 'terms'

async function getLegal(type: LegalType) {
  const { data } = await supabase.from('legal_content').select('*').eq('type', type).single()
  return data
}

export default function AdminLegal() {
  const [tab, setTab]         = useState<LegalType>('privacy')
  const [content, setContent] = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [saving, setSaving]   = useState(false)
  const [loading, setLoading] = useState(true)

  const load = async (type: LegalType) => {
    setLoading(true)
    const data = await getLegal(type)
    setContent(data?.content ?? getDefault(type))
    setUpdatedAt(data?.updated_at ?? null)
    setLoading(false)
  }

  useEffect(() => { load(tab) }, [tab])

  const save = async () => {
    setSaving(true)
    const now = new Date().toISOString()
    await supabase.from('legal_content').upsert({ type: tab, content, updated_at: now }, { onConflict: 'type' })
    setUpdatedAt(now)
    toast.success(`${tab === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'} saved`)
    setSaving(false)
  }

  return (
    <div className="p-6 md:p-8 space-y-6 h-full flex flex-col">
      <div>
        <h1 className="text-2xl font-bold text-white">Legal Pages</h1>
        <p className="text-slate-400 text-sm mt-0.5">Customize Privacy Policy and Terms & Conditions. Changes go live instantly.</p>
      </div>

      <div className="flex gap-1 border-b border-white/6">
        {(['privacy', 'terms'] as LegalType[]).map(t => (
          <button key={t} onClick={() => setTab(t)}
            className={`flex items-center gap-2 px-5 py-2.5 text-sm font-medium border-b-2 -mb-px transition ${tab === t ? 'border-brand-500 text-brand-300' : 'border-transparent text-slate-400 hover:text-white'}`}>
            <Shield className="w-4 h-4" />
            {t === 'privacy' ? 'Privacy Policy' : 'Terms & Conditions'}
          </button>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Clock className="w-3.5 h-3.5" />
          {updatedAt ? `Last updated: ${new Date(updatedAt).toLocaleString()}` : 'Not set yet'}
        </div>
        <div className="flex gap-2 items-center">
          <a href={tab === 'privacy' ? '/privacy-policy' : '/terms'} target="_blank" rel="noreferrer"
            className="btn-secondary text-xs">Preview Live →</a>
          <button onClick={save} disabled={saving} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> {saving ? 'Saving…' : 'Save & Publish'}
          </button>
        </div>
      </div>

      {loading
        ? <div className="flex-1 shimmer rounded-xl" />
        : <textarea value={content} onChange={e => setContent(e.target.value)}
            className="flex-1 input resize-none font-mono text-xs leading-relaxed min-h-[60vh]"
            placeholder="Write your legal content here… (Plain text or Markdown)" />
      }

      <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-4 text-xs text-amber-300">
        <Shield className="w-4 h-4 inline mr-1.5" />
        Legal tip: Make sure both pages include your company name, contact email, data retention policy, user rights, and cookie usage before going live.
      </div>
    </div>
  )
}

function getDefault(type: LegalType): string {
  if (type === 'privacy') return `# Privacy Policy

Last updated: ${new Date().toLocaleDateString()}

## 1. Information We Collect
We collect information you provide directly to us, such as when you create an account or book an appointment.

## 2. How We Use Your Information
We use the information we collect to provide, maintain, and improve our services.

## 3. Data Retention
We retain your data for as long as your account is active or as needed to provide you services.

## 4. Your Rights
You may access, correct, or delete your personal data by contacting us at support@appointbook.com.

## 5. Cookies
We use cookies to improve your experience on our platform.

## 6. Contact Us
For any privacy concerns, contact us at: support@appointbook.com`

  return `# Terms & Conditions

Last updated: ${new Date().toLocaleDateString()}

## 1. Acceptance of Terms
By accessing AppointBook, you agree to these Terms & Conditions.

## 2. Use of Service
You agree to use AppointBook only for lawful purposes and in accordance with these Terms.

## 3. User Accounts
You are responsible for maintaining the confidentiality of your account credentials.

## 4. Payments
Paid subscriptions are billed via Razorpay. All sales are final unless otherwise stated.

## 5. Termination
We reserve the right to terminate accounts that violate these terms.

## 6. Limitation of Liability
AppointBook shall not be liable for any indirect or consequential damages.

## 7. Contact
For questions about these Terms, contact: support@appointbook.com`
}
