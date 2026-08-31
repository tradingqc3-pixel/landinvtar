import { useState, useEffect, useRef } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  User, ShieldCheck, Camera, MapPin, Mail, Phone,
  Calendar, CheckCircle2, AlertCircle, Clock, ChevronRight,
  X, Check, Wallet, Plus, Minus, ArrowDownLeft, ArrowUpRight,
  IndianRupee, Building2, RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { supabase } from '../lib/supabase';
import { BankAccount, UpiId, WalletTransaction } from '../types/database';

const Profile = () => {
  const { user, profile, refreshProfile } = useAuth();
  const { settings } = useBranding();
  const [searchParams] = useSearchParams();
  const initialTab = searchParams.get('tab') || 'personal';
  const [activeTab, setActiveTab] = useState(initialTab);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: profile?.name || '',
    phone: profile?.phone || '',
    location: (profile as any)?.location || ''
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Banking Data State
  const [bankAccount, setBankAccount] = useState<BankAccount | null>(null);
  const [upiId, setUpiId] = useState<UpiId | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [bankingLoading, setBankingLoading] = useState(false);

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || '',
        phone: profile.phone || '',
        location: (profile as any).location || ''
      });
    }
  }, [profile]);

  useEffect(() => {
    if (activeTab === 'banking' && user) {
      fetchBankingData();
    }
  }, [activeTab, user]);

  const fetchBankingData = async () => {
    setBankingLoading(true);
    try {
      const [bankRes, upiRes, txRes] = await Promise.all([
        supabase.from('bank_accounts').select('*').eq('user_id', user?.id).eq('is_default', true).maybeSingle(),
        supabase.from('upi_ids').select('*').eq('user_id', user?.id).eq('is_default', true).maybeSingle(),
        supabase.from('wallet_transactions').select('*').eq('user_id', user?.id).order('created_at', { ascending: false }).limit(5)
      ]);

      setBankAccount(bankRes.data);
      setUpiId(upiRes.data);
      setTransactions(txRes.data || []);
    } catch (error) {
      console.error('Error fetching banking data:', error);
    } finally {
      setBankingLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({
          name: formData.name,
          phone: formData.phone,
        })
        .eq('id', user?.id);

      if (error) throw error;
      await refreshProfile();
      setIsEditing(false);
      showToast('Profile updated successfully');
    } catch (error: any) {
      console.error('Update error:', error);
      showToast(error.message || 'Failed to update profile', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    // Validation
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      showToast('Please upload JPG, PNG or WEBP only', 'error');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      showToast('File size exceeds 5MB limit', 'error');
      return;
    }

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const filePath = `${user.id}/avatar.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          upsert: true,
          cacheControl: '3600'
        });

      if (uploadError) throw uploadError;

      // Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Update Profile
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ avatar_url: `${publicUrl}?t=${Date.now()}` })
        .eq('id', user.id);

      if (updateError) throw updateError;

      await refreshProfile();
      showToast('Profile photo updated successfully');
    } catch (error: any) {
      console.error('Upload error:', error);
      showToast(error.message || 'Failed to upload image', 'error');
    } finally {
      setUploading(false);
      if (e.target) e.target.value = '';
    }
  };

  const userInitial = profile?.name?.charAt(0) || user?.email?.charAt(0) || 'A';

  const tabs = [
    { id: 'personal', label: 'Identity', icon: User },
    { id: 'kyc', label: 'Verification', icon: ShieldCheck }
  ];

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 ${toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold text-sm uppercase tracking-widest">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-container px-6">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Top Profile Card */}
          <div className="bg-white dark:bg-slate-900 rounded-[64px] p-10 md:p-16 border border-white dark:border-slate-800 shadow-xl flex flex-col md:flex-row gap-12 items-center">
             <div className="relative group">
                <div className="w-40 h-40 rounded-[48px] bg-slate-100 dark:bg-slate-800 overflow-hidden border-4 border-white dark:border-slate-800 shadow-2xl transition-transform group-hover:scale-105 duration-500 flex items-center justify-center">
                   {uploading ? (
                      <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
                   ) : profile?.avatar_url ? (
                      <img src={profile.avatar_url} className="w-full h-full object-cover" alt="Profile" />
                   ) : (
                      <span className="text-6xl font-black text-emerald-500 uppercase">{userInitial}</span>
                   )}
                </div>
                <button
                  onClick={handleAvatarClick}
                  disabled={uploading}
                  className="absolute -bottom-4 -right-4 w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center shadow-xl border-4 border-white dark:border-slate-900 hover:bg-emerald-700 transition-all disabled:opacity-50"
                >
                   <Camera size={20} />
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleFileChange}
                />
             </div>

             <div className="flex-1 space-y-6 text-center md:text-left">
                <div className="space-y-1">
                   <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight">{profile?.name || 'New Investor'}</h1>
                   <p className="text-lg text-slate-500 font-medium italic">{user?.email}</p>
                </div>
                <div className="flex flex-wrap justify-center md:justify-start gap-4">
                   <div className={`px-4 py-2 rounded-full flex items-center gap-2 border ${profile?.kyc_status === 'approved' ? 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-100 dark:border-emerald-900/30 text-emerald-600' : 'bg-gold-50 dark:bg-gold-900/20 border-gold-100 dark:border-gold-900/30 text-gold-600'}`}>
                      {profile?.kyc_status === 'approved' ? <ShieldCheck size={16} /> : <Clock size={16} />}
                      <span className="text-[10px] font-black uppercase tracking-widest">{profile?.kyc_status === 'approved' ? 'Verified Owner' : 'KYC Pending'}</span>
                   </div>
                   <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center gap-2 border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400">
                      <Calendar size={16} />
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-400">Joined {new Date(profile?.created_at || Date.now()).toLocaleDateString('en-IN', { month: 'long', year: 'numeric' })}</span>
                   </div>
                </div>
             </div>

             <div className="w-full md:w-auto">
                <button
                  onClick={() => isEditing ? handleUpdateProfile() : setIsEditing(true)}
                  disabled={saving || uploading}
                  className="w-full px-10 py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/20 disabled:opacity-50"
                >
                   {saving ? 'Synchronizing...' : isEditing ? 'Save Profile' : 'Edit Terminal'}
                </button>
             </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
             {/* Sidebar Tabs */}
             <div className="lg:col-span-3 space-y-2">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-4 px-8 py-5 rounded-2xl font-bold transition-all ${activeTab === tab.id ? 'bg-emerald-600 text-white shadow-xl shadow-emerald-600/20 translate-x-2' : 'bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 border border-transparent hover:border-emerald-100 dark:hover:border-emerald-900 hover:text-emerald-600'}`}
                  >
                    <tab.icon size={20} />
                    {tab.label}
                  </button>
                ))}
             </div>

             {/* Content Area */}
             <div className="lg:col-span-9">
                <AnimatePresence mode="wait">
                   {activeTab === 'personal' && (
                     <motion.div
                       key="personal"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-16 border border-white dark:border-slate-800 shadow-xl space-y-12"
                     >
                        <div className="space-y-8">
                           <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[4px]">Identity Metrics</h3>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                              <InfoItem label="Full Legal Name" value={formData.name} icon={User} isEditing={isEditing} onChange={(v) => setFormData({...formData, name: v})} />
                              <InfoItem label="Primary Email" value={user?.email || ''} icon={Mail} />
                              <InfoItem label="Mobile Terminal" value={formData.phone} icon={Phone} isEditing={isEditing} onChange={(v) => setFormData({...formData, phone: v})} />
                              <InfoItem label="Permanent Address" value={formData.location || 'Bandra West, Mumbai'} icon={MapPin} isEditing={isEditing} onChange={(v) => setFormData({...formData, location: v})} />
                           </div>
                        </div>
                     </motion.div>
                   )}

                   {activeTab === 'kyc' && (
                     <motion.div
                       key="kyc"
                       initial={{ opacity: 0, x: 20 }}
                       animate={{ opacity: 1, x: 0 }}
                       exit={{ opacity: 0, x: -20 }}
                       className="bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-16 border border-white dark:border-slate-800 shadow-xl space-y-12"
                     >
                        <div className="space-y-8">
                           <div className="flex items-center justify-between">
                              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[4px]">Verification Vault</h3>
                              <div className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest ${profile?.kyc_status === 'approved' ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20' : 'bg-gold-500/10 text-gold-500 border border-gold-500/20'}`}>
                                 Status: {profile?.kyc_status || 'NOT STARTED'}
                              </div>
                           </div>

                           <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                              <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">PAN Card</p>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                 </div>
                                 <p className="text-xl font-bold dark:text-white">ABCDE1234F</p>
                              </div>
                              <div className="p-8 rounded-[32px] bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-700 space-y-4">
                                 <div className="flex items-center justify-between">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Aadhaar Number</p>
                                    <CheckCircle2 size={16} className="text-emerald-500" />
                                 </div>
                                 <p className="text-xl font-bold dark:text-white">XXXX XXXX 1234</p>
                              </div>
                           </div>

                           <div className="p-10 rounded-[40px] bg-emerald-600 text-white relative overflow-hidden shadow-2xl">
                              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                              <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                                 <div className="w-20 h-20 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                                    <ShieldCheck size={40} />
                                 </div>
                                 <div className="space-y-2 flex-1 text-center md:text-left">
                                    <h4 className="text-2xl font-black">Fractional Owner Status</h4>
                                    <p className="text-emerald-50 font-medium leading-relaxed italic">Your account is fully compliant with RERA and Indian Land Revenue guidelines. All your digital records are verified.</p>
                                 </div>
                              </div>
                           </div>
                        </div>
                     </motion.div>
                   )}
                </AnimatePresence>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const InfoItem = ({ label, value, icon: Icon, isEditing, onChange }: any) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 ml-4">
      <Icon size={14} className="text-slate-400" />
      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">{label}</span>
    </div>
    {isEditing && onChange ? (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold dark:text-white transition-all"
      />
    ) : (
      <div className="px-8 py-5 bg-slate-50 dark:bg-slate-800 rounded-[28px] border border-transparent">
         <p className="text-lg font-bold text-slate-700 dark:text-slate-200">{value || 'Not provided'}</p>
      </div>
    )}
  </div>
);

export default Profile;
