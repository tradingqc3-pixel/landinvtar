import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import {
  Play, Save, RefreshCw, AlertCircle,
  CheckCircle2, Layout, Video, Image as ImageIcon,
  Type, FileText, MousePointer2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import ReactPlayer from 'react-player';

const HowItWorksManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    how_hero_title: '',
    how_hero_subtitle: '',
    how_hero_description: '',
    how_hero_image_url: '',
    how_cta_text: '',
    how_video_text: '',
    how_video_url: '',
    how_video_type: 'youtube'
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSettingsId(data.id);
        setFormData({
          how_hero_title: data.how_hero_title || '',
          how_hero_subtitle: data.how_hero_subtitle || '',
          how_hero_description: data.how_hero_description || '',
          how_hero_image_url: data.how_hero_image_url || '',
          how_cta_text: data.how_cta_text || '',
          how_video_text: data.how_video_text || '',
          how_video_url: data.how_video_url || '',
          how_video_type: data.how_video_type || 'youtube'
        });
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Platform synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settingsId) return;
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      const { error: updateError } = await supabase
        .from('app_settings')
        .update({
          ...formData,
          updated_at: new Date().toISOString()
        })
        .eq('id', settingsId);

      if (updateError) throw updateError;
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchSettings();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to deploy changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Step Buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <SectionHeader
        title="How It Works CMS"
        subtitle="Manage the narrative and visual instructions of the investment loop."
        icon={Layout}
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
          <p className="font-bold text-sm">Instructional matrix updated successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Type size={18} className="text-emerald-600" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Hero Configuration</h4>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subtitle (Gold Text)</label>
                    <input
                      type="text"
                      value={formData.how_hero_subtitle}
                      onChange={(e) => setFormData({...formData, how_hero_subtitle: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Main Title</label>
                    <input
                      type="text"
                      value={formData.how_hero_title}
                      onChange={(e) => setFormData({...formData, how_hero_title: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Narrative Description</label>
                    <textarea
                      rows={4}
                      value={formData.how_hero_description}
                      onChange={(e) => setFormData({...formData, how_hero_description: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
               <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

               <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-3 mb-2">
                     <Video size={18} className="text-blue-600" />
                     <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Instructional Video</h4>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Video Type</label>
                        <select
                          value={formData.how_video_type}
                          onChange={(e) => setFormData({...formData, how_video_type: e.target.value})}
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none appearance-none cursor-pointer"
                        >
                           <option value="youtube">YouTube</option>
                           <option value="mp4">Direct MP4 URL</option>
                        </select>
                     </div>
                     <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Video Label</label>
                        <input
                          type="text"
                          value={formData.how_video_text}
                          onChange={(e) => setFormData({...formData, how_video_text: e.target.value})}
                          className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                        />
                     </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Source URL</label>
                    <input
                      type="text"
                      value={formData.how_video_url}
                      onChange={(e) => setFormData({...formData, how_video_url: e.target.value})}
                      className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white transition-all outline-none"
                      placeholder="https://youtube.com/watch?v=..."
                    />
                  </div>
               </div>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
               <div className="flex items-center gap-3 mb-2">
                  <ImageIcon size={18} className="text-gold-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Hero Visualization</h4>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Hero Image URL</label>
                  <input
                    type="text"
                    value={formData.how_hero_image_url}
                    onChange={(e) => setFormData({...formData, how_hero_image_url: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white transition-all outline-none"
                  />
               </div>

               <div className="aspect-square rounded-3xl overflow-hidden border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-800">
                  {formData.how_hero_image_url ? (
                    <img src={formData.how_hero_image_url} className="w-full h-full object-cover" alt="Hero Preview" />
                  ) : (
                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-300 gap-4 opacity-50">
                       <ImageIcon size={48} />
                       <p className="text-[10px] font-black uppercase tracking-widest">Image Preview Locked</p>
                    </div>
                  )}
               </div>
            </div>

            <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-6">
               <div className="flex items-center gap-3 mb-2">
                  <MousePointer2 size={18} className="text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Action Config</h4>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary CTA Button</label>
                  <input
                    type="text"
                    value={formData.how_cta_text}
                    onChange={(e) => setFormData({...formData, how_cta_text: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>

               <button
                 onClick={handleSave}
                 disabled={saving}
                 className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                 Sync Instructional Matrix
               </button>
            </div>
         </div>
      </div>

      <div className="bg-slate-950 rounded-[48px] p-10 md:p-20 text-white relative overflow-hidden shadow-2xl border border-white/5">
         <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-600/10 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />
         <div className="flex items-center gap-4 mb-10 relative z-10">
            <Play size={24} className="text-emerald-500" />
            <h3 className="text-xl font-black uppercase tracking-widest">Video Stream Monitor</h3>
         </div>

         <div className="relative aspect-video rounded-[32px] overflow-hidden border border-white/10 bg-slate-900 shadow-3xl z-10 group">
            {formData.how_video_url ? (
               <ReactPlayer
                 url={formData.how_video_url}
                 width="100%"
                 height="100%"
                 controls={true}
               />
            ) : (
               <div className="w-full h-full flex flex-col items-center justify-center text-slate-700 gap-4 opacity-50 bg-slate-900/50 backdrop-blur-sm">
                  <Video size={64} />
                  <p className="text-[10px] font-black uppercase tracking-widest">Signal Missing</p>
               </div>
            )}
         </div>
      </div>
    </div>
  );
};

export default HowItWorksManager;
