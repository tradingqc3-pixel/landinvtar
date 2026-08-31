import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Save, RefreshCw, AlertCircle, CheckCircle2, Type, Hash, Users } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const AboutUsCMS = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    subtitle: '',
    main_title: '',
    description: '',
    stat1_label: '',
    stat1_value: '',
    stat2_label: '',
    stat2_value: '',
    stat3_label: '',
    stat3_value: '',
    stat4_label: '',
    stat4_value: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('about_us_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        console.error('Supabase fetch error:', fetchError);
        throw fetchError;
      }

      if (data) {
        setSettingsId(data.id);
        setFormData({
          subtitle: data.subtitle || '',
          main_title: data.main_title || '',
          description: data.description || '',
          stat1_label: data.stat1_label || '',
          stat1_value: data.stat1_value || '',
          stat2_label: data.stat2_label || '',
          stat2_value: data.stat2_value || '',
          stat3_label: data.stat3_label || '',
          stat3_value: data.stat3_value || '',
          stat4_label: data.stat4_label || '',
          stat4_value: data.stat4_value || ''
        });
      } else {
        // Automatically create a default row if none exists
        const defaultData = {
          subtitle: 'The Visionaries',
          main_title: 'InvestLand is Democratizing Real Estate.',
          description: 'We believe that the power of land ownership should belong to everyone, not just the billionaire class. Our mission is to make real estate as liquid and accessible as stocks.',
          stat1_label: 'Assets Managed',
          stat1_value: '₹150Cr+',
          stat2_label: 'Total Investors',
          stat2_value: '12,400+',
          stat3_label: 'Verified Area',
          stat3_value: '2,500+ Acres',
          stat4_label: 'Avg. ROI',
          stat4_value: '18.5%'
        };

        const { data: newData, error: insertError } = await supabase
          .from('about_us_settings')
          .insert([defaultData])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newData) {
          setSettingsId(newData.id);
          setFormData({
            subtitle: newData.subtitle,
            main_title: newData.main_title,
            description: newData.description,
            stat1_label: newData.stat1_label,
            stat1_value: newData.stat1_value,
            stat2_label: newData.stat2_label,
            stat2_value: newData.stat2_value,
            stat3_label: newData.stat3_label,
            stat3_value: newData.stat3_value,
            stat4_label: newData.stat4_label,
            stat4_value: newData.stat4_value
          });
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      // Removed the generic "Failed to load" error message per requirement
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

      // Use upsert - if settingsId exists, include it to update that specific row
      const { data: upsertedData, error: upsertError } = await supabase
        .from('about_us_settings')
        .upsert(settingsId ? { id: settingsId, ...payload } : payload)
        .select()
        .single();

      if (upsertError) {
        console.error('Supabase upsert error:', upsertError);
        throw upsertError;
      }

      if (upsertedData) {
        setSettingsId(upsertedData.id);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (err: any) {
      console.error('Save error:', err);
      setError('Synchronization failure. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing Content Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-500 pb-20">
      <SectionHeader
        title="About Us CMS"
        subtitle="Manage the narrative, mission, and success metrics of the platform."
        icon={Users}
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
           <p className="font-bold text-sm">About Us settings deployed successfully.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Hero Configuration */}
         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 space-y-6">
               <div className="flex items-center gap-3">
                  <Type size={18} className="text-emerald-600" />
                  <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Narrative Config</h4>
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subtitle</label>
                  <input
                    type="text"
                    value={formData.subtitle}
                    onChange={(e) => setFormData({...formData, subtitle: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Main Title</label>
                  <input
                    type="text"
                    value={formData.main_title}
                    onChange={(e) => setFormData({...formData, main_title: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>

               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                  <textarea
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  />
               </div>
            </div>
         </div>

         {/* Stats Configuration */}
         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center gap-3">
               <Hash size={18} className="text-blue-600" />
               <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Success Metrics</h4>
            </div>

            <div className="grid grid-cols-2 gap-6">
               {[1, 2, 3, 4].map(i => (
                 <div key={i} className="space-y-4 p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl border border-slate-100 dark:border-slate-700">
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stat {i} Label</label>
                       <input
                         type="text"
                         value={(formData as any)[`stat${i}_label`]}
                         onChange={(e) => setFormData({...formData, [`stat${i}_label`]: e.target.value})}
                         className="w-full bg-transparent border-none p-0 focus:ring-0 font-bold text-xs dark:text-white uppercase"
                       />
                    </div>
                    <div className="space-y-1">
                       <label className="text-[9px] font-black uppercase tracking-widest text-slate-400">Stat {i} Value</label>
                       <input
                         type="text"
                         value={(formData as any)[`stat${i}_value`]}
                         onChange={(e) => setFormData({...formData, [`stat${i}_value`]: e.target.value})}
                         className="w-full bg-transparent border-none p-0 focus:ring-0 font-black text-2xl text-emerald-600 dark:text-emerald-400"
                       />
                    </div>
                 </div>
               ))}
            </div>
         </div>
      </div>

      <div className="flex justify-center pt-10">
         <button
           onClick={handleSave}
           disabled={saving}
           className="px-20 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[4px] text-xs hover:bg-emerald-700 transition-all shadow-3xl shadow-emerald-500/40 flex items-center justify-center gap-4 active:scale-95 disabled:opacity-50"
         >
           {saving ? <RefreshCw className="animate-spin" size={20}/> : <Save size={20}/>}
           Sync About Settings
         </button>
      </div>
    </div>
  );
};

export default AboutUsCMS;
