import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, Heart, ShieldCheck,
  Target, Rocket, Award, RefreshCw
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const About = () => {
  const [loading, setLoading] = useState(true);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchAboutData();
  }, []);

  const fetchAboutData = async () => {
    try {
      const { data, error } = await supabase
        .from('about_us_settings')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('Supabase fetch error:', error);
        throw error;
      }

      if (data) {
        setSettings(data);
      } else {
        // Fallback default row
        setSettings({
          subtitle: 'The Visionaries',
          main_title: 'InvestLand is Democratizing Real Estate.',
          description: 'We believe that the power of land ownership should belong to everyone, not just the billionaire class. Our mission is to make real estate as liquid and accessible as stocks.',
          stat1_label: 'Assets Managed',
          stat1_value: '₹150Cr+',
          stat2_label: 'Total Investors',
          stat2_value: '12,400+',
          stat3_label: 'Verified Area',
          stat3_value: '2,500+ Acres',
          stat4_label: 'Avg. ROI',
          stat4_value: '18.5%'
        });
      }
    } catch (err) {
      console.error('Error fetching about data:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950">
        <RefreshCw className="w-12 h-12 text-emerald-600 animate-spin" />
        <p className="text-slate-400 font-black uppercase tracking-widest text-xs">Syncing Platform Vision...</p>
      </div>
    );
  }

  if (!settings) return null;

  // Split title for stylized highlighting (last 2 words usually)
  const titleParts = settings.main_title.trim().split(' ');
  const highlightCount = 2;
  const mainTitle = titleParts.slice(0, -highlightCount).join(' ');
  const highlightWord = titleParts.slice(-highlightCount).join(' ');

  return (
    <div className="pt-32 pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="px-6 mb-32 max-container">
        <div className="text-center space-y-8">
           <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold-600 font-black uppercase tracking-[4px] text-sm"
           >
             {settings.subtitle}
           </motion.h2>
           <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-8xl font-black text-slate-900 dark:text-white tracking-tighter leading-[0.9]"
           >
             {mainTitle} <br />
             <span className="text-emerald-600 italic text-outline">{highlightWord}</span>
           </motion.h1>
           <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed italic"
           >
             {settings.description}
           </motion.p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-950 dark:bg-slate-900 text-white">
        <div className="max-container px-6 grid grid-cols-2 md:grid-cols-4 gap-12">
          {[
            { label: settings.stat1_label, val: settings.stat1_value },
            { label: settings.stat2_label, val: settings.stat2_value },
            { label: settings.stat3_label, val: settings.stat3_value },
            { label: settings.stat4_label, val: settings.stat4_value }
          ].map((stat, i) => (
            <div key={i} className="text-center space-y-2">
              <p className="text-4xl lg:text-5xl font-black text-emerald-500 tracking-tighter">{stat.val}</p>
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Story Section */}
      <section className="py-32 bg-white dark:bg-slate-950">
         <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="space-y-8">
               <h2 className="text-gold-600 font-black uppercase tracking-[4px] text-sm">Our Genesis</h2>
               <h3 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight italic underline underline-offset-8">Beyond the <br />Concrete Jungle.</h3>
               <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                 InvestLand was born in 2024 with a simple observation: while the value of urban and suburban land in India was skyrocketing, the opportunity to benefit from this growth was restricted to a few high-net-worth individuals.
               </p>
               <div className="space-y-4 pt-4">
                 {[
                   "Built for the modern digital-first investor.",
                   "Removing legal barriers and document complexity.",
                   "Strategic focuses on India's growth corridors.",
                   "Complete transparency through blockchain technology."
                 ].map((text, i) => (
                   <div key={i} className="flex items-center gap-3 text-slate-800 dark:text-slate-300 font-black uppercase tracking-widest text-[10px]">
                     <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                     {text}
                   </div>
                 ))}
               </div>
            </div>

            <div className="relative">
              <div className="rounded-[64px] overflow-hidden shadow-2xl border-4 border-white dark:border-slate-800 aspect-[4/3]">
                 <img src="https://images.unsplash.com/photo-1570129477492-45c003edd2be?q=80&w=1000" className="w-full h-full object-cover" />
              </div>
              <div className="absolute -bottom-10 -right-10 bg-emerald-600 text-white p-10 rounded-[40px] shadow-3xl max-w-xs space-y-4">
                 <Heart className="w-8 h-8 fill-current" />
                 <p className="text-xl font-black leading-tight italic">"We value your trust more than your capital."</p>
                 <p className="text-sm font-bold text-emerald-100 uppercase tracking-widest">— Founders' Promise</p>
              </div>
            </div>
         </div>
      </section>

      {/* Values Section */}
      <section className="py-32 bg-slate-50 dark:bg-slate-900/50">
        <div className="max-container px-6 space-y-20">
           <div className="text-center space-y-4">
              <h2 className="text-gold-600 font-black uppercase tracking-[4px] text-sm">Corporate DNA</h2>
              <h3 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight">Core Values</h3>
           </div>

           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              {[
                { title: "Transparency", icon: ShieldCheck, desc: "Open books, open communication. No hidden charges ever." },
                { title: "Security", icon: Award, desc: "Every investment is protected by top-tier legal audits." },
                { title: "Accessibility", icon: Rocket, desc: "Investing should be for everyone, starting from just ₹500." },
                { title: "Growth", icon: Target, desc: "We focus on long-term value creation and sustainable wealth." }
              ].map((v, i) => (
                <div key={i} className="bg-white dark:bg-slate-900 p-10 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm space-y-6 hover:shadow-xl transition-all duration-300">
                  <div className="w-16 h-16 bg-slate-900 dark:bg-slate-800 rounded-2xl flex items-center justify-center text-emerald-500">
                    <v.icon className="w-8 h-8" />
                  </div>
                  <h4 className="text-2xl font-black text-slate-900 dark:text-white">{v.title}</h4>
                  <p className="text-slate-500 dark:text-slate-400 font-medium italic">"{v.desc}"</p>
                </div>
              ))}
           </div>
        </div>
      </section>
    </div>
  );
};

export default About;
