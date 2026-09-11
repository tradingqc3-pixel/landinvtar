import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Search, Save, RefreshCw, CheckCircle2, Globe, Sparkles, Share2, Twitter, Layout, AlertCircle } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import clsx from 'clsx';

const SEOSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'general' | 'og' | 'twitter' | 'schema'>('general');

  const [formData, setFormData] = useState({
    browser_title: 'InvestLand — Premium Fractional Land Investment',
    meta_description: 'Invest in premium land from ₹500. Secure, transparent, and high-yield real estate assets.',
    keywords: 'land investment, fractional ownership, real estate India, InvestLand',
    canonical_url: 'https://investland.app',
    og_title: '',
    og_description: '',
    og_image: '',
    twitter_title: '',
    twitter_description: '',
    twitter_image: '',
    json_ld: '',
    google_analytics_id: 'G-XXXXXXXXXX'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the first existing row to get the current SEO configuration
      const { data, error: fetchError } = await supabase
        .from('seo_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        if (fetchError.message.includes('schema cache')) {
          throw new Error('Database schema cache is out of sync. Please refresh the page or contact support.');
        }
        throw fetchError;
      }

      if (data) {
        setSettingsId(data.id);
        setFormData({
          browser_title: data.browser_title || '',
          meta_description: data.meta_description || '',
          keywords: data.keywords || '',
          canonical_url: data.canonical_url || '',
          og_title: data.og_title || '',
          og_description: data.og_description || '',
          og_image: data.og_image || '',
          twitter_title: data.twitter_title || '',
          twitter_description: data.twitter_description || '',
          twitter_image: data.twitter_image || '',
          json_ld: data.json_ld || '',
          google_analytics_id: data.google_analytics_id || ''
        });
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError(err.message || 'System synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      // Use upsert to handle singleton row update
      const payload: any = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      // If we have an existing record ID, ensure we update that specific one
      if (settingsId) {
        payload.id = settingsId;
      }

      const { error: upsertError } = await supabase
        .from('seo_settings')
        .upsert(payload);

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchSettings();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Failed to deploy SEO changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="flex flex-col items-center justify-center h-96 gap-4">
      <RefreshCw size={32} className="text-emerald-500 animate-spin" />
      <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing SEO Matrix...</p>
    </div>
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20">
      <SectionHeader
        title="SEO Settings"
        subtitle="Command the platform's global search presence and metadata identity."
        icon={Search}
      />

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <p className="font-bold text-sm">SEO Protocol synchronized successfully across all terminals.</p>
        </div>
      )}

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-[32px] flex items-center gap-4 text-rose-600">
          <AlertCircle size={24} />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      <div className="flex gap-2 p-1 bg-slate-100 dark:bg-slate-800 w-fit rounded-2xl">
        {[
          { id: 'general', label: 'General', icon: Layout },
          { id: 'og', label: 'Open Graph', icon: Share2 },
          { id: 'twitter', label: 'Twitter Card', icon: Twitter },
          { id: 'schema', label: 'JSON-LD Schema', icon: Sparkles }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={clsx(
              "flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
              activeTab === tab.id ? "bg-white dark:bg-slate-900 text-emerald-600 shadow-sm" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl">
               {activeTab === 'general' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Browser Tab Title</label>
                       <input
                         type="text"
                         value={formData.browser_title}
                         onChange={(e) => setFormData({...formData, browser_title: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Search Engine Description</label>
                       <textarea
                         rows={4}
                         value={formData.meta_description}
                         onChange={(e) => setFormData({...formData, meta_description: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none leading-relaxed"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Ranking Keywords</label>
                       <input
                         type="text"
                         value={formData.keywords}
                         onChange={(e) => setFormData({...formData, keywords: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                         placeholder="e.g. land, investment, real estate"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Canonical URL</label>
                       <input
                         type="url"
                         value={formData.canonical_url}
                         onChange={(e) => setFormData({...formData, canonical_url: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                         placeholder="https://investland.app"
                       />
                    </div>
                 </div>
               )}

               {activeTab === 'og' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">OG Title</label>
                       <input
                         type="text"
                         value={formData.og_title}
                         onChange={(e) => setFormData({...formData, og_title: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                         placeholder="Social sharing title"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">OG Description</label>
                       <textarea
                         rows={4}
                         value={formData.og_description}
                         onChange={(e) => setFormData({...formData, og_description: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none leading-relaxed"
                         placeholder="Social sharing description"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">OG Image URL</label>
                       <input
                         type="text"
                         value={formData.og_image}
                         onChange={(e) => setFormData({...formData, og_image: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                         placeholder="https://.../og-image.jpg"
                       />
                    </div>
                 </div>
               )}

               {activeTab === 'twitter' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Twitter Title</label>
                       <input
                         type="text"
                         value={formData.twitter_title}
                         onChange={(e) => setFormData({...formData, twitter_title: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Twitter Description</label>
                       <textarea
                         rows={4}
                         value={formData.twitter_description}
                         onChange={(e) => setFormData({...formData, twitter_description: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none leading-relaxed"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Twitter Image URL</label>
                       <input
                         type="text"
                         value={formData.twitter_image}
                         onChange={(e) => setFormData({...formData, twitter_image: e.target.value})}
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                         placeholder="https://.../twitter-card.jpg"
                       />
                    </div>
                 </div>
               )}

               {activeTab === 'schema' && (
                 <div className="space-y-8 animate-in fade-in slide-in-from-left-4 duration-500">
                    <div className="space-y-4">
                       <div className="flex items-center justify-between">
                          <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Organization JSON-LD</label>
                       </div>
                       <textarea
                         rows={12}
                         value={formData.json_ld}
                         onChange={(e) => setFormData({...formData, json_ld: e.target.value})}
                         placeholder='{"@context": "https://schema.org", ...}'
                         className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white outline-none leading-relaxed"
                       />
                    </div>
                 </div>
               )}
            </div>
         </div>

         <div className="space-y-6">
            <div className="bg-emerald-600 rounded-[40px] p-10 text-white relative overflow-hidden shadow-2xl">
               <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
               <Sparkles className="w-12 h-12 mb-6" />
               <h4 className="text-xl font-black uppercase tracking-tighter mb-2">Google Preview</h4>
               <div className="bg-white rounded-2xl p-6 shadow-lg">
                  <p className="text-[#1a0dab] text-lg font-medium truncate mb-1 leading-tight">{formData.browser_title || 'Enter a title'}</p>
                  <p className="text-[#006621] text-xs font-normal mb-1 truncate">{formData.canonical_url || 'https://investland.app'}</p>
                  <p className="text-[#545454] text-xs line-clamp-2 leading-relaxed">{formData.meta_description || 'Enter a meta description to see how it looks in search results.'}</p>
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
                 className="w-full py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20 flex items-center justify-center gap-3 active:scale-95 disabled:opacity-50"
               >
                 {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                 Deploy SEO Updates
               </button>

               <div className="pt-6 border-t border-slate-50 dark:border-slate-800 space-y-4">
                  <div className="flex items-center justify-between text-slate-400">
                    <p className="text-[9px] font-black uppercase tracking-widest">PostgREST Sync</p>
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  </div>
                  <p className="text-[10px] text-slate-500 font-medium italic leading-relaxed">
                    Updates to SEO metadata are propagated to the global CDN in real-time.
                  </p>
               </div>
            </div>
         </div>
      </div>
    </div>
  );
};

export default SEOSettings;
