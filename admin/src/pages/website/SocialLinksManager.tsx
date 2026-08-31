import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Share2, Save, RefreshCw, Facebook, Twitter, Instagram, Linkedin, Github } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const SocialLinksManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);
  const [links, setLinks] = useState({
    facebook: '',
    twitter: '',
    instagram: '',
    linkedin: '',
    github: ''
  });

  useEffect(() => {
    fetchLinks();
  }, []);

  const fetchLinks = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('id, social_links')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      if (data) {
        setSettingsId(data.id);
        if (data.social_links) setLinks(data.social_links);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { social_links: links, updated_at: new Date().toISOString() };
      let error;

      if (settingsId) {
        const res = await supabase.from('app_settings').update(payload).eq('id', settingsId);
        error = res.error;
      } else {
        const res = await supabase.from('app_settings').insert([payload]);
        error = res.error;
      }

      if (error) throw error;
      alert('Social cloud updated!');
      fetchLinks();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Social Media Links"
        subtitle="Manage the platform's social cloud and outreach links."
        icon={Share2}
      />

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-12 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
            {[
              { id: 'facebook', label: 'Facebook URL', icon: Facebook, color: 'text-blue-600' },
              { id: 'twitter', label: 'Twitter / X URL', icon: Twitter, color: 'text-slate-900 dark:text-white' },
              { id: 'instagram', label: 'Instagram URL', icon: Instagram, color: 'text-rose-600' },
              { id: 'linkedin', label: 'LinkedIn Professional URL', icon: Linkedin, color: 'text-blue-700' },
            ].map(social => (
               <div key={social.id} className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">{social.label}</label>
                  <div className="relative">
                     <social.icon className={`absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 ${social.color}`} />
                     <input
                       type="url"
                       value={(links as any)[social.id]}
                       onChange={(e) => setLinks({...links, [social.id]: e.target.value})}
                       className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                     />
                  </div>
               </div>
            ))}
         </div>

         <div className="pt-6 border-t border-slate-50 dark:border-slate-800 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-10 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2"
            >
              {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
              Sync Social Matrix
            </button>
         </div>
      </div>
    </div>
  );
};

export default SocialLinksManager;
