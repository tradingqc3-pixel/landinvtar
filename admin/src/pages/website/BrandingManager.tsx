import React, { useEffect, useState, useRef } from 'react';
import SectionHeader from '../../components/SectionHeader';
import {
  UploadCloud,
  Save,
  RefreshCw,
  CheckCircle2,
  Image as ImageIcon,
  AlertCircle,
  FileUp,
  Trash2,
  Loader2
} from 'lucide-react';
import { supabase } from '../../lib/supabase';

const BrandingManager = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState<{ type: 'logo' | 'favicon', percent: number } | null>(null);

  const [formData, setFormData] = useState({
    logo_url: '/logo.png',
    favicon_url: '/logo.png',
    primary_color: '#10b981',
    secondary_color: '#f59e0b'
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);

  const logoInputRef = useRef<HTMLInputElement>(null);
  const faviconInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // Fetch the first existing row to get the current branding configuration
      const { data, error } = await supabase
        .from('branding_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setFormData({
          logo_url: data.logo_url || '/logo.png',
          favicon_url: data.favicon_url || '/logo.png',
          primary_color: data.primary_color || '#10b981',
          secondary_color: data.secondary_color || '#f59e0b'
        });
        setLogoPreview(data.logo_url || '/logo.png');
        setFaviconPreview(data.favicon_url || '/logo.png');
      }
    } catch (err: any) {
      console.error('Fetch error:', err);
      setError('System identity synchronization failure. Ensure branding_settings record exists.');
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'logo' | 'favicon') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      setError(`${type.charAt(0).toUpperCase() + type.slice(1)} file size exceeds 5MB limit.`);
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      if (type === 'logo') {
        setLogoFile(file);
        setLogoPreview(reader.result as string);
      } else {
        setFaviconFile(file);
        setFaviconPreview(reader.result as string);
      }
    };
    reader.readAsDataURL(file);
    setError(null);
  };

  const uploadToBrandingBucket = async (file: File, folder: string) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${folder}-${Date.now()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    // Ensure user is authenticated before upload
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Please sign in before uploading branding files.');

    const { error: uploadError } = await supabase.storage
      .from('branding')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true // Requirement: Use upsert: true to avoid RLS storage issues
      });

    if (uploadError) {
      console.error('Storage Upload Error:', uploadError);
      if (uploadError.message === 'Bucket not found') {
        throw new Error("Supabase Storage bucket 'branding' not found. Please ensure it exists.");
      }
      throw new Error(`Storage error: ${uploadError.message}`);
    }

    const { data: { publicUrl } } = supabase.storage
      .from('branding')
      .getPublicUrl(filePath);

    return publicUrl;
  };

  const handleSave = async () => {
    setSaving(true);
    setSuccess(false);
    setError(null);
    try {
      // 0. Verify Authentication
      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError || !user) {
        throw new Error('Please sign in before uploading branding files.');
      }

      let finalLogoUrl = formData.logo_url;
      let finalFaviconUrl = formData.favicon_url;

      // 1. Handle Storage Uploads separately
      try {
        if (logoFile) {
          setUploadProgress({ type: 'logo', percent: 50 });
          finalLogoUrl = await uploadToBrandingBucket(logoFile, 'logo');
          setUploadProgress({ type: 'logo', percent: 100 });
        }

        if (faviconFile) {
          setUploadProgress({ type: 'favicon', percent: 50 });
          finalFaviconUrl = await uploadToBrandingBucket(faviconFile, 'favicon');
          setUploadProgress({ type: 'favicon', percent: 100 });
        }
      } catch (storageErr: any) {
        throw new Error(`File upload failed: ${storageErr.message}`);
      }

      // 2. Database Update Logic
      try {
        // Fetch the existing record to get its primary key (UUID)
        const { data: row, error: fetchError } = await supabase
          .from("branding_settings")
          .select("id")
          .limit(1)
          .single();

        if (fetchError) {
          throw new Error(`Failed to identify branding record: ${fetchError.message}`);
        }

        // Update the specific row found using its UUID
        const { error: updateError } = await supabase
          .from("branding_settings")
          .update({
            logo_url: finalLogoUrl,
            favicon_url: finalFaviconUrl,
            primary_color: formData.primary_color,
            secondary_color: formData.secondary_color,
            updated_at: new Date().toISOString()
          })
          .eq("id", row.id);

        if (updateError) {
          throw new Error(`Database synchronization failed: ${updateError.message}`);
        }
      } catch (dbErr: any) {
        throw new Error(`Database update failed: ${dbErr.message}`);
      }

      setSuccess(true);
      setLogoFile(null);
      setFaviconFile(null);

      // Update local link elements immediately for favicon
      const faviconLink = document.querySelector("link[rel~='icon']") as HTMLLinkElement;
      if (faviconLink) faviconLink.href = finalFaviconUrl;

      setTimeout(() => setSuccess(false), 3000);
      fetchSettings();
    } catch (err: any) {
      console.error('Save error:', err);
      setError(err.message || 'Synchronization failure in visual matrix.');
    } finally {
      setSaving(false);
      setUploadProgress(null);
    }
  };

  const handleRemove = async (type: 'logo' | 'favicon') => {
    setSaving(true);
    setError(null);
    try {
      // Get the existing row UUID first
      const { data: row, error: fetchError } = await supabase
        .from("branding_settings")
        .select("id")
        .limit(1)
        .single();

      if (fetchError) throw new Error(`Database identification failed: ${fetchError.message}`);

      const updateData = type === 'logo' ? { logo_url: '/logo.png' } : { favicon_url: '/logo.png' };

      const { error } = await supabase
        .from('branding_settings')
        .update(updateData)
        .eq('id', row.id);

      if (error) throw new Error(`Database update failed: ${error.message}`);

      if (type === 'logo') {
        setLogoPreview('/logo.png');
        setFormData(prev => ({ ...prev, logo_url: '/logo.png' }));
      } else {
        setFaviconPreview('/logo.png');
        setFormData(prev => ({ ...prev, favicon_url: '/logo.png' }));
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
      fetchSettings();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Accessing Identity Locker...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <SectionHeader
        title="Logo & Favicon"
        subtitle="Command the platform's visual sovereignty and core branding."
        icon={UploadCloud}
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
           <p className="font-bold text-sm">Visual identity locked and synchronized across all terminals.</p>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
         {/* Logo Section */}
         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 space-y-6">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Platform Master Logo</label>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">SVG/PNG/JPG · MAX 5MB</span>
               </div>

               <div
                 onClick={() => logoInputRef.current?.click()}
                 onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
                 onDrop={(e) => { e.preventDefault(); e.stopPropagation(); const f = e.dataTransfer.files?.[0]; if (f) handleFileChange({ target: { files: [f] } } as any, 'logo'); }}
                 className="aspect-video rounded-[32px] bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden group/drop hover:border-emerald-500 transition-all cursor-pointer"
               >
                  {logoPreview ? (
                    <img src={logoPreview} className="h-20 w-auto relative z-10 transition-transform group-hover/drop:scale-105" alt="Logo Preview" />
                  ) : (
                    <div className="text-center space-y-2">
                       <FileUp size={40} className="text-slate-300 mx-auto" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Deploy Logo Matrix</p>
                    </div>
                  )}
                  {uploadProgress?.type === 'logo' && (
                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Uploading {uploadProgress.percent}%</p>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-emerald-600/10 opacity-0 group-hover/drop:opacity-100 transition-opacity" />
               </div>

               <div className="flex gap-3 pt-2">
                  <button
                    onClick={() => logoInputRef.current?.click()}
                    className="flex-1 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
                  >
                    Replace Logo
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove('logo'); }}
                    className="px-6 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
               <input ref={logoInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'logo')} className="hidden" />
            </div>
         </div>

         {/* Favicon Section */}
         <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-8 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 group-hover:scale-150 transition-transform duration-700" />

            <div className="relative z-10 space-y-6 text-center">
               <div className="flex justify-between items-center">
                  <label className="text-[10px] font-black uppercase tracking-[3px] text-slate-400">Terminal Favicon</label>
                  <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-full">ICO/PNG · 1:1 RATIO</span>
               </div>

               <div
                 onClick={() => faviconInputRef.current?.click()}
                 className="w-48 h-48 mx-auto rounded-[40px] bg-slate-50 dark:bg-slate-800 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-700 relative overflow-hidden group/drop hover:border-blue-500 transition-all cursor-pointer"
               >
                  {faviconPreview ? (
                    <img src={faviconPreview} className="w-16 h-16 relative z-10 shadow-2xl" alt="Favicon Preview" />
                  ) : (
                    <div className="space-y-2">
                       <ImageIcon size={40} className="text-slate-300 mx-auto" />
                       <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Icon Buffer</p>
                    </div>
                  )}
                  {uploadProgress?.type === 'favicon' && (
                     <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-20 flex flex-col items-center justify-center text-white space-y-4">
                        <Loader2 className="w-8 h-8 animate-spin" />
                        <p className="text-[10px] font-black uppercase tracking-widest">Uploading {uploadProgress.percent}%</p>
                     </div>
                  )}
                  <div className="absolute inset-0 bg-blue-600/10 opacity-0 group-hover/drop:opacity-100 transition-opacity" />
               </div>

               <div className="flex gap-3 justify-center pt-2">
                  <button
                    onClick={() => faviconInputRef.current?.click()}
                    className="flex-1 px-6 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-[1.02] transition-all shadow-lg"
                  >
                    Replace Icon
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleRemove('favicon'); }}
                    className="px-6 py-4 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-rose-100 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
               </div>
               <input ref={faviconInputRef} type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'favicon')} className="hidden" />
            </div>
         </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col md:flex-row justify-between items-center gap-8 relative overflow-hidden">
         <div className="flex flex-wrap gap-10 relative z-10">
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Primary Emerald</label>
               <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <input type="color" value={formData.primary_color} onChange={(e) => setFormData({...formData, primary_color: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none p-0 cursor-pointer bg-transparent" />
                  <span className="font-mono text-xs font-bold dark:text-white uppercase tracking-tighter">{formData.primary_color}</span>
               </div>
            </div>
            <div className="space-y-3">
               <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 block ml-2">Gold Accent</label>
               <div className="flex items-center gap-4 bg-slate-50 dark:bg-slate-800 p-3 rounded-2xl border border-slate-100 dark:border-slate-700">
                  <input type="color" value={formData.secondary_color} onChange={(e) => setFormData({...formData, secondary_color: e.target.value})} className="w-10 h-10 rounded-xl overflow-hidden border-none p-0 cursor-pointer bg-transparent" />
                  <span className="font-mono text-xs font-bold dark:text-white uppercase tracking-tighter">{formData.secondary_color}</span>
               </div>
            </div>
         </div>

         <div className="flex gap-4 w-full md:w-auto relative z-10">
            <button
              onClick={fetchSettings}
              className="flex-1 md:flex-none px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-slate-200 transition-all"
            >
              Revert Changes
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-[2] md:flex-none px-12 py-5 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[2px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              Lock Identity Matrix
            </button>
         </div>
      </div>
    </div>
  );
};

export default BrandingManager;
