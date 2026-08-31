import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import Layout from './components/Layout';
import ErrorBoundary from './components/ErrorBoundary';
import AdminDashboard from './pages/AdminDashboard';
import Users from './pages/Users';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import EditProject from './pages/EditProject';
import KYC from './pages/KYC';
import InvestmentRecords from './pages/InvestmentRecords';
import Payments from './pages/Payments';
import Withdrawals from './pages/Withdrawals';
import Notifications from './pages/Notifications';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Logs from './pages/Logs';
import CustomerSupport from './pages/CustomerSupport';
import Login from './pages/Login';

// Website Management Pages
import WebsiteCMS from './pages/website/WebsiteCMS';
import HeroBanner from './pages/website/HeroBanner';
import FeaturedProjects from './pages/website/FeaturedProjects';
import FAQManager from './pages/website/FAQManager';
import BlogManager from './pages/website/BlogManager';
import TestimonialsManager from './pages/website/TestimonialsManager';
import ProjectGallery from './pages/website/ProjectGallery';
import ContactMessages from './pages/website/ContactMessages';
import HowItWorksManager from './pages/website/HowItWorksManager';
import AboutUsCMS from './pages/website/AboutUsCMS';
import Subscribers from './pages/website/Subscribers';
import SEOSettings from './pages/website/SEOSettings';
import BrandingManager from './pages/website/BrandingManager';
import NavigationManager from './pages/website/NavigationManager';
import FooterManager from './pages/website/FooterManager';
import ContactSettings from './pages/website/ContactSettings';
import AnalyticsManager from './pages/website/AnalyticsManager';
import SocialLinksManager from './pages/website/SocialLinksManager';

const LoadingScreen = () => (
  <div className="h-screen w-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="w-20 h-20 border-4 border-emerald-500/20 rounded-full"></div>
        <div className="absolute top-0 left-0 w-20 h-20 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
        <div className="absolute inset-0 flex items-center justify-center">
          <img src="/logo.png" alt="IL" className="w-8 h-8 opacity-50" />
        </div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-slate-900 dark:text-white font-black uppercase tracking-[4px] text-xs">InvestLand Admin</p>
        <p className="text-slate-400 dark:text-slate-500 font-bold text-[10px] uppercase tracking-widest animate-pulse">Initializing Terminal...</p>
      </div>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const { session, role, loading } = useAuth();

  if (loading) return <LoadingScreen />;

  const isAdmin = role === 'admin' || role === 'super_admin';

  if (!session || !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  return <Layout />;
};

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ThemeProvider>
          <Router>
            <Routes>
              <Route path="/login" element={<Login />} />

              <Route element={<ProtectedRoute />}>
                <Route index element={<Navigate to="/dashboard" replace />} />
                <Route path="dashboard" element={<AdminDashboard />} />
                <Route path="users" element={<Users />} />
                <Route path="projects" element={<Projects />} />
                <Route path="projects/new" element={<EditProject />} />
                <Route path="projects/:id" element={<ProjectDetails />} />
                <Route path="projects/:id/edit" element={<EditProject />} />
                <Route path="kyc" element={<KYC />} />
                <Route path="investments" element={<InvestmentRecords />} />
                <Route path="payments" element={<Payments />} />
                <Route path="withdrawals" element={<Withdrawals />} />
                <Route path="notifications" element={<Notifications />} />
                <Route path="reports" element={<Reports />} />
                <Route path="settings" element={<Settings />} />
                <Route path="logs" element={<Logs />} />
                <Route path="support" element={<CustomerSupport />} />

                {/* Website Management Routes */}
                <Route path="website/cms" element={<WebsiteCMS />} />
                <Route path="website/hero" element={<HeroBanner />} />
                <Route path="website/featured" element={<FeaturedProjects />} />
                <Route path="website/faq" element={<FAQManager />} />
                <Route path="website/blog" element={<BlogManager />} />
                <Route path="website/testimonials" element={<TestimonialsManager />} />
                <Route path="website/gallery" element={<ProjectGallery />} />
                <Route path="website/messages" element={<ContactMessages />} />
                <Route path="website/how-it-works" element={<HowItWorksManager />} />
                <Route path="website/about-us" element={<AboutUsCMS />} />
                <Route path="website/subscribers" element={<Subscribers />} />
                <Route path="website/seo" element={<SEOSettings />} />
                <Route path="website/branding" element={<BrandingManager />} />
                <Route path="website/contact" element={<ContactSettings />} />
                <Route path="website/navigation" element={<NavigationManager />} />
                <Route path="website/footer" element={<FooterManager />} />
                <Route path="website/analytics" element={<AnalyticsManager />} />
                <Route path="website/social" element={<SocialLinksManager />} />
              </Route>

              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </Router>
        </ThemeProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
