import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { CalendarCheck, Shield } from 'lucide-react'

export default function TermsPage() {
  const [content, setContent]     = useState('')
  const [updatedAt, setUpdatedAt] = useState<string | null>(null)
  const [loading, setLoading]     = useState(true)

  useEffect(() => {
    supabase.from('legal_content').select('*').eq('type', 'terms').single()
      .then(({ data }) => {
        setContent(data?.content ?? 'Terms coming soon.')
        setUpdatedAt(data?.updated_at ?? null)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-surface-950">
      <nav className="border-b border-white/6 px-6 py-4">
        <div className="max-w-3xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">AppointBook</span>
          </Link>
        </div>
      </nav>
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="flex items-center gap-3 mb-2">
          <Shield className="w-5 h-5 text-brand-400" />
          <h1 className="text-3xl font-bold text-white">Terms & Conditions</h1>
        </div>
        {updatedAt && <p className="text-xs text-slate-500 mb-8">Last updated: {new Date(updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</p>}
        {loading
          ? <div className="space-y-3">{Array.from({ length: 12 }).map((_, i) => <div key={i} className="shimmer h-3 rounded" style={{ width: `${60 + (i % 4) * 10}%` }} />)}</div>
          : <div className="prose prose-invert prose-sm max-w-none [&_h2]:text-lg [&_h2]:font-semibold [&_h2]:text-white [&_h2]:mt-6 [&_h2]:mb-2 [&_p]:text-slate-300 [&_p]:leading-7 [&_p]:mb-4">
              {content.split('\n').map((line, i) => {
                if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
                if (line.startsWith('# '))  return <h1 key={i} className="text-xl font-bold text-white mt-6 mb-2">{line.slice(2)}</h1>
                if (line === '')            return <br key={i} />
                return <p key={i}>{line}</p>
              })}
            </div>
        }
      </div>
    </div>
  )
}
