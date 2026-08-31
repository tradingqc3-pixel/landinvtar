import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Mail, Phone, MapPin, Send, MessageCircle,
  HelpCircle, ShieldCheck, CheckCircle2, RefreshCw,
  AlertCircle
} from 'lucide-react';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [settings, setSettings] = useState({
    contact_title: 'Connect with Us',
    contact_description: 'Every great investment begins with a single conversation.',
    contact_phone: '+91 98765 43210',
    whatsapp_number: '+91 98765 43210',
    support_email: 'hello@investland.app',
    corporate_address: 'BKC, Mumbai, Maharashtra',
    contact_success_message: 'Our investment specialists have been notified. We will reach out to you within the next 2 hours.',
    response_time: 'Response time: < 120 minutes'
  });

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    subject: 'General Inquiry',
    message: ''
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings')
        .select('contact_title, contact_description, contact_phone, whatsapp_number, support_email, corporate_address, contact_success_message, response_time')
        .limit(1)
        .maybeSingle();

      if (error) throw error;

      if (data) {
        setSettings({
          contact_title: data.contact_title || settings.contact_title,
          contact_description: data.contact_description || settings.contact_description,
          contact_phone: data.contact_phone || settings.contact_phone,
          whatsapp_number: data.whatsapp_number || settings.whatsapp_number,
          support_email: data.support_email || settings.support_email,
          corporate_address: data.corporate_address || settings.corporate_address,
          contact_success_message: data.contact_success_message || settings.contact_success_message,
          response_time: data.response_time || settings.response_time
        });
      }
    } catch (err) {
      console.error('Error fetching contact settings:', err);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const { error: submitError } = await supabase
        .from('contact_messages')
        .insert([{
          full_name: formState.name,
          email: formState.email,
          subject: formState.subject,
          message: formState.message
        }]);

      if (submitError) {
        throw new Error(submitError.message);
      }

      setSubmitted(true);
      setFormState({ name: '', email: '', subject: 'General Inquiry', message: '' });
    } catch (err: any) {
      console.error('Submit error:', err);
      setError(err.message || 'Transmission failure. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Split title for stylized highlighting (e.g., last word emerald)
  const titleParts = settings.contact_title.trim().split(' ');
  const highlightWord = titleParts.length > 0 ? titleParts.pop() : '';
  const mainTitle = titleParts.join(' ');

  return (
    <div className="pt-32 pb-32 overflow-hidden bg-white dark:bg-slate-950 transition-colors duration-300">
      {/* Hero Section */}
      <section className="mb-32">
        <div className="max-container px-6 text-center space-y-8">
           <motion.h2
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-gold-600 font-black uppercase tracking-[4px] text-sm"
           >
             Direct Channel
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
             {settings.contact_description}
           </motion.p>
        </div>
      </section>

      <section className="py-20 bg-white dark:bg-slate-950">
        <div className="max-container px-6 grid grid-cols-1 lg:grid-cols-12 gap-16 items-start">
         {/* Contact Info */}
         <div className="lg:col-span-4 space-y-12 lg:sticky lg:top-32">
            <div className="space-y-8">
               <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight">Connect with Us</h3>
               <p className="text-slate-500 dark:text-slate-400 font-medium italic">"Every great investment begins with a single conversation."</p>
            </div>

            <div className="space-y-6">
               {[
                 { icon: Phone, label: "Direct Line", val: settings.contact_phone, color: "text-emerald-600" },
                 { icon: Mail, label: "Official Email", val: settings.support_email, color: "text-blue-600 dark:text-blue-400" },
                 { icon: MessageCircle, label: "WhatsApp Support", val: settings.whatsapp_number, color: "text-[#25D366]" },
                 { icon: MapPin, label: "Corporate Address", val: settings.corporate_address, color: "text-red-500" }
               ].map((item, i) => (
                 <div key={i} className="flex items-center gap-6 p-6 rounded-3xl bg-slate-50 dark:bg-slate-900 border border-slate-100 dark:border-slate-800 hover:bg-white dark:hover:bg-slate-800 hover:shadow-xl transition-all duration-300">
                    <div className={`w-12 h-12 rounded-xl bg-white dark:bg-slate-800 flex items-center justify-center ${item.color} shadow-sm`}>
                       <item.icon className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{item.label}</p>
                      <p className="text-lg font-black text-slate-900 dark:text-white">{item.val}</p>
                    </div>
                 </div>
               ))}
            </div>

            <div className="p-8 bg-emerald-900 rounded-[40px] text-white space-y-4 shadow-2xl relative overflow-hidden">
               <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-12 -mt-12 blur-2xl" />
               <ShieldCheck className="w-10 h-10 text-emerald-400" />
               <p className="text-lg font-black italic">"Compliant, Secure, and Regulated."</p>
               <p className="text-xs font-bold text-emerald-300 uppercase tracking-widest">ISO 27001 Certified Platform</p>
            </div>
         </div>

         {/* Contact Form */}
         <div className="lg:col-span-8">
            <div className="bg-white dark:bg-slate-900 p-12 rounded-[64px] border border-slate-100 dark:border-slate-800 shadow-2xl space-y-12">
               {submitted ? (
                 <motion.div
                   initial={{ opacity: 0, scale: 0.9 }}
                   animate={{ opacity: 1, scale: 1 }}
                   className="py-20 text-center space-y-6"
                 >
                   <div className="w-24 h-24 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="w-12 h-12" />
                   </div>
                   <h4 className="text-4xl font-black text-slate-900 dark:text-white">Message Received</h4>
                   <p className="text-lg text-slate-500 dark:text-slate-400 max-w-sm mx-auto font-medium italic">
                     {settings.contact_success_message}
                   </p>
                   <button
                    onClick={() => setSubmitted(false)}
                    className="text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest text-xs"
                   >
                     Send another message
                   </button>
                 </motion.div>
                ) : (
                 <form onSubmit={handleSubmit} className="space-y-8">
                    {error && (
                      <div className="p-4 bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 rounded-2xl flex items-center gap-3 text-rose-600 text-xs font-bold animate-in slide-in-from-top-2">
                        <AlertCircle size={16} />
                        {error}
                      </div>
                    )}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">Full Name</label>
                          <input
                            required
                            type="text"
                            placeholder="John Doe"
                            value={formState.name}
                            onChange={(e) => setFormState({...formState, name: e.target.value})}
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                          />
                       </div>
                       <div className="space-y-3">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">Email Address</label>
                          <input
                            required
                            type="email"
                            placeholder="john@example.com"
                            value={formState.email}
                            onChange={(e) => setFormState({...formState, email: e.target.value})}
                            className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-bold transition-all text-slate-900 dark:text-white"
                          />
                       </div>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">Subject</label>
                       <select
                        value={formState.subject}
                        onChange={(e) => setFormState({...formState, subject: e.target.value})}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-black text-sm appearance-none cursor-pointer text-slate-900 dark:text-white"
                       >
                          <option>General Inquiry</option>
                          <option>Asset Verification</option>
                          <option>Technical Support</option>
                          <option>Large Capital Investment</option>
                          <option>Partnership Proposal</option>
                       </select>
                    </div>

                    <div className="space-y-3">
                       <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 ml-4">Detailed Message</label>
                       <textarea
                        required
                        rows={6}
                        placeholder="How can our investment desk help you today?"
                        value={formState.message}
                        onChange={(e) => setFormState({...formState, message: e.target.value})}
                        className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-[28px] focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all text-slate-900 dark:text-white"
                       ></textarea>
                    </div>

                    <div className="pt-4 flex flex-col md:flex-row items-center justify-between gap-8">
                       <div className="flex items-center gap-4 text-slate-400 dark:text-slate-500">
                          <HelpCircle className="w-5 h-5" />
                          <p className="text-xs font-bold italic">{settings.response_time}</p>
                       </div>
                       <button
                        type="submit"
                        disabled={loading}
                        className="w-full md:w-auto px-12 py-6 bg-emerald-600 text-white rounded-[28px] font-black uppercase tracking-widest text-sm hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-600/30 flex items-center justify-center gap-3 group disabled:opacity-50"
                       >
                         {loading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <>Transmit Message <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                       </button>
                    </div>
                 </form>
               )}
            </div>
         </div>
        </div>
      </section>
    </div>
  );
};

export default Contact;
