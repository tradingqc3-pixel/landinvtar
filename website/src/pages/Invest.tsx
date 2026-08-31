import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ChevronLeft, IndianRupee, ShieldCheck,
  TrendingUp, AlertCircle, CheckCircle2,
  Lock, Wallet, ArrowRight, MapPin, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { LandProject } from '../types/database';

const Invest = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, profile, refreshProfile } = useAuth();

  const [project, setProject] = useState<LandProject | null>(null);
  const [amount, setAmount] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubloading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProjectData();
    }
  }, [id]);

  const fetchProjectData = async () => {
    setLoading(true);
    try {
      const { data, error: projectError } = await supabase
        .from('land_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (projectError) throw projectError;

      setProject(data);
      setAmount(data.min_investment.toString());
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to load project details.');
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmInvestment = async () => {
    if (!project || !user || !profile) return;

    const investAmount = parseFloat(amount);
    if (isNaN(investAmount) || investAmount < project.min_investment) {
      setError(`Minimum investment is ₹${project.min_investment.toLocaleString()}`);
      return;
    }

    if (investAmount > (profile.wallet_balance || 0)) {
      setError('Insufficient wallet balance. Please add money to your wallet.');
      return;
    }

    setSubloading(true);
    setError(null);

    try {
      // Use the Atomic RPC for Investment
      const { data, error: investError } = await supabase.rpc('invest_in_project', {
        p_project_id: project.id,
        p_amount: investAmount
      });

      if (investError) throw investError;

      if (data?.success) {
        setSuccess(true);
        await refreshProfile();
      } else {
        throw new Error('Transaction could not be verified by the ledger.');
      }
    } catch (err: any) {
      console.error('Investment error:', err);
      setError(err.message || 'Investment failed. Please try again.');
    } finally {
      setSubloading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950 transition-colors duration-300">
        <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">Preparing Terminal...</p>
      </div>
    );
  }

  if (error && !project) {
    return (
      <div className="pt-32 text-center py-20 px-6 max-w-2xl mx-auto bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
        <Link to="/projects" className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg">
          Back to Projects
        </Link>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 text-center py-20 px-6 bg-white dark:bg-slate-950 transition-colors duration-300">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The asset you want to invest in is unavailable.</p>
        <Link to="/projects" className="text-emerald-600 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
          <ChevronLeft className="w-4 h-4" /> Back to Assets
        </Link>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 transition-colors duration-300 min-h-screen">
      <div className="max-container px-6">
        <div className="max-w-4xl mx-auto">
          <Link to={`/projects/${id}`} className="inline-flex items-center gap-2 text-slate-500 dark:text-slate-400 hover:text-emerald-600 transition-colors font-bold uppercase tracking-widest text-xs mb-8">
            <ChevronLeft className="w-4 h-4" /> Cancel & Return to Details
          </Link>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-white dark:bg-slate-900 p-12 md:p-20 rounded-[64px] shadow-3xl text-center space-y-8 border border-white dark:border-slate-800"
            >
              <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="space-y-4">
                <h2 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">Investment Confirmed!</h2>
                <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium italic">
                  You are now a fractional owner of <span className="text-slate-900 dark:text-white font-bold">{project.name}</span>.
                </p>
              </div>
              <div className="pt-8 flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/portfolio" className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30">
                  View My Portfolio
                </Link>
                <Link to="/projects" className="px-10 py-5 bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-200 dark:hover:bg-slate-700 transition-all">
                  Explore More Assets
                </Link>
              </div>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 items-start">
              {/* Left: Summary */}
              <div className="lg:col-span-3 space-y-8">
                <div className="bg-white dark:bg-slate-900 p-8 rounded-[48px] border border-white dark:border-slate-800 shadow-xl space-y-8">
                  <div className="flex flex-col md:flex-row gap-8 items-center">
                    <div className="w-32 h-32 rounded-3xl overflow-hidden shadow-lg shrink-0">
                      <img src={project.image} className="w-full h-full object-cover" alt={project.name} />
                    </div>
                    <div className="space-y-2 text-center md:text-left">
                      <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{project.name}</h3>
                      <p className="text-slate-500 dark:text-slate-400 flex items-center justify-center md:justify-start gap-2 font-medium">
                        <MapPin className="w-4 h-4 text-emerald-600" /> {project.location}, {project.city}
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6 pt-8 border-t border-slate-50 dark:border-slate-800">
                    <div className="space-y-1">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Asset Return</p>
                      <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{project.expected_roi}% P.A.</p>
                    </div>
                    <div className="space-y-1 text-right">
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Minimum Entry</p>
                      <p className="text-2xl font-black text-slate-900 dark:text-white">₹{project.min_investment.toLocaleString()}</p>
                    </div>
                  </div>
                </div>

                <div className="bg-emerald-600 rounded-[48px] p-10 text-white space-y-6 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex items-center gap-4">
                    <ShieldCheck className="w-10 h-10 text-emerald-100" />
                    <div>
                      <h4 className="text-xl font-black uppercase">Digital Trust Guaranteed</h4>
                      <p className="text-sm text-emerald-50 font-medium italic opacity-80">Legal SPV structure & blockchain security.</p>
                    </div>
                  </div>
                  <ul className="space-y-3">
                    {['Government Approved', '100% Verified Title', 'Strategic Growth Corridor'].map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-xs font-bold uppercase tracking-widest">
                        <CheckCircle2 className="w-4 h-4" /> {item}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Right: Form */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-white dark:border-slate-800 shadow-2xl space-y-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <Wallet className="w-5 h-5 text-emerald-600" />
                      <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Investment Terminal</h4>
                    </div>

                    {error && (
                      <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/30 rounded-2xl flex items-center gap-3 text-red-600 dark:text-red-400">
                        <AlertCircle className="w-5 h-5 shrink-0" />
                        <p className="text-xs font-bold">{error}</p>
                      </div>
                    )}

                    <div className="space-y-3">
                      <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">Purchase Amount</label>
                      <div className="relative">
                        <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-900 dark:text-white" />
                        <input
                          type="number"
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          placeholder="0"
                          className="w-full pl-14 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 outline-none font-black text-2xl text-slate-900 dark:text-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="p-6 bg-slate-50 dark:bg-slate-800 rounded-3xl space-y-4">
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>Wallet Balance</span>
                        <span className="text-slate-900 dark:text-white font-black">₹{profile?.wallet_balance?.toLocaleString() || '0'}</span>
                      </div>
                      <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                        <span>Platform Fee</span>
                        <span className="text-emerald-600 font-black">FREE</span>
                      </div>
                      <div className="pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center">
                        <span className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white">Net Total</span>
                        <span className="text-xl font-black text-slate-900 dark:text-white">₹{parseFloat(amount || '0').toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  <button
                    onClick={handleConfirmInvestment}
                    disabled={submitting || parseFloat(amount) < (project?.min_investment || 0)}
                    className="w-full py-6 bg-slate-900 dark:bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-black dark:hover:bg-emerald-700 transition-all shadow-2xl shadow-slate-900/20 disabled:opacity-50 flex items-center justify-center gap-3 group"
                  >
                    {submitting ? (
                      <RefreshCw className="w-6 h-6 animate-spin" />
                    ) : (
                      <>
                        Confirm Investment
                        <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-3 text-slate-400">
                    <Lock className="w-4 h-4" />
                    <span className="text-[9px] font-black uppercase tracking-widest">AES-256 Bit Secure Transaction</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Invest;
