import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Search, Save, RefreshCw, CheckCircle2, Globe, Sparkles } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SEOSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    seo_title: 'InvestLand — Premium Fractional Land Investment',
    seo_description: 'Invest in premium land from ₹500. Secure, transparent, and high-yield real estate assets.',
    seo_keywords: 'land investment, fractional ownership, real estate India, InvestLand',
    google_analytics_id: 'G-XXXXXXXXXX',
    meta_tags: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('id, seo_title, seo_description, seo_keywords, google_analytics_id, meta_tags')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettingsId(data.id);
        setFormData({
          seo_title: data.seo_title || formData.seo_title,
          seo_description: data.seo_description || formData.seo_description,
          seo_keywords: data.seo_keywords || formData.seo_keywords,
          google_analytics_id: data.google_analytics_id || formData.google_analytics_id,
          meta_tags: data.meta_tags || ''
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
      let error;

      if (settingsId) {
        const res = await supabase.from('app_settings').update(payload).eq('id', settingsId);
        error = res.error;
      } else {
        const res = await supabase.from('app_settings').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchSettings();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex items-center justify-center h-96"><RefreshCw size={32} className="text-emerald-500 animate-spin" /></div>;

  return (
    <div className="space-y-6">
      <SectionHeader
        title="SEO Settings"
        subtitle="Optimize the platform for global search visibility."
        icon={Search}
      />

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold animate-in slide-in-from-top-2 duration-300">
          <CheckCircle2 size={18} />
          SEO Meta updated and indexed for sync!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Browser Tab Title</label>
                  <input
                    type="text"
                    value={formData.seo_title}
                    onChange={(e) => setFormData({...formData, seo_title: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Search Engine Description</label>
                  <textarea
                    rows={4}
                    value={formData.seo_description}
                    onChange={(e) => setFormData({...formData, seo_description: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                  />
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Ranking Keywords (Comma Separated)</label>
                  <input
                    type="text"
                    value={formData.seo_keywords}
                    onChange={(e) => setFormData({...formData, seo_keywords: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                  />
               </div>
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-emerald-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <Sparkles className="w-12 h-12 mb-6" />
               <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Search Preview</h4>
               <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <p className="text-blue-600 text-sm font-bold truncate mb-1">{formData.seo_title}</p>
                  <p className="text-emerald-700 text-[10px] font-medium mb-2">https://investland.app</p>
                  <p className="text-slate-500 text-[10px] line-clamp-2">{formData.seo_description}</p>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-8 border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Google Analytics G-ID</label>
                  <input
                    type="text"
                    value={formData.google_analytics_id}
                    onChange={(e) => setFormData({...formData, google_analytics_id: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                  />
               </div>
               <button
                 onClick={handleSave}
                 disabled={saving}
                 className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center"
               >
                 {saving ? <RefreshCw size={16} className="animate-spin" /> : 'Deploy SEO Updates'}
               </button>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SEOSettings;
