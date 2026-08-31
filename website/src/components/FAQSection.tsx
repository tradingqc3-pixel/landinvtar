import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, RefreshCw, HelpCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

const FAQSection = () => {
  const [faqs, setFaqs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaqs();
  }, []);

  const fetchFaqs = async () => {
    try {
      const { data, error } = await supabase
        .from('faqs')
        .select('*')
        .eq('is_active', true)
        .order('order_index', { ascending: true });

      if (error) throw error;
      setFaqs(data || []);
    } catch (err) {
      console.error('FAQ Error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return null;
  if (faqs.length === 0) return null;

  return (
    <section className="py-32 bg-slate-50 dark:bg-slate-900/30">
      <div className="max-container px-6 max-w-4xl">
        <div className="text-center space-y-4 mb-12">
           <h2 className="text-gold-500 font-black uppercase tracking-[4px] text-sm">Knowledge Base</h2>
           <h3 className="text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight uppercase tracking-[2px]">Common Questions</h3>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <AccordionItem key={faq.id} question={faq.question} answer={faq.answer} />
          ))}
        </div>
      </div>
    </section>
  );
};

const AccordionItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-3xl overflow-hidden transition-all duration-300 shadow-sm">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-8 py-6 flex items-center justify-between text-left group"
      >
        <span className="text-lg font-bold text-slate-800 dark:text-white group-hover:text-emerald-600 transition-colors uppercase tracking-tight">{question}</span>
        <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${isOpen ? 'bg-emerald-600 text-white rotate-45 shadow-lg shadow-emerald-500/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
          <Plus className="w-5 h-5" />
        </div>
      </button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="px-8 pb-8 text-slate-500 dark:text-slate-400 font-medium leading-relaxed border-t border-slate-50 dark:border-slate-800 pt-4 italic">
              "{answer}"
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FAQSection;
