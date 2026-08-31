import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Menu, X, ChevronRight, Sun, Moon, User, LogOut, Settings, Wallet, Briefcase, History, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { useTheme } from '../context/ThemeContext';
import { useAuth } from '../context/AuthContext';
import { useBranding } from '../context/BrandingContext';
import { supabase } from '../lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [navItems, setNavItems] = useState<any[]>([]);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const { user, profile, signOut } = useAuth();
  const { settings } = useBranding();
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    fetchNavItems();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const fetchNavItems = async () => {
    const { data } = await supabase
      .from('navigation_menu')
      .select('*')
      .eq('is_visible', true)
      .order('order_index', { ascending: true });

    if (data && data.length > 0) {
      setNavItems(data);
    } else {
      // Default fallback
      setNavItems([
        { label: 'Home', link: '/' },
        { label: 'Projects', link: '/projects' },
        { label: 'How It Works', link: '/how-it-works' },
        { label: 'About Us', link: '/about' }
      ]);
    }
  };

  useEffect(() => {
    setIsOpen(false);
    setIsProfileOpen(false);
  }, [location]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const dynamicLinks = user ? [
    ...navItems.filter(i => !['How It Works', 'About Us'].includes(i.label)),
    { label: 'Portfolio', link: '/portfolio' },
    { label: 'Wallet', link: '/wallet' }
  ] : navItems;

  const userInitial = profile?.name?.charAt(0) || user?.email?.charAt(0) || 'A';

  return (
    <nav
      className={cn(
        'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
        isScrolled
          ? 'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm py-3'
          : 'bg-transparent py-4'
      )}
    >
      <div className="max-container px-6 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <img
            src={settings.logo_url || "/logo.png"}
            alt="InvestLand"
            className="h-10 w-auto object-contain"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
        </Link>

        {/* Desktop Nav */}
        <div className="hidden md:flex items-center gap-8">
          {dynamicLinks.map((link) => (
            <Link
              key={link.label}
              to={link.link}
              className={cn(
                'text-[10px] font-black uppercase tracking-widest transition-colors hover:text-emerald-600',
                location.pathname === link.link
                  ? 'text-emerald-600'
                  : 'text-slate-600 dark:text-slate-300'
              )}
            >
              {link.label}
            </Link>
          ))}

          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>

          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 p-1 rounded-full border border-slate-200 dark:border-slate-800 hover:border-emerald-500 transition-all"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden flex items-center justify-center bg-slate-100 dark:bg-slate-800">
                  {profile?.avatar_url ? (
                    <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-xs font-black text-emerald-500 uppercase">{userInitial}</span>
                  )}
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-slate-200 pr-2">
                  {profile?.name?.split(' ')[0] || 'Investor'}
                </span>
              </button>

              <AnimatePresence>
                {isProfileOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className="absolute right-0 mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 overflow-hidden"
                  >
                    <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-sm font-black text-slate-900 dark:text-white truncate">{profile?.name || user.email}</p>
                      <p className="text-xs text-slate-500 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <DropdownLink to="/profile" icon={User} label="My Profile" />
                      <DropdownLink to="/profile?tab=kyc" icon={ShieldCheck} label="KYC Verification" />
                      <DropdownLink to="/portfolio" icon={Briefcase} label="Investment History" />
                      <DropdownLink to="/wallet" icon={Wallet} label="Wallet" />
                      <DropdownLink to="/settings" icon={Settings} label="Settings" />
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 transition-colors"
                      >
                        <LogOut size={16} />
                        Logout
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ) : (
            <Link
              to="/login"
              className="px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest rounded-full hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all shadow-xl shadow-slate-900/10 flex items-center gap-2 group"
            >
              Sign In
              <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          )}
        </div>

        {/* Mobile Nav Toggle */}
        <div className="flex items-center gap-4 md:hidden">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-300"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <button
            className="p-2 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 overflow-hidden"
          >
            <div className="flex flex-col p-6 gap-4">
              {dynamicLinks.map((link) => (
                <Link
                  key={link.label}
                  to={link.link}
                  className={cn(
                    'text-sm font-black uppercase tracking-widest transition-colors',
                    location.pathname === link.link
                      ? 'text-emerald-600'
                      : 'text-slate-600 dark:text-slate-300'
                  )}
                >
                  {link.label}
                </Link>
              ))}

              {user ? (
                <>
                  <div className="h-px bg-slate-100 dark:border-slate-800 my-2" />
                  <Link to="/profile" className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-slate-600 dark:text-slate-300">
                    <User size={20} /> My Profile
                  </Link>
                  <button
                    onClick={handleSignOut}
                    className="flex items-center gap-3 text-sm font-black uppercase tracking-widest text-rose-600"
                  >
                    <LogOut size={20} /> Logout
                  </button>
                </>
              ) : (
                <Link
                  to="/login"
                  className="mt-4 px-6 py-4 bg-emerald-600 text-white text-center font-black uppercase tracking-widest text-[10px] rounded-2xl shadow-lg shadow-emerald-600/20"
                >
                  Get Started
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const DropdownLink = ({ to, icon: Icon, label }: { to: string; icon: any; label: string }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-2.5 text-xs font-black uppercase tracking-widest text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
  >
    <Icon size={16} />
    {label}
  </Link>
);

export default Navbar;
