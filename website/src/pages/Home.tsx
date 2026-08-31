import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronRight, TrendingUp, ShieldCheck, Users,
  Map, IndianRupee, ArrowUpRight, BarChart3,
  Zap, CheckCircle2, RefreshCw, PlayCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LandProject } from '../../../types/database';
import VideoModal from '../components/VideoModal';
import FAQSection from '../components/FAQSection';
import TestimonialSection from '../components/TestimonialSection';

const Home = () => {
  const [featuredProjects, setFeaturedProjects] = useState<LandProject[]>([]);
  const [hero, setHero] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

  useEffect(() => {
    fetchInitialData();
  }, []);

  const fetchInitialData = async () => {
    try {
      const [projectsRes, heroRes] = await Promise.all([
        supabase.from('land_projects').select('*').eq('is_active', true).eq('is_featured', true).order('featured_order', { ascending: true }).limit(3),
        supabase.from('hero_settings').select('*').limit(1).maybeSingle()
      ]);

      if (projectsRes.error) throw projectsRes.error;
      if (heroRes.error) throw heroRes.error;

      setFeaturedProjects(projectsRes.data || []);
      setHero(heroRes.data);
    } catch (err) {
      console.error('Error fetching home data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white dark:bg-slate-950 gap-4">
         <RefreshCw className="w-12 h-12 text-emerald-500 animate-spin" />
         <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Real Estate Matrix...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-hidden">
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={hero?.video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'}
      />

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center pt-32 pb-20 overflow-hidden bg-white dark:bg-slate-950">
        <div className="absolute inset-0 -z-10 opacity-30 dark:opacity-20 pointer-events-none">
           <img src={hero?.image_url} className="w-full h-full object-cover blur-sm scale-110" />
        </div>
        <div className="absolute top-0 left-0 w-full h-full -z-10">
          <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-emerald-100/50 dark:bg-emerald-900/30 blur-[120px]" />
          <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gold-100/30 dark:bg-gold-900/10 blur-[100px]" />
        </div>

        <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="space-y-10"
          >
            <div className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-xs font-black uppercase tracking-[2px] border border-emerald-100 dark:border-emerald-800 shadow-sm shadow-emerald-600/5">
              <TrendingUp className="w-4 h-4" />
              {hero?.subtitle || "India's #1 Land Investment Platform"}
            </div>
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white leading-[1.15] tracking-tight uppercase py-2">
              {hero?.title || "Invest in Premium Land from ₹500"}
            </h1>
            <p className="text-lg sm:text-xl text-slate-600 dark:text-slate-400 leading-relaxed max-w-lg font-medium italic">
              "{hero?.description || "Democratizing real estate ownership through fractional investment."}"
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to={hero?.cta_link || "/projects"}
                className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 text-sm group"
              >
                {hero?.cta_text || "Start Investing"}
                <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button
                onClick={() => setIsVideoOpen(true)}
                className="px-10 py-5 bg-white dark:bg-slate-900 text-slate-900 dark:text-white border border-slate-200 dark:border-slate-800 rounded-2xl font-black uppercase tracking-widest hover:bg-slate-50 dark:hover:bg-slate-800 transition-all flex items-center justify-center gap-3 text-sm shadow-sm"
              >
                <PlayCircle className="w-5 h-5 text-emerald-600" /> Watch Strategy
              </button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.8, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="relative"
          >
            <div className="relative rounded-[48px] overflow-hidden shadow-2xl border-8 border-white dark:border-slate-800/50 aspect-[4/5] md:aspect-square group">
              <img
                src={hero?.image_url || "https://images.pexels.com/photos/1117452/pexels-photo-1117452.jpeg"}
                alt="Premium Land"
                className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-1000"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-transparent to-transparent" />
              <div className="absolute bottom-10 left-10 right-10 text-white space-y-2">
                <p className="text-gold-400 font-bold uppercase tracking-[4px] text-xs">Primary Focus</p>
                <h3 className="text-3xl font-black">{hero?.title?.split(' ').slice(-3).join(' ')}</h3>
                <p className="text-slate-200 font-medium italic">High-growth corridor assets only.</p>
              </div>
            </div>

            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
              className="absolute -top-6 -right-6 md:right-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-[200px]"
            >
              <IndianRupee className="w-8 h-8 text-emerald-600 mb-2" />
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Starting from</p>
              <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">₹500</p>
            </motion.div>

            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ repeat: Infinity, duration: 5, ease: "easeInOut", delay: 1 }}
              className="absolute -bottom-6 -left-6 md:left-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl p-6 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 max-w-[200px]"
            >
              <ShieldCheck className="w-8 h-8 text-gold-500 mb-2" />
              <p className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest mb-1">Security</p>
              <p className="text-sm font-bold text-slate-900 dark:text-white leading-tight uppercase tracking-tighter">100% Legal Verification</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Featured Projects Section */}
      <section className="py-32 bg-white dark:bg-slate-950">
        <div className="max-container px-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 mb-16">
            <div className="space-y-4">
              <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm">Investment Catalog</h2>
              <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">Active Opportunities</h3>
              <p className="text-lg text-slate-500 dark:text-slate-400 max-w-xl leading-relaxed italic">
                "Curated, high-potential land parcels across strategic growth corridors in India."
              </p>
            </div>
            <Link
              to="/projects"
              className="group flex items-center gap-3 text-emerald-600 font-black uppercase tracking-widest text-sm hover:text-emerald-700 transition-colors"
            >
              View All Projects
              <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <ChevronRight className="w-5 h-5" />
              </div>
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="group cursor-pointer"
              >
                <Link to={`/projects/${project.id}`}>
                  <div className="relative rounded-[40px] overflow-hidden bg-slate-100 dark:bg-slate-900 aspect-[4/5] shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-2">
                    <img
                      src={project.image || 'https://via.placeholder.com/600x800'}
                      alt={project.name}
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-6 left-6 flex gap-2">
                      <div className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-white/20 dark:border-slate-800">
                        {project.category}
                      </div>
                      <div className="px-4 py-2 bg-emerald-600/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-emerald-400/20">
                        {project.funding_progress}% Funded
                      </div>
                    </div>

                    <div className="absolute bottom-8 left-8 right-8 text-white">
                      <div className="flex items-center gap-2 mb-2">
                        <IndianRupee className="w-4 h-4 text-gold-400" />
                        <p className="text-xl font-black tracking-tight">₹{project.min_investment.toLocaleString()}</p>
                        <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Entry</p>
                      </div>
                      <h4 className="text-2xl font-black mb-1 leading-tight tracking-tight">{project.name}</h4>
                      <p className="text-sm font-medium text-slate-300 mb-6 flex items-center gap-1">
                        <Map className="w-4 h-4" /> {project.location}
                      </p>

                      <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                        <div>
                          <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target ROI</p>
                          <p className="text-lg font-black text-emerald-400">{project.expected_roi}% <span className="text-[10px] text-slate-400 uppercase">P.A.</span></p>
                        </div>
                        <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 transition-all">
                          <ArrowUpRight className="w-6 h-6" />
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Sim Section */}
      <section className="py-32 bg-slate-950 text-white relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-0 opacity-20 pointer-events-none">
          <div className="absolute top-0 right-0 w-[800px] h-[800px] rounded-full bg-emerald-600/30 blur-[150px]" />
          <div className="absolute bottom-0 left-0 w-[600px] h-[600px] rounded-full bg-gold-600/10 blur-[120px]" />
        </div>

        <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center relative z-10">
          <div className="space-y-8">
            <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm italic underline underline-offset-8">Simulation Engine</h2>
            <h3 className="text-5xl lg:text-6xl font-black tracking-tighter leading-tight">
              Watch Your <br /><span className="text-emerald-500">Wealth Grow</span>
            </h3>
            <p className="text-lg text-slate-400 leading-relaxed max-w-lg font-medium italic">
              "Unlike stock markets, land is a tangible asset with consistent historical appreciation. Calculate your potential returns below."
            </p>

            <div className="grid grid-cols-2 gap-8 pt-8">
              <div className="space-y-2">
                <BarChart3 className="w-10 h-10 text-emerald-500" />
                <p className="text-3xl font-black">18.5%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Average Annual appreciation</p>
              </div>
              <div className="space-y-2">
                <ShieldCheck className="w-10 h-10 text-gold-500" />
                <p className="text-3xl font-black">100%</p>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Asset Backed security</p>
              </div>
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 p-10 rounded-[48px] shadow-3xl space-y-10">
             <ROICalculator />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <TestimonialSection />

      {/* FAQ Section */}
      <FAQSection />

      {/* Final CTA */}
      <section className="py-24 bg-white dark:bg-slate-950">
        <div className="max-container px-6">
          <div className="bg-emerald-600 rounded-[64px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-3xl">
           <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -mr-32 -mt-32 blur-3xl" />
           <div className="absolute bottom-0 left-0 w-64 h-64 bg-gold-400/20 rounded-full -ml-32 -mb-32 blur-3xl" />

           <div className="relative z-10 space-y-8 max-w-2xl mx-auto">
             <h3 className="text-4xl lg:text-6xl font-black tracking-tight leading-tight uppercase tracking-tighter">Ready to own a piece of <span className="text-emerald-100 italic">Tomorrow?</span></h3>
             <p className="text-xl text-emerald-50 font-medium leading-relaxed italic font-black uppercase tracking-widest opacity-80">
               Join 12,000+ smart investors and start building your real estate portfolio today.
             </p>
             <div className="pt-8">
               <Link
                to="/register"
                className="inline-flex items-center gap-3 px-12 py-6 bg-white text-emerald-700 rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-50 transition-all shadow-2xl"
               >
                 Create Free Account
                 <ChevronRight className="w-5 h-5" />
               </Link>
             </div>
           </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const ROICalculator = () => {
  const [amount, setAmount] = useState(10000);
  const [years, setYears] = useState(3);
  const roi = 18.5; // Average ROI

  const totalValue = amount * Math.pow((1 + roi/100), years);
  const profit = totalValue - amount;

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Investment Amount</p>
          <p className="text-2xl font-black text-emerald-500">₹{amount.toLocaleString()}</p>
        </div>
        <input
          type="range"
          min="500"
          max="1000000"
          step="500"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
        />
        <div className="flex gap-4">
          {[500, 5000, 25000, 100000].map(val => (
            <button
              key={val}
              onClick={() => setAmount(val)}
              className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${amount === val ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              ₹{val >= 1000 ? (val/1000 + 'k') : val}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <p className="text-sm font-black uppercase tracking-widest text-slate-400">Holding Period</p>
          <p className="text-2xl font-black text-gold-500">{years} Years</p>
        </div>
        <div className="flex gap-3">
          {[1, 3, 5, 10].map(yr => (
            <button
              key={yr}
              onClick={() => setYears(yr)}
              className={`flex-1 py-4 rounded-2xl font-black uppercase tracking-widest text-sm transition-all border ${years === yr ? 'bg-gold-600 border-gold-600 text-slate-950 shadow-lg shadow-gold-600/20' : 'bg-slate-800 border-slate-700 text-slate-400'}`}
            >
              {yr}Y
            </button>
          ))}
        </div>
      </div>

      <div className="pt-8 border-t border-slate-800 grid grid-cols-2 gap-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Total Returns</p>
          <p className="text-3xl font-black text-emerald-500">₹{Math.round(profit).toLocaleString()}</p>
        </div>
        <div>
          <p className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">Final Value</p>
          <p className="text-3xl font-black text-white">₹{Math.round(totalValue).toLocaleString()}</p>
        </div>
      </div>
    </div>
  );
};

export default Home;
