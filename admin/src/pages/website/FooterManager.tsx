import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Layout, Save, RefreshCw, AlertCircle, CheckCircle2, Type, Link as LinkIcon, Share2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const FooterManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    description: '',
    copyright: '',
    social_links: [] as any[],
    quick_links: [] as any[]
  });

  useEffect(() => {
    fetchFooterSettings();
  }, []);

  const fetchFooterSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('footer_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      if (data) {
        setSettingsId(data.id);
        setFormData({
          description: data.description || '',
          copyright: data.copyright || '',
          social_links: data.social_links || [],
          quick_links: data.quick_links || []
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      const payload = { ...formData, updated_at: new Date().toISOString() };
      const { error } = await supabase
        .from('footer_settings')
        .upsert(settingsId ? { id: settingsId, ...payload } : payload);

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchFooterSettings();
    } catch (err: any) {
      console.error(err);
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const updateLink = (type: 'social' | 'quick', index: number, field: string, value: string) => {
    const list = type === 'social' ? [...formData.social_links] : [...formData.quick_links];
    list[index][field] = value;
    setFormData({ ...formData, [type === 'social' ? 'social_links' : 'quick_links']: list });
  };

  const addLink = (type: 'social' | 'quick') => {
    const list = type === 'social' ? [...formData.social_links] : [...formData.quick_links];
    const newItem = type === 'social' ? { platform: '', url: '', icon: '' } : { label: '', url: '' };
    setFormData({ ...formData, [type === 'social' ? 'social_links' : 'quick_links']: [...list, newItem] });
  };

  const removeLink = (type: 'social' | 'quick', index: number) => {
    const list = type === 'social' ? [...formData.social_links] : [...formData.quick_links];
    const filtered = list.filter((_, i) => i !== index);
    setFormData({ ...formData, [type === 'social' ? 'social_links' : 'quick_links']: filtered });
  };

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw size={32} className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <SectionHeader
        title="Footer CMS"
        subtitle="Manage the persistent brand footprint and quick navigation links."
        icon={Layout}
      />

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4">
           <CheckCircle2 size={24} />
           <p className="font-bold text-sm">Footer layout synchronization complete.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <Type size={18} className="text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Global Footprint</h4>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Company Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Copyright Label</label>
                  <input
                    type="text"
                    value={formData.copyright}
                    onChange={(e) => setFormData({...formData, copyright: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>
            </div>
         </div>

         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex justify-between items-center">
               <div className="flex items-center gap-3">
                  <Share2 size={18} className="text-blue-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Social Connectors</h4>
               </div>
               <button onClick={() => addLink('social')} className="text-emerald-600 font-black text-[10px] uppercase tracking-widest hover:underline">+ Add Node</button>
            </div>

            <div className="space-y-4 max-h-[400px] overflow-y-auto pr-4 scrollbar-hide">
               {formData.social_links.map((link, idx) => (
                 <div key={idx} className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl grid grid-cols-2 gap-4 relative group">
                    <button onClick={() => removeLink('social', idx)} className="absolute -top-2 -right-2 w-8 h-8 bg-rose-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-lg scale-75 group-hover:scale-100"><RefreshCw size={14} className="rotate-45" /></button>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400">Platform</label>
                       <input value={link.platform} onChange={e => updateLink('social', idx, 'platform', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold dark:text-white" placeholder="Facebook" />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase text-slate-400">Target URL</label>
                       <input value={link.url} onChange={e => updateLink('social', idx, 'url', e.target.value)} className="w-full bg-transparent border-none p-0 focus:ring-0 font-mono text-[10px] text-emerald-600" placeholder="https://..." />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex justify-center">
         <button
           onClick={handleSave}
           disabled={saving}
           className="px-20 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[4px] text-xs hover:bg-emerald-700 transition-all shadow-3xl shadow-emerald-500/40 flex items-center justify-center gap-4 disabled:opacity-50"
         >
           {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
           Sync Footer Ledger
         </button>
      </div>
    </div>
  );
};

export default FooterManager;
