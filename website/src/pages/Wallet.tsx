import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Wallet as WalletIcon, ArrowUpRight, ArrowDownLeft, Plus, IndianRupee, History, ShieldCheck, AlertCircle, X, Check, ChevronRight, RefreshCw } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { WalletTransaction } from '../types/database';
import { walletService, Wallet as WalletType } from '../services/walletService';

declare global {
  interface Window {
    Razorpay: any;
  }
}

const Wallet = () => {
  const { user, refreshProfile } = useAuth();
  const [wallet, setWallet] = useState<WalletType | null>(null);
  const [transactions, setTransactions] = useState<WalletTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWalletData = useCallback(async () => {
    if (!user) return;
    try {
      const [walletData, txData] = await Promise.all([
        walletService.getWallet(user.id),
        walletService.getTransactions(user.id)
      ]);
      setWallet(walletData);
      setTransactions(txData);
    } catch (err) {
      console.error('Error fetching wallet data:', err);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  const handleDeposit = async () => {
    const val = parseFloat(amount);
    if (!val || val < 100 || !user) {
      setError('Minimum deposit is ₹100');
      return;
    }

    setActionLoading(true);
    setError(null);

    try {
      // 1. Create Razorpay Order
      const order = await walletService.createRazorpayOrder(val);

      // 2. Configure Razorpay Options
      const options = {
        key: order.key_id,
        amount: order.amount,
        currency: order.currency,
        name: "InvestLand",
        description: "Wallet Refill",
        order_id: order.order_id,
        handler: async (response: any) => {
          try {
            setActionLoading(true);
            // 3. Verify Payment
            await walletService.verifyRazorpayPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature
            });

            // 4. Refresh State
            await Promise.all([
              fetchWalletData(),
              refreshProfile()
            ]);

            setIsDepositOpen(false);
            setAmount('');
          } catch (err: any) {
            setError(err.message || 'Payment verification failed.');
          } finally {
            setActionLoading(false);
          }
        },
        prefill: {
          name: user.email?.split('@')[0],
          email: user.email,
        },
        theme: {
          color: "#10b981",
        },
        modal: {
          ondismiss: () => {
            setActionLoading(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.open();

    } catch (err: any) {
      console.error('Deposit error:', err);
      setError(err.message || 'Could not initiate payment.');
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950">
        <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Accessing Secure Vault...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-container px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">InvestLand <span className="text-emerald-600">Wallet</span></h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Manage your investment funds and track real-time transaction history.
            </p>
          </div>
          <div className="flex gap-4">
            <button
              onClick={() => setIsDepositOpen(true)}
              className="flex items-center gap-3 px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30"
            >
              <Plus className="w-5 h-5" /> Add Money
            </button>
            <Link
              to="/withdraw"
              className="flex items-center gap-3 px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-slate-50 dark:hover:bg-slate-800 transition-all shadow-sm"
            >
              <ArrowUpRight className="w-5 h-5 text-emerald-600" /> Withdraw
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
           {/* Balance Card */}
           <div className="lg:col-span-4 space-y-6">
              <div className="bg-slate-900 rounded-[48px] p-10 text-white space-y-10 relative overflow-hidden shadow-2xl">
                 <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-600/20 rounded-full -mr-24 -mt-24 blur-3xl" />
                 <div className="flex items-center gap-4 relative z-10">
                    <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
                       <WalletIcon className="w-6 h-6 text-emerald-400" />
                    </div>
                    <span className="text-xs font-black uppercase tracking-widest text-emerald-100/50">Current Balance</span>
                 </div>

                 <div className="space-y-2 relative z-10">
                    <p className="text-6xl font-black tracking-tighter">₹{wallet?.balance?.toLocaleString('en-IN') || '0'}</p>
                    <p className="text-xs font-bold text-emerald-100/40 uppercase tracking-widest">Available for investment</p>
                 </div>

                 <div className="pt-10 border-t border-white/5 grid grid-cols-2 gap-6 relative z-10">
                    <div>
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Total Deposits</p>
                       <p className="text-xl font-bold">₹{wallet?.total_deposit?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                    <div className="text-right">
                       <p className="text-[10px] font-black uppercase tracking-widest text-emerald-100/30">Total Invested</p>
                       <p className="text-xl font-bold">₹{wallet?.total_investment?.toLocaleString('en-IN') || '0'}</p>
                    </div>
                 </div>
              </div>

              <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6">
                 <div className="flex items-center gap-3">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white">Security Protocol</h4>
                 </div>
                 <p className="text-xs font-medium text-slate-500 dark:text-slate-400 leading-relaxed italic">
                   "All transactions are secured using bank-grade encryption and stored on a private digital ledger."
                 </p>
              </div>
           </div>

           {/* History Table */}
           <div className="lg:col-span-8 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center justify-between">
                 <div className="flex items-center gap-3">
                    <History className="w-6 h-6 text-emerald-600" />
                    <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Activity Feed</h3>
                 </div>
              </div>

              {transactions.length === 0 ? (
                <div className="py-20 text-center space-y-4">
                   <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                      <History className="w-8 h-8 text-slate-300" />
                   </div>
                   <p className="text-slate-500 dark:text-slate-400 font-bold italic">No records found in the ledger.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                       <tr className="bg-slate-50/50 dark:bg-slate-800/30">
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Reference</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Category</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400">Date</th>
                          <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-slate-400 text-right">Amount</th>
                       </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                       {transactions.map((tx) => (
                         <tr key={tx.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/20 transition-colors group">
                            <td className="px-8 py-6">
                               <div className="flex items-center gap-4">
                                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110 ${tx.type === 'credit' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'bg-rose-50 dark:bg-rose-900/20 text-rose-600'}`}>
                                     {tx.type === 'credit' ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                                  </div>
                                  <p className="text-sm font-black text-slate-900 dark:text-white truncate max-w-[200px]">{tx.description}</p>
                               </div>
                            </td>
                            <td className="px-8 py-6">
                               <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-slate-400">
                                 {tx.status}
                               </span>
                            </td>
                            <td className="px-8 py-6">
                               <p className="text-[10px] font-bold text-slate-400">{new Date(tx.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                            </td>
                            <td className="px-8 py-6 text-right">
                               <p className={`text-lg font-black ${tx.type === 'credit' ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                                 {tx.type === 'credit' ? '+' : '-'}₹{tx.amount.toLocaleString('en-IN')}
                               </p>
                            </td>
                         </tr>
                       ))}
                    </tbody>
                  </table>
                </div>
              )}
           </div>
        </div>
      </div>

      {/* Deposit Modal */}
      <AnimatePresence>
        {isDepositOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-6">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsDepositOpen(false)}
              className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="relative w-full max-w-lg bg-white dark:bg-slate-900 rounded-[48px] shadow-3xl border border-slate-100 dark:border-slate-800 p-10 space-y-10"
            >
               <div className="flex items-center justify-between">
                  <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Add Funds</h3>
                  <button onClick={() => setIsDepositOpen(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors">
                     <X className="w-6 h-6 text-slate-400" />
                  </button>
               </div>

               <div className="space-y-4">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Enter Amount</label>
                  <div className="relative">
                    <IndianRupee className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-slate-900 dark:text-white" />
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0"
                      className="w-full pl-16 pr-8 py-6 bg-slate-50 dark:bg-slate-800 border-none rounded-[32px] focus:ring-2 focus:ring-emerald-500 outline-none font-black text-3xl text-slate-900 dark:text-white transition-all"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 pt-2">
                     {[500, 1000, 5000, 10000].map(a => (
                       <button key={a} onClick={() => setAmount(a.toString())} className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-emerald-50 dark:hover:bg-emerald-900/30 hover:text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest transition-colors">
                         +₹{a >= 1000 ? `${a/1000}k` : a}
                       </button>
                     ))}
                  </div>
               </div>

               {error && (
                 <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold">
                    <AlertCircle size={16} />
                    {error}
                 </div>
               )}

               <div className="space-y-4">
                 <button
                    onClick={handleDeposit}
                    disabled={actionLoading || !amount || parseFloat(amount) < 100}
                    className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/30 disabled:opacity-50 flex items-center justify-center gap-3"
                 >
                    {actionLoading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <>Initiate Secure Payment <ChevronRight className="w-5 h-5" /></>}
                 </button>
                 <p className="text-center text-[9px] font-black uppercase tracking-widest text-slate-400 flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> PCI-DSS Compliant Encryption Active
                 </p>
               </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Wallet;
