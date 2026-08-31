import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin, IndianRupee, TrendingUp, ShieldCheck,
  Calendar, Users, ArrowLeft, Share2, Heart,
  FileText, Download, CheckCircle2, ChevronRight,
  Info, PieChart, BarChart3, Star, Zap, AlertCircle,
  Check
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import type { LandProject } from '../../../types/database';

const ProjectDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState<LandProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeImage, setActiveImage] = useState(0);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showToast, setShowToast] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProject();
      const savedFavorites = JSON.parse(localStorage.getItem('investland_favorites') || '[]');
      setIsFavorited(savedFavorites.includes(id));
    }
  }, [id]);

  const fetchProject = async () => {
    setLoading(true);
    setError(null);
    try {
      const { data, error: fetchError } = await supabase
        .from('land_projects')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      setProject(data);
    } catch (err: any) {
      console.error('Error fetching project:', err);
      setError(err.message || 'Failed to connect to the database.');
    } finally {
      setLoading(false);
    }
  };

  const handleInvest = async () => {
    if (user) {
      navigate(`/invest/${id}`);
    } else {
      navigate('/login');
    }
  };

  const handleWithdrawClick = () => {
    if (user) {
      navigate(`/withdraw?project=${encodeURIComponent(project?.name || '')}&id=${id}`);
    } else {
      navigate('/login');
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: project?.name || 'InvestLand Project',
      text: `Check out ${project?.name} in ${project?.location} on InvestLand!`,
      url: window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        await navigator.clipboard.writeText(window.location.href);
        triggerToast();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback to clipboard if share was cancelled or failed
      await navigator.clipboard.writeText(window.location.href);
      triggerToast();
    }
  };

  const toggleFavorite = () => {
    if (!id) return;
    const savedFavorites = JSON.parse(localStorage.getItem('investland_favorites') || '[]');
    let newFavorites;

    if (isFavorited) {
      newFavorites = savedFavorites.filter((favId: string) => favId !== id);
    } else {
      newFavorites = [...savedFavorites, id];
    }

    localStorage.setItem('investland_favorites', JSON.stringify(newFavorites));
    setIsFavorited(!isFavorited);
  };

  const triggerToast = () => {
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  if (loading) {
    return (
      <div className="pt-32 flex flex-col items-center justify-center min-h-[60vh] gap-4 bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin" />
        <p className="text-slate-400 dark:text-slate-500 font-black uppercase tracking-widest text-xs">Loading Asset Data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="pt-32 text-center py-20 px-6 max-w-2xl mx-auto bg-white dark:bg-slate-950 transition-colors duration-300">
        <div className="w-20 h-20 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-3xl font-black text-slate-900 dark:text-white mb-2">Sync Error</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">{error}</p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => fetchProject()}
            className="px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-lg"
          >
            Retry Sync
          </button>
          <Link to="/projects" className="text-slate-400 dark:text-slate-500 font-bold uppercase tracking-widest text-xs hover:text-slate-600 dark:hover:text-slate-300 transition-colors">
            Back to Catalog
          </Link>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="pt-32 text-center py-20 px-6 bg-white dark:bg-slate-950 transition-colors duration-300">
        <h2 className="text-3xl font-black text-slate-900 dark:text-white">Project Not Found</h2>
        <p className="text-slate-500 dark:text-slate-400 mb-8">The project you are looking for does not exist or has been removed.</p>
        <Link to="/projects" className="text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest text-sm flex items-center justify-center gap-2">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
      </div>
    );
  }

  const allImages = [project.image, ...(project.images || [])].filter(Boolean);

  return (
    <div className="pt-32 pb-32 bg-white dark:bg-slate-950 transition-colors duration-300 relative">
      {/* Toast Notification */}
      <AnimatePresence>
        {showToast && (
          <motion.div
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 20, x: '-50%' }}
            className="fixed bottom-10 left-1/2 z-50 bg-slate-900 dark:bg-emerald-600 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3 border border-white/10"
          >
            <div className="w-6 h-6 bg-emerald-500/20 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-emerald-400 dark:text-white" />
            </div>
            <p className="font-bold text-sm uppercase tracking-widest">Link copied to clipboard</p>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="max-container px-6 space-y-12">
        {/* Breadcrumbs & Navigation */}
        <div className="flex items-center justify-between">
          <Link to="/projects" className="text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Back to Assets
          </Link>
          <div className="flex gap-4">
            <button
              onClick={handleShare}
              className="p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm text-slate-400 dark:text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-all"
            >
              <Share2 className="w-5 h-5" />
            </button>
            <button
              onClick={toggleFavorite}
              className={`p-3 bg-white dark:bg-slate-900 rounded-xl border border-slate-100 dark:border-slate-800 shadow-sm transition-all ${isFavorited ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 dark:text-slate-500 hover:text-rose-500'}`}
            >
              <Heart className={`w-5 h-5 ${isFavorited ? 'fill-current' : ''}`} />
            </button>
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
          {/* Image Gallery */}
          <div className="space-y-6">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative rounded-[48px] overflow-hidden aspect-[4/3] shadow-2xl bg-slate-100 dark:bg-slate-900 border-4 border-white dark:border-slate-800"
            >
              <img
                src={allImages[activeImage]}
                alt={project.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-8 left-8 flex gap-3">
                <div className="px-5 py-2.5 bg-emerald-600/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-emerald-400/20 shadow-xl">
                  {project.category}
                </div>
                {project.is_govt_approved && (
                  <div className="px-5 py-2.5 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-emerald-700 dark:text-emerald-400 border border-white/20 dark:border-slate-800 shadow-xl flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4" /> Govt Approved
                  </div>
                )}
              </div>
            </motion.div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 px-4">
              {allImages.slice(0, 4).map((img, i) => (
                <button
                  key={i}
                  onClick={() => setActiveImage(i)}
                  className={`relative rounded-2xl overflow-hidden aspect-square border-2 transition-all ${activeImage === i ? 'border-emerald-600 scale-105 shadow-lg' : 'border-white dark:border-slate-800 hover:border-emerald-200 dark:hover:border-emerald-900'}`}
                >
                  <img src={img} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Core Investment Info */}
          <div className="space-y-8 lg:sticky lg:top-32">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="flex gap-0.5 text-gold-500">
                   {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-4 h-4 fill-current" />)}
                </div>
                <span className="text-xs font-black text-slate-400 dark:text-slate-500 uppercase tracking-widest">Asset Code: {project.id.slice(0, 8)}</span>
              </div>
              <h1 className="text-5xl lg:text-6xl font-black text-slate-900 dark:text-white tracking-tighter leading-tight">{project.name}</h1>
              <p className="text-xl text-slate-500 dark:text-slate-400 font-medium flex items-center gap-2">
                <MapPin className="w-6 h-6 text-emerald-600" /> {project.location}, {project.city}, {project.state}
              </p>
            </div>

            <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-10">
              <div className="grid grid-cols-2 gap-10">
                <div className="space-y-1">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Minimum Entry</p>
                  <p className="text-4xl font-black text-slate-900 dark:text-white">₹{project.min_investment.toLocaleString()}</p>
                </div>
                <div className="space-y-1 text-right">
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Target ROI</p>
                  <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">{project.expected_roi}% <span className="text-sm">P.A.</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center text-sm font-black uppercase tracking-widest">
                  <span className="text-slate-400 dark:text-slate-500">Funding Progress</span>
                  <span className="text-emerald-600 dark:text-emerald-400">{project.funding_progress}%</span>
                </div>
                <div className="h-4 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden p-1">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${project.funding_progress}%` }}
                    transition={{ duration: 1, ease: "easeOut" }}
                    className="h-full bg-emerald-600 dark:bg-emerald-500 rounded-full"
                  />
                </div>
                <div className="flex justify-between text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  <span>₹{(project.raised_funding / 100000).toFixed(1)}L Raised</span>
                  <span>Goal: ₹{(project.total_funding / 10000000).toFixed(1)} Cr</span>
                </div>
              </div>

              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <button
                  onClick={handleInvest}
                  className="w-full py-6 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-900/20 flex items-center justify-center gap-3 group"
                >
                  Invest in Asset
                  <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
                <button
                  onClick={handleWithdrawClick}
                  className="w-full py-6 bg-slate-900 dark:bg-white/10 dark:hover:bg-white/20 text-white rounded-2xl font-black uppercase tracking-widest hover:bg-black transition-all shadow-xl flex items-center justify-center gap-3"
                >
                  Withdraw
                </button>
                <p className="col-span-full text-center text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                  Secure Digital Ownership Recorded on Blockchain
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
               <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm">
                    <Calendar className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Duration</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{project.timeline}</p>
                  </div>
               </div>
               <div className="bg-slate-50 dark:bg-slate-900 p-6 rounded-3xl border border-slate-100 dark:border-slate-800 flex items-center gap-4">
                  <div className="w-12 h-12 bg-white dark:bg-slate-800 rounded-xl flex items-center justify-center text-gold-600 dark:text-gold-400 shadow-sm">
                    <Users className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Investors</p>
                    <p className="text-lg font-black text-slate-900 dark:text-white">{project.investors_count.toLocaleString()}</p>
                  </div>
               </div>
            </div>
          </div>
        </div>

        {/* Detailed Information Tabs */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-12">
          <div className="lg:col-span-2 space-y-12">
            {/* Overview */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <Info className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Project Overview</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 p-10 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm prose prose-slate dark:prose-invert max-w-none">
                <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed font-medium italic">
                  {project.description}
                </p>
              </div>
            </section>

            {/* Highlights */}
            <section className="space-y-6">
               <div className="flex items-center gap-3">
                <Zap className="w-6 h-6 text-gold-600 dark:text-gold-400" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Investment Highlights</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {project.highlights?.map((h, i) => (
                  <div key={i} className="flex items-center gap-4 p-6 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800">
                    <CheckCircle2 className="w-6 h-6 text-emerald-500 dark:text-emerald-400 shrink-0" />
                    <span className="font-bold text-slate-700 dark:text-slate-300">{h}</span>
                  </div>
                ))}
              </div>
            </section>

            {/* Location & Connectivity */}
            <section className="space-y-6">
              <div className="flex items-center gap-3">
                <MapPin className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Connectivity Nodes</h3>
              </div>
              <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 divide-y md:divide-y-0 md:divide-x divide-slate-100 dark:divide-slate-800">
                    {project.amenities?.map((a: any, i: number) => (
                      <div key={i} className="p-8 space-y-2 text-center group hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">{a.type}</p>
                        <p className="text-lg font-black text-slate-900 dark:text-white leading-tight">{a.name}</p>
                        <p className="text-sm font-bold text-emerald-600 dark:text-emerald-400">{a.distance}</p>
                      </div>
                    ))}
                 </div>
              </div>
            </section>
          </div>

          <div className="space-y-12">
             {/* Documents */}
             <section className="space-y-6">
                <div className="flex items-center gap-3">
                  <FileText className="w-6 h-6 text-slate-700 dark:text-slate-300" />
                  <h3 className="text-2xl font-black uppercase tracking-widest text-slate-900 dark:text-white">Legal Audit</h3>
                </div>
                <div className="bg-slate-900 dark:bg-slate-900/50 rounded-[48px] p-10 space-y-6 shadow-2xl border dark:border-slate-800">
                  {project.documents?.map((doc: any, i: number) => (
                    <div key={i} className="flex items-center justify-between group cursor-pointer border-b border-white/5 pb-6 last:border-0 last:pb-0">
                      <div className="flex items-center gap-4">
                         <div className="w-10 h-10 bg-white/10 dark:bg-slate-800 rounded-xl flex items-center justify-center text-white dark:text-slate-300 transition-colors group-hover:bg-emerald-600 dark:group-hover:bg-emerald-600">
                           <FileText className="w-5 h-5" />
                         </div>
                         <div>
                           <p className="text-sm font-bold text-white group-hover:text-emerald-400 transition-colors">{doc.name}</p>
                           <p className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">{doc.status}</p>
                         </div>
                      </div>
                      <Download className="w-5 h-5 text-white/20 group-hover:text-white transition-all" />
                    </div>
                  ))}
                  <div className="pt-6">
                    <button className="w-full py-4 bg-white/10 dark:bg-slate-800 hover:bg-white/20 dark:hover:bg-slate-700 border border-white/10 dark:border-slate-700 rounded-2xl text-white font-black uppercase tracking-widest text-[10px] transition-all flex items-center justify-center gap-2">
                      <Download className="w-4 h-4" /> Download All Credentials
                    </button>
                  </div>
                </div>
             </section>

             {/* Analytics Card */}
             <div className="bg-emerald-50 dark:bg-emerald-900/10 rounded-[48px] p-10 border border-emerald-100 dark:border-emerald-900/20 space-y-8 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-600/5 rounded-full -mr-16 -mt-16 blur-2xl" />
                <h4 className="text-xl font-black uppercase tracking-widest text-emerald-900 dark:text-emerald-400">Appreciation Vector</h4>
                <div className="flex items-center gap-6">
                   <div className="w-20 h-20 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-600/5 dark:shadow-emerald-900/5">
                      <TrendingUp className="w-10 h-10 text-emerald-600 dark:text-emerald-400" />
                   </div>
                   <div>
                     <p className="text-4xl font-black text-emerald-600 dark:text-emerald-400">+{project.appreciation_rate}%</p>
                     <p className="text-[10px] font-black uppercase tracking-widest text-emerald-700/50 dark:text-emerald-400/30">Historical CAGR</p>
                   </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <BarChart3 className="w-4 h-4" />
                    Strategic corridor growth
                  </div>
                  <div className="flex items-center gap-3 text-emerald-700 dark:text-emerald-400 font-bold text-sm">
                    <PieChart className="w-4 h-4" />
                    Diversified risk profile
                  </div>
                </div>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetails;
