import { useEffect, useState } from 'react'
import { supabase, BlogPost } from '../../lib/supabase'
import { Plus, Edit2, Trash2, Eye, EyeOff, X, Save, Image } from 'lucide-react'
import toast from 'react-hot-toast'

const EMPTY: Partial<BlogPost> = {
  title: '', slug: '', content: '', cover_image_url: '',
  category: '', meta_title: '', meta_description: '', is_published: false
}

function BlogEditor({ post, onSave, onClose }: { post: Partial<BlogPost>; onSave: (p: Partial<BlogPost>) => void; onClose: () => void }) {
  const [form, setForm] = useState(post)
  const up = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }))

  const autoSlug = (title: string) =>
    title.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').slice(0, 60)

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-surface-950 overflow-y-auto">
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/6 sticky top-0 bg-surface-950 z-10">
        <h2 className="text-base font-semibold text-white">{post.id ? 'Edit Post' : 'New Post'}</h2>
        <div className="flex items-center gap-3">
          <button onClick={() => up('is_published', !form.is_published)}
            className={`badge cursor-pointer ${form.is_published ? 'badge-green' : 'badge bg-white/8 text-slate-400'}`}>
            {form.is_published ? '● Published' : '○ Draft'}
          </button>
          <button onClick={() => onSave(form)} className="btn-primary text-sm">
            <Save className="w-4 h-4" /> Save Post
          </button>
          <button onClick={onClose} className="btn-ghost p-2"><X className="w-4 h-4" /></button>
        </div>
      </div>

      <div className="flex-1 max-w-4xl mx-auto w-full p-6 space-y-5">
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Title *</label>
          <input value={form.title} onChange={e => { up('title', e.target.value); if (!post.id) up('slug', autoSlug(e.target.value)) }}
            placeholder="Post title…" className="input text-lg py-3 font-medium" />
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Slug *</label>
            <input value={form.slug} onChange={e => up('slug', e.target.value)} placeholder="my-post-slug" className="input font-mono text-xs" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Category</label>
            <input value={form.category} onChange={e => up('category', e.target.value)} placeholder="Tips, News, Guide…" className="input" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">
            <Image className="w-3.5 h-3.5 inline mr-1" />Cover Image URL
          </label>
          <input value={form.cover_image_url} onChange={e => up('cover_image_url', e.target.value)} placeholder="https://…/image.jpg" className="input" />
          {form.cover_image_url && <img src={form.cover_image_url} alt="" className="mt-2 h-32 w-full object-cover rounded-xl" />}
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-400 mb-1.5">Content *</label>
          <textarea value={form.content} onChange={e => up('content', e.target.value)}
            rows={16} placeholder="Write your post here… (Markdown supported)"
            className="input resize-none font-mono text-sm leading-relaxed" />
        </div>
        <div className="card p-5 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">SEO Settings</p>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta title</label>
            <input value={form.meta_title} onChange={e => up('meta_title', e.target.value)} placeholder={form.title} className="input" />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-400 mb-1.5">Meta description</label>
            <textarea value={form.meta_description} onChange={e => up('meta_description', e.target.value)}
              rows={2} placeholder="Brief description for search engines…" className="input resize-none" />
            <p className="text-xs text-slate-600 mt-1">{(form.meta_description ?? '').length}/160 chars</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function AdminBlog() {
  const [posts, setPosts]       = useState<BlogPost[]>([])
  const [loading, setLoading]   = useState(true)
  const [editing, setEditing]   = useState<Partial<BlogPost> | null>(null)

  const load = () =>
    supabase.from('blog_posts').select('*').order('created_at', { ascending: false })
      .then(({ data }) => { setPosts(data ?? []); setLoading(false) })

  useEffect(() => { load() }, [])

  const savePost = async (form: Partial<BlogPost>) => {
    if (!form.title || !form.slug) { toast.error('Title and slug required'); return }
    if (form.id) {
      const { data } = await supabase.from('blog_posts').update({ ...form, published_at: form.is_published ? new Date().toISOString() : null }).eq('id', form.id).select().single()
      if (data) setPosts(p => p.map(x => x.id === data.id ? data : x))
    } else {
      const { data } = await supabase.from('blog_posts').insert({ ...form, published_at: form.is_published ? new Date().toISOString() : null }).select().single()
      if (data) setPosts(p => [data, ...p])
    }
    setEditing(null)
    toast.success('Post saved')
  }

  const togglePublish = async (post: BlogPost) => {
    const is_published = !post.is_published
    await supabase.from('blog_posts').update({ is_published, published_at: is_published ? new Date().toISOString() : null }).eq('id', post.id)
    setPosts(p => p.map(x => x.id === post.id ? { ...x, is_published } : x))
    toast.success(is_published ? 'Post published' : 'Post unpublished')
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    await supabase.from('blog_posts').delete().eq('id', id)
    setPosts(p => p.filter(x => x.id !== id))
    toast.success('Post deleted')
  }

  return (
    <>
      {editing && <BlogEditor post={editing} onSave={savePost} onClose={() => setEditing(null)} />}

      <div className="p-6 md:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">Blog</h1>
            <p className="text-slate-400 text-sm mt-0.5">{posts.length} posts</p>
          </div>
          <button onClick={() => setEditing(EMPTY)} className="btn-primary text-sm">
            <Plus className="w-4 h-4" /> New Post
          </button>
        </div>

        <div className="card divide-y divide-white/5">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="px-6 py-4 flex gap-4">
                <div className="shimmer h-12 w-16 rounded-xl flex-shrink-0" />
                <div className="flex-1 space-y-2"><div className="shimmer h-4 w-64 rounded" /><div className="shimmer h-3 w-32 rounded" /></div>
              </div>
            ))
          ) : posts.length === 0 ? (
            <div className="px-6 py-12 text-center text-slate-500">No posts yet. Create your first post.</div>
          ) : posts.map(p => (
            <div key={p.id} className="px-6 py-4 flex items-center gap-4 hover:bg-white/2 transition">
              {p.cover_image_url
                ? <img src={p.cover_image_url} alt="" className="w-16 h-12 rounded-xl object-cover flex-shrink-0" />
                : <div className="w-16 h-12 rounded-xl bg-surface-800 flex-shrink-0" />
              }
              <div className="flex-1 min-w-0">
                <p className="font-medium text-white text-sm truncate">{p.title}</p>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-xs text-slate-500">/blog/{p.slug}</span>
                  {p.category && <span className="text-xs text-brand-400">{p.category}</span>}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className={p.is_published ? 'badge badge-green' : 'badge bg-white/8 text-slate-500'}>
                  {p.is_published ? 'Live' : 'Draft'}
                </span>
                <button onClick={() => togglePublish(p)} className="btn-ghost p-1.5">
                  {p.is_published ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button onClick={() => setEditing(p)} className="btn-ghost p-1.5">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deletePost(p.id)} className="btn-ghost p-1.5 text-red-400 hover:bg-red-500/10">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  )
}
