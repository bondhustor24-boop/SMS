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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 sm:gap-3 mb-4">
      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-2.5">
        <div className="p-2 bg-emerald-50 dark:bg-emerald-950/60 rounded-lg text-emerald-600 dark:text-emerald-400 shrink-0">
          <Table className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.totalRows}</p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-2.5">
        <div className="p-2 bg-blue-50 dark:bg-blue-950/60 rounded-lg text-blue-600 dark:text-blue-400 shrink-0">
          <Filter className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.filteredRows}</p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{filteredRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-2.5">
        <div className="p-2 bg-purple-50 dark:bg-purple-950/60 rounded-lg text-purple-600 dark:text-purple-400 shrink-0">
          <Columns className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.totalCols}</p>
          <p className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalColumns}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-2.5 sm:p-3.5 rounded-xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-2.5">
        <div className="p-2 bg-amber-50 dark:bg-amber-950/60 rounded-lg text-amber-600 dark:text-amber-400 shrink-0">
          <Clock className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <p className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider truncate">{t.lastUpdated}</p>
          <p className="text-[10px] sm:text-xs font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
            {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  );
};
