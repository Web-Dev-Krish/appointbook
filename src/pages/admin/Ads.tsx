import { useEffect, useState } from 'react'
import { supabase, SponsoredAd } from '../../lib/supabase'
import { Plus, Trash2, ToggleLeft, ToggleRight, Clock, ExternalLink } from 'lucide-react'
import toast from 'react-hot-toast'

async function getSetting(key: string) {
  const { data } = await supabase.from('site_settings').select('value').eq('key', key).single()
  return data?.value ?? ''
}
async function setSetting(key: string, value: string) {
  await supabase.from('site_settings').upsert({ key, value }, { onConflict: 'key' })
}

export default function AdminAds() {
  const [adsenseId, setAdsenseId]     = useState('')
  const [adsenseOn, setAdsenseOn]     = useState(true)
  const [sponsored, setSponsored]     = useState<SponsoredAd[]>([])
  const [loading, setLoading]         = useState(true)
  const [saving, setSaving]           = useState(false)
  const [showForm, setShowForm]       = useState(false)
  const [form, setForm] = useState({
    title: '', target_url: '', image_url: '',
    start_at: '', end_at: '', is_active: true
  })

  useEffect(() => {
    Promise.all([
      getSetting('adsense_publisher_id'),
      getSetting('adsense_enabled'),
      supabase.from('sponsored_ads').select('*').order('start_at', { ascending: false })
    ]).then(([aid, aon, ads]) => {
      if (aid) setAdsenseId(aid)
      setAdsenseOn(aon !== 'false')
      setSponsored(ads.data ?? [])
      setLoading(false)
    })
  }, [])

  const saveAdSense = async () => {
    setSaving(true)
    await Promise.all([
      setSetting('adsense_publisher_id', adsenseId),
      setSetting('adsense_enabled', String(adsenseOn)),
    ])
    toast.success('AdSense settings saved')
    setSaving(false)
  }

  const addSponsored = async () => {
    if (!form.title || !form.target_url || !form.start_at || !form.end_at) {
      toast.error('Fill all required fields'); return
    }
    const { data } = await supabase.from('sponsored_ads').insert(form).select().single()
    if (data) { setSponsored(s => [data, ...s]); setForm({ title: '', target_url: '', image_url: '', start_at: '', end_at: '', is_active: true }); setShowForm(false) }
    toast.success('Sponsored ad added')
  }

  const toggleAd = async (id: string, is_active: boolean) => {
    await supabase.from('sponsored_ads').update({ is_active }).eq('id', id)
    setSponsored(s => s.map(x => x.id === id ? { ...x, is_active } : x))
  }

  const deleteAd = async (id: string) => {
    await supabase.from('sponsored_ads').delete().eq('id', id)
    setSponsored(s => s.filter(x => x.id !== id))
    toast.success('Ad removed')
  }

  const now = new Date()
  const isLive = (ad: SponsoredAd) => ad.is_active && new Date(ad.start_at) <= now && new Date(ad.end_at) >= now

  return (
    <div className="p-6 md:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Ads Manager</h1>
        <p className="text-slate-400 text-sm mt-0.5">Control Google AdSense and scheduled sponsored ads.</p>
      </div>

      {/* AdSense */}
      <div className="card p-6 space-y-4">
        <div className="flex items-center justify-between border-b border-white/6 pb-3">
          <h2 className="font-semibold text-white text-sm">Google AdSense</h2>
          <button onClick={() => setAdsenseOn(!adsenseOn)} className="flex items-center gap-2 text-sm transition">
            {adsenseOn
              ? <><ToggleRight className="w-8 h-8 text-brand-400" /><span className="text-emerald-400 text-xs font-medium">Enabled</span></>
              : <><ToggleLeft  className="w-8 h-8 text-slate-500" /><span className="text-slate-400 text-xs">Disabled</span></>
            }
          </button>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">AdSense Publisher ID</label>
          <input value={adsenseId} onChange={e => setAdsenseId(e.target.value)} placeholder="pub-0000000000000000" className="input font-mono text-xs" />
          <p className="text-xs text-slate-500 mt-1">Ads appear on blog pages, landing page, and free-plan booking pages.</p>
        </div>
        <button onClick={saveAdSense} disabled={saving} className="btn-primary text-sm">
          {saving ? 'Saving…' : 'Save AdSense Settings'}
        </button>
      </div>

      {/* Sponsored Ads */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-white/6 flex items-center justify-between">
          <div>
            <h2 className="font-semibold text-white text-sm">Sponsored Ads</h2>
            <p className="text-xs text-slate-400 mt-0.5">Scheduled ads automatically replace AdSense during their active window.</p>
          </div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary text-xs">
            <Plus className="w-3.5 h-3.5" /> New Ad
          </button>
        </div>

        {/* Add form */}
        {showForm && (
          <div className="px-6 py-5 border-b border-white/6 bg-surface-800/30 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
                <input value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} className="input" placeholder="Summer Campaign" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Target URL *</label>
                <input value={form.target_url} onChange={e => setForm(f => ({ ...f, target_url: e.target.value }))} className="input" placeholder="https://example.com" />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">Image URL (optional)</label>
                <input value={form.image_url} onChange={e => setForm(f => ({ ...f, image_url: e.target.value }))} className="input" placeholder="https://…/banner.png" />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">Start *</label>
                  <input type="datetime-local" value={form.start_at} onChange={e => setForm(f => ({ ...f, start_at: e.target.value }))} className="input text-xs" />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1.5">End *</label>
                  <input type="datetime-local" value={form.end_at} onChange={e => setForm(f => ({ ...f, end_at: e.target.value }))} className="input text-xs" />
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={addSponsored} className="btn-primary text-sm">Create Ad</button>
              <button onClick={() => setShowForm(false)} className="btn-secondary text-sm">Cancel</button>
            </div>
          </div>
        )}

        <div className="divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className="shimmer h-12 w-12 rounded-xl" />
                <div className="flex-1 space-y-2"><div className="shimmer h-4 w-48 rounded" /><div className="shimmer h-3 w-32 rounded" /></div>
              </div>
            ))
          ) : sponsored.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500 text-sm">No sponsored ads yet.</div>
          ) : sponsored.map(ad => {
            const live = isLive(ad)
            return (
              <div key={ad.id} className="px-6 py-4 flex items-center gap-4">
                {ad.image_url
                  ? <img src={ad.image_url} alt="" className="w-12 h-12 rounded-xl object-cover flex-shrink-0" />
                  : <div className="w-12 h-12 rounded-xl bg-surface-800 flex items-center justify-center flex-shrink-0"><Clock className="w-5 h-5 text-slate-500" /></div>
                }
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-white">{ad.title}</p>
                    {live && <span className="badge bg-emerald-500/15 text-emerald-400 text-[10px]">LIVE</span>}
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {new Date(ad.start_at).toLocaleString()} → {new Date(ad.end_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <a href={ad.target_url} target="_blank" rel="noreferrer" className="btn-ghost p-1.5">
                    <ExternalLink className="w-4 h-4" />
                  </a>
                  <button onClick={() => toggleAd(ad.id, !ad.is_active)} className="btn-ghost p-1.5">
                    {ad.is_active
                      ? <ToggleRight className="w-5 h-5 text-brand-400" />
                      : <ToggleLeft  className="w-5 h-5 text-slate-500" />
                    }
                  </button>
                  <button onClick={() => deleteAd(ad.id)} className="btn-ghost p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/10">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
