import React from 'react';
import { Table, Columns, Filter, Clock } from 'lucide-react';

interface MetricsOverviewProps {
  totalRows: number;
  filteredRows: number;
  totalColumns: number;
  updatedAt: string | null;
  lang: 'bn' | 'en';
}

export const MetricsOverview: React.FC<MetricsOverviewProps> = ({
  totalRows,
  filteredRows,
  totalColumns,
  updatedAt,
  lang,
}) => {
  const t = {
    en: {
      totalRows: "Total Rows",
      filteredRows: "Filtered Matches",
      totalCols: "Total Columns",
      lastUpdated: "Last Refreshed",
      liveStatus: "Active Sheet",
    },
    bn: {
      totalRows: "মোট সারি (Rows)",
      filteredRows: "ফিল্টার করা তথ্য",
      totalCols: "মোট কলাম (Columns)",
      lastUpdated: "সর্বশেষ সিঙ্ক",
      liveStatus: "অ্যাক্টিভ শিট",
    },
  }[lang];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 mb-4">
      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center space-x-3">
        <div className="p-2.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/20 shrink-0">
          <Table className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.totalRows}</p>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">{totalRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center space-x-3">
        <div className="p-2.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-xl border border-blue-500/20 shrink-0">
          <Filter className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.filteredRows}</p>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">{filteredRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center space-x-3">
        <div className="p-2.5 bg-purple-500/10 text-purple-600 dark:text-purple-400 rounded-xl border border-purple-500/20 shrink-0">
          <Columns className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.totalCols}</p>
          <p className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 tracking-tight mt-0.5">{totalColumns}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-3 sm:p-4 rounded-2xl border border-slate-200/90 dark:border-slate-800 shadow-xs hover:shadow-md transition-all flex items-center space-x-3">
        <div className="p-2.5 bg-amber-500/10 text-amber-600 dark:text-amber-400 rounded-xl border border-amber-500/20 shrink-0">
          <Clock className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.lastUpdated}</p>
          <p className="text-xs sm:text-sm font-bold text-slate-800 dark:text-slate-200 mt-0.5 truncate font-mono">
            {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  );
};
