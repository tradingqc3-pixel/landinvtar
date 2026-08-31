import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Home from './pages/Home';
import Projects from './pages/Projects';
import ProjectDetails from './pages/ProjectDetails';
import HowItWorks from './pages/HowItWorks';
import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import Invest from './pages/Invest';
import Portfolio from './pages/Portfolio';
import Wallet from './pages/Wallet';
import Withdraw from './pages/Withdraw';
import Profile from './pages/Profile';
import Settings from './pages/Settings';
import WhatsAppButton from './components/WhatsAppButton';
import { useAuth } from './context/AuthContext';
import { useBranding } from './context/BrandingContext';
import { motion } from 'framer-motion';

function App() {
  const { user, loading: authLoading } = useAuth();
  const { settings, loading: brandingLoading } = useBranding();

  if (authLoading || brandingLoading) {
    return (
      <div className="min-h-screen bg-[#020B1F] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="w-24 h-24 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/20"
        >
          <img
            src={settings.logo_url || "/logo.png"}
            alt="InvestLand Loading"
            className="w-full h-full object-cover"
            onError={(e) => {
              e.currentTarget.src = "/logo.png";
            }}
          />
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-slate-950 text-slate-900 dark:text-white transition-colors duration-300 selection:bg-emerald-100 dark:selection:bg-emerald-900 selection:text-emerald-900 dark:selection:text-emerald-100">
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/:id" element={<ProjectDetails />} />
          <Route path="/how-it-works" element={<HowItWorks />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={user ? <Navigate to="/" /> : <Login />} />
          <Route path="/register" element={user ? <Navigate to="/" /> : <Register />} />

          {/* Protected Routes */}
          <Route path="/invest/:id" element={user ? <Invest /> : <Navigate to="/login" />} />
          <Route path="/portfolio" element={user ? <Portfolio /> : <Navigate to="/login" />} />
          <Route path="/wallet" element={user ? <Wallet /> : <Navigate to="/login" />} />
          <Route path="/withdraw" element={user ? <Withdraw /> : <Navigate to="/login" />} />
          <Route path="/profile" element={user ? <Profile /> : <Navigate to="/login" />} />
          <Route path="/settings" element={user ? <Settings /> : <Navigate to="/login" />} />
        </Routes>
      </main>
      <Footer />
      <WhatsAppButton />
    </div>
  );
}

export default App;
