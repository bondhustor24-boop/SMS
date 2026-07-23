import React, { useState, useMemo } from 'react';
import { SheetRow, ViewMode } from '../types';
import {
  Search,
  ArrowUpDown,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  ChevronLeft,
  ChevronRight,
  LayoutGrid,
  Table,
  Code,
  FileSpreadsheet,
  Layers,
} from 'lucide-react';

interface DataTableProps {
  headers: string[];
  rows: SheetRow[];
  loading: boolean;
  lang: 'bn' | 'en';
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  rows,
  loading,
  lang,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>({});
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [viewMode, setViewMode] = useState<ViewMode>('table');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Translation strings
  const t = {
    en: {
      searchPlaceholder: "Search across all cells...",
      columns: "Columns",
      exportCsv: "Export CSV",
      exportJson: "Export JSON",
      rowsPerPage: "Rows per page:",
      showing: "Showing",
      to: "to",
      of: "of",
      entries: "entries",
      prev: "Prev",
      next: "Next",
      noData: "No data found matching your search.",
      copyRow: "Copy Row",
      copied: "Copied!",
      allCols: "Select All",
      hideAllCols: "Deselect All",
    },
    bn: {
      searchPlaceholder: "যেকোনো তথ্য দিয়ে খুঁজুন (Search)...",
      columns: "কলামসমূহ",
      exportCsv: "সিএসভি এক্সপোর্ট (CSV)",
      exportJson: "জেসন এক্সপোর্ট (JSON)",
      rowsPerPage: "প্রতি পৃষ্ঠায় সারি:",
      showing: "প্রদর্শন",
      to: "থেকে",
      of: "মোট",
      entries: "টি তথ্য",
      prev: "পূর্ববর্তী",
      next: "পরবর্তী",
      noData: "আপনার অনুসন্ধানের সাথে কোন তথ্য পাওয়া যায়নি।",
      copyRow: "সারি কপি করুন",
      copied: "কপি হয়েছে!",
      allCols: "সব সিলেক্ট করুন",
      hideAllCols: "সব তুলে দিন",
    },
  }[lang];

  // Visible columns
  const visibleHeaders = useMemo(() => {
    return headers.filter((h) => !hiddenColumns[h]);
  }, [headers, hiddenColumns]);

  // Filtered rows
  const filteredRows = useMemo(() => {
    if (!searchTerm.trim()) return rows;
    const term = searchTerm.toLowerCase();

    return rows.filter((row) => {
      return headers.some((header) => {
        const val = row[header];
        return val && String(val).toLowerCase().includes(term);
      });
    });
  }, [rows, searchTerm, headers]);

  // Sorted rows
  const sortedRows = useMemo(() => {
    if (!sortColumn) return filteredRows;

    return [...filteredRows].sort((a, b) => {
      const valA = a[sortColumn] || '';
      const valB = b[sortColumn] || '';

      // Check numeric comparison
      const numA = Number(valA);
      const numB = Number(valB);
      if (!isNaN(numA) && !isNaN(numB) && valA.trim() !== '' && valB.trim() !== '') {
        return sortDirection === 'asc' ? numA - numB : numB - numA;
      }

      // String comparison
      return sortDirection === 'asc'
        ? String(valA).localeCompare(String(valB))
        : String(valB).localeCompare(String(valA));
    });
  }, [filteredRows, sortColumn, sortDirection]);

  // Paginated rows
  const paginatedRows = useMemo(() => {
    if (pageSize === -1) return sortedRows;
    const start = (currentPage - 1) * pageSize;
    return sortedRows.slice(start, start + pageSize);
  }, [sortedRows, currentPage, pageSize]);

  const totalPages = pageSize === -1 ? 1 : Math.ceil(sortedRows.length / pageSize) || 1;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      if (sortDirection === 'asc') {
        setSortDirection('desc');
      } else {
        setSortColumn(null);
        setSortDirection('asc');
      }
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const toggleColumnHide = (column: string) => {
    setHiddenColumns((prev) => ({
      ...prev,
      [column]: !prev[column],
    }));
  };

  const copyRowToClipboard = (row: SheetRow) => {
    const cleanRow = { ...row };
    delete cleanRow._id;
    navigator.clipboard.writeText(JSON.stringify(cleanRow, null, 2));
    setCopiedRowId(row._id);
    setTimeout(() => setCopiedRowId(null), 2000);
  };

  const exportToCSV = () => {
    const csvHeader = visibleHeaders.join(',') + '\n';
    const csvRows = sortedRows
      .map((row) =>
        visibleHeaders
          .map((h) => {
            const val = (row[h] || '').replace(/"/g, '""');
            return `"${val}"`;
          })
          .join(',')
      )
      .join('\n');

    const blob = new Blob([csvHeader + csvRows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SMS333_Sheet_Export_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToJSON = () => {
    const cleanData = sortedRows.map((row) => {
      const obj: Record<string, string> = {};
      visibleHeaders.forEach((h) => {
        obj[h] = row[h] || '';
      });
      return obj;
    });

    const blob = new Blob([JSON.stringify(cleanData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `SMS333_Sheet_Export_${Date.now()}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden">
      {/* Controls Bar */}
      <div className="p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 hover:text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-full w-4 h-4 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* View Switcher, Columns, and Export Actions */}
        <div className="flex flex-wrap items-center gap-2">
          {/* View Mode Toggle */}
          <div className="bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-xl flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <Table className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`p-1.5 rounded-lg text-xs font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Raw JSON View"
            >
              <Code className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Column Picker Button */}
          <div className="relative">
            <button
              onClick={() => setShowColumnPicker(!showColumnPicker)}
              className="flex items-center space-x-1.5 px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-xs font-medium rounded-xl transition-all shadow-2xs"
            >
              <Layers className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t.columns}</span>
              <span className="ml-1 px-1.5 py-0.2 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[10px] font-bold">
                {visibleHeaders.length}/{headers.length}
              </span>
            </button>

            {/* Column Picker Dropdown */}
            {showColumnPicker && (
              <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl z-50 p-3">
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-700 text-xs font-semibold text-slate-800 dark:text-slate-200">
                  <span>{t.columns}</span>
                  <div className="flex gap-2">
                    <button
                      onClick={() => setHiddenColumns({})}
                      className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline"
                    >
                      {t.allCols}
                    </button>
                  </div>
                </div>

                <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                  {headers.map((header) => {
                    const isVisible = !hiddenColumns[header];
                    return (
                      <label
                        key={header}
                        className="flex items-center space-x-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 p-1.5 rounded-lg cursor-pointer select-none"
                      >
                        <input
                          type="checkbox"
                          checked={isVisible}
                          onChange={() => toggleColumnHide(header)}
                          className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                        />
                        <span className="truncate">{header}</span>
                      </label>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Export Dropdown / Buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1 px-3 py-1.5 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-xs font-medium rounded-xl transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
            <span className="sm:hidden">CSV</span>
          </button>

          <button
            onClick={exportToJSON}
            className="flex items-center space-x-1 px-3 py-1.5 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-xs font-medium rounded-xl transition-all shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{t.exportJson}</span>
            <span className="sm:hidden">JSON</span>
          </button>
        </div>
      </div>

      {/* Main Table / Grid Content */}
      {loading && rows.length === 0 ? (
        <div className="py-20 text-center">
          <div className="inline-block w-8 h-8 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3"></div>
          <p className="text-xs font-medium text-slate-500 dark:text-slate-400">Loading Google Sheet data...</p>
        </div>
      ) : paginatedRows.length === 0 ? (
        <div className="py-16 text-center text-slate-500 dark:text-slate-400">
          <p className="text-sm font-medium">{t.noData}</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold select-none">
                <th className="py-3 px-3 text-center w-12 text-slate-400 dark:text-slate-500 font-normal border-r border-slate-200/50 dark:border-slate-800/80">
                  #
                </th>
                {visibleHeaders.map((header) => {
                  const isSorted = sortColumn === header;
                  return (
                    <th
                      key={header}
                      onClick={() => handleSort(header)}
                      className="py-3 px-4 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors border-r border-slate-200/50 dark:border-slate-800/80 whitespace-nowrap"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{header}</span>
                        <ArrowUpDown
                          className={`w-3.5 h-3.5 ${
                            isSorted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 opacity-50'
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
                <th className="py-3 px-3 text-center w-16 text-slate-500 dark:text-slate-400 font-medium">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200">
              {paginatedRows.map((row, idx) => {
                const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row._id || idx}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors group"
                  >
                    <td className="py-2.5 px-3 text-center text-slate-400 dark:text-slate-500 font-mono text-xs border-r border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                      {rowIndex}
                    </td>
                    {visibleHeaders.map((header) => (
                      <td
                        key={header}
                        className="py-2.5 px-4 border-r border-slate-200/40 dark:border-slate-800/60 max-w-xs truncate"
                        title={row[header] || ''}
                      >
                        {row[header] !== undefined && row[header] !== '' ? (
                          row[header]
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 italic">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={() => copyRowToClipboard(row)}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/60 rounded-lg transition-colors"
                        title={copiedRowId === row._id ? t.copied : t.copyRow}
                      >
                        {copiedRowId === row._id ? (
                          <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {paginatedRows.map((row, idx) => (
            <div
              key={row._id || idx}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl border border-slate-200 dark:border-slate-700/80 p-4 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all shadow-2xs"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-2 mb-3">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-2 py-0.5 rounded-full">
                  Row #{(currentPage - 1) * pageSize + idx + 1}
                </span>
                <button
                  onClick={() => copyRowToClipboard(row)}
                  className="flex items-center space-x-1 text-xs text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {copiedRowId === row._id ? (
                    <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  <span>{copiedRowId === row._id ? t.copied : t.copyRow}</span>
                </button>
              </div>

              <div className="space-y-2 text-xs">
                {visibleHeaders.map((header) => (
                  <div key={header} className="flex justify-between gap-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">{header}:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium text-right break-words">
                      {row[header] || '-'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Raw JSON view mode */
        <div className="p-4 bg-slate-900 text-emerald-400 font-mono text-xs overflow-x-auto max-h-[600px]">
          <pre>{JSON.stringify(paginatedRows, null, 2)}</pre>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-2">
          <span>{t.rowsPerPage}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded-lg px-2 py-1 text-xs focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>All ({sortedRows.length})</option>
          </select>
        </div>

        <div>
          {t.showing}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {sortedRows.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}
          </span>{' '}
          {t.to}{' '}
          <span className="font-semibold text-slate-900 dark:text-slate-100">
            {pageSize === -1
              ? sortedRows.length
              : Math.min(currentPage * pageSize, sortedRows.length)}
          </span>{' '}
          {t.of} <span className="font-semibold text-slate-900 dark:text-slate-100">{sortedRows.length}</span>{' '}
          {t.entries}
        </div>

        <div className="flex items-center space-x-1.5">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2 font-medium">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
