import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { MessageSquareQuote, Plus, RefreshCw, Trash2, Edit2, Save, X, Star } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  content: string;
  avatar_url: string;
  rating: number;
}

const TestimonialsManager = () => {
  const [items, setItems] = useState<Testimonial[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsProfileModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Testimonial | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.from('testimonials').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const itemData = {
      name: formData.get('name'),
      role: formData.get('role'),
      content: formData.get('content'),
      avatar_url: formData.get('avatar_url'),
      rating: parseInt(formData.get('rating') as string) || 5
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from('testimonials').update(itemData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('testimonials').insert([itemData]);
        if (error) throw error;
      }
      setIsProfileModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this investor testimonial?')) return;
    try {
      const { error } = await supabase.from('testimonials').delete().eq('id', id);
      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <SectionHeader
          title="Testimonials"
          subtitle="Manage the social proof and investor feedback."
          icon={MessageSquareQuote}
        />
        <button
          onClick={() => { setEditingItem(null); setIsProfileModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} />
          Add Feedback
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Proof Records...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
              <MessageSquareQuote size={40} />
           </div>
           <p className="text-slate-500 font-bold italic">No testimonials recorded.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div key={item.id} className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm group relative">
               <div className="flex items-center gap-4 mb-6">
                  <img src={item.avatar_url} className="w-12 h-12 rounded-full object-cover shadow-md" alt={item.name} />
                  <div>
                     <h4 className="text-sm font-black dark:text-white uppercase truncate">{item.name}</h4>
                     <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{item.role}</p>
                  </div>
               </div>
               <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed italic mb-6">"{item.content}"</p>
               <div className="flex justify-between items-center pt-6 border-t border-slate-50 dark:border-slate-800">
                  <div className="flex gap-0.5 text-gold-500">
                     {[...Array(item.rating)].map((_, i) => <Star key={i} size={12} fill="currentColor" />)}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingItem(item); setIsProfileModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
                    <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-xl p-10 border border-white dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsProfileModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
              </button>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{editingItem ? 'Edit Feedback' : 'Anchor Feedback'}</h3>
                    <p className="text-slate-500 font-medium italic">Broadcast verified investor success stories.</p>
                 </div>

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Investor Name</label>
                          <input required name="name" defaultValue={editingItem?.name} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Role/Designation</label>
                          <input required name="role" defaultValue={editingItem?.role} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" placeholder="e.g., Tech Lead" />
                       </div>
                    </div>
                    <div className="grid grid-cols-3 gap-6 items-end">
                       <div className="col-span-2 space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Avatar URL</label>
                          <input required name="avatar_url" defaultValue={editingItem?.avatar_url} type="url" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Rating</label>
                          <select name="rating" defaultValue={editingItem?.rating || 5} className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none">
                             {[5, 4, 3, 2, 1].map(v => <option key={v} value={v}>{v} Stars</option>)}
                          </select>
                       </div>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Testimonial Content</label>
                       <textarea required name="content" defaultValue={editingItem?.content} rows={4} className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                    </div>

                    <button
                      disabled={saving}
                      className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                    >
                      {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                      {editingItem ? 'Sync Proof Updates' : 'Anchor New Proof'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default TestimonialsManager;
