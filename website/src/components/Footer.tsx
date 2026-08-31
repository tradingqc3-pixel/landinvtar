import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone, MapPin, RefreshCw, Youtube, Github } from 'lucide-react';
import { useBranding } from '../context/BrandingContext';
import { supabase } from '../lib/supabase';

const iconMap: any = {
  Facebook, Twitter, Instagram, Linkedin, Youtube, Github
};

const Footer = () => {
  const { settings, loading } = useBranding();
  const [socialLinks, setSocialLinks] = useState<any[]>([]);

  useEffect(() => {
    fetchSocialLinks();
  }, []);

  const fetchSocialLinks = async () => {
    const { data } = await supabase.from('footer_settings').select('social_links').limit(1).maybeSingle();
    if (data?.social_links) setSocialLinks(data.social_links);
  };

  return (
    <footer className="bg-slate-950 dark:bg-slate-900 text-white pt-20 pb-10 transition-colors duration-300 border-t dark:border-slate-800">
      <div className="max-container px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        <div className="space-y-6">
          <Link to="/" className="flex items-center gap-2">
            {loading ? (
              <RefreshCw className="animate-spin text-emerald-500" size={20} />
            ) : (
              <img
                src={settings.logo_url || "/logo.png"}
                alt={settings.brand_name}
                className="h-10 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.src = "/logo.png";
                }}
              />
            )}
          </Link>
          <p className="text-slate-400 dark:text-slate-500 leading-relaxed max-w-xs italic">
            "{settings.footer_description}"
          </p>
          <div className="flex gap-4">
            {socialLinks.length > 0 ? socialLinks.map((link, i) => {
              const Icon = iconMap[link.platform] || link.platform.charAt(0);
              return (
                <a
                  key={i}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-all border border-white/5"
                >
                  {typeof Icon === 'string' ? <span className="font-black text-xs">{Icon}</span> : <Icon className="w-5 h-5" />}
                </a>
              );
            }) : (
               [Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-full bg-slate-900 dark:bg-slate-800 flex items-center justify-center hover:bg-emerald-600 transition-colors">
                    <Icon className="w-5 h-5" />
                  </a>
               ))
            )}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[3px] mb-8 text-emerald-500">Quick Links</h4>
          <ul className="space-y-4 text-slate-400 dark:text-slate-500 text-sm font-medium">
            <li><Link to="/projects" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">Browse Projects</Link></li>
            <li><Link to="/how-it-works" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">How it Works</Link></li>
            <li><Link to="/about" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">About Us</Link></li>
            <li><Link to="/contact" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">Contact Support</Link></li>
            <li><Link to="/login" className="hover:text-emerald-400 transition-colors uppercase tracking-widest text-[10px]">Login / Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[3px] mb-8 text-emerald-500">Contact Us</h4>
          <ul className="space-y-6 text-slate-400 dark:text-slate-500">
            <li className="flex items-start gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-emerald-500"><MapPin size={16} /></div>
              <span className="text-xs font-bold leading-relaxed">{settings.corporate_address}</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-emerald-500"><Phone size={16} /></div>
              <span className="text-xs font-bold">{settings.contact_phone}</span>
            </li>
            <li className="flex items-center gap-4">
              <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-emerald-500"><Mail size={16} /></div>
              <span className="text-xs font-bold">{settings.support_email}</span>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-black uppercase tracking-[3px] mb-8 text-emerald-500">Newsletter</h4>
          <p className="text-xs font-medium text-slate-400 dark:text-slate-500 mb-6 italic">"Get the latest high-yield project updates directly in your inbox."</p>
          <form className="space-y-3">
            <input
              type="email"
              placeholder="Enter secure email"
              className="w-full px-6 py-4 bg-slate-900 dark:bg-slate-800 rounded-2xl border border-white/5 focus:outline-none focus:border-emerald-600 text-xs text-white transition-all"
            />
            <button className="w-full py-4 bg-emerald-600 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-600/20">
              Sync My Inbox
            </button>
          </form>
        </div>
      </div>

      <div className="max-container px-6 mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-black uppercase tracking-widest text-slate-500">
        <p>{settings.footer_copyright}</p>
        <div className="flex gap-8">
          <a href="#" className="hover:text-emerald-500 transition-colors">Privacy Protocol</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">Terms of Service</a>
          <a href="#" className="hover:text-emerald-500 transition-colors">Risk Disclosure</a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
