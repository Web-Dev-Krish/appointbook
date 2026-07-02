// BlogList.tsx
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { supabase, BlogPost } from '../lib/supabase'
import { CalendarCheck, Clock } from 'lucide-react'

export default function BlogList() {
  const [posts, setPosts]   = useState<BlogPost[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    supabase.from('blog_posts').select('*').eq('is_published', true)
      .order('published_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false) })
  }, [])

  return (
    <div className="min-h-screen bg-surface-950">
      <nav className="border-b border-white/6 px-6 py-4">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">AppointBook</span>
          </Link>
          <Link to="/login" className="btn-secondary text-xs">Login</Link>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto px-6 py-16">
        <div className="mb-12">
          <p className="text-xs tracking-widest text-brand-400 font-medium mb-2">BLOG</p>
          <h1 className="text-4xl font-bold text-white">Tips, guides & updates</h1>
          <p className="text-slate-400 mt-3 text-sm">Insights to help you grow your booking business.</p>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-2 gap-6">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card overflow-hidden">
                <div className="shimmer h-44 w-full rounded-none" />
                <div className="p-5 space-y-3">
                  <div className="shimmer h-4 w-20 rounded" />
                  <div className="shimmer h-5 w-full rounded" />
                  <div className="shimmer h-3 w-4/5 rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-24 text-slate-500">No posts yet. Check back soon!</div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {posts.map(p => (
              <Link key={p.id} to={`/blog/${p.slug}`} className="card overflow-hidden hover:border-brand-500/30 transition-colors group">
                {p.cover_image_url && (
                  <img src={p.cover_image_url} alt={p.title} className="h-44 w-full object-cover group-hover:scale-[1.02] transition-transform duration-300" />
                )}
                <div className="p-5 space-y-2">
                  {p.category && <span className="badge badge-blue text-[10px]">{p.category}</span>}
                  <h2 className="font-semibold text-white text-sm leading-snug group-hover:text-brand-300 transition-colors">{p.title}</h2>
                  {p.meta_description && <p className="text-xs text-slate-400 line-clamp-2">{p.meta_description}</p>}
                  <div className="flex items-center gap-1 text-xs text-slate-500 pt-1">
                    <Clock className="w-3 h-3" />
                    {p.published_at ? new Date(p.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : 'Draft'}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
