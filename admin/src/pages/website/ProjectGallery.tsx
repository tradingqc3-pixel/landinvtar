import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { ImagePlus, RefreshCw, Trash2, Plus, X, Search, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import type { LandProject } from '../../types/project';

const ProjectGallery = () => {
  const [projects, setProjects] = useState<LandProject[]>([]);
  const [selectedProject, setSelectedProject] = useState<LandProject | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchProjects();
  }, []);

  const fetchProjects = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('land_projects')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      setProjects(data || []);
      if (data && data.length > 0) setSelectedProject(data[0]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const addImage = async (url: string) => {
    if (!selectedProject || !url) return;
    setSaving(true);
    const newImages = [...(selectedProject.images || []), url];
    try {
      const { error } = await supabase
        .from('land_projects')
        .update({ images: newImages })
        .eq('id', selectedProject.id);
      if (error) throw error;

      // Update local state
      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, images: newImages } : p));
      setSelectedProject({ ...selectedProject, images: newImages });
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const removeImage = async (url: string) => {
    if (!selectedProject) return;
    const newImages = selectedProject.images.filter(img => img !== url);
    try {
      const { error } = await supabase
        .from('land_projects')
        .update({ images: newImages })
        .eq('id', selectedProject.id);
      if (error) throw error;

      setProjects(projects.map(p => p.id === selectedProject.id ? { ...p, images: newImages } : p));
      setSelectedProject({ ...selectedProject, images: newImages });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Project Gallery"
        subtitle="Manage the high-resolution visual buffer for each land asset."
        icon={ImagePlus}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-4">
           <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-50 dark:border-slate-800">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Select Asset</p>
              </div>
              <div className="max-h-[600px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 scrollbar-hide">
                 {projects.map(p => (
                    <button
                      key={p.id}
                      onClick={() => setSelectedProject(p)}
                      className={`w-full p-4 flex items-center gap-3 text-left transition-all ${selectedProject?.id === p.id ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600' : 'hover:bg-slate-50 dark:hover:bg-slate-800/50'}`}
                    >
                       <img src={p.image} className="w-10 h-10 rounded-lg object-cover" alt="Thumb" />
                       <div className="min-w-0">
                          <p className="text-xs font-black uppercase truncate">{p.name}</p>
                          <p className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">{p.location}</p>
                       </div>
                    </button>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
           {selectedProject ? (
              <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
                 <div className="bg-white dark:bg-slate-900 p-8 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl space-y-8">
                    <div className="flex justify-between items-center">
                       <div>
                          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight">{selectedProject.name}</h3>
                          <p className="text-slate-500 font-medium italic italic">Managing {selectedProject.images?.length || 0} visual records.</p>
                       </div>
                       <div className="flex gap-2">
                          <input
                            id="newImageUrl"
                            type="url"
                            placeholder="Enter image URL..."
                            className="px-6 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold text-xs outline-none"
                          />
                          <button
                            onClick={() => {
                              const input = document.getElementById('newImageUrl') as HTMLInputElement;
                              addImage(input.value);
                              input.value = '';
                            }}
                            className="p-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors"
                          >
                             <Plus size={20} />
                          </button>
                       </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                       {selectedProject.images?.map((url, i) => (
                          <div key={i} className="group relative aspect-video rounded-3xl overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                             <img src={url} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" alt="Gallery" />
                             <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                <button
                                  onClick={() => removeImage(url)}
                                  className="p-3 bg-rose-600 text-white rounded-2xl hover:scale-110 transition-transform"
                                >
                                   <Trash2 size={18} />
                                </button>
                             </div>
                             <div className="absolute bottom-4 left-4">
                                <span className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest border border-white/20">Record {i+1}</span>
                             </div>
                          </div>
                       ))}
                       {(!selectedProject.images || selectedProject.images.length === 0) && (
                          <div className="col-span-full py-20 text-center border-2 border-dashed border-slate-100 dark:border-slate-800 rounded-[32px]">
                             <p className="text-slate-400 font-bold italic italic uppercase tracking-widest text-[10px]">No gallery records linked to this asset.</p>
                          </div>
                       )}
                    </div>
                 </div>
              </div>
           ) : (
              <div className="flex flex-col items-center justify-center h-[500px] bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm opacity-50">
                 <ImagePlus size={48} className="text-slate-300 mb-4" />
                 <p className="text-slate-500 font-bold italic">Select an asset from the sidebar buffer.</p>
              </div>
           )}
        </div>
      </div>
    </div>
  );
};

export default ProjectGallery;
