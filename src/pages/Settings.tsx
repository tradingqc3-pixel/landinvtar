import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sun, Moon, Bell, Lock, Shield, Eye, EyeOff,
  Smartphone, LogOut, ChevronRight, Globe, Trash2,
  User, Mail, CheckCircle2, AlertCircle, Save
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';

const Settings = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();

  // State for different sections
  const [notifications, setNotifications] = useState(() => {
    const saved = localStorage.getItem('investland_notifications');
    return saved === null ? true : saved === 'true';
  });

  const [profileData, setProfileData] = useState({
    name: profile?.name || '',
    email: user?.email || ''
  });

  const [passwordData, setPasswordData] = useState({
    newPassword: '',
    confirmPassword: ''
  });

  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    if (profile) {
      setProfileData(prev => ({ ...prev, name: profile.name }));
    }
  }, [profile]);

  const triggerToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleUpdateProfile = async () => {
    if (!profileData.name.trim()) {
      triggerToast('Name cannot be empty', 'error');
      return;
    }
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ name: profileData.name })
        .eq('id', user?.id);

      if (error) throw error;
      await refreshProfile();
      triggerToast('Profile updated successfully');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePassword = async () => {
    if (passwordData.newPassword.length < 6) {
      triggerToast('Password must be at least 6 characters', 'error');
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      triggerToast('Passwords do not match', 'error');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: passwordData.newPassword
      });

      if (error) throw error;
      setPasswordData({ newPassword: '', confirmPassword: '' });
      triggerToast('Password updated successfully');
    } catch (err: any) {
      triggerToast(err.message || 'Failed to update password', 'error');
    } finally {
      setLoading(false);
    }
  };

  const toggleNotifications = () => {
    const newState = !notifications;
    setNotifications(newState);
    localStorage.setItem('investland_notifications', String(newState));
    triggerToast(`Notifications ${newState ? 'enabled' : 'disabled'}`);
  };

  const handleLogout = async () => {
    await signOut();
    navigate('/');
  };

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-50 px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10 ${
              toast.type === 'success' ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'
            }`}
          >
            {toast.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <p className="font-bold text-sm uppercase tracking-widest">{toast.message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-container px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">System <span className="text-emerald-600">Settings</span></h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 font-medium">Configure your InvestLand terminal and security preferences.</p>
          </div>

          <div className="grid grid-cols-1 gap-12">
             {/* Profile Section */}
             <SettingSection title="Identity Management">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Full Legal Name</label>
                         <div className="relative">
                            <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="text"
                              value={profileData.name}
                              onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                              className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold dark:text-white transition-all"
                              placeholder="Display Name"
                            />
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Email (Locked)</label>
                         <div className="relative opacity-60">
                            <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type="email"
                              value={profileData.email}
                              disabled
                              className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] outline-none font-bold dark:text-white cursor-not-allowed"
                            />
                         </div>
                      </div>
                   </div>
                   <div className="flex justify-end">
                      <button
                        onClick={handleUpdateProfile}
                        disabled={loading}
                        className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 disabled:opacity-50"
                      >
                         <Save size={16} />
                         {loading ? 'Saving...' : 'Commit Changes'}
                      </button>
                   </div>
                </div>
             </SettingSection>

             {/* Theme Section */}
             <SettingSection title="Visual Interface">
                <div className="flex items-center justify-between p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${theme === 'dark' ? 'bg-indigo-500/10 text-indigo-400' : 'bg-gold-500/10 text-gold-600'}`}>
                         {theme === 'dark' ? <Moon size={28} /> : <Sun size={28} />}
                      </div>
                      <div>
                         <h4 className="text-xl font-bold dark:text-white">{theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Optimize for low-light environments.</p>
                      </div>
                   </div>
                   <button
                    onClick={toggleTheme}
                    className="relative w-20 h-10 bg-slate-200 dark:bg-emerald-600/30 rounded-full p-1 transition-colors duration-500"
                   >
                      <motion.div
                        animate={{ x: theme === 'dark' ? 40 : 0 }}
                        className="w-8 h-8 bg-white dark:bg-emerald-500 rounded-full shadow-lg flex items-center justify-center text-slate-900"
                      >
                         {theme === 'dark' ? <Moon size={14} /> : <Sun size={14} />}
                      </motion.div>
                   </button>
                </div>
             </SettingSection>

             {/* Notifications Section */}
             <SettingSection title="Communications">
                <div className="flex items-center justify-between p-8 bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-blue-500/10 text-blue-500 rounded-2xl flex items-center justify-center">
                         <Bell size={28} />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold dark:text-white">Push Notifications</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Project updates and payout alerts.</p>
                      </div>
                   </div>
                   <button
                    onClick={toggleNotifications}
                    className={`relative w-20 h-10 rounded-full p-1 transition-colors duration-500 ${notifications ? 'bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700'}`}
                   >
                      <motion.div
                        animate={{ x: notifications ? 40 : 0 }}
                        className="w-8 h-8 bg-white rounded-full shadow-lg"
                      />
                   </button>
                </div>
             </SettingSection>

             {/* Security Section */}
             <SettingSection title="Security & Authentication">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
                   <div className="flex items-center gap-6">
                      <div className="w-14 h-14 bg-emerald-500/10 text-emerald-500 rounded-2xl flex items-center justify-center">
                         <Lock size={28} />
                      </div>
                      <div>
                         <h4 className="text-xl font-bold dark:text-white">Update Passkey</h4>
                         <p className="text-sm text-slate-500 dark:text-slate-400">Regular rotation improves security.</p>
                      </div>
                   </div>

                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">New Password</label>
                         <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPass ? "text" : "password"}
                              value={passwordData.newPassword}
                              onChange={(e) => setPasswordData({...passwordData, newPassword: e.target.value})}
                              className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold dark:text-white transition-all"
                              placeholder="••••••••"
                            />
                            <button
                              onClick={() => setShowPass(!showPass)}
                              className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-500"
                            >
                               {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                         </div>
                      </div>
                      <div className="space-y-3">
                         <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Confirm New Password</label>
                         <div className="relative">
                            <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                            <input
                              type={showPass ? "text" : "password"}
                              value={passwordData.confirmPassword}
                              onChange={(e) => setPasswordData({...passwordData, confirmPassword: e.target.value})}
                              className="w-full pl-14 pr-14 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold dark:text-white transition-all"
                              placeholder="••••••••"
                            />
                         </div>
                      </div>
                   </div>

                   <div className="flex justify-end">
                      <button
                        onClick={handleUpdatePassword}
                        disabled={loading || !passwordData.newPassword}
                        className="px-10 py-5 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-black dark:hover:bg-slate-700 transition-all shadow-xl"
                      >
                         Rotate Key
                      </button>
                   </div>
                </div>
             </SettingSection>

             {/* Dangerous Section */}
             <SettingSection title="Management">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                   <button
                    onClick={handleLogout}
                    className="flex items-center justify-between p-8 bg-rose-500/5 hover:bg-rose-500/10 border border-rose-500/10 rounded-[32px] group transition-all text-left"
                   >
                      <div className="flex items-center gap-6">
                         <div className="w-14 h-14 bg-rose-500 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-rose-500/20 group-hover:scale-110 transition-transform">
                            <LogOut size={28} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black text-rose-600">Terminate Session</h4>
                            <p className="text-sm text-rose-500/60">Logout from this terminal.</p>
                         </div>
                      </div>
                   </button>

                   <button className="flex items-center justify-between p-8 bg-slate-900 dark:bg-slate-900 border border-transparent rounded-[32px] group transition-all text-left">
                      <div className="flex items-center gap-6 text-white/40 group-hover:text-rose-600 transition-colors">
                         <div className="w-14 h-14 bg-white/5 rounded-2xl flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                            <Trash2 size={28} />
                         </div>
                         <div>
                            <h4 className="text-xl font-black group-hover:text-white transition-colors">Deactivate Account</h4>
                            <p className="text-sm">Purge data from digital ledger.</p>
                         </div>
                      </div>
                   </button>
                </div>
             </SettingSection>

             <div className="pt-8 text-center space-y-4">
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">InvestLand Web Terminal v1.0.4</p>
                <div className="flex items-center justify-center gap-4 text-xs font-bold text-slate-500">
                   <Link to="/terms" className="hover:text-emerald-600 transition-colors">Terms</Link>
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
                   <span className="w-1 h-1 bg-slate-300 rounded-full" />
                   <Link to="/compliance" className="hover:text-emerald-600 transition-colors">Compliance</Link>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const SettingSection = ({ title, children }: any) => (
  <div className="space-y-6">
     <h3 className="text-sm font-black uppercase tracking-[4px] text-slate-400 ml-4">{title}</h3>
     {children}
  </div>
);

export default Settings;
