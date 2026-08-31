import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Mail, Lock, ChevronRight, AlertCircle,
  Eye, EyeOff, Grapes as Google
} from 'lucide-react';
import { supabase } from '../lib/supabase';

import { useBranding } from '../context/BrandingContext';

const Login = () => {
  const { settings } = useBranding();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      navigate('/');
    } catch (err: any) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    }
  };

  return (
    <div className="min-h-screen flex bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Left Side: Branding & Image (Desktop only) */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-emerald-950">
        <img
          src="https://images.unsplash.com/photo-1500382017468-9049fed747ef?q=80&w=2000&auto=format&fit=crop"
          alt="Premium Land"
          className="absolute inset-0 w-full h-full object-cover opacity-60 scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-tr from-emerald-950 via-emerald-950/40 to-transparent" />

        <div className="relative z-10 p-20 flex flex-col justify-between h-full w-full">
          <Link to="/" className="flex items-center gap-3">
            <img
              src={settings.logo_url || "/logo.png"}
              alt="InvestLand"
              className="h-10 w-auto"
              onError={(e) => {
                e.currentTarget.src = "/logo.png";
              }}
            />
          </Link>

          <div className="space-y-6">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-6xl font-black text-white leading-tight tracking-tighter"
            >
              The Future of <br />
              <span className="text-emerald-500 italic">Land Ownership</span> <br />
              is Here.
            </motion.h2>
            <p className="text-xl text-emerald-100/60 max-w-md font-medium leading-relaxed">
              Join 12,000+ smart investors securing high-yield land assets from just ₹500.
            </p>
          </div>

          <div className="flex items-center gap-6">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <img
                  key={i}
                  src={`https://i.pravatar.cc/100?u=${i}`}
                  className="w-10 h-10 rounded-full border-2 border-emerald-900 shadow-xl"
                  alt="User"
                />
              ))}
            </div>
            <p className="text-sm font-bold text-emerald-100/40 uppercase tracking-widest">Verified Investors</p>
          </div>
        </div>
      </div>

      {/* Right Side: Login Card */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-20 relative">
        {/* Background Decor (Mobile only) */}
        <div className="lg:hidden absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-100/50 dark:bg-emerald-900/10 blur-[100px] -z-10" />

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="w-full max-w-md space-y-10"
        >
          <div className="space-y-3">
            <div className="lg:hidden inline-flex items-center gap-2 mb-4">
              <img
                src={settings.logo_url || "/logo.png"}
                alt="InvestLand"
                className="h-10 w-auto"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            </div>
            <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight leading-none">Welcome Back</h1>
            <p className="text-slate-500 dark:text-slate-400 font-medium italic">Secure access to your land portfolio.</p>
          </div>

          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/20 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <p className="text-sm font-bold">{error}</p>
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 ml-4">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500 ml-4">Passkey</label>
                <div className="relative">
                  <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                  <input
                    required
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-16 pr-16 py-5 bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-400 hover:text-emerald-600 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between px-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input type="checkbox" className="peer sr-only" />
                  <div className="w-5 h-5 border-2 border-slate-200 dark:border-slate-800 rounded-lg peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all" />
                  <div className="absolute inset-0 flex items-center justify-center text-white scale-0 peer-checked:scale-100 transition-transform">
                    <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20"><path d="M0 11l2-2 5 5L18 3l2 2L7 18z"/></svg>
                  </div>
                </div>
                <span className="text-sm font-bold text-slate-500 dark:text-slate-400 italic">Remember Me</span>
              </label>
              <Link to="/forgot-password" title="Forgot Password" className="text-sm font-black uppercase tracking-widest text-emerald-600 hover:text-emerald-700">Forgot Key?</Link>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-sm hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 group disabled:opacity-50"
            >
              {loading ? (
                <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="space-y-6">
            <div className="relative flex items-center justify-center">
              <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-100 dark:border-slate-800"></div></div>
              <span className="relative px-6 bg-white dark:bg-slate-950 text-[10px] font-black uppercase tracking-[2px] text-slate-400 dark:text-slate-500">Instant Access</span>
            </div>

            <button
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-4 py-5 border-2 border-slate-100 dark:border-slate-800 rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-slate-900 dark:text-white"
            >
              <img src="https://www.google.com/favicon.ico" className="w-5 h-5" alt="Google" />
              Sign in with Google
            </button>

            <p className="text-center text-sm font-bold text-slate-500 dark:text-slate-400">
              Don't have an account?
              <Link to="/register" className="text-emerald-600 dark:text-emerald-400 uppercase tracking-widest font-black ml-3 hover:underline underline-offset-8">Create Account</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
