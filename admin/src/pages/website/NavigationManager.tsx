import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { Menu, Plus, RefreshCw, Trash2, Edit2, Save, X, GripVertical, Eye, EyeOff } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface NavItem {
  id: string;
  label: string;
  link: string;
  order_index: number;
  is_visible: boolean;
}

const NavigationManager = () => {
  const [items, setItems] = useState<NavItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<NavItem | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('navigation_menu')
        .select('*')
        .order('order_index', { ascending: true });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    const itemData = {
      label: formData.get('label'),
      link: formData.get('link'),
      order_index: parseInt(formData.get('order_index') as string) || 0,
      is_visible: formData.get('is_visible') === 'on'
    };

    try {
      if (editingItem) {
        const { error } = await supabase.from('navigation_menu').update(itemData).eq('id', editingItem.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('navigation_menu').insert([itemData]);
        if (error) throw error;
      }
      setIsModalOpen(false);
      fetchItems();
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Destroy this navigation node?')) return;
    try {
      const { error } = await supabase.from('navigation_menu').delete().eq('id', id);
      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const toggleVisibility = async (item: NavItem) => {
    try {
      const { error } = await supabase.from('navigation_menu').update({ is_visible: !item.is_visible }).eq('id', item.id);
      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <SectionHeader
          title="Navigation CMS"
          subtitle="Configure the global portal entry points and site structure."
          icon={Menu}
        />
        <button
          onClick={() => { setEditingItem(null); setIsModalOpen(true); }}
          className="flex items-center gap-2 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20"
        >
          <Plus size={16} />
          Create Node
        </button>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center h-96 bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm">
           <RefreshCw size={32} className="text-emerald-500 animate-spin mb-4" />
           <p className="text-slate-400 font-bold uppercase tracking-widest text-[10px]">Syncing Portal Map...</p>
        </div>
      ) : items.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-[48px] p-20 text-center border border-slate-100 dark:border-slate-800 shadow-sm space-y-4">
           <div className="w-20 h-20 bg-slate-50 dark:bg-slate-800 rounded-3xl flex items-center justify-center mx-auto text-slate-300">
              <Menu size={40} />
           </div>
           <p className="text-slate-500 font-bold italic">No navigation links defined.</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
           <div className="overflow-x-auto">
              <table className="w-full text-left">
                 <thead className="bg-slate-50 dark:bg-slate-800/50 text-slate-400 text-[10px] font-black uppercase tracking-[2px]">
                    <tr>
                       <th className="px-8 py-5 w-16 text-center">Pos</th>
                       <th className="px-8 py-5">Node Label</th>
                       <th className="px-8 py-5">Gateway Link</th>
                       <th className="px-8 py-5 text-center">Visibility</th>
                       <th className="px-8 py-5 text-right">Actions</th>
                    </tr>
                 </thead>
                 <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                    {items.map((item) => (
                       <tr key={item.id} className="hover:bg-slate-50/50 transition-colors group">
                          <td className="px-8 py-6 text-center font-black text-slate-400 text-xs">{item.order_index}</td>
                          <td className="px-8 py-6">
                             <p className="font-black text-slate-900 dark:text-white uppercase tracking-wider text-sm">{item.label}</p>
                          </td>
                          <td className="px-8 py-6 font-mono text-[10px] text-emerald-600">{item.link}</td>
                          <td className="px-8 py-6 text-center">
                             <button onClick={() => toggleVisibility(item)} className={`p-2 rounded-xl transition-all ${item.is_visible ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-400'}`}>
                                {item.is_visible ? <Eye size={16} /> : <EyeOff size={16} />}
                             </button>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <button onClick={() => { setEditingItem(item); setIsModalOpen(true); }} className="p-2 text-slate-400 hover:text-emerald-500 transition-colors"><Edit2 size={16} /></button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 text-slate-400 hover:text-rose-500 transition-colors"><Trash2 size={16} /></button>
                             </div>
                          </td>
                       </tr>
                    ))}
                 </tbody>
              </table>
           </div>
        </div>
      )}

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-slate-950/80 backdrop-blur-sm">
           <div className="bg-white dark:bg-slate-900 rounded-[48px] w-full max-w-xl p-10 border border-white dark:border-slate-800 shadow-2xl relative animate-in zoom-in-95 duration-300">
              <button onClick={() => setIsModalOpen(false)} className="absolute top-10 right-10 text-slate-400 hover:text-rose-500 transition-colors">
                 <X size={24} />
              </button>
              <div className="space-y-8">
                 <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">{editingItem ? 'Edit Node' : 'Anchor Node'}</h3>
                    <p className="text-slate-500 font-medium italic">Define a portal gateway label and redirect target.</p>
                 </div>

                 <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Label</label>
                          <input required name="label" defaultValue={editingItem?.label} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="space-y-2">
                          <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Gateway Link</label>
                          <input required name="link" defaultValue={editingItem?.link} type="text" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                       </div>
                       <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-2">
                             <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-4">Sequence Index</label>
                             <input required name="order_index" defaultValue={editingItem?.order_index || 0} type="number" className="w-full px-8 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-3xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none" />
                          </div>
                          <div className="flex items-center gap-4 pl-4 pt-10">
                             <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative">
                                   <input name="is_visible" type="checkbox" defaultChecked={editingItem?.is_visible ?? true} className="peer sr-only" />
                                   <div className="w-6 h-6 border-2 border-slate-200 dark:border-slate-800 rounded-lg peer-checked:bg-emerald-600 peer-checked:border-emerald-600 transition-all" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 group-hover:text-emerald-500 transition-colors">Visible</span>
                             </label>
                          </div>
                       </div>
                    </div>

                    <button
                      disabled={saving}
                      className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black uppercase tracking-[3px] text-xs hover:bg-emerald-700 transition-all shadow-2xl shadow-emerald-500/30 flex items-center justify-center gap-3"
                    >
                      {saving ? <RefreshCw size={20} className="animate-spin" /> : <Save size={20} />}
                      Sync Portal Node
                    </button>
                 </form>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default NavigationManager;
