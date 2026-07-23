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
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
          <Table className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.totalRows}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
          <Filter className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.filteredRows}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{filteredRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-purple-50 dark:bg-purple-950/60 rounded-xl text-purple-600 dark:text-purple-400">
          <Columns className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.totalCols}</p>
          <p className="text-xl font-bold text-slate-900 dark:text-slate-100 mt-0.5">{totalColumns}</p>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{t.lastUpdated}</p>
          <p className="text-xs font-semibold text-slate-800 dark:text-slate-200 mt-1 truncate">
            {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  );
};
