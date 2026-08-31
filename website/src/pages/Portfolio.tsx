import { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, TrendingUp, ArrowUpRight, MapPin, IndianRupee, PieChart, Activity, ChevronRight, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { Investment, computePortfolioStats } from '../types/database';

const Portfolio = () => {
  const { user } = useAuth();
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchInvestments();
    }
  }, [user]);

  const fetchInvestments = async () => {
    try {
      const { data, error } = await supabase
        .from('investments')
        .select(`
          *,
          land_projects (
            id,
            name,
            location,
            image,
            expected_roi,
            category
          )
        `)
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInvestments(data || []);
    } catch (err) {
      console.error('Error fetching investments:', err);
    } finally {
      setLoading(false);
    }
  };

  const stats = useMemo(() => computePortfolioStats(investments), [investments]);

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Loading Portfolio...</p>
      </div>
    );
  }

  return (
    <div className="pt-32 pb-32 bg-slate-50 dark:bg-slate-950 min-h-screen transition-colors duration-300">
      <div className="max-container px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight">My <span className="text-emerald-600">Portfolio</span></h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Track your fractional land ownership and projected capital appreciation.
            </p>
          </div>
          <div className="flex gap-4">
            <div className="bg-white dark:bg-slate-900 px-6 py-3 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm flex items-center gap-3">
              <Activity className="w-5 h-5 text-emerald-600" />
              <span className="text-sm font-bold text-slate-600 dark:text-slate-300">Market is Active</span>
            </div>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatCard
            label="Total Value"
            value={`₹${stats.portfolioValue.toLocaleString('en-IN')}`}
            sub="Current valuation"
            icon={TrendingUp}
            color="emerald"
          />
          <StatCard
            label="Invested"
            value={`₹${stats.totalInvested.toLocaleString('en-IN')}`}
            sub="Principal capital"
            icon={Briefcase}
            color="blue"
          />
          <StatCard
            label="Total Returns"
            value={`+₹${stats.totalReturns.toLocaleString('en-IN')}`}
            sub={`${stats.returnsPercent.toFixed(1)}% Appreciation`}
            icon={PieChart}
            color="gold"
          />
          <StatCard
            label="Assets"
            value={investments.length.toString()}
            sub="Land parcels owned"
            icon={Activity}
            color="purple"
          />
        </div>

        {/* Main Content */}
        <div className="space-y-8">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-widest">Active Holdings</h3>

          {investments.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-20 rounded-[48px] border border-slate-100 dark:border-slate-800 text-center space-y-6 shadow-sm">
              <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
                <Briefcase className="w-10 h-10 text-slate-300" />
              </div>
              <div className="space-y-2">
                <h4 className="text-2xl font-black text-slate-900 dark:text-white">No Investments Yet</h4>
                <p className="text-slate-500 dark:text-slate-400">Start building your real estate wealth from just ₹500.</p>
              </div>
              <Link
                to="/projects"
                className="inline-flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20"
              >
                Browse Projects <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-6">
              {investments.map((investment, idx) => (
                <motion.div
                  key={investment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  className="bg-white dark:bg-slate-900 p-6 md:p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-xl transition-all group"
                >
                  <div className="flex flex-col lg:flex-row gap-8 items-center">
                    {/* Project Image */}
                    <div className="w-full lg:w-48 aspect-square rounded-3xl overflow-hidden shadow-lg shrink-0 relative">
                      <img
                        src={investment.land_projects?.image || 'https://via.placeholder.com/400'}
                        alt={investment.land_projects?.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      />
                      <div className="absolute top-3 left-3 px-3 py-1.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-xl text-[8px] font-black uppercase tracking-widest">
                        {investment.land_projects?.category}
                      </div>
                    </div>

                    {/* Basic Info */}
                    <div className="flex-1 space-y-4 w-full">
                      <div className="space-y-1">
                        <h4 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">{investment.land_projects?.name}</h4>
                        <p className="text-sm font-medium text-slate-500 dark:text-slate-400 flex items-center gap-2">
                          <MapPin className="w-4 h-4 text-emerald-600" /> {investment.land_projects?.location}
                        </p>
                      </div>
                      <div className="flex flex-wrap gap-4">
                         <div className="px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-2">
                            <Clock className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                              Invested on {new Date(investment.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </span>
                         </div>
                         <div className="px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-emerald-600" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400">
                              {investment.roi_rate}% P.A.
                            </span>
                         </div>
                      </div>
                    </div>

                    {/* Financials */}
                    <div className="grid grid-cols-2 lg:grid-cols-1 gap-8 w-full lg:w-48 text-center lg:text-right border-t lg:border-t-0 lg:border-l border-slate-100 dark:border-slate-800 pt-8 lg:pt-0 lg:pl-8">
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Amount Invested</p>
                          <p className="text-2xl font-black text-slate-900 dark:text-white">₹{investment.amount.toLocaleString('en-IN')}</p>
                       </div>
                       <div className="space-y-1">
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Current Value</p>
                          <p className="text-2xl font-black text-emerald-600">₹{Math.round(investment.amount * (1 + (investment.roi_rate/100) * ((Date.now() - new Date(investment.created_at).getTime()) / (365.25 * 24 * 60 * 60 * 1000)))).toLocaleString('en-IN')}</p>
                       </div>
                    </div>

                    {/* Action */}
                    <div className="w-full lg:w-auto">
                       <Link
                        to={`/projects/${investment.project_id}`}
                        className="w-full lg:w-14 h-14 bg-slate-900 dark:bg-slate-800 text-white rounded-2xl flex items-center justify-center hover:bg-emerald-600 transition-all shadow-lg"
                       >
                         <ArrowUpRight className="w-6 h-6" />
                       </Link>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const StatCard = ({ label, value, sub, icon: Icon, color }: any) => {
  const colors: any = {
    emerald: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20',
    blue: 'text-blue-600 bg-blue-50 dark:bg-blue-900/20',
    gold: 'text-gold-600 bg-gold-50 dark:bg-gold-900/20',
    purple: 'text-purple-600 bg-purple-50 dark:bg-purple-900/20'
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${colors[color]}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{label}</p>
        <p className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">{value}</p>
        <p className="text-xs font-bold text-slate-500 dark:text-slate-400 italic">{sub}</p>
      </div>
    </div>
  );
};

export default Portfolio;
