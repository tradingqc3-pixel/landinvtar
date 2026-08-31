import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  User, Mail, Lock, ChevronRight, AlertCircle,
  ShieldCheck, CheckCircle2, Eye, EyeOff
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useBranding } from '../context/BrandingContext';

const Register = () => {
  const { settings } = useBranding();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: name,
          }
        }
      });

      if (error) throw error;
      setSuccess(true);
      setTimeout(() => navigate('/login'), 3000);
    } catch (err: any) {
      setError(err.message || 'Registration failed');
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
    <div className="min-h-screen flex items-center justify-center pt-24 pb-20 overflow-hidden bg-[#020B1F] relative">
      {/* Background Decor */}
      <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-blue-500/5 blur-[100px] pointer-events-none" />

      <div className="max-container px-6 flex justify-center items-center relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="w-full max-w-[520px] bg-white/5 backdrop-blur-2xl p-10 md:p-12 rounded-[40px] border border-white/10 shadow-2xl space-y-10"
        >
          <div className="text-center space-y-4">
             <Link to="/" className="inline-flex items-center gap-3 mb-4 group">
                <img
                  src={settings.logo_url || "/logo.png"}
                  alt="InvestLand"
                  className="h-10 w-auto"
                  onError={(e) => {
                    e.currentTarget.src = "/logo.png";
                  }}
                />
             </Link>
             <h1 className="text-4xl font-black text-white tracking-tight leading-tight">Open Account</h1>
             <p className="text-slate-400 font-medium italic">Join the fractional movement today.</p>
          </div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="py-12 text-center space-y-6"
            >
              <div className="w-20 h-20 bg-emerald-50/20 rounded-full flex items-center justify-center mx-auto text-emerald-400 border border-emerald-500/30">
                 <CheckCircle2 className="w-10 h-10" />
              </div>
              <h4 className="text-2xl font-black text-white">Verification Sent</h4>
              <p className="text-lg text-slate-400 font-medium italic max-w-xs mx-auto">
                Please check your inbox to activate your InvestLand terminal. Redirecting...
              </p>
            </motion.div>
          ) : (
            <form onSubmit={handleRegister} className="space-y-6">
              {error && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex items-center gap-3 text-red-400"
                >
                  <AlertCircle className="w-5 h-5 shrink-0" />
                  <p className="text-sm font-bold">{error}</p>
                </motion.div>
              )}

              <div className="space-y-4">
                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-500 ml-4">Display Name</label>
                   <div className="relative">
                      <User className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        required
                        type="text"
                        placeholder="John Doe"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold transition-all text-white placeholder:text-slate-600"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-500 ml-4">Email Address</label>
                   <div className="relative">
                      <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        required
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full pl-16 pr-8 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold transition-all text-white placeholder:text-slate-600"
                      />
                   </div>
                </div>

                <div className="space-y-1.5">
                   <label className="text-[10px] font-black uppercase tracking-[2px] text-slate-500 ml-4">Access Passkey</label>
                   <div className="relative">
                      <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                      <input
                        required
                        type={showPassword ? "text" : "password"}
                        placeholder="Min. 8 Characters"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full pl-16 pr-16 py-5 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/50 outline-none font-bold transition-all text-white placeholder:text-slate-600"
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-500 hover:text-emerald-500 transition-colors"
                      >
                        {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                      </button>
                   </div>
                </div>
              </div>

              <div className="px-4 text-[10px] font-medium text-slate-500 leading-relaxed italic text-center uppercase tracking-wider">
                 By selecting "Initiate Onboarding", you consent to our <Link to="/terms" className="text-emerald-500 font-black hover:underline underline-offset-4">Terms of Service</Link> and data processing protocols.
              </div>

              <div className="space-y-4">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-6 bg-gradient-to-r from-emerald-600 to-emerald-500 text-white rounded-2xl font-black uppercase tracking-[3px] text-sm hover:from-emerald-700 hover:to-emerald-600 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3 group disabled:opacity-50"
                >
                  {loading ? (
                    <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      Initiate Onboarding
                      <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-white/10"></div></div>
                  <span className="relative px-4 bg-transparent text-[10px] font-black uppercase tracking-[2px] text-slate-500">Or</span>
                </div>

                <button
                  type="button"
                  onClick={handleGoogleLogin}
                  className="w-full flex items-center justify-center gap-4 py-5 border border-white/10 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-white/5 transition-all text-white shadow-xl"
                >
                  <img src="https://www.google.com/favicon.ico" className="w-4 h-4" alt="Google" />
                  Continue with Google
                </button>
              </div>

              <p className="text-center text-sm font-bold text-slate-500">
                Already an owner? <Link to="/login" className="text-white uppercase tracking-widest font-black ml-2 hover:text-emerald-500 transition-colors">Sign In</Link>
              </p>
            </form>
          )}

          {!success && (
            <div className="pt-8 border-t border-white/5 flex flex-col items-center gap-4">
              <div className="flex items-center gap-3 text-emerald-500/40">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="text-[10px] font-black uppercase tracking-[2px]">KYC Verification Protocol Ready</span>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default Register;
