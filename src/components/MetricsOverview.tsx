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
      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-emerald-50 rounded-xl text-emerald-600">
          <Table className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t.totalRows}</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{totalRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-blue-50 rounded-xl text-blue-600">
          <Filter className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t.filteredRows}</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{filteredRows.toLocaleString()}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-purple-50 rounded-xl text-purple-600">
          <Columns className="w-5 h-5" />
        </div>
        <div>
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t.totalCols}</p>
          <p className="text-xl font-bold text-slate-900 mt-0.5">{totalColumns}</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center space-x-3.5">
        <div className="p-3 bg-amber-50 rounded-xl text-amber-600">
          <Clock className="w-5 h-5" />
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">{t.lastUpdated}</p>
          <p className="text-xs font-semibold text-slate-800 mt-1 truncate">
            {updatedAt ? new Date(updatedAt).toLocaleTimeString() : 'Just now'}
          </p>
        </div>
      </div>
    </div>
  );
};
