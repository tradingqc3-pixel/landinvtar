import React, { useEffect, useState, useRef } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Type, Image as ImageIcon, Link as LinkIcon, Loader2, Zap, ShieldCheck, Video, UploadCloud, Play } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Hero Banner CMS - Configuration Terminal
 * Handles narrative mapping, visual asset deployment, and real-time snapshot preview.
 */
const HeroBanner = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [uploading, setUploading] = useState(false);

  const thumbInputRef = useRef<HTMLInputElement>(null);

  // Default values following the platform's visual identity
  const DEFAULT_HERO = {
    goldSubtitle: "India's #1 Land Investment Platform",
    heroTitle: "Invest in Premium Land from ₹500",
    description: "Democratizing real estate ownership through fractional investment.",
    backgroundImage: "https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg",
    ctaText: "Start Investing",
    ctaLink: "/projects",
    watchButtonText: "Watch Strategy",
    watchVideoType: "youtube",
    watchVideoUrl: "",
    watchThumbnailUrl: "",
    watchEnabled: false
  };

  // Form State
  const [formData, setFormData] = useState({
    id: '',
    goldSubtitle: '',
    heroTitle: '',
    description: '',
    backgroundImage: '',
    ctaText: '',
    ctaLink: '',
    watchButtonText: '',
    watchVideoType: '',
    watchVideoUrl: '',
    watchThumbnailUrl: '',
    watchEnabled: false
  });

  useEffect(() => {
    fetchHeroSettings();
  }, []);

  /**
   * REQUIREMENT: Fetch active hero configuration directly from Supabase
   * bypassing the backend terminal for direct cloud synchronization.
   */
  const fetchHeroSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. First, check if the table exists by doing a simple count or select
      // This helps verify schema cache synchronization
      const { data, error: sbError } = await supabase
        .from('hero_banner')
        .select('*')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (sbError) {
        if (sbError.code === 'PGRST204' || sbError.message?.includes('schema cache')) {
          throw new Error("Supabase Schema Error: The 'hero_banner' table was not found in the 'public' schema. Please run the migration to add the required columns.");
        }
        throw sbError;
      }

      if (data) {
        setFormData({
          id: data.id || '',
          goldSubtitle: data.gold_subtitle || '',
          heroTitle: data.hero_title || '',
          description: data.description || '',
          backgroundImage: data.background_image_url || '',
          ctaText: data.cta_text || '',
          ctaLink: data.cta_link || '',
          watchButtonText: data.watch_button_text || 'Watch Strategy',
          watchVideoType: data.watch_video_type || 'youtube',
          watchVideoUrl: data.watch_video_url || '',
          watchThumbnailUrl: data.watch_thumbnail_url || '',
          watchEnabled: data.watch_enabled ?? false
        });
      } else {
        // Fallback to default schema if no record exists
        setFormData({
          id: '',
          ...DEFAULT_HERO
        });
      }
    } catch (err: any) {
      console.error('[CMS Cloud Error]:', err);
      setError(err.message || `Cloud Synchronization failure: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-watch-thumb-${Date.now()}.${fileExt}`;
      const filePath = `hero/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('website_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website_assets')
        .getPublicUrl(filePath);

      setFormData(prev => ({ ...prev, watchThumbnailUrl: publicUrl }));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failure.');
    } finally {
      setUploading(false);
    }
  };

  /**
   * Requirement: Direct Persistence logic to Supabase
   */
  const handleSave = async () => {
    if (!formData.heroTitle || !formData.backgroundImage) {
      setError('Hero Title and Background Image are mandatory attributes.');
      return;
    }

    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const payload = {
        gold_subtitle: formData.goldSubtitle,
        hero_title: formData.heroTitle,
        description: formData.description,
        background_image_url: formData.backgroundImage,
        cta_text: formData.ctaText,
        cta_link: formData.ctaLink,
        watch_button_text: formData.watchButtonText,
        watch_video_type: formData.watchVideoType,
        watch_video_url: formData.watchVideoUrl,
        watch_thumbnail_url: formData.watchThumbnailUrl,
        watch_enabled: formData.watchEnabled,
        updated_at: new Date().toISOString()
      };

      let sbResult;
      if (formData.id) {
        sbResult = await supabase
          .from('hero_banner')
          .update(payload)
          .eq('id', formData.id);
      } else {
        sbResult = await supabase
          .from('hero_banner')
          .insert([{ ...payload, is_active: true }]);
      }

      if (sbResult.error) throw sbResult.error;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchHeroSettings();
    } catch (err: any) {
      console.error('[CMS Cloud Save Error]:', err);
      setError(`Deployment failure: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-[4px] text-[10px]">Syncing Hero Buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionHeader
          title="Hero Banner CMS"
          subtitle="Command the platform's primary visual gateway and call-to-actions."
          icon={ImageIcon}
        />
        <div className="px-6 py-3 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800 rounded-2xl flex items-center gap-3">
           <ShieldCheck size={18} className="text-emerald-500" />
           <div>
              <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest leading-none">Status: Connected</p>
              <p className="text-[10px] text-slate-500 font-bold tracking-tighter">Direct Cloud Synchronization : Supabase</p>
           </div>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4 shadow-sm">
           <AlertCircle size={24} />
           <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4 shadow-sm">
           <CheckCircle2 size={24} />
           <p className="font-bold text-sm">Hero configuration deployed successfully to cloud.</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-12 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <Type size={18} className="text-emerald-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Narrative Matrix</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Gold Subtitle</label>
              <input
                type="text"
                value={formData.goldSubtitle}
                onChange={(e) => setFormData({...formData, goldSubtitle: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                placeholder="e.g. India's #1 Land Investment Platform"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Main Hero Title</label>
              <input
                type="text"
                value={formData.heroTitle}
                onChange={(e) => setFormData({...formData, heroTitle: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                placeholder="e.g. Invest in Premium Land from ₹500"
              />
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Platform Narrative</label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none leading-relaxed"
                placeholder="Enter compelling homepage copy..."
              />
            </div>
          </div>

          <div className="space-y-6">
            <div className="flex items-center gap-3">
              <ImageIcon size={18} className="text-blue-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Visual Deployment</h4>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Background Identity URL</label>
              <input
                type="text"
                value={formData.backgroundImage}
                onChange={(e) => setFormData({...formData, backgroundImage: e.target.value})}
                className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                placeholder="https://images.unsplash.com/..."
              />
            </div>

            <div className="grid grid-cols-2 gap-6 pt-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CTA Button Text</label>
                <input
                  type="text"
                  value={formData.ctaText}
                  onChange={(e) => setFormData({...formData, ctaText: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  placeholder="e.g. Start Investing"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">CTA Target Path</label>
                <div className="relative">
                   <LinkIcon className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                   <input
                     type="text"
                     value={formData.ctaLink}
                     onChange={(e) => setFormData({...formData, ctaLink: e.target.value})}
                     className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                     placeholder="e.g. /projects"
                   />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* WATCH STRATEGY SECTION */}
        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 space-y-8 relative z-10">
           <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                 <Video size={18} className="text-purple-600" />
                 <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Watch Strategy Module</h4>
              </div>
              <div className="flex items-center gap-3">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Enable Feature</label>
                 <button
                   onClick={() => setFormData({...formData, watchEnabled: !formData.watchEnabled})}
                   className={cn(
                     "w-12 h-6 rounded-full transition-all relative",
                     formData.watchEnabled ? "bg-emerald-600" : "bg-slate-200 dark:bg-slate-700"
                   )}
                 >
                    <div className={cn(
                      "absolute top-1 w-4 h-4 rounded-full bg-white transition-all",
                      formData.watchEnabled ? "left-7" : "left-1"
                    )} />
                 </button>
              </div>
           </div>

           <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Button Label</label>
                 <input
                   type="text"
                   value={formData.watchButtonText}
                   onChange={(e) => setFormData({...formData, watchButtonText: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                   placeholder="e.g. Watch Strategy"
                 />
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Video Source Type</label>
                 <select
                   value={formData.watchVideoType}
                   onChange={(e) => setFormData({...formData, watchVideoType: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none appearance-none cursor-pointer"
                 >
                    <option value="youtube">YouTube</option>
                    <option value="mp4">Direct MP4</option>
                    <option value="vimeo">Vimeo</option>
                 </select>
              </div>
              <div className="space-y-2">
                 <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Stream URL</label>
                 <input
                   type="text"
                   value={formData.watchVideoUrl}
                   onChange={(e) => setFormData({...formData, watchVideoUrl: e.target.value})}
                   className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white outline-none"
                   placeholder="https://..."
                 />
              </div>
           </div>

           <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Thumbnail Gateway</label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                 <div
                   className="aspect-video rounded-3xl overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 cursor-pointer hover:border-emerald-500 transition-all relative group"
                   onClick={() => thumbInputRef.current?.click()}
                 >
                    {formData.watchThumbnailUrl ? (
                       <img src={formData.watchThumbnailUrl} className="w-full h-full object-cover" alt="Thumb" />
                    ) : (
                       <>
                          <UploadCloud size={32} className="text-slate-300" />
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Poster Image</p>
                       </>
                    )}
                    {uploading && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><RefreshCw className="animate-spin text-white" /></div>}
                 </div>
                 <div className="space-y-4">
                    <input
                      type="text"
                      value={formData.watchThumbnailUrl}
                      onChange={(e) => setFormData({...formData, watchThumbnailUrl: e.target.value})}
                      className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono text-[10px] dark:text-white outline-none"
                      placeholder="Direct Thumbnail URL"
                    />
                    <input type="file" ref={thumbInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />
                    <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-slate-100 dark:border-slate-800">
                       <p className="text-[10px] text-slate-500 italic leading-relaxed">"The thumbnail is displayed in the video modal preview and before playback starts. High-resolution 16:9 images recommended."</p>
                    </div>
                 </div>
              </div>
           </div>
        </div>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex justify-center">
           <button
             onClick={handleSave}
             disabled={saving || uploading}
             className="px-20 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[4px] text-xs hover:bg-emerald-700 transition-all shadow-3xl shadow-emerald-500/40 flex items-center justify-center gap-4 disabled:opacity-50 active:scale-95"
           >
             {saving ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
             Sync Hero Matrix
           </button>
        </div>
      </div>

      {/* Live Snapshot Preview */}
      <div className="space-y-4">
        <h3 className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-10">Production Real-Time Snapshot</h3>
        <div className="bg-slate-950 rounded-[48px] p-10 md:p-20 relative overflow-hidden min-h-[500px] flex items-center shadow-2xl">
            <div className="absolute inset-0 opacity-40">
               <img src={formData.backgroundImage || "https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg"} className="w-full h-full object-cover" alt="Hero Preview" />
            </div>
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-950/60 to-transparent" />

            <div className="relative z-10 max-w-2xl space-y-8">
               <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-900/30 text-emerald-400 rounded-full text-[10px] font-black uppercase tracking-widest border border-emerald-500/20">
                  <Zap size={12} className="fill-current" />
                  {formData.goldSubtitle || "India's #1 Land Investment Platform"}
               </div>
               <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[1.1] uppercase">{formData.heroTitle || "Invest in Premium Land from ₹500"}</h2>
               <p className="text-lg text-slate-400 font-medium italic leading-relaxed max-w-lg">"{formData.description || "Democratizing real estate ownership through fractional investment. Secure, transparent, and high-yield land assets at your fingertips."}"</p>
               <div className="pt-4 flex gap-4">
                  <button className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] shadow-lg shadow-emerald-600/20">{formData.ctaText || "Start Investing"}</button>
                  {formData.watchEnabled && (
                    <button className="px-10 py-5 bg-white/10 backdrop-blur-md text-white border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center gap-2">
                       <Play size={14} fill="white" /> {formData.watchButtonText || "Watch Strategy"}
                    </button>
                  )}
               </div>
            </div>
        </div>
      </div>
    </div>
  );
};

export default HeroBanner;
