import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Type, Image as ImageIcon, Link as LinkIcon, Video } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const HeroBanner = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    description: '',
    image_url: '',
    cta_text: '',
    cta_link: '',
    video_url: ''
  });

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  const fetchHeroSettings = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('hero_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSettingsId(data.id);
        setFormData({
          title: data.title || '',
          subtitle: data.subtitle || '',
          description: data.description || '',
          image_url: data.image_url || '',
          cta_text: data.cta_text || '',
          cta_link: data.cta_link || '',
          video_url: data.video_url || ''
        });
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Failed to load hero configurations.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const payload = {
        ...formData,
        updated_at: new Date().toISOString()
      };

      const { error: upsertError } = await supabase
        .from('hero_settings')
        .upsert(settingsId ? { id: settingsId, ...payload } : payload);

      if (upsertError) throw upsertError;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchHeroSettings();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Synchronization failure.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Hero Buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <SectionHeader
        title="Hero Banner CMS"
        subtitle="Manage the primary visual gateway and call-to-actions of the homepage."
        icon={ImageIcon}
      />

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
           <AlertCircle size={24} />
           <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4">
           <CheckCircle2 size={24} />
           <p className="font-bold text-sm">Hero configuration deployed live.</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Type size={18} className="text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Textual Matrix</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Gold Subtitle</label>
              <input
                type="text"
                value={formData.subtitle}
                onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Main Hero Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Narrative Description</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ImageIcon size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Visual Assets</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Background Image URL</label>
              <input
                type="text"
                value={formData.image_url}
                onChange={(e) => setFormData({...formData, image_url: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">YouTube / Video URL</label>
              <div className="relative">
                <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  value={formData.video_url}
                  onChange={(e) => setFormData({...formData, video_url: e.target.value})}
                  className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CTA Text</label>
                <input
                  type="text"
                  value={formData.cta_text}
                  onChange={(e) => setFormData({...formData, cta_text: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CTA Link</label>
                <div className="relative">
                   <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input
                     type="text"
                     value={formData.cta_link}
                     onChange={(e) => setFormData({...formData, cta_link: e.target.value})}
                     className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-center">
           <button
             onClick={handleSave}
             disabled={saving}
             className="px-20 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[4px] text-xs hover:bg-emerald-700 transition-all shadow-3xl shadow-emerald-500/40 flex items-center justify-center gap-4 disabled:opacity-50"
           >
             {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
             Sync Hero Matrix
           </button>
        </div>
      </div>

      {/* Live Snapshot */}
      <div className="bg-slate-950 rounded-[48px] p-20 relative overflow-hidden">
          <div className="absolute inset-0 opacity-40">
             <img src={formData.image_url} className="w-full h-full object-cover" />
          </div>
          <div className="absolute inset-0 bg-gradient-to-r from-slate-950 to-transparent" />

          <div className="relative z-10 max-w-2xl space-y-6">
             <p className="text-gold-500 font-black uppercase tracking-[4px] text-xs">{formData.subtitle}</p>
             <h2 className="text-5xl font-black text-white tracking-tighter leading-none">{formData.title}</h2>
             <p className="text-lg text-slate-400 font-medium italic">"{formData.description}"</p>
             <div className="pt-6">
                <button className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px]">{formData.cta_text}</button>
             </div>
          </div>
      </div>
    </div>
  );
};

export default HeroBanner;
