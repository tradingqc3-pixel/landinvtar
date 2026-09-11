import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Star, GripVertical, RefreshCw, Save, CheckCircle2, Search, X } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { LandProject } from '../../types/project';

const FeaturedProjects = () => {
  const [projects, setProjects] = useState<LandProject[]>([]);
  const [allProjects, setAllProjects] = useState<LandProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchFeatured();
  }, []);

  /**
   * REQUIREMENT: Fetch all featured projects from the land_projects table
   * where is_featured = true, ordered by featured_order ASC.
   */
  const fetchFeatured = async () => {
    setLoading(true);
    setSuccess(false);
    try {
      const { data, error } = await supabase
        .from('land_projects')
        .select('*')
        .eq('is_featured', true)
        .order('featured_order', { ascending: true });

      if (error) {
        console.error('[Supabase Error]:', error);
        throw error;
      }
      setProjects(data || []);
    } catch (err: any) {
      console.error('[CMS Sync Error]: Failed to synchronize featured projects matrix.', err.message);
    } finally {
      setLoading(false);
    }
  };

  /**
   * REQUIREMENT: Add Asset logic - selects from inventory and saves to Supabase.
   */
  const fetchAllForSearch = async () => {
    try {
      // Fetch active projects that are NOT already in the featured buffer
      const featuredIds = projects.map(p => p.id);

      let query = supabase
        .from('land_projects')
        .select('*')
        .eq('is_active', true);

      if (searchTerm) {
        query = query.ilike('name', `%${searchTerm}%`);
      }

      const { data, error } = await query.limit(20);

      if (error) throw error;

      // Client-side filter to ensure we don't show already featured projects in search
      const unfeatured = (data || []).filter(p => !featuredIds.includes(p.id));
      setAllProjects(unfeatured);
    } catch (err) {
      console.error('[Search Error]:', err);
    }
  };

  useEffect(() => {
    if (isSearchOpen) fetchAllForSearch();
  }, [searchTerm, isSearchOpen, projects]);

  const addFeatured = async (project: LandProject) => {
    try {
      const { error } = await supabase
        .from('land_projects')
        .update({ is_featured: true, featured_order: projects.length })
        .eq('id', project.id);
      if (error) throw error;
      setIsSearchOpen(false);
      setSearchTerm('');
      await fetchFeatured();
    } catch (err) {
      console.error('[CMS Error]: Failed to anchor asset.', err);
    }
  };

  const removeFeatured = async (id: string) => {
    try {
      const { error } = await supabase
        .from('land_projects')
        .update({ is_featured: false, featured_order: null })
        .eq('id', id);
      if (error) throw error;
      await fetchFeatured();
    } catch (err) {
      console.error('[CMS Error]: Failed to evict asset.', err);
    }
  };

  /**
   * REQUIREMENT: Lock Sequence - update featured_order in Supabase.
   */
  const saveOrder = async () => {
    setSaving(true);
    setSuccess(false);
    try {
      // Sequential update to lock in the visual order
      for (let i = 0; i < projects.length; i++) {
        const { error } = await supabase
          .from('land_projects')
          .update({ featured_order: i })
          .eq('id', projects[i].id);
        if (error) throw error;
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      console.error('[CMS Error]: Failed to lock sequence.', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <SectionHeader
          title="Featured Projects"
          subtitle="Anchor the most premium land assets to the website home screen."
          icon={Star}
        />
        <div className="flex gap-3">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl"
          >
            Add Asset
          </button>
          <button
            onClick={saveOrder}
            disabled={saving || projects.length === 0}
            className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 disabled:opacity-50 min-w-[160px] justify-center"
          >
            {saving ? <RefreshCw size={16} className="animate-spin" /> : success ? <CheckCircle2 size={16} /> : <Save size={16} />}
            {saving ? 'Locking...' : success ? 'Sequence Locked' : 'Lock Sequence'}
          </button>
        </div>
      </div>

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-4 rounded-2xl flex items-center gap-3 text-emerald-600 text-sm font-bold animate-in slide-in-from-top-2">
           <CheckCircle2 size={18} />
           Featured project order synchronized successfully!
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Filtering Featured Assets...</p>
        </div>
      ) : projects.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-3xl flex items-center justify-center mx-auto text-emerald-600">
              <Star size={40} />
           </div>
           <p className="text-slate-500 font-bold italic italic uppercase tracking-widest text-[10px]">The featured buffer is currently empty.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
          <div className="p-8 border-b border-slate-50 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Active Homepage Sequence</p>
          </div>
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {projects.map((project, idx) => (
              <div key={project.id} className="p-8 flex items-center gap-6 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group">
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors cursor-grab active:cursor-grabbing">
                  <GripVertical size={20} />
                </div>
                <div className="w-24 h-16 rounded-2xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-inner">
                  <img src={project.image} className="w-full h-full object-cover" alt="Asset" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight truncate">{project.name}</p>
                  <p className="text-sm text-slate-500 font-medium italic">{project.location}</p>
                </div>
                <div className="flex items-center gap-6">
                  <div className="hidden md:block text-right">
                    <p className="text-xs font-black text-emerald-600 uppercase">₹{project.min_investment.toLocaleString()}</p>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Entry Tier</p>
                  </div>
                  <button
                    onClick={() => removeFeatured(project.id)}
                    className="px-6 py-2.5 bg-rose-50 dark:bg-rose-900/10 text-rose-600 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-rose-100 transition-all"
                  >
                    Evict
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Search Asset Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-xl p-10 border border-white dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsSearchOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
              </button>
              <div className="space-y-8">
                 <div className="space-y-2 text-center">
                    <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase tracking-[3px]">Asset Inventory</h3>
                    <p className="text-slate-500 font-medium italic">Search for land to anchor on homepage.</p>
                 </div>

                 <div className="relative">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                      autoFocus
                      type="text"
                      placeholder="Enter project name..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
                    />
                 </div>

                 <div className="max-h-64 overflow-y-auto space-y-2 pr-2 scrollbar-hide">
                    {allProjects.map(p => (
                      <button
                        key={p.id}
                        onClick={() => addFeatured(p)}
                        className="w-full p-4 rounded-2xl hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-4 text-left transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700"
                      >
                         <img src={p.image} className="w-12 h-12 rounded-xl object-cover" alt="Thumb" />
                         <div className="flex-1">
                            <p className="text-sm font-black dark:text-white uppercase truncate">{p.name}</p>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{p.location}</p>
                         </div>
                         <Star size={16} className="text-slate-300 group-hover:text-emerald-500" />
                      </button>
                    ))}
                 </div>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default FeaturedProjects;
