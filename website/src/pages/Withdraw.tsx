import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowLeft, IndianRupee, Building2, CreditCard,
  Smartphone, CheckCircle2, AlertCircle, Clock,
  ChevronRight, Wallet, History, X, Check, Info,
  Plus, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { BankAccount, UpiId, WalletTransaction } from '../types/database';

const Withdraw = () => {
  const { user, profile, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const initialAmount = searchParams.get('amount') || '';
  const projectContext = searchParams.get('project');

  const [amount, setAmount] = useState(initialAmount);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [bankAccounts, setBankAccounts] = useState<BankAccount[]>([]);
  const [upiIds, setUpiIds] = useState<UpiId[]>([]);
  const [selectedMethod, setSelectedMethod] = useState<{ type: 'bank' | 'upi', id: string } | null>(null);
  const [history, setHistory] = useState<WalletTransaction[]>([]);

  useEffect(() => {
    if (user) {
      fetchPaymentMethods();
      fetchHistory();
    }
  }, [user]);

  const fetchPaymentMethods = async () => {
    try {
      const [bankRes, upiRes] = await Promise.all([
        supabase.from('bank_accounts').select('*').eq('user_id', user?.id),
        supabase.from('upi_ids').select('*').eq('user_id', user?.id)
      ]);

      setBankAccounts(bankRes.data || []);
      setUpiIds(upiRes.data || []);

      if (bankRes.data && bankRes.data.length > 0) {
        const def = bankRes.data.find(b => b.is_default) || bankRes.data[0];
        setSelectedMethod({ type: 'bank', id: def.id });
      } else if (upiRes.data && upiRes.data.length > 0) {
        const def = upiRes.data.find(u => u.is_default) || upiRes.data[0];
        setSelectedMethod({ type: 'upi', id: def.id });
      }
    } catch (err) {
      console.error('Error fetching methods:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('wallet_transactions')
        .select('*')
        .eq('user_id', user?.id)
        .eq('type', 'debit')
        .ilike('description', '%Withdrawal%')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setHistory(data || []);
    } catch (err) {
      console.error('Error fetching history:', err);
    }
  };

  const handleWithdraw = async () => {
    const val = parseFloat(amount);
    if (!val || val < 100) {
      setError('Minimum withdrawal amount is ₹100');
      return;
    }
    if (val > (profile?.wallet_balance || 0)) {
      setError('Insufficient wallet balance');
      return;
    }
    if (!selectedMethod) {
      setError('Please select or add a withdrawal method');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      if (!selectedMethod) return;

      const selectedAccount = selectedMethod.type === 'bank'
        ? bankAccounts.find(b => b.id === selectedMethod.id)
        : upiIds.find(u => u.id === selectedMethod.id);

      if (!selectedAccount) {
        throw new Error('Selected payment method not found');
      }

      const description = selectedMethod.type === 'bank'
        ? `Withdrawal to Bank (${(selectedAccount as BankAccount).bank_name})`
        : `Withdrawal to UPI (${(selectedAccount as UpiId).upi_id})`;

      // Create transaction record - Trigger tr_process_wallet_tx handles balance deduction automatically
      const { error: txError } = await supabase.from('wallet_transactions').insert({
        user_id: user?.id,
        amount: val,
        type: 'debit',
        description,
        status: 'Pending'
      });

      if (txError) throw txError;

      // REPLACED: Direct balance update removed.
      // Balance deduction is now handled by the ledger trigger (v2) which locks funds for 'debit' transactions.

      setSuccess(true);
      await refreshProfile();
      await fetchHistory();

      setTimeout(() => {
        setSuccess(false);
        setAmount('');
      }, 5000);
    } catch (err: any) {
      setError(err.message || 'Withdrawal failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const selectedData = selectedMethod
    ? (selectedMethod.type === 'bank'
        ? bankAccounts.find(b => b.id === selectedMethod.id)
        : upiIds.find(u => u.id === selectedMethod.id))
    : null;

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950">
        <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Preparing Withdrawal Terminal...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-container px-6">
        <div className="max-w-6xl mx-auto space-y-12">

          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate('/wallet')}
                className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-900 flex items-center justify-center border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-emerald-600 transition-all shadow-sm"
              >
                <ArrowLeft size={20} />
              </button>
              <div>
                <h1 className="text-4xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">Withdraw <span className="text-emerald-600">Funds</span></h1>
                <p className="text-slate-500 dark:text-slate-400 font-medium">Move your earnings to your bank account or UPI.</p>
              </div>
            </div>

            <div className="bg-emerald-600 px-8 py-4 rounded-[24px] text-white flex items-center gap-4 shadow-xl shadow-emerald-600/20">
               <Wallet size={20} />
               <div>
                  <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/50">Available Balance</p>
                  <p className="text-2xl font-black">₹{profile?.wallet_balance?.toLocaleString('en-IN')}</p>
               </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            {/* Form Section */}
            <div className="lg:col-span-7 space-y-8">
               <div className="bg-white dark:bg-slate-900 rounded-[48px] p-10 border border-slate-100 dark:border-slate-800 shadow-xl space-y-10 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -mr-16 -mt-16" />

                  {success ? (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="py-10 text-center space-y-6"
                    >
                      <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mx-auto text-emerald-600 border border-emerald-100 dark:border-emerald-800">
                         <Check size={40} />
                      </div>
                      <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Withdrawal Initiated</h3>
                        <p className="text-slate-500 dark:text-slate-400 font-medium italic">₹{parseFloat(amount).toLocaleString('en-IN')} will be credited to your account after administrative approval.</p>
                      </div>
                      <button
                        onClick={() => setSuccess(false)}
                        className="px-10 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs"
                      >
                        New Withdrawal
                      </button>
                    </motion.div>
                  ) : (
                    <>
                      <div className="space-y-6">
                        {projectContext && (
                          <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-3xl border border-emerald-100 dark:border-emerald-900/20 flex items-center gap-4 animate-in fade-in slide-in-from-top-2">
                            <div className="w-10 h-10 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600">
                              <Info size={20} />
                            </div>
                            <div>
                              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Withdrawal Context</p>
                              <p className="text-sm font-bold dark:text-white">Project: {projectContext}</p>
                            </div>
                          </div>
                        )}

                        <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Withdrawal Amount</label>
                          <div className="relative">
                            <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-900 dark:text-white" />
                            <input
                              type="number"
                              value={amount}
                              onChange={(e) => setAmount(e.target.value)}
                              placeholder="Min. 100"
                              className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] focus:ring-2 focus:ring-emerald-500 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all"
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Destination Target</label>
                           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              {bankAccounts.map(bank => (
                                <button
                                  key={bank.id}
                                  onClick={() => setSelectedMethod({ type: 'bank', id: bank.id })}
                                  className={`p-6 rounded-[32px] border flex items-center gap-4 transition-all text-left ${selectedMethod?.type === 'bank' && selectedMethod?.id === bank.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-emerald-500'}`}
                                >
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod?.type === 'bank' && selectedMethod?.id === bank.id ? 'bg-white/20' : 'bg-white dark:bg-slate-900'}`}>
                                      <Building2 size={20} className={selectedMethod?.type === 'bank' && selectedMethod?.id === bank.id ? 'text-white' : 'text-emerald-600'} />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-xs font-black uppercase truncate">{bank.bank_name}</p>
                                      <p className={`text-[10px] font-bold ${selectedMethod?.type === 'bank' && selectedMethod?.id === bank.id ? 'text-emerald-100' : 'text-slate-400'}`}>XXXX {bank.account_number.slice(-4)}</p>
                                   </div>
                                </button>
                              ))}
                              {upiIds.map(upi => (
                                <button
                                  key={upi.id}
                                  onClick={() => setSelectedMethod({ type: 'upi', id: upi.id })}
                                  className={`p-6 rounded-[32px] border flex items-center gap-4 transition-all text-left ${selectedMethod?.type === 'upi' && selectedMethod?.id === upi.id ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-50 dark:bg-slate-800 border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-blue-500'}`}
                                >
                                   <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${selectedMethod?.type === 'upi' && selectedMethod?.id === upi.id ? 'bg-white/20' : 'bg-white dark:bg-slate-900'}`}>
                                      <Smartphone size={20} className={selectedMethod?.type === 'upi' && selectedMethod?.id === upi.id ? 'text-white' : 'text-blue-500'} />
                                   </div>
                                   <div className="min-w-0">
                                      <p className="text-xs font-black uppercase truncate">UPI ID</p>
                                      <p className={`text-[10px] font-bold ${selectedMethod?.type === 'upi' && selectedMethod?.id === upi.id ? 'text-blue-100' : 'text-slate-400'}`}>{upi.upi_id}</p>
                                   </div>
                                </button>
                              ))}
                              <Link to="/profile" className="p-6 rounded-[32px] border-2 border-dashed border-slate-200 dark:border-slate-800 flex items-center justify-center gap-3 text-slate-400 hover:text-emerald-600 hover:border-emerald-600 transition-all">
                                 <Plus className="w-5 h-5" />
                                 <span className="text-[10px] font-black uppercase tracking-widest">Link New</span>
                              </Link>
                           </div>
                        </div>

                        {selectedData && (
                          <div className="p-8 bg-slate-50 dark:bg-slate-800/50 rounded-[32px] border border-slate-100 dark:border-slate-800 space-y-4 animate-in fade-in duration-500">
                             <div className="flex items-center gap-3 text-slate-400">
                                <AlertCircle size={14} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Settlement Audit</span>
                             </div>
                             {selectedMethod?.type === 'bank' ? (
                               <div className="grid grid-cols-2 gap-6">
                                  <div>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Holder</p>
                                     <p className="text-sm font-bold dark:text-white">{(selectedData as BankAccount).account_holder}</p>
                                  </div>
                                  <div>
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">IFSC</p>
                                     <p className="text-sm font-bold dark:text-white uppercase">{(selectedData as BankAccount).ifsc_code}</p>
                                  </div>
                                  <div className="col-span-2">
                                     <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Account Number</p>
                                     <p className="text-sm font-bold dark:text-white">{(selectedData as BankAccount).account_number}</p>
                                  </div>
                               </div>
                             ) : (
                               <div>
                                  <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Virtual Address</p>
                                  <p className="text-sm font-bold dark:text-white">{(selectedData as UpiId).upi_id}</p>
                               </div>
                             )}
                          </div>
                        )}

                        {error && (
                          <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                             <AlertCircle size={16} />
                             {error}
                          </div>
                        )}

                        <button
                          onClick={handleWithdraw}
                          disabled={submitting || !amount || parseFloat(amount) < 100}
                          className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-sm hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 disabled:opacity-50 flex items-center justify-center gap-3"
                        >
                          {submitting ? <RefreshCw size={20} className="animate-spin" /> : <>Lock Withdrawal <ChevronRight size={18} /></>}
                        </button>
                      </div>
                    </>
                  )}
               </div>
            </div>

            {/* Sidebar / Stats */}
            <div className="lg:col-span-5 space-y-8">
               <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-8 relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/10 rounded-full -mr-24 -mt-24 blur-3xl" />
                  <div className="flex items-center gap-3 relative z-10">
                     <History className="w-5 h-5 text-emerald-400" />
                     <h3 className="text-lg font-black uppercase tracking-widest">Transfer Logs</h3>
                  </div>

                  <div className="space-y-4 relative z-10">
                     {history.length === 0 ? (
                        <div className="py-10 text-center space-y-4 opacity-50">
                           <Clock className="w-12 h-12 mx-auto text-slate-500" />
                           <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">No active withdrawal requests</p>
                        </div>
                     ) : (
                        history.map(tx => (
                           <div key={tx.id} className="p-5 bg-white/5 rounded-[32px] border border-white/5 flex items-center justify-between group hover:bg-white/10 transition-all">
                              <div className="flex items-center gap-4">
                                 <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${tx.status === 'Completed' ? 'bg-emerald-500/20 text-emerald-400' : tx.status === 'Failed' ? 'bg-rose-500/20 text-rose-400' : 'bg-gold-500/20 text-gold-400'}`}>
                                    {tx.status === 'Completed' ? <CheckCircle2 size={18} /> : tx.status === 'Failed' ? <X size={18} /> : <Clock size={18} />}
                                 </div>
                                 <div>
                                    <p className="text-sm font-black tracking-tight">₹{tx.amount.toLocaleString('en-IN')}</p>
                                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</p>
                                 </div>
                              </div>
                              <span className={`text-[8px] font-black uppercase tracking-[2px] px-3 py-1 rounded-full ${tx.status === 'Completed' ? 'text-emerald-400 border border-emerald-500/30' : tx.status === 'Failed' ? 'text-rose-400 border border-rose-500/30' : 'text-gold-400 border border-gold-500/30'}`}>
                                 {tx.status === 'Completed' ? 'Approved' : tx.status === 'Failed' ? 'Rejected' : 'Pending'}
                              </span>
                           </div>
                        ))
                     )}
                  </div>

                  <div className="pt-8 border-t border-white/5 flex items-center justify-between text-slate-500 relative z-10">
                     <p className="text-[9px] font-black uppercase tracking-widest italic">Verification ID: SEC-{user?.id.slice(0,8).toUpperCase()}</p>
                     <div className="flex items-center gap-2">
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        <span className="text-[8px] font-black uppercase tracking-widest text-emerald-400">Ledger Online</span>
                     </div>
                  </div>
               </div>

               <div className="p-8 rounded-[40px] bg-emerald-600 text-white relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16 blur-2xl" />
                  <div className="flex items-center gap-6 relative z-10">
                     <div className="w-16 h-16 bg-white/20 rounded-3xl flex items-center justify-center shrink-0">
                        <CheckCircle2 size={32} />
                     </div>
                     <div className="space-y-1">
                        <h4 className="text-xl font-black uppercase tracking-tight">KYC Verified</h4>
                        <p className="text-emerald-50 text-xs font-medium italic opacity-80">"Your profile is compliant with fractional ownership regulations. Withdrawals are prioritized."</p>
                     </div>
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Withdraw;
