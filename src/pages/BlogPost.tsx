import { useEffect, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { supabase, BlogPost } from '../lib/supabase'
import { CalendarCheck, ArrowLeft, Clock } from 'lucide-react'

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>()
  const [post, setPost]     = useState<BlogPost | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!slug) return
    supabase.from('blog_posts').select('*').eq('slug', slug).eq('is_published', true).single()
      .then(({ data }) => { setPost(data); setLoading(false) })
  }, [slug])

  if (loading) return (
    <div className="min-h-screen bg-surface-950 p-6">
      <div className="max-w-2xl mx-auto space-y-4 pt-16">
        <div className="shimmer h-8 w-3/4 rounded-xl" />
        <div className="shimmer h-4 w-40 rounded" />
        <div className="shimmer h-60 w-full rounded-xl" />
        {Array.from({ length: 8 }).map((_, i) => <div key={i} className="shimmer h-3 rounded" style={{ width: `${70 + (i % 3) * 10}%` }} />)}
      </div>
    </div>
  )

  if (!post) return (
    <div className="min-h-screen bg-surface-950 flex items-center justify-center">
      <div className="text-center"><p className="text-white text-xl font-bold mb-2">Post not found</p>
      <Link to="/blog" className="text-brand-400 hover:text-brand-300 text-sm">← Back to blog</Link></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-surface-950">
      <nav className="border-b border-white/6 px-6 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-brand-600 flex items-center justify-center">
              <CalendarCheck className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-semibold text-white text-sm">AppointBook</span>
          </Link>
          <Link to="/blog" className="btn-ghost text-xs"><ArrowLeft className="w-3.5 h-3.5" /> Blog</Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-12">
        {post.category && <span className="badge badge-blue text-xs mb-4 inline-block">{post.category}</span>}
        <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-4">{post.title}</h1>
        <div className="flex items-center gap-2 text-xs text-slate-500 mb-8">
          <Clock className="w-3.5 h-3.5" />
          {post.published_at && new Date(post.published_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}
        </div>

        {post.cover_image_url && (
          <img src={post.cover_image_url} alt={post.title} className="w-full rounded-2xl object-cover h-72 mb-10" />
        )}

        <div className="prose prose-invert prose-sm max-w-none
          [&_h2]:text-white [&_h2]:text-xl [&_h2]:font-bold [&_h2]:mt-8 [&_h2]:mb-3
          [&_h3]:text-white [&_h3]:text-base [&_h3]:font-semibold [&_h3]:mt-6 [&_h3]:mb-2
          [&_p]:text-slate-300 [&_p]:leading-7 [&_p]:mb-4
          [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:text-slate-300 [&_ul]:space-y-1
          [&_ol]:list-decimal [&_ol]:pl-5 [&_ol]:text-slate-300 [&_ol]:space-y-1
          [&_code]:bg-surface-800 [&_code]:text-brand-300 [&_code]:rounded [&_code]:px-1.5 [&_code]:py-0.5 [&_code]:text-xs
          [&_strong]:text-white [&_strong]:font-semibold
          [&_a]:text-brand-400 [&_a]:underline hover:[&_a]:text-brand-300
          [&_blockquote]:border-l-2 [&_blockquote]:border-brand-500 [&_blockquote]:pl-4 [&_blockquote]:text-slate-400 [&_blockquote]:italic">
          {/* Render markdown-like content as plain text with newlines */}
          {post.content.split('\n').map((line, i) => {
            if (line.startsWith('## ')) return <h2 key={i}>{line.slice(3)}</h2>
            if (line.startsWith('### ')) return <h3 key={i}>{line.slice(4)}</h3>
            if (line.startsWith('# ')) return <h1 key={i} className="text-2xl font-bold text-white mt-6 mb-3">{line.slice(2)}</h1>
            if (line.startsWith('- ')) return <li key={i}>{line.slice(2)}</li>
            if (line === '') return <br key={i} />
            return <p key={i}>{line}</p>
          })}
        </div>

        <div className="border-t border-white/6 mt-12 pt-8 text-center">
          <p className="text-sm text-slate-400 mb-4">Ready to take appointments like a pro?</p>
          <Link to="/register" className="btn-primary">Start for free →</Link>
        </div>
      </article>
    </div>
  )
}
