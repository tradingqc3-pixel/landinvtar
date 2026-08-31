import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Search, MapPin, IndianRupee, ArrowUpRight,
  ChevronDown, LayoutGrid, List as ListIcon, X, SlidersHorizontal
} from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { LandProject } from '../../../types/database';

const CATEGORIES = ['All', 'Residential', 'Commercial', 'Farm Land', 'Industrial', 'Luxury Villas'];

const Projects = () => {
  const [projects, setProjects] = useState<LandProject[]>([]);
  const [filteredProjects, setFilteredProjects] = useState<LandProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    fetchProjects();
  }, []);

  useEffect(() => {
    filterProjects();
  }, [projects, searchTerm, selectedCategory]);

  const fetchProjects = async () => {
    try {
      const { data, error } = await supabase
        .from('land_projects')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
    } finally {
      setLoading(false);
    }
  };

  const filterProjects = () => {
    let filtered = [...projects];

    if (searchTerm) {
      const q = searchTerm.toLowerCase();
      filtered = filtered.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.location.toLowerCase().includes(q) ||
        p.city.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredProjects(filtered);
  };

  return (
    <div className="pt-32 pb-20 min-h-screen bg-slate-50/50 dark:bg-slate-950 transition-colors duration-300">
      <div className="max-container px-6 space-y-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-slate-900 dark:text-white tracking-tight leading-tight">Explore <br />Land <span className="text-emerald-600">Assets</span></h1>
            <p className="text-lg text-slate-500 dark:text-slate-400 max-w-lg font-medium">
              Verified fractional investment opportunities across India's fastest growing nodes.
            </p>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden sm:flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
                <button
                  onClick={() => setViewMode('grid')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'grid' ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <LayoutGrid className="w-5 h-5" />
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`p-2 rounded-lg transition-all ${viewMode === 'list' ? 'bg-slate-900 dark:bg-emerald-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300'}`}
                >
                  <ListIcon className="w-5 h-5" />
                </button>
             </div>
             <button
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold uppercase tracking-widest text-xs border transition-all ${isFilterOpen ? 'bg-emerald-600 border-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 shadow-sm hover:border-emerald-600 dark:hover:border-emerald-600 hover:text-emerald-600'}`}
             >
               <SlidersHorizontal className="w-4 h-4" />
               Filters
             </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <AnimatePresence>
          {isFilterOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Search Assets</label>
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      placeholder="Name, Location, City..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-12 pr-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-medium transition-all text-slate-900 dark:text-white"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Category Filter</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(cat => (
                      <button
                        key={cat}
                        onClick={() => setSelectedCategory(cat)}
                        className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${selectedCategory === cat ? 'bg-emerald-600 border-emerald-600 text-white' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-emerald-600 dark:hover:border-emerald-600 hover:text-emerald-600 dark:hover:text-emerald-400'}`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-3">
                   <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500">Sort By</label>
                   <select className="w-full px-4 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 outline-none font-bold text-sm appearance-none cursor-pointer text-slate-900 dark:text-white">
                     <option>Newest First</option>
                     <option>Lowest Entry Price</option>
                     <option>Highest Expected ROI</option>
                     <option>Most Popular</option>
                   </select>
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  onClick={() => {setSearchTerm(''); setSelectedCategory('All');}}
                  className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2 transition-colors"
                >
                  <X className="w-4 h-4" /> Reset Filters
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Results Info */}
        <div className="flex items-center justify-between">
           <p className="text-sm font-bold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Showing {filteredProjects.length} Assets</p>
        </div>

        {/* Projects Grid/List */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="h-[500px] rounded-[48px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 animate-pulse" />
            ))}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-20 text-center space-y-6 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
            <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto">
              <Search className="w-10 h-10 text-slate-300 dark:text-slate-700" />
            </div>
            <div>
              <h4 className="text-2xl font-black text-slate-900 dark:text-white">No projects found</h4>
              <p className="text-slate-500 dark:text-slate-400">Try adjusting your filters or search terms.</p>
            </div>
          </div>
        ) : (
          <div className={`grid gap-8 ${viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'}`}>
            {filteredProjects.map((project, idx) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                className={viewMode === 'list' ? 'flex flex-col lg:flex-row bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden group hover:shadow-xl dark:hover:shadow-emerald-900/10 transition-all duration-500' : ''}
              >
                <Link to={`/projects/${project.id}`} className={viewMode === 'list' ? 'lg:w-1/3 h-64 lg:h-auto' : ''}>
                  <div className={`relative overflow-hidden bg-slate-100 dark:bg-slate-800 shadow-xl transition-all duration-500 hover:shadow-2xl hover:-translate-y-1 ${viewMode === 'grid' ? 'rounded-[48px] aspect-[4/5]' : 'h-full'}`}>
                    <img
                      src={project.image || 'https://via.placeholder.com/800x1000'}
                      alt={project.name}
                      className="w-full h-full object-cover scale-105 group-hover:scale-100 transition-transform duration-700"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/90 via-slate-900/20 to-transparent opacity-60 group-hover:opacity-100 transition-opacity" />

                    <div className="absolute top-6 left-6 flex gap-2">
                      <div className="px-4 py-2 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-900 dark:text-white border border-white/20 dark:border-slate-800 shadow-sm">
                        {project.category}
                      </div>
                      <div className="px-4 py-2 bg-emerald-600/90 backdrop-blur-md rounded-2xl text-[10px] font-black uppercase tracking-widest text-white border border-emerald-400/20">
                        {project.funding_progress}% Funded
                      </div>
                    </div>

                    {viewMode === 'grid' && (
                      <div className="absolute bottom-8 left-8 right-8 text-white">
                        <div className="flex items-center gap-2 mb-2">
                          <IndianRupee className="w-4 h-4 text-gold-400" />
                          <p className="text-xl font-black tracking-tight">₹{project.min_investment.toLocaleString()}</p>
                          <p className="text-xs font-bold text-slate-300 uppercase tracking-widest">Min.</p>
                        </div>
                        <h4 className="text-2xl font-black mb-1 tracking-tight leading-tight">{project.name}</h4>
                        <p className="text-sm font-medium text-slate-300 mb-6 flex items-center gap-1">
                          <MapPin className="w-4 h-4 text-emerald-500" /> {project.location}, {project.city}
                        </p>

                        <div className="pt-6 border-t border-white/10 flex justify-between items-center">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Target Return</p>
                            <p className="text-lg font-black text-emerald-400">{project.expected_roi}% <span className="text-[10px] text-slate-400">P.A.</span></p>
                          </div>
                          <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/10 group-hover:bg-emerald-600 transition-all">
                            <ArrowUpRight className="w-6 h-6" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {viewMode === 'list' && (
                  <div className="flex-1 p-10 flex flex-col justify-between">
                    <div className="space-y-4">
                      <div className="flex justify-between items-start">
                        <div className="space-y-1">
                          <h4 className="text-3xl font-black text-slate-900 dark:text-white tracking-tight leading-none">{project.name}</h4>
                          <p className="text-lg text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                            <MapPin className="w-5 h-5 text-emerald-600" /> {project.location}, {project.city}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-black text-emerald-600 uppercase tracking-widest">Entry Point</p>
                          <p className="text-3xl font-black text-slate-900 dark:text-white leading-none mt-1">₹{project.min_investment.toLocaleString()}</p>
                        </div>
                      </div>
                      <p className="text-slate-500 dark:text-slate-400 leading-relaxed max-w-2xl line-clamp-2 italic">
                        {project.description}
                      </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-12 pt-8 border-t border-slate-100 dark:border-slate-800">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Asset Value</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">₹{(project.total_funding / 10000000).toFixed(1)} Cr</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Target ROI</p>
                        <p className="text-2xl font-black text-emerald-600">{project.expected_roi}% <span className="text-xs font-bold text-slate-400 dark:text-slate-500">P.A.</span></p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 dark:text-slate-500 mb-1">Investors</p>
                        <p className="text-2xl font-black text-slate-900 dark:text-white">{project.investors_count.toLocaleString()}</p>
                      </div>
                      <div className="flex-1 flex justify-end">
                        <Link
                          to={`/projects/${project.id}`}
                          className="px-8 py-4 bg-slate-900 dark:bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-800 dark:hover:bg-emerald-700 transition-all flex items-center gap-2 group self-center shadow-lg dark:shadow-emerald-900/20"
                        >
                          View Details
                          <ChevronDown className="w-4 h-4 -rotate-90 group-hover:translate-x-1 transition-transform" />
                        </Link>
                      </div>
                    </div>
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Projects;
