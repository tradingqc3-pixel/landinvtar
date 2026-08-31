import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Globe, Save, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '../../lib/supabase';

const WebsiteCMS = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    brand_name: '',
    hero_headline: '',
    platform_description: '',
    support_email: '',
    contact_phone: '',
    headquarters_address: '',
    logo_url: '',
    favicon_url: '',
    primary_color: '',
    secondary_color: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch the first settings row from app_settings
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (data) {
        setSettingsId(data.id);
        setFormData({
          brand_name: data.brand_name || '',
          hero_headline: data.hero_headline || '',
          platform_description: data.platform_description || '',
          support_email: data.support_email || '',
          contact_phone: data.contact_phone || '',
          headquarters_address: data.headquarters_address || '',
          logo_url: data.logo_url || '',
          favicon_url: data.favicon_url || '',
          primary_color: data.primary_color || '',
          secondary_color: data.secondary_color || ''
        });
      } else {
        // Automatically create a default row if none exists
        const defaultData = {
          brand_name: 'InvestLand',
          hero_headline: 'Premium Fractional Land Investment',
          platform_description: 'Invest in premium land from ₹500. InvestLand makes real estate investment accessible, transparent, and profitable for everyone.',
          support_email: 'hello@investland.app',
          contact_phone: '+91 98765 43210',
          headquarters_address: '123 Finance Tower, BKC, Mumbai, Maharashtra 400051',
          logo_url: '/logo.png',
          favicon_url: '/logo.png',
          primary_color: '#10b981',
          secondary_color: '#f59e0b'
        };

        const { data: newData, error: insertError } = await supabase
          .from('app_settings')
          .insert([defaultData])
          .select()
          .single();

        if (insertError) throw insertError;

        if (newData) {
          setSettingsId(newData.id);
          setFormData({
            brand_name: newData.brand_name || '',
            hero_headline: newData.hero_headline || '',
            platform_description: newData.platform_description || '',
            support_email: newData.support_email || '',
            contact_phone: newData.contact_phone || '',
            headquarters_address: newData.headquarters_address || '',
            logo_url: newData.logo_url || '',
            favicon_url: newData.favicon_url || '',
            primary_color: newData.primary_color || '',
            secondary_color: newData.secondary_color || ''
          });
        }
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('Platform synchronization interrupted. Please verify database connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!settingsId) {
      setError('No active settings node detected. Please refresh.');
      return;
    }

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
      // Refresh local state from server to ensure sync
      await fetchSettings();
    } catch (err: any) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to deploy changes to the cloud.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Syncing CMS Buffer...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader
        title="Website CMS"
        subtitle="Manage global website identity and platform narratives."
        icon={Globe}
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
          <p className="font-bold text-sm">Website content deployed successfully!</p>
        </div>
      )}

      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Platform Brand Name</label>
            <input
              type="text"
              value={formData.brand_name}
              onChange={(e) => setFormData({...formData, brand_name: e.target.value})}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Hero Headline</label>
            <input
              type="text"
              value={formData.hero_headline}
              onChange={(e) => setFormData({...formData, hero_headline: e.target.value})}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 relative z-10">
          <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Platform Description</label>
          <textarea
            rows={4}
            value={formData.platform_description}
            onChange={(e) => setFormData({...formData, platform_description: e.target.value})}
            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 relative z-10">
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Support Email</label>
            <input
              type="email"
              value={formData.support_email}
              onChange={(e) => setFormData({...formData, support_email: e.target.value})}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Contact Hotline</label>
            <input
              type="text"
              value={formData.contact_phone}
              onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400 ml-4">Headquarters Address</label>
            <input
              type="text"
              value={formData.headquarters_address}
              onChange={(e) => setFormData({...formData, headquarters_address: e.target.value})}
              className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800/50 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
            />
          </div>
        </div>

        <div className="pt-8 border-t border-slate-50 dark:border-slate-800 relative z-10">
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-3 px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50"
          >
            {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
            Deploy CMS Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default WebsiteCMS;
