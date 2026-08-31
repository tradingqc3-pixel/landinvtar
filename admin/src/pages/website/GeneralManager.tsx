import React from 'react';
import { useParams } from 'react-router-dom';
import SectionHeader from '../../components/SectionHeader';
import {
  Globe, ImagePlus, Rss, MessageSquareQuote,
  Mail, UserPlus, Search, UploadCloud, Menu,
  Layout, LineChart, Share2, AlertCircle
} from 'lucide-react';

const GeneralManager = () => {
  const { module } = useParams();

  return (
    <div className="space-y-6">
      <SectionHeader
        title="Module Deprecated"
        subtitle="This generic module has been replaced by specific feature controllers."
        icon={AlertCircle}
      />
      <div className="bg-white dark:bg-slate-900 rounded-[40px] p-20 border border-slate-100 dark:border-slate-800 shadow-xl flex flex-col items-center text-center">
         <p className="text-slate-500 font-bold italic">Please use the specific sidebar links for direct CRUD operations.</p>
      </div>
    </div>
  );
};

export default GeneralManager;
