import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquareQuote, RefreshCw } from 'lucide-react';
import { supabase } from '../lib/supabase';

const TestimonialSection = () => {
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    try {
      const { data, error } = await supabase
        .from('testimonials')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error('Testimonial Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (items.length === 0) return null;

  return (
    <section className="py-32 bg-white dark:bg-slate-950">
      <div className="max-container px-6">
        <div className="text-center space-y-6 mb-20">
           <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm">Investor Voices</h2>
           <h3 className="text-4xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">Trusted by Thousands</h3>
           <p className="text-lg text-slate-500 dark:text-slate-400 max-w-2xl mx-auto font-medium italic">
             "Real stories from real land owners who scaled their wealth with InvestLand."
           </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
           {items.map((item, i) => (
             <motion.div
               key={item.id}
               initial={{ opacity: 0, y: 20 }}
               whileInView={{ opacity: 1, y: 0 }}
               transition={{ delay: i * 0.1 }}
               viewport={{ once: true }}
               className="p-10 rounded-[48px] bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 shadow-sm hover:shadow-2xl transition-all duration-500 group"
             >
                <div className="flex items-center gap-4 mb-8">
                   <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-white dark:border-slate-800 shadow-lg">
                      <img src={item.avatar_url || `https://i.pravatar.cc/150?u=${item.id}`} className="w-full h-full object-cover" alt={item.name} />
                   </div>
                   <div>
                      <h4 className="font-black text-slate-900 dark:text-white uppercase tracking-tight">{item.name}</h4>
                      <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">{item.role} @ {item.company}</p>
                   </div>
                </div>

                <div className="relative">
                   <MessageSquareQuote className="absolute -top-4 -left-4 w-12 h-12 text-emerald-500/10" />
                   <p className="text-slate-500 dark:text-slate-400 leading-relaxed font-medium italic relative z-10">
                      "{item.content}"
                   </p>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 dark:border-slate-800 flex gap-1 text-gold-500">
                   {[...Array(item.rating)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                </div>
             </motion.div>
           ))}
        </div>
      </div>
    </section>
  );
};

export default TestimonialSection;
