import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Rss, Plus, RefreshCw, Trash2, Edit2, Save, X, Eye, FileText, User } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface BlogPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  category: string;
  image_url: string;
  author: string;
  published_at: string;
}

const BlogManager = () => {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<BlogPost | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('blog_posts')
        .select('*')
        .order('published_at', { ascending: false });
      if (error) throw error;
      setPosts(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const generateSlug = (title: string) => {
    return title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);

    const postData = {
      title: formData.get('title'),
      slug: formData.get('slug'),
      content: formData.get('content'),
      category: formData.get('category'),
      image_url: formData.get('image_url'),
      author: formData.get('author'),
      published_at: new Date().toISOString()
    };

    try {
      if (editingPost) {
        const { error } = await supabase.from('blog_posts').update(postData).eq('id', editingPost.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('blog_posts').insert([postData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchPosts();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Archive this news record forever?')) return;
    try {
      const { error } = await supabase.from('blog_posts').delete().eq('id', id);
      if (error) throw error;
      fetchPosts();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <SectionHeader
          title="Blog / News CMS"
          subtitle="Publish platform updates and fractional real estate insights."
          icon={Rss}
        />
        <button
          onClick={() => { setEditingPost(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} />
          New Dispatch
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing News Feed...</p>
        </div>
      ) : posts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
              <Rss size={40} />
           </div>
           <p className="text-slate-500 font-bold italic">No articles published yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {posts.map((post) => (
            <div key={post.id} className="bg-white dark:bg-slate-900 p-6 rounded-[32px] border border-slate-100 dark:border-slate-800 flex items-center gap-6 group hover:shadow-lg transition-all">
               <div className="w-40 h-24 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0">
                  <img src={post.image_url} className="w-full h-full object-cover" alt={post.title} />
               </div>
               <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                     <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg">{post.category}</span>
                     <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">By {post.author}</span>
                  </div>
                  <h4 className="text-lg font-black text-slate-900 dark:text-white truncate mt-2">{post.title}</h4>
                  <p className="text-slate-400 font-mono text-[9px] uppercase tracking-widest">{post.slug}</p>
               </div>
               <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button onClick={() => { setEditingPost(post); setIsModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-colors"><Edit2 size={18} /></button>
                  <button onClick={() => handleDelete(post.id)} className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"><Trash2 size={18} /></button>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-4xl p-10 md:p-16 border border-white dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
              </button>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{editingPost ? 'Update Entry' : 'New Dispatch'}</h3>
                    <p className="text-slate-500 font-medium italic">Publish global fractional insights.</p>
                 </div>

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Dispatch Title</label>
                          <input required name="title" defaultValue={editingPost?.title} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Slug (Permanent Link)</label>
                          <input required name="slug" defaultValue={editingPost?.slug} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white outline-none" />
                       </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Author Node</label>
                          <input required name="author" defaultValue={editingPost?.author || 'InvestLand Desk'} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                          <input required name="category" defaultValue={editingPost?.category || 'Market Insights'} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Cover Image URL</label>
                          <input required name="image_url" defaultValue={editingPost?.image_url} type="url" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                    </div>

                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Narrative Content</label>
                       <textarea required name="content" defaultValue={editingPost?.content} rows={10} className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] focus:ring-2 focus:ring-emerald-500 font-medium dark:text-white outline-none" />
                    </div>

                    <button
                      disabled={saving}
                      className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                    >
                      {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                      {editingPost ? 'Sync Dispatch Updates' : 'Anchor New Dispatch'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default BlogManager;
