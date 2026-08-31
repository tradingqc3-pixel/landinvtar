import React, { useEffect, useState } from 'react';
import SectionHeader from '../../components/SectionHeader';
import { UserPlus, RefreshCw, Trash2, Download, Search } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface Subscriber {
  id: string;
  email: string;
  created_at: string;
}

const Subscribers = () => {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('newsletter_subscribers')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setItems(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this email from the broadcast loop?')) return;
    try {
      const { error } = await supabase.from('newsletter_subscribers').delete().eq('id', id);
      if (error) throw error;
      fetchItems();
    } catch (err) {
      console.error(err);
    }
  };

  const filtered = items.filter(i => i.email.toLowerCase().includes(searchTerm.toLowerCase()));

  const exportCSV = () => {
    const csv = ['Email,Subscribed At', ...items.map(i => `${i.email},${i.created_at}`)].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `investland-subscribers-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end">
        <SectionHeader
          title="Newsletter Subscribers"
          subtitle="Manage the fractional movement audience and broadcast lists."
          icon={UserPlus}
        />
        <div className="flex gap-2">
           <button onClick={exportCSV} className="flex items-center gap-2 px-8 py-4 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-[10px] hover:scale-105 transition-all shadow-xl">
              <Download size={16} /> Export CSV
           </button>
           <button onClick={fetchItems} className="p-4 bg-white dark:bg-slate-900 text-emerald-600 rounded-2xl border border-slate-100 dark:border-slate-800 hover:bg-emerald-50 transition-all">
              <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
           </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden">
        <div className="p-8 border-b border-slate-50 dark:border-slate-800 flex items-center gap-4">
           <div className="relative flex-1">
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search email records..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-16 pr-8 py-4 bg-slate-50 dark:bg-slate-800/50 border-none rounded-2xl focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white outline-none"
              />
           </div>
           <span className="text-[10px] font-black text-slate-400 uppercase tracking-[3px] pr-4">{filtered.length} Leads</span>
        </div>

        <div className="overflow-x-auto">
           <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800 text-[10px] font-black uppercase tracking-[2px] text-slate-400">
                 <tr>
                    <th className="px-8 py-6">Subscriber Identity</th>
                    <th className="px-8 py-6 text-center">Acquisition Date</th>
                    <th className="px-8 py-6 text-right">Sequence Action</th>
                 </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 dark:divide-slate-800">
                 {loading && items.length === 0 ? (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-400 italic font-medium">Syncing broadcast registry...</td></tr>
                 ) : filtered.length === 0 ? (
                    <tr><td colSpan={3} className="p-20 text-center text-slate-400 italic font-medium">No subscriber records matched the query.</td></tr>
                 ) : (
                    filtered.map(i => (
                       <tr key={i.id} className="group hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors">
                          <td className="px-8 py-6">
                             <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center text-emerald-600 font-black text-xs">@</div>
                                <p className="text-sm font-black dark:text-white uppercase tracking-tight">{i.email}</p>
                             </div>
                          </td>
                          <td className="px-8 py-6 text-center">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{new Date(i.created_at).toLocaleDateString()} {new Date(i.created_at).toLocaleTimeString()}</p>
                          </td>
                          <td className="px-8 py-6 text-right">
                             <button
                               onClick={() => handleDelete(i.id)}
                               className="p-3 text-slate-300 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-900/10 rounded-xl transition-all opacity-0 group-hover:opacity-100"
                             >
                                <Trash2 size={18} />
                             </button>
                          </td>
                       </tr>
                    ))
                 )}
              </tbody>
           </table>
        </div>
      </div>
    </div>
  );
};

export default Subscribers;
