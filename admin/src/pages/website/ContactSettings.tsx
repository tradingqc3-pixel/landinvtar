import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Mail, Save, RefreshCw, AlertCircle, CheckCircle2, Phone, MessageCircle, MapPin, Type, MessageSquare, Clock, CheckCircle } from 'lucide-react';
import { supabase, isNetworkError } from '../../lib/supabase';

const ContactSettings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [settingsId, setSettingsId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    contact_title: '',
    contact_description: '',
    contact_phone: '',
    whatsapp_number: '',
    support_email: '',
    corporate_address: '',
    response_time: '',
    contact_success_message: ''
  });

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    setError(null);
    try {
      // 3. Fetch the single settings row using optimized single row selector
      const { data, error: fetchError } = await supabase
        .from('app_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (fetchError) {
        throw new Error(`Supabase Error: ${fetchError.message} (${fetchError.code})`);
      }

      if (data) {
        setSettingsId(data.id);
        setFormData({
          contact_title: data.contact_title || 'Connect with Us',
          contact_description: data.contact_description || '',
          contact_phone: data.contact_phone || '',
          whatsapp_number: data.whatsapp_number || '',
          support_email: data.support_email || '',
          corporate_address: data.corporate_address || '',
          response_time: data.response_time || 'Response time: < 120 minutes',
          contact_success_message: data.contact_success_message || 'Our investment specialists have been notified.'
        });
      }
    } catch (err: any) {
      console.error('[ContactSettings] Load failure:', err);

      // 5. descriptive error handling
      if (isNetworkError(err)) {
        setError('Network Error: Request blocked or Supabase URL unreachable. Check your internet or ad-blockers.');
      } else {
        setError(err.message || 'Synchronization failure. Ensure app_settings table exists.');
      }
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

      let saveError;

      // 4. Save logic using existing UUID for updates
      if (settingsId) {
        const { error: updateError } = await supabase
          .from('app_settings')
          .update(payload)
          .eq('id', settingsId);
        saveError = updateError;
      } else {
        // Fallback for empty table: insert first row
        const { data: newData, error: insertError } = await supabase
          .from('app_settings')
          .insert([payload])
          .select()
          .single();

        if (newData) setSettingsId(newData.id);
        saveError = insertError;
      }

      if (saveError) {
        throw new Error(`Save Failure: ${saveError.message}`);
      }

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      await fetchSettings();
    } catch (err: any) {
      console.error('[ContactSettings] Save failure:', err);

      if (isNetworkError(err)) {
        setError('Save Failed: Network request interrupted. Verify Supabase connection.');
      } else {
        setError(err.message || 'Operation failure in communication matrix.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Contact Locker...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <SectionHeader
        title="Contact Settings"
        subtitle="Manage the platform's direct communication channels and support narrative."
        icon={Mail}
      />

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4">
          <AlertCircle size={24} />
          <div className="flex-1">
             <p className="font-black text-sm uppercase tracking-wider text-rose-700 dark:text-rose-400">Communication Error</p>
             <p className="font-bold text-xs opacity-80">{error}</p>
          </div>
          <button onClick={fetchSettings} className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-xl hover:scale-110 transition-transform">
             <RefreshCw size={18} />
          </button>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4">
          <CheckCircle2 size={24} />
          <p className="font-bold text-sm">Contact parameters synchronized successfully!</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <Type size={18} className="text-emerald-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Narrative Config</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Page Title</label>
                <input
                  type="text"
                  value={formData.contact_title}
                  onChange={(e) => setFormData({...formData, contact_title: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                  placeholder="e.g., Connect with Us"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Subtitle / Description</label>
                <textarea
                  rows={4}
                  value={formData.contact_description}
                  onChange={(e) => setFormData({...formData, contact_description: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />
            <div className="relative z-10 space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <MessageSquare size={18} className="text-blue-600" />
                <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Form Response</h4>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Expected Response Time</label>
                <div className="relative">
                   <Clock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                   <input
                     type="text"
                     value={formData.response_time}
                     onChange={(e) => setFormData({...formData, response_time: e.target.value})}
                     className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                   />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Success Message</label>
                <textarea
                  rows={3}
                  value={formData.contact_success_message}
                  onChange={(e) => setFormData({...formData, contact_success_message: e.target.value})}
                  className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                />
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-8">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
            <div className="flex items-center gap-3 mb-2">
              <Phone size={18} className="text-gold-600" />
              <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Direct Nodes</h4>
            </div>
            <div className="grid grid-cols-1 gap-6">
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Official Support Email</label>
                  <div className="relative">
                    <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="email"
                      value={formData.support_email}
                      onChange={(e) => setFormData({...formData, support_email: e.target.value})}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Contact Hotline</label>
                  <div className="relative">
                    <Phone className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.contact_phone}
                      onChange={(e) => setFormData({...formData, contact_phone: e.target.value})}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">WhatsApp Link</label>
                  <div className="relative">
                    <MessageCircle className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({...formData, whatsapp_number: e.target.value})}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>
               </div>
               <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">HQ Corporate Address</label>
                  <div className="relative">
                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                      type="text"
                      value={formData.corporate_address}
                      onChange={(e) => setFormData({...formData, corporate_address: e.target.value})}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white transition-all outline-none"
                    />
                  </div>
               </div>
            </div>
            <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex gap-4">
               <button
                 onClick={fetchSettings}
                 className="flex-1 py-4 bg-slate-100 dark:bg-slate-800 text-slate-500 rounded-3xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-200 transition-all"
               >
                 Reset
               </button>
               <button
                 onClick={handleSave}
                 disabled={saving}
                 className="flex-[2] py-4 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
               >
                 {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                 Sync Contact Parameters
               </button>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-slate-50 dark:bg-slate-900 rounded-[48px] p-10 md:p-20 border border-slate-100 dark:border-slate-800 shadow-inner space-y-12">
          <div className="flex items-center gap-3 mb-4">
             <CheckCircle className="text-emerald-500" size={24} />
             <h3 className="text-xl font-black uppercase tracking-widest dark:text-white">Live Snapshot Preview</h3>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
             <div className="space-y-6">
                <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{formData.contact_title}</h4>
                <p className="text-lg text-slate-500 dark:text-slate-400 font-medium italic">"{formData.contact_description}"</p>
                <div className="space-y-4 pt-6">
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-emerald-600/10 flex items-center justify-center text-emerald-600"><Phone size={18}/></div>
                      <p className="font-bold dark:text-white">{formData.contact_phone}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-blue-600/10 flex items-center justify-center text-blue-600"><Mail size={18}/></div>
                      <p className="font-bold dark:text-white">{formData.support_email}</p>
                   </div>
                   <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-lg bg-red-600/10 flex items-center justify-center text-red-600"><MapPin size={18}/></div>
                      <p className="font-bold dark:text-white">{formData.corporate_address}</p>
                   </div>
                </div>
             </div>
             <div className="bg-white dark:bg-slate-800 p-8 rounded-[40px] shadow-2xl border border-white dark:border-slate-700 text-center space-y-6">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600"><CheckCircle2 size={32}/></div>
                <h4 className="text-xl font-black dark:text-white uppercase tracking-widest">Success State Preview</h4>
                <p className="text-sm text-slate-500 dark:text-slate-400 italic">"{formData.contact_success_message}"</p>
                <div className="pt-4 flex items-center justify-center gap-2 text-slate-400 font-bold text-[10px] uppercase tracking-widest">
                   <Clock size={12}/> {formData.response_time}
                </div>
             </div>
          </div>
      </div>
    </div>
  );
};

export default ContactSettings;
