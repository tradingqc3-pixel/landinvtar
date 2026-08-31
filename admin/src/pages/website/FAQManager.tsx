import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { HelpCircle, Plus, RefreshCw, Trash2, Edit2, Save, X, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: string;
  order_index: number;
  is_active: boolean;
}

const FAQManager = () => {
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .order('category', { ascending: true })
        .order('order_index', { ascending: true });
      if (error) throw error;
      setFaqs(data || []);
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
    const faqData = {
      question: formData.get('question'),
      answer: formData.get('answer'),
      category: formData.get('category'),
      order_index: parseInt(formData.get('order_index') as string) || 0,
      is_active: formData.get('is_active') === 'on'
    };

    try {
      if (editingFaq) {
        const { error } = await supabase.from('faqs').update(faqData).eq('id', editingFaq.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('faqs').insert([faqData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchFaqs();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this knowledge record?')) return;
    try {
      const { error } = await supabase.from('faqs').delete().eq('id', id);
      if (error) throw error;
      fetchFaqs();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <SectionHeader
          title="FAQ Manager"
          subtitle="Build and scale the InvestLand platform knowledge base."
          icon={HelpCircle}
        />
        <button
          onClick={() => { setEditingFaq(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} />
          Create Record
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Knowledge Base...</p>
        </div>
      ) : faqs.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
              <HelpCircle size={40} />
           </div>
           <p className="text-slate-500 font-bold italic">No FAQ entries found.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {faqs.map((faq) => (
            <div key={faq.id} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md group">
               <div className="flex justify-between items-start gap-4">
                  <div className="flex-1 space-y-3">
                     <div className="flex items-center gap-3">
                        <span className="px-3 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 text-[9px] font-black uppercase tracking-widest rounded-lg border border-emerald-100 dark:border-emerald-800">
                           {faq.category}
                        </span>
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[2px]">Index: {faq.order_index}</span>
                        {!faq.is_active && <span className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-400 text-[8px] font-black uppercase rounded">Draft</span>}
                     </div>
                     <h4 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight leading-tight">{faq.question}</h4>
                     <p className="text-slate-500 dark:text-slate-400 text-sm font-medium leading-relaxed italic">"{faq.answer}"</p>
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => { setEditingFaq(faq); setIsModalOpen(true); }}
                      className="p-3 bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500 rounded-xl transition-colors"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="p-3 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-xl hover:bg-rose-100 transition-colors"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
               </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-2xl p-10 md:p-16 border border-white dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
              </button>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{editingFaq ? 'Update FAQ' : 'Create FAQ'}</h3>
                    <p className="text-slate-500 font-medium italic">Define a new knowledge record for platform users.</p>
                 </div>

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                       <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Category</label>
                             <input required name="category" defaultValue={editingFaq?.category || 'General'} type="text" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                          </div>
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Sequence Index</label>
                             <input required name="order_index" defaultValue={editingFaq?.order_index || 0} type="number" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                          </div>
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Question</label>
                          <input required name="question" defaultValue={editingFaq?.question} type="text" className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Answer</label>
                          <textarea required name="answer" defaultValue={editingFaq?.answer} rows={4} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="flex items-center gap-4 pl-4 pt-4">
                          <label className="flex items-center gap-3 cursor-pointer group">
                             <div className="relative">
                                <input name="is_active" type="checkbox" defaultChecked={editingFaq?.is_active ?? true} className="peer sr-only" />
                                <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-800 rounded-lg peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all" />
                             </div>
                             <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-500 transition-colors">Visible to Public</span>
                          </label>
                       </div>
                    </div>

                    <button
                      disabled={saving}
                      className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                    >
                      {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                      {editingFaq ? 'Commit Updates' : 'Anchor New FAQ'}
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FAQManager;
