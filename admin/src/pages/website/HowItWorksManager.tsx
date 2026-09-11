import React, { useEffect, useState, useRef } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save, RefreshCw, AlertCircle,
  CheckCircle2, Layout, Image as ImageIcon,
  Plus, Trash2, ArrowUp, ArrowDown,
  Play, Copy, Eye, GripVertical, X,
  Video, Type, Layers, UploadCloud, ShieldCheck
} from 'lucide-react';
import { howItWorksSectionsService } from '../../services/howItWorksService';
import type { HowItWorksSection } from '../../types/how-it-works';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { supabase } from '../../lib/supabase';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const HowItWorksManager = () => {
  const [steps, setSteps] = useState<HowItWorksSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const [editingStep, setEditingStep] = useState<Partial<HowItWorksSection> | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadSteps();
  }, []);

  const loadSteps = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await howItWorksSectionsService.getSections();
      setSteps(data);
    } catch (err: any) {
      setError(err.message || 'Synchronization failure.');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    const nextNum = steps.length > 0 ? Math.max(...steps.map(s => s.step_number)) + 1 : 1;
    setEditingStep({
      step_number: nextNum,
      title: 'New Investment Step',
      description: 'Describe the process for investors to follow.',
      image_url: '',
      video_url: '',
      display_order: steps.length
    });
    setIsPanelOpen(true);
  };

  const handleEdit = (step: HowItWorksSection) => {
    setEditingStep({ ...step });
    setIsPanelOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: 'image_url') => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `how-it-works/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('website_assets')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('website_assets')
        .getPublicUrl(filePath);

      setEditingStep(prev => ({ ...prev, [field]: publicUrl }));
      setSuccess('Asset uploaded successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Upload failure.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!editingStep) return;
    setSaving(true);
    setError(null);
    try {
      if (editingStep.id) {
        await howItWorksSectionsService.updateSection(editingStep.id, editingStep);
      } else {
        await howItWorksSectionsService.createSection(editingStep);
      }
      await loadSteps();
      setIsPanelOpen(false);
      setSuccess('Ledger updated successfully.');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err: any) {
      setError(err.message || 'Commit failure.');
    } finally {
      setSaving(false);
    }
  };

  const handleMove = async (index: number, direction: 'up' | 'down') => {
    const newSteps = [...steps];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= steps.length) return;

    [newSteps[index], newSteps[targetIndex]] = [newSteps[targetIndex], newSteps[index]];
    const ordered = newSteps.map((s, i) => ({ ...s, display_order: i }));
    setSteps(ordered);

    try {
      await howItWorksSectionsService.reorderSections(ordered.map(s => s.id));
    } catch (err: any) {
      setError(err.message || 'Sequence persistence failure.');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Purge this step?')) return;
    try {
      setSaving(true);
      await howItWorksSectionsService.deleteSection(id);
      await loadSteps();
      setSuccess('Step purged.');
    } catch (err: any) {
      setError(err.message || 'Deletion failure.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-black uppercase tracking-[4px] text-[10px]">Syncing Matrix...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-20">
      <div className="flex justify-between items-center">
        <SectionHeader
          title="How It Works CMS"
          subtitle="Manage every step of the instructional process ledger."
          icon={Layout}
        />
        <button
          onClick={handleAdd}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} /> Add Process Step
        </button>
      </div>

      {error && (
        <div className="bg-rose-50 dark:bg-rose-900/10 border border-rose-100 dark:border-rose-900/20 p-6 rounded-[32px] flex items-center gap-4 text-rose-600 animate-in slide-in-from-top-4 shadow-sm">
          <AlertCircle size={24} />
          <p className="font-bold text-sm">{error}</p>
        </div>
      )}

      {success && (
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-100 dark:border-emerald-900/20 p-6 rounded-[32px] flex items-center gap-4 text-emerald-600 animate-in slide-in-from-top-4 shadow-sm">
          <CheckCircle2 size={24} />
          <p className="font-bold text-sm">{success}</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {steps.map((step, idx) => (
          <div key={step.id} className="bg-white dark:bg-slate-900 rounded-[32px] p-6 border border-slate-100 dark:border-slate-800 shadow-lg flex items-center gap-6 group hover:border-emerald-500/50 transition-all">
            <div className="flex flex-col gap-1 shrink-0">
              <button onClick={() => handleMove(idx, 'up')} disabled={idx === 0} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded disabled:opacity-10 text-slate-400"><ArrowUp size={16} /></button>
              <div className="flex justify-center text-slate-200"><GripVertical size={20} /></div>
              <button onClick={() => handleMove(idx, 'down')} disabled={idx === steps.length - 1} className="p-1 hover:bg-slate-50 dark:hover:bg-slate-800 rounded disabled:opacity-10 text-slate-400"><ArrowDown size={16} /></button>
            </div>

            <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-2xl font-black text-emerald-600 shrink-0">
               {step.step_number}
            </div>

            <div className="flex-1 min-w-0 space-y-1">
              <h4 className="text-sm font-black uppercase tracking-tight dark:text-white truncate">{step.title}</h4>
              <p className="text-xs text-slate-500 truncate">{step.description}</p>
            </div>

            <div className="flex items-center gap-2">
              <button onClick={() => handleEdit(step)} className="px-6 py-2.5 bg-slate-900 dark:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:scale-105 transition-all shadow-lg">Edit</button>
              <button onClick={() => handleDelete(step.id)} className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/20 rounded-xl transition-all"><Trash2 size={18} /></button>
            </div>
          </div>
        ))}
      </div>

      {/* Editor Side Panel */}
      <AnimatePresence>
        {isPanelOpen && editingStep && (
          <div className="fixed inset-0 z-[100] flex justify-end">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsPanelOpen(false)} className="absolute inset-0 bg-slate-950/80 backdrop-blur-md" />
            <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} transition={{ type: 'spring', damping: 25, stiffness: 200 }} className="relative w-full max-w-[1200px] bg-slate-50 dark:bg-slate-950 h-screen overflow-hidden flex flex-col">
              <div className="p-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex justify-between items-center">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg shadow-emerald-500/20">
                      <Layout size={24} />
                   </div>
                   <div>
                      <h3 className="text-xl font-black uppercase tracking-tight dark:text-white">Step Configuration</h3>
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[4px]">Process Node #{editingStep.step_number}</p>
                   </div>
                </div>
                <div className="flex gap-4">
                   <button onClick={() => setIsPanelOpen(false)} className="px-8 py-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-slate-50 transition-all">Discard</button>
                   <button onClick={handleSave} disabled={saving} className="px-10 py-3 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center gap-2">
                      {saving ? <RefreshCw className="animate-spin" size={16} /> : <Save size={16} />} Commit Step
                   </button>
                </div>
              </div>

              <div className="flex-1 overflow-hidden flex">
                <div className="flex-1 overflow-y-auto p-10 space-y-12 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">

                  <div className="space-y-8">
                     <div className="flex items-center gap-3">
                        <Type size={18} className="text-emerald-600" />
                        <h4 className="text-xs font-black uppercase tracking-widest dark:text-white">Content Matrix</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Step Number</label>
                           <input type="number" value={editingStep.step_number} onChange={e => setEditingStep({...editingStep, step_number: parseInt(e.target.value)})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                        </div>
                        <div className="md:col-span-3 space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Step Title</label>
                           <input type="text" value={editingStep.title} onChange={e => setEditingStep({...editingStep, title: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-black dark:text-white outline-none" />
                        </div>
                        <div className="col-span-full space-y-2">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Description</label>
                           <textarea rows={4} value={editingStep.description} onChange={e => setEditingStep({...editingStep, description: e.target.value})} className="w-full px-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-medium italic dark:text-white outline-none leading-relaxed" />
                        </div>
                     </div>
                  </div>

                  <div className="space-y-8 pt-8 border-t border-slate-50 dark:border-slate-800">
                     <div className="flex items-center gap-3">
                        <Layers size={18} className="text-blue-600" />
                        <h4 className="text-xs font-black uppercase tracking-widest dark:text-white">Media Assets</h4>
                     </div>
                     <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Primary Image</label>
                           <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                              <div className="aspect-video rounded-[32px] overflow-hidden bg-slate-50 dark:bg-slate-800 border-2 border-dashed border-slate-200 dark:border-slate-700 flex flex-col items-center justify-center gap-4 transition-all hover:border-emerald-500">
                                 {editingStep.image_url ? (
                                    <img src={editingStep.image_url} className="w-full h-full object-cover" alt="" />
                                 ) : (
                                    <>
                                       <UploadCloud size={32} className="text-slate-300" />
                                       <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Image</p>
                                    </>
                                 )}
                                 {uploading && <div className="absolute inset-0 bg-slate-900/60 flex items-center justify-center"><RefreshCw className="animate-spin text-white" size={32} /></div>}
                              </div>
                              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={e => handleFileUpload(e, 'image_url')} />
                           </div>
                           <input type="text" value={editingStep.image_url || ''} onChange={e => setEditingStep({...editingStep, image_url: e.target.value})} className="w-full px-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono text-[10px] dark:text-white outline-none" placeholder="Direct Image URL" />
                        </div>
                        <div className="space-y-4">
                           <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Process Video</label>
                           <div className="space-y-4">
                              <div className="relative">
                                 <Video className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                                 <input type="text" value={editingStep.video_url || ''} onChange={e => setEditingStep({...editingStep, video_url: e.target.value})} className="w-full pl-16 pr-8 py-5 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-mono text-xs dark:text-white outline-none" placeholder="Video URL (YouTube/MP4)" />
                              </div>
                              <div className="p-6 bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-100 dark:border-slate-800">
                                 <p className="text-[10px] text-slate-400 italic">"Ensure videos are set to public visibility for playback to work on the portal."</p>
                              </div>
                           </div>
                        </div>
                     </div>
                  </div>
                </div>

                <div className="w-[400px] bg-slate-950 p-10 hidden xl:flex flex-col border-l border-white/5">
                   <div className="sticky top-0 space-y-10">
                      <div className="flex items-center gap-2 border-b border-white/5 pb-6">
                         <ShieldCheck size={16} className="text-emerald-500" />
                         <h4 className="text-[10px] font-black uppercase tracking-[4px] text-slate-400">Ledger Validation</h4>
                      </div>
                      <div className="bg-white/5 rounded-[32px] p-8 border border-white/5 space-y-6">
                         <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white font-black">{editingStep.step_number}</div>
                         <div className="space-y-2">
                            <h5 className="font-black text-white uppercase">{editingStep.title}</h5>
                            <p className="text-xs text-slate-500 leading-relaxed italic">"{editingStep.description}"</p>
                         </div>
                      </div>
                      <p className="text-[10px] text-slate-500 italic">Changes will reflect instantly on the public portal after committing to the instructional database.</p>
                   </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default HowItWorksManager;
