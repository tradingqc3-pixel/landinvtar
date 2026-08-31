import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Map,
  FileCheck,
  Wallet,
  CreditCard,
  ArrowDownCircle,
  Settings,
  Bell,
  BarChart3,
  LifeBuoy,
  Globe,
  Image,
  Star,
  ImagePlus,
  Rss,
  MessageSquare,
  MessageSquareQuote,
  HelpCircle,
  Play,
  Mail,
  UserPlus,
  Search,
  UploadCloud,
  Menu,
  Layout,
  LineChart,
  Share2,
  Activity
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../context/AuthContext';

const menuGroups = [
  {
    title: 'Core',
    items: [
      { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
      { icon: Users, label: 'Users', path: '/users' },
      { icon: FileCheck, label: 'KYC Verification', path: '/kyc' },
      { icon: Map, label: 'Land Projects', path: '/projects' },
      { icon: Wallet, label: 'Investments', path: '/investments' },
      { icon: CreditCard, label: 'Payments', path: '/payments' },
      { icon: ArrowDownCircle, label: 'Withdrawals', path: '/withdrawals' },
    ]
  },
  {
    title: 'Website Management',
    items: [
      { icon: Globe, label: 'Website CMS', path: '/website/cms' },
      { icon: Image, label: 'Hero Banner', path: '/website/hero' },
      { icon: Star, label: 'Featured Projects', path: '/website/featured' },
      { icon: ImagePlus, label: 'Project Gallery', path: '/website/gallery' },
      { icon: Rss, label: 'Blog / News', path: '/website/blog' },
      { icon: MessageSquareQuote, label: 'Testimonials', path: '/website/testimonials' },
      { icon: HelpCircle, label: 'FAQ Manager', path: '/website/faq' },
      { icon: Play, label: 'How It Works', path: '/website/how-it-works' },
      { icon: Users, label: 'About Us CMS', path: '/website/about-us' },
      { icon: Mail, label: 'Contact Settings', path: '/website/contact' },
      { icon: MessageSquare, label: 'Contact Messages', path: '/website/messages' },
      { icon: UserPlus, label: 'Newsletter Subscribers', path: '/website/subscribers' },
      { icon: Search, label: 'SEO Settings', path: '/website/seo' },
      { icon: UploadCloud, label: 'Logo & Favicon', path: '/website/branding' },
      { icon: Menu, label: 'Navigation Menu', path: '/website/navigation' },
      { icon: Layout, label: 'Footer Manager', path: '/website/footer' },
      { icon: LineChart, label: 'Website Analytics', path: '/website/analytics' },
      { icon: Share2, label: 'Social Media Links', path: '/website/social' },
    ]
  },
  {
    title: 'System',
    items: [
      { icon: Bell, label: 'Notifications Manager', path: '/notifications' },
      { icon: BarChart3, label: 'Reports', path: '/reports' },
      { icon: LifeBuoy, label: 'Customer Support', path: '/support' },
      { icon: Activity, label: 'Activity Logs', path: '/logs' },
      { icon: Settings, label: 'Settings', path: '/settings' },
    ]
  }
];

const Sidebar = () => {
  const { user } = useAuth();

  return (
    <aside className="w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col h-full transition-colors duration-300">
      <div className="p-6">
        <h1 className="text-2xl font-bold text-emerald-600 dark:text-emerald-500 flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg overflow-hidden flex items-center justify-center bg-emerald-600 shadow-lg shadow-emerald-500/20">
            <img src="/logo.png" alt="IL" className="w-full h-full object-cover" />
          </div>
          InvestLand
        </h1>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[2px] mt-1 italic">Admin Control Center</p>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-8 overflow-y-auto scrollbar-hide">
        {menuGroups.map((group) => (
          <div key={group.title} className="space-y-2">
            <h2 className="px-3 text-[10px] font-black text-slate-400 dark:text-slate-500 uppercase tracking-[3px]">
              {group.title}
            </h2>
            <div className="space-y-1">
              {group.items.map((item) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => clsx(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
                    isActive
                      ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 translate-x-1"
                      : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-emerald-600 dark:hover:text-emerald-400"
                  )}
                >
                  <item.icon size={18} />
                  {group.title === 'Website Management' ? item.label.replace(' Manager', '') : item.label}
                </NavLink>
              ))}
            </div>
          </div>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-200 dark:border-slate-800">
        <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 flex items-center gap-3 border border-slate-100 dark:border-slate-800">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black text-lg shadow-inner">
            {user?.email?.charAt(0).toUpperCase() || 'A'}
          </div>
          <div className="flex-1 overflow-hidden">
            <p className="text-sm font-black dark:text-white truncate">Super Admin</p>
            <p className="text-[10px] text-slate-500 font-bold truncate tracking-widest">{user?.email}</p>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
