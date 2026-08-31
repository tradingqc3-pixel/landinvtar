import React, { useEffect, useState, useMemo } from 'react';
import SectionHeader from '../../components/SectionHeader';
import {
  Mail, RefreshCw, Trash2, CheckCircle2,
  X, Eye, AlertCircle, Search, Filter,
  ChevronRight, Inbox, MessageSquare, CheckCircle,
  ExternalLink
} from 'lucide-react';
import { supabase } from '../../lib/supabase';
import clsx from 'clsx';

interface Message {
  id: string;
  full_name: string;
  email: string;
  subject: string;
  message: string;
  status: 'New' | 'Read' | 'Replied';
  created_at: string;
}

const ContactMessages = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'New' | 'Read' | 'Replied'>('All');

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (err) {
      console.error('Fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();

    // Subscribe to realtime updates for contact_messages
    const channel = supabase
      .channel('public:contact_messages')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'contact_messages'
      }, (payload) => {
        console.log('Realtime change received:', payload);
        fetchMessages();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const updateStatus = async (id: string, status: Message['status']) => {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;

      // Update local state for immediate feedback
      setMessages(prev => prev.map(m => m.id === id ? { ...m, status } : m));
      if (selectedMessage?.id === id) {
        setSelectedMessage(prev => prev ? { ...prev, status } : null);
      }
    } catch (err) {
      console.error('Update status error:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this message? This action is permanent.')) return;
    try {
      const { error } = await supabase.from('contact_messages').delete().eq('id', id);
      if (error) throw error;

      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedMessage?.id === id) setSelectedMessage(null);
    } catch (err) {
      console.error('Delete error:', err);
    }
  };

  const filteredMessages = useMemo(() => {
    return messages.filter(m => {
      const name = m.full_name || '';
      const email = m.email || '';
      const subject = m.subject || '';

      const matchesSearch =
        name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        subject.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesFilter = statusFilter === 'All' || m.status === statusFilter;

      return matchesSearch && matchesFilter;
    });
  }, [messages, searchQuery, statusFilter]);

  const stats = useMemo(() => {
    return {
      total: messages.length,
      new: messages.filter(m => m.status === 'New').length,
      replied: messages.filter(m => m.status === 'Replied').length
    };
  }, [messages]);

  const getStatusColor = (status: Message['status']) => {
    switch (status) {
      case 'New': return 'text-blue-500 bg-blue-500/10 border-blue-500/20';
      case 'Read': return 'text-amber-500 bg-amber-500/10 border-amber-500/20';
      case 'Replied': return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
      default: return 'text-slate-500 bg-slate-500/10 border-slate-500/20';
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <SectionHeader
          title="Contact Messages"
          subtitle="Process incoming communication and investor inquiries."
          icon={Mail}
        />
        <div className="flex gap-4">
          <button
            onClick={() => { setLoading(true); fetchMessages(); }}
            className="p-4 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 text-slate-500 hover:text-emerald-500 transition-all shadow-sm"
          >
            <RefreshCw size={20} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Inquiries', val: stats.total, icon: Inbox, color: 'text-slate-600' },
          { label: 'Awaiting Review', val: stats.new, icon: AlertCircle, color: 'text-blue-600' },
          { label: 'Replied/Processed', val: stats.replied, icon: CheckCircle, color: 'text-emerald-600' }
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-slate-900 p-8 rounded-[32px] border border-slate-100 dark:border-slate-800 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">{stat.label}</p>
              <p className="text-3xl font-black text-slate-900 dark:text-white">{stat.val}</p>
            </div>
            <div className={clsx("w-14 h-14 rounded-2xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center shadow-inner", stat.color)}>
              <stat.icon size={28} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Message List */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 rounded-[40px] border border-slate-100 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col">
            <div className="p-8 border-b border-slate-50 dark:border-slate-800 space-y-6">
              <div className="relative">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search sender, email, or subject..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-16 pr-6 py-4 bg-slate-50 dark:bg-slate-800 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 font-bold dark:text-white text-sm"
                />
              </div>
              <div className="flex gap-2">
                {['All', 'New', 'Read', 'Replied'].map(f => (
                  <button
                    key={f}
                    onClick={() => setStatusFilter(f as any)}
                    className={clsx(
                      "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                      statusFilter === f
                        ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/20"
                        : "bg-slate-50 dark:bg-slate-800 text-slate-400 hover:text-emerald-500"
                    )}
                  >
                    {f}
                  </button>
                ))}
              </div>
            </div>

            <div className="h-[600px] overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800 scrollbar-hide">
              {loading && messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50">
                  <RefreshCw className="w-8 h-8 text-emerald-500 animate-spin" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Syncing Communication Cloud...</p>
                </div>
              ) : filteredMessages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full gap-4 opacity-50 p-12 text-center">
                  <Inbox className="w-12 h-12 text-slate-300 mx-auto" />
                  <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Zero entries found in this view.</p>
                </div>
              ) : (
                filteredMessages.map(m => (
                  <button
                    key={m.id}
                    onClick={() => {
                      setSelectedMessage(m);
                      if (m.status === 'New') updateStatus(m.id, 'Read');
                    }}
                    className={clsx(
                      "w-full p-8 text-left transition-all relative border-l-4 group",
                      selectedMessage?.id === m.id
                        ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-500"
                        : "hover:bg-slate-50 dark:hover:bg-slate-800/40 border-transparent"
                    )}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <span className={clsx(
                        "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-tighter border",
                        getStatusColor(m.status)
                      )}>
                        {m.status}
                      </span>
                      <p className="text-[9px] font-bold text-slate-400 uppercase">
                        {new Date(m.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <h4 className="text-sm font-black uppercase text-slate-900 dark:text-white group-hover:text-emerald-600 transition-colors truncate">
                      {m.full_name}
                    </h4>
                    <p className="text-xs text-slate-500 font-medium truncate mb-4">{m.subject}</p>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 line-clamp-1 italic font-medium leading-relaxed">
                      {m.message}
                    </p>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Message View / Detail Drawer */}
        <div className="lg:col-span-7">
          {selectedMessage ? (
            <div
              className="bg-white dark:bg-slate-900 rounded-[48px] p-10 md:p-12 border border-slate-100 dark:border-slate-800 shadow-2xl space-y-10 relative overflow-hidden transition-all duration-300 animate-in fade-in slide-in-from-right-4"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

              <div className="flex justify-between items-start relative z-10">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                     <span className={clsx(
                      "px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border",
                      getStatusColor(selectedMessage.status)
                    )}>
                      {selectedMessage.status}
                    </span>
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px] mb-2">Sender Metadata</p>
                    <h3 className="text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase leading-none">
                      {selectedMessage.full_name}
                    </h3>
                    <a href={`mailto:${selectedMessage.email}`} className="text-emerald-600 font-bold text-sm flex items-center gap-2 mt-3 hover:underline">
                      <Mail size={14} />
                      {selectedMessage.email}
                    </a>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleDelete(selectedMessage.id)}
                    className="p-4 bg-rose-50 dark:bg-rose-900/20 text-rose-600 rounded-2xl hover:bg-rose-100 dark:hover:bg-rose-900/40 transition-colors"
                  >
                    <Trash2 size={22} />
                  </button>
                  <button
                    onClick={() => setSelectedMessage(null)}
                    className="p-4 bg-slate-50 dark:bg-slate-800 text-slate-400 rounded-2xl hover:text-slate-900 dark:hover:text-white transition-colors"
                  >
                    <X size={22} />
                  </button>
                </div>
              </div>

              <div className="h-px bg-slate-50 dark:bg-slate-800 relative z-10" />

              <div className="space-y-6 relative z-10">
                <div className="flex justify-between items-end">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-[4px]">Inquiry Narrative</p>
                  <p className="text-[10px] font-bold text-slate-500 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded-lg">
                    Received: {new Date(selectedMessage.created_at).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' })}
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 rounded-[40px] p-10 border border-slate-100 dark:border-slate-800">
                  <h4 className="text-xl font-black dark:text-white mb-6 uppercase tracking-tight leading-tight border-b dark:border-slate-700 pb-4">
                    Subject: {selectedMessage.subject}
                  </h4>
                  <p className="text-slate-600 dark:text-slate-300 font-medium leading-relaxed italic text-lg whitespace-pre-wrap">
                    "{selectedMessage.message}"
                  </p>
                </div>
              </div>

              <div className="pt-8 border-t border-slate-50 dark:border-slate-800 flex flex-wrap gap-4 relative z-10">
                {selectedMessage.status !== 'Replied' && (
                  <button
                    onClick={() => updateStatus(selectedMessage.id, 'Replied')}
                    className="flex-1 px-8 py-5 bg-emerald-600 text-white rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-emerald-700 transition-all shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-3"
                  >
                    <CheckCircle2 size={18} /> Mark as Replied
                  </button>
                )}
                <a
                  href={`mailto:${selectedMessage.email}?subject=Re: ${selectedMessage.subject}`}
                  className="flex-1 px-8 py-5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-2xl font-black uppercase tracking-widest text-xs hover:scale-[1.02] transition-all flex items-center justify-center gap-3 shadow-xl"
                >
                  <ExternalLink size={18} /> Open Mail Client
                </a>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-[700px] bg-white dark:bg-slate-900 rounded-[48px] border border-slate-100 dark:border-slate-800 shadow-sm opacity-50 text-center p-12 transition-all">
              <div className="w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6">
                <MessageSquare size={48} className="text-slate-300" />
              </div>
              <h3 className="text-xl font-black uppercase tracking-widest text-slate-400 mb-2">No Record Selected</h3>
              <p className="text-slate-500 font-medium max-w-xs italic text-sm">Select an inquiry from the inbox to audit the communication narrative.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ContactMessages;
