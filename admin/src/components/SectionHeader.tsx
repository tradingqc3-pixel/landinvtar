import React from 'react';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  icon: React.ElementType;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, subtitle, icon: Icon }) => (
  <div className="flex items-center gap-4 mb-8">
    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-sm border border-emerald-500/10">
      <Icon size={24} />
    </div>
    <div>
      <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tighter uppercase tracking-[2px]">{title}</h2>
      {subtitle && <p className="text-sm font-medium text-slate-500 dark:text-slate-400 italic">{subtitle}</p>}
    </div>
  </div>
);

export default SectionHeader;
