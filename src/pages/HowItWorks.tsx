import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  UserPlus, Search, IndianRupee, TrendingUp,
  ShieldCheck, FileText, ChevronRight, PlayCircle, CheckCircle2,
  RefreshCw, Rocket, Activity, CreditCard, Shield, Map
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import VideoModal from '../components/VideoModal';

// Icon mapping for dynamic steps
const iconMap: any = {
  UserPlus, Search, IndianRupee, TrendingUp,
  FileText, Rocket, Activity, CreditCard,
  Shield, Map
};

const HowItWorks = () => {
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);
  const [steps, setSteps] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [settingsRes, stepsRes] = await Promise.all([
        supabase.from('app_settings').select('*').limit(1).maybeSingle(),
        supabase.from('how_it_works_steps').select('*').order('order_index', { ascending: true })
      ]);

      if (settingsRes.data) setSettings(settingsRes.data);
      if (stepsRes.data) setSteps(stepsRes.data);
    } catch (err) {
      console.error('Error fetching instructions:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950">
           <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Instructional Buffer...</p>
        </div>
     );
  }

  const heroSettings = {
    title: settings?.how_hero_title || 'Investment Simplified.',
    subtitle: settings?.how_hero_subtitle || 'The Investment Loop',
    description: settings?.how_hero_description || "We've broken down the barriers of traditional real estate. No middlemen, no bulky paperwork, no massive down-payments.",
    image_url: settings?.how_hero_image_url || 'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?q=80&w=1000',
    cta_text: settings?.how_cta_text || 'Get Started Now',
    video_text: settings?.how_video_text || 'Watch Video',
    video_url: settings?.how_video_url || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
  };

  return (
    <div className="pt-32 pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      <VideoModal
        isOpen={isVideoOpen}
        onClose={() => setIsVideoOpen(false)}
        videoUrl={heroSettings.video_url}
      />

      {/* Hero Section */}
      <section className="mb-32 relative">
         <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-emerald-100/30 dark:bg-emerald-900/10 blur-[100px] -z-10" />
         <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
              <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm italic">{heroSettings.subtitle}</h2>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight uppercase">{heroSettings.title}</h1>
              <p className="text-lg sm:text-xl text-slate-500 dark:text-slate-400 leading-relaxed max-w-lg font-medium italic">
                "{heroSettings.description}"
              </p>
              <div className="flex gap-4">
                <Link to="/register" className="px-10 py-5 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-black dark:hover:bg-emerald-700 transition-all shadow-2xl">{heroSettings.cta_text}</Link>
                <button
                  onClick={() => setIsVideoOpen(true)}
                  className="flex items-center gap-2 px-8 py-5 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[10px] hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                >
                  <PlayCircle className="w-5 h-5" /> {heroSettings.video_text}
                </button>
              </div>
            </div>

            <div className="relative">
              <div className="relative rounded-[64px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-square">
                 <img src={heroSettings.image_url} className="w-full h-full object-cover" alt="How It Works" />
                 <div className="absolute inset-0 bg-emerald-600/10 mix-blend-overlay" />
              </div>
              <motion.div
                animate={{ x: [0, 10, 0] }}
                transition={{ repeat: Infinity, duration: 4 }}
                className="absolute -top-10 -left-10 bg-white dark:bg-slate-900 p-8 rounded-3xl shadow-3xl border border-slate-50 dark:border-slate-800 flex items-center gap-6"
              >
                 <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white">
                   <ShieldCheck className="w-8 h-8" />
                 </div>
                 <div>
                   <p className="text-2xl font-black text-slate-900 dark:text-white">100% Secure</p>
                   <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asset-Backed Ledger</p>
                 </div>
              </motion.div>
            </div>
         </div>
      </section>

      {/* Steps Section */}
      <section className="bg-slate-950 dark:bg-slate-900 py-32 text-white overflow-hidden relative">
        <div className="max-container px-6 space-y-24">
           <div className="max-w-3xl space-y-6">
              <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm italic underline underline-offset-8">Step-by-Step Guide</h2>
              <h3 className="text-5xl lg:text-6xl font-black tracking-tight leading-tight uppercase">Your path to <br />becoming a <span className="text-emerald-500 italic">Landowner</span></h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
              <div className="hidden lg:block absolute top-12 left-0 w-full h-0.5 bg-slate-800 dark:bg-slate-700 -z-0" />

              {steps.map((step, i) => {
                const Icon = iconMap[step.icon] || CheckCircle2;
                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.1 }}
                    viewport={{ once: true }}
                    className="space-y-8 relative z-10 group"
                  >
                     <div className="w-24 h-24 rounded-[32px] bg-slate-900 dark:bg-slate-800 border-2 border-slate-800 dark:border-slate-700 text-emerald-500 flex items-center justify-center shadow-2xl group-hover:scale-110 group-hover:border-emerald-500 transition-all duration-500">
                       <Icon className="w-10 h-10" />
                     </div>
                     <div className="space-y-4">
                       <div className="flex items-center gap-4">
                         <span className="text-4xl font-black text-slate-800 dark:text-slate-700">0{i+1}</span>
                         <h4 className="text-2xl font-black uppercase tracking-tight">{step.title}</h4>
                       </div>
                       <p className="text-slate-400 dark:text-slate-500 font-medium leading-relaxed italic text-lg">
                         "{step.description}"
                       </p>
                     </div>
                  </motion.div>
                );
              })}
           </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-32 bg-white dark:bg-slate-950">
         <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="order-2 lg:order-1">
               <div className="bg-slate-50 dark:bg-slate-900 rounded-[48px] p-12 space-y-12 border border-slate-100 dark:border-slate-800 shadow-sm">
                  <div className="flex items-center gap-8">
                     <div className="w-20 h-20 bg-white dark:bg-slate-800 rounded-3xl flex items-center justify-center text-emerald-600 shadow-xl border border-emerald-50 dark:border-emerald-900/30">
                        <FileText className="w-10 h-10" />
                     </div>
                     <div className="space-y-1">
                       <h4 className="text-2xl font-black text-slate-900 dark:text-white leading-tight uppercase">Digital Trust Protocol</h4>
                       <p className="text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Powered by Smart Contracts</p>
                     </div>
                  </div>

                  <div className="space-y-6">
                    <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                      "Every fraction you buy is linked to a legal entity (SPV) that owns the land. Your ownership is digitally recorded on a secure ledger, making it immutable and transparent."
                    </p>
                    <ul className="space-y-4">
                       {[
                         "Automated dividend distributions",
                         "Secondary marketplace for liquidity",
                         "Instant digital ownership certificates",
                         "Transparent tax reporting"
                       ].map((item, i) => (
                         <li key={i} className="flex items-center gap-3 text-slate-900 dark:text-white font-black uppercase tracking-widest text-[9px]">
                           <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                           {item}
                         </li>
                       ))}
                    </ul>
                  </div>
               </div>
            </div>

            <div className="space-y-8 order-1 lg:order-2">
               <h2 className="text-gold-600 font-black uppercase tracking-[4px] text-sm">Under the hood</h2>
               <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight uppercase">Advanced <br />Security for <br /><span className="text-emerald-600 italic">Peace of Mind.</span></h3>
               <p className="text-xl text-slate-500 dark:text-slate-400 font-medium max-w-md italic">
                 "We've integrated top-tier banking infrastructure and legal audit systems to ensure your capital is always safe."
               </p>
               <div className="pt-4">
                 <Link to="/about" className="group inline-flex items-center gap-3 font-black uppercase tracking-widest text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 transition-colors">
                    Learn about our legal structure
                    <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                      <ChevronRight className="w-5 h-5" />
                    </div>
                 </Link>
               </div>
            </div>
         </div>
      </section>

      {/* CTA section */}
      <section className="py-20">
        <div className="max-container px-6">
          <div className="max-w-7xl mx-auto bg-slate-900 dark:bg-slate-900/50 rounded-[64px] p-16 text-center text-white relative overflow-hidden border dark:border-slate-800 shadow-3xl">
           <div className="absolute top-0 left-0 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-5" />
           <div className="relative z-10 space-y-8">
             <h3 className="text-4xl lg:text-5xl font-black tracking-tight leading-tight italic uppercase">Still have questions?</h3>
             <p className="text-lg text-slate-400 max-w-xl mx-auto font-medium italic opacity-80">
               "Our investment specialists are here to guide you through your first fractional land purchase."
             </p>
             <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
                <Link to="/contact" className="px-10 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">Talk to Specialist</Link>
                <Link to="/projects" className="px-10 py-5 bg-white dark:bg-slate-800 text-slate-900 dark:text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 dark:hover:bg-slate-700 transition-all shadow-sm">Browse Opportunities</Link>
             </div>
           </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default HowItWorks;
