import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck, RefreshCw, X, AlertCircle, Layout, Play, Zap, ChevronRight, Activity, Image as ImageIcon, Video
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import ReactPlayer from 'react-player';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface HowItWorksStep {
  id: string;
  step_number: number;
  title: string;
  description: string;
  image_url: string | null;
  video_url: string | null;
  display_order: number;
}

const HowItWorks = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [steps, setSteps] = useState<HowItWorksStep[]>([]);
  const [activeVideo, setActiveVideo] = useState<{ url: string } | null>(null);
  const [activeImage, setActiveImage] = useState<string | null>(null);

  useEffect(() => {
    fetchSteps();
  }, []);

  const fetchSteps = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('how_it_works')
        .select('*')
        .order('display_order', { ascending: true });

      if (fetchError) throw fetchError;
      setSteps(data || []);
    } catch (err: any) {
      console.error('How It Works error:', err);
      setError(err.message || 'Synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
     return (
        <div className="pt-32 flex flex-col items-center justify-center min-h-[80vh] gap-6 bg-white dark:bg-slate-950">
           <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
           <p className="text-slate-400 font-black uppercase tracking-widest text-[10px]">Syncing Instructional Ledger...</p>
        </div>
     );
  }

  if (error) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[80vh] bg-white dark:bg-slate-950 px-6">
        <div className="max-w-md w-full bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-10 rounded-[48px] text-center space-y-6">
           <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-3xl flex items-center justify-center mx-auto text-rose-500 shadow-xl">
              <AlertCircle size={40} />
           </div>
           <div className="space-y-2">
              <h3 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-tight">Synchronization Error</h3>
              <p className="text-slate-500 text-sm font-medium italic">"{error}"</p>
           </div>
           <button
             onClick={fetchSteps}
             className="px-10 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
           >
             Retry Handshake
           </button>
        </div>
      </div>
    );
  }

  if (steps.length === 0) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[80vh] bg-white dark:bg-slate-950 px-6 text-center">
        <div className="max-w-2xl w-full space-y-10">
           <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-900/20 rounded-[32px] flex items-center justify-center mx-auto text-emerald-500 shadow-inner">
              <Layout size={48} />
           </div>
           <div className="space-y-4">
              <h3 className="text-3xl lg:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">Content coming soon</h3>
              <p className="text-slate-500 dark:text-slate-400 text-lg font-medium italic leading-relaxed">
                We're currently updating our investment guide. Please check back shortly or visit our dashboard to get started immediately.
              </p>
           </div>
           <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/register"
                className="w-full sm:w-auto px-12 py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-2xl"
              >
                Get Started
              </Link>
           </div>
        </div>
      </div>
    );
  }

  const Player = ReactPlayer as any;

  return (
    <div className="bg-white dark:bg-slate-950 transition-colors duration-300 min-h-screen pt-32 pb-20">

      {/* Video Overlay Modal */}
      <AnimatePresence>
        {activeVideo && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveVideo(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-6xl aspect-video bg-black rounded-[48px] overflow-hidden shadow-[0_0_100px_rgba(0,0,0,0.5)] border border-white/10 z-10"
            >
              <button
                onClick={() => setActiveVideo(null)}
                className="absolute top-6 right-6 z-20 p-4 bg-white/10 hover:bg-rose-600 backdrop-blur-md rounded-full text-white transition-all shadow-xl group"
              >
                <X className="w-6 h-6 group-hover:rotate-90 transition-transform duration-300" />
              </button>

              <div className="w-full h-full">
                <Player
                  url={activeVideo.url}
                  width="100%"
                  height="100%"
                  playing={true}
                  controls={true}
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Image Lightbox Modal */}
      <AnimatePresence>
        {activeImage && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveImage(null)}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-xl cursor-pointer"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 40 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 40 }}
              className="relative w-full max-w-6xl z-10 flex items-center justify-center"
            >
              <button
                onClick={() => setActiveImage(null)}
                className="absolute top-[-50px] right-0 md:top-[-60px] p-4 text-white hover:text-rose-500 transition-colors bg-white/10 backdrop-blur-md rounded-full"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="bg-slate-900 rounded-[32px] overflow-hidden shadow-2xl border border-white/10 max-h-[85vh] w-auto">
                <img
                  src={activeImage}
                  className="w-full h-full object-contain max-h-[85vh]"
                  alt="Full view"
                />
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <div className="max-container px-6">
        <div className="max-w-4xl mx-auto text-center space-y-8 mb-24">
           <div className="inline-flex items-center gap-3 px-6 py-2.5 bg-emerald-500/10 text-emerald-500 rounded-full text-[10px] md:text-[11px] font-black uppercase tracking-[4px] border border-emerald-500/20 shadow-sm">
              <Zap size={14} className="fill-current" />
              Process Blueprint
           </div>
           <h1 className="text-5xl md:text-7xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
              How InvestLand <span className="text-emerald-600">Works</span>
           </h1>
           <p className="text-xl text-slate-500 dark:text-slate-400 font-medium italic max-w-2xl mx-auto">
              "Discover land opportunities, review project details, and manage your investment from one place."
           </p>
        </div>

        <div className="space-y-12">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-16 border border-slate-100 dark:border-slate-800 shadow-xl group hover:border-emerald-500/30 transition-all"
            >
              <div className="flex flex-col lg:flex-row gap-16 items-center">
                 <div className="flex-1 space-y-8">
                    <div className="flex items-center gap-6">
                       <div className="w-16 h-16 rounded-2xl bg-emerald-600 text-white flex items-center justify-center text-3xl font-black shadow-lg shadow-emerald-600/20">
                          {step.step_number}
                       </div>
                       <h2 className="text-3xl md:text-4xl font-black text-slate-900 dark:text-white uppercase tracking-tight">
                          {step.title}
                       </h2>
                    </div>
                    <p className="text-lg text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic">
                       "{step.description}"
                    </p>

                    <div className="flex flex-wrap gap-4 pt-4">
                       {step.video_url && (
                          <button
                            onClick={() => setActiveVideo({ url: step.video_url || '' })}
                            className="flex items-center gap-3 px-8 h-[48px] bg-emerald-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-600/20 active:scale-95"
                          >
                            <Video size={18} fill="currentColor" /> Watch Video
                          </button>
                       )}
                       {step.image_url && (
                          <button
                            onClick={() => setActiveImage(step.image_url)}
                            className="flex items-center gap-3 px-8 h-[48px] bg-transparent text-emerald-600 border-2 border-emerald-600 rounded-xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-50 dark:hover:bg-emerald-900/10 transition-all active:scale-95"
                          >
                            <ImageIcon size={18} /> View Image
                          </button>
                       )}
                    </div>
                 </div>

                 {step.image_url && (
                    <div className="w-full lg:w-1/3 aspect-square rounded-[40px] overflow-hidden border-8 border-slate-50 dark:border-slate-800 shadow-2xl relative">
                       <img
                         src={step.image_url}
                         className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                         alt={step.title}
                       />
                       <div className="absolute inset-0 bg-emerald-600/5 mix-blend-overlay" />
                    </div>
                 )}
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Trust Markers Section */}
      <section className="py-24 mt-24 bg-slate-900 text-white">
         <div className="max-container px-6 grid grid-cols-2 md:grid-cols-4 gap-12 text-center">
            <div className="space-y-2">
               <ShieldCheck className="w-10 h-10 text-emerald-500 mx-auto" />
               <p className="text-2xl font-black">100%</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Legal Verification</p>
            </div>
            <div className="space-y-2">
               <Activity className="w-10 h-10 text-emerald-500 mx-auto" />
               <p className="text-2xl font-black">18.5%</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Avg. Annual ROI</p>
            </div>
            <div className="space-y-2">
               <Zap className="w-10 h-10 text-emerald-500 mx-auto" />
               <p className="text-2xl font-black">₹500</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Min. Entry</p>
            </div>
            <div className="space-y-2">
               <Layout className="w-10 h-10 text-emerald-500 mx-auto" />
               <p className="text-2xl font-black">24/7</p>
               <p className="text-[10px] font-black uppercase tracking-widest text-slate-500">Asset Tracking</p>
            </div>
         </div>
      </section>
    </div>
  );
};

export default HowItWorks;
