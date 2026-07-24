import React, { useState, useMemo, useEffect } from 'react';
import { SheetRow, ViewMode, UserRole } from '../types';
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
  Lock,
  Unlock,
  Crown,
  Save,
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface DataTableProps {
  headers: string[];
  rows: SheetRow[];
  loading: boolean;
  lang: 'bn' | 'en';
  userRole?: UserRole;
}

export const DataTable: React.FC<DataTableProps> = ({
  headers,
  rows,
  loading,
  lang,
  userRole = 'user',
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hiddenColumns, setHiddenColumns] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sms333_hidden_columns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [showColumnPicker, setShowColumnPicker] = useState(false);
  const [isColsSaved, setIsColsSaved] = useState(false);
  // Default view mode set to 'cards' (Grid View) as requested
  const [viewMode, setViewMode] = useState<ViewMode>('cards');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(25);
  const [copiedRowId, setCopiedRowId] = useState<string | null>(null);

  // Super Admin Column Locking state (persisted in localStorage)
  const [lockedColumns, setLockedColumns] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sms333_locked_columns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const [superAdminHiddenColumns, setSuperAdminHiddenColumns] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('sms333_sa_hidden_columns');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  const toggleLockColumn = (header: string) => {
    if (userRole !== 'super_admin') return;
    setLockedColumns((prev) => {
      const isCurrentlyLocked = !!prev[header];
      const updated = { ...prev, [header]: !isCurrentlyLocked };
      localStorage.setItem('sms333_locked_columns', JSON.stringify(updated));
      
      // When locking, record current hidden state as the fixed locked state
      if (!isCurrentlyLocked) {
        setSuperAdminHiddenColumns((saPrev) => {
          const saUpdated = { ...saPrev, [header]: !!hiddenColumns[header] };
          localStorage.setItem('sms333_sa_hidden_columns', JSON.stringify(saUpdated));
          return saUpdated;
        });
      }
      return updated;
    });
  };

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
      saLockTitle: "Super Admin Column Lock",
      lockedBySa: "Locked by Super Admin",
      saveCols: "Save Columns",
      saveSuccess: "Saved!",
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
      saLockTitle: "সুপার এডমিন কলাম লক",
      lockedBySa: "Super Admin দ্বারা লক করা",
      saveCols: "কলাম সেভ করুন",
      saveSuccess: "সেভ হয়েছে!",
    },
  }[lang];

  const handleSaveColumnSettings = () => {
    // If Super Admin, update superAdminHiddenColumns so locked or hidden columns are hidden for non-admin users
    const updatedSaHidden: Record<string, boolean> = { ...superAdminHiddenColumns };
    if (userRole === 'super_admin') {
      headers.forEach((h) => {
        if (lockedColumns[h] || hiddenColumns[h]) {
          updatedSaHidden[h] = true;
        } else {
          updatedSaHidden[h] = false;
        }
      });
      setSuperAdminHiddenColumns(updatedSaHidden);
    }

    localStorage.setItem('sms333_hidden_columns', JSON.stringify(hiddenColumns));
    localStorage.setItem('sms333_locked_columns', JSON.stringify(lockedColumns));
    localStorage.setItem('sms333_sa_hidden_columns', JSON.stringify(updatedSaHidden));

    // Dispatch custom event so all active dashboards sync live instantly
    window.dispatchEvent(new Event('sms333_columns_updated'));

    setIsColsSaved(true);
    setTimeout(() => {
      setIsColsSaved(false);
      setShowColumnPicker(false);
    }, 1200);
  };

  // Sync locked and hidden column states live across user dashboards
  useEffect(() => {
    const syncColumns = () => {
      try {
        const savedLocked = localStorage.getItem('sms333_locked_columns');
        if (savedLocked) setLockedColumns(JSON.parse(savedLocked));

        const savedSaHidden = localStorage.getItem('sms333_sa_hidden_columns');
        if (savedSaHidden) setSuperAdminHiddenColumns(JSON.parse(savedSaHidden));

        if (userRole !== 'super_admin') {
          const savedHidden = localStorage.getItem('sms333_hidden_columns');
          if (savedHidden) setHiddenColumns(JSON.parse(savedHidden));
        }
      } catch (err) {
        console.error('Error syncing column settings:', err);
      }
    };

    syncColumns(); // Immediate check on mount

    window.addEventListener('sms333_columns_updated', syncColumns);
    window.addEventListener('storage', syncColumns);

    const interval = setInterval(syncColumns, 1000);

    return () => {
      window.removeEventListener('sms333_columns_updated', syncColumns);
      window.removeEventListener('storage', syncColumns);
      clearInterval(interval);
    };
  }, [userRole]);

  // Visible columns calculated based on user role and locks
  const visibleHeaders = useMemo(() => {
    return headers.filter((h) => {
      if (userRole !== 'super_admin') {
        if (lockedColumns[h] || superAdminHiddenColumns[h]) {
          return false;
        }
      }
      return !hiddenColumns[h];
    });
  }, [headers, hiddenColumns, lockedColumns, superAdminHiddenColumns, userRole]);

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
    <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs overflow-hidden text-[10px]">
      {/* Controls Bar */}
      <div className="p-2.5 sm:p-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col md:flex-row md:items-center justify-between gap-2">
        {/* Search Field */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={t.searchPlaceholder}
            className="w-full pl-8 pr-6 py-1.5 text-[10px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all text-slate-800 dark:text-slate-100 shadow-2xs"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] text-slate-400 hover:text-slate-600 bg-slate-200 dark:bg-slate-700 dark:text-slate-300 rounded-full w-3.5 h-3.5 flex items-center justify-center"
            >
              ×
            </button>
          )}
        </div>

        {/* View Switcher, Columns, and Export Actions */}
        <div className="flex flex-wrap items-center gap-1.5 text-[10px]">
          {/* View Mode Toggle */}
          <div className="bg-slate-200/80 dark:bg-slate-800 p-0.5 rounded-lg flex items-center">
            <button
              onClick={() => setViewMode('table')}
              className={`p-1 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'table'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Table View"
            >
              <Table className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'cards'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Card Grid View"
            >
              <LayoutGrid className="w-3 h-3" />
            </button>
            <button
              onClick={() => setViewMode('raw')}
              className={`p-1 rounded text-[10px] font-medium flex items-center space-x-1 transition-all ${
                viewMode === 'raw'
                  ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
              title="Raw JSON View"
            >
              <Code className="w-3 h-3" />
            </button>
          </div>

          {/* Column Picker Button (Super Admin ONLY) */}
          {userRole === 'super_admin' && (
            <div className="relative">
              <button
                onClick={() => setShowColumnPicker(!showColumnPicker)}
                className="flex items-center space-x-1 px-2.5 py-1 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700/80 text-slate-700 dark:text-slate-200 text-[10px] font-medium rounded-lg transition-all shadow-2xs"
              >
                <Layers className="w-3 h-3 text-slate-500 dark:text-slate-400" />
                <span>{t.columns}</span>
                <span className="ml-0.5 px-1 py-0.1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-full text-[9px] font-bold">
                  {visibleHeaders.length}/{headers.length}
                </span>
              </button>

              {/* Column Picker Dropdown */}
              {showColumnPicker && (
                <div className="absolute right-0 mt-1.5 w-60 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-xl z-50 p-2.5 text-[10px]">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 border-b border-slate-100 dark:border-slate-700 font-semibold text-slate-800 dark:text-slate-200">
                    <div className="flex items-center gap-1">
                      <span>{t.columns}</span>
                      <span className="bg-amber-500/20 text-amber-500 border border-amber-500/30 px-1 py-0.1 rounded text-[8px] font-bold flex items-center gap-0.5">
                        <Crown className="w-2.5 h-2.5" /> Lock Control
                      </span>
                    </div>
                    <div className="flex gap-1.5">
                      <button
                        onClick={() => setHiddenColumns({})}
                        className="text-[9px] text-emerald-600 dark:text-emerald-400 hover:underline"
                      >
                        {t.allCols}
                      </button>
                    </div>
                  </div>

                  <div className="max-h-56 overflow-y-auto space-y-1 pr-1">
                    {headers.map((header) => {
                      const isLocked = !!lockedColumns[header];
                      const isVisible = !hiddenColumns[header];

                      return (
                        <div
                          key={header}
                          className={`flex items-center justify-between text-[10px] p-1 rounded transition-colors ${
                            isLocked 
                              ? 'bg-amber-500/10 border border-amber-500/20' 
                              : 'hover:bg-slate-50 dark:hover:bg-slate-700/50'
                          }`}
                        >
                          <label className="flex items-center space-x-1.5 cursor-pointer select-none min-w-0 flex-1">
                            <input
                              type="checkbox"
                              checked={isVisible}
                              onChange={() => toggleColumnHide(header)}
                              className="rounded text-emerald-600 focus:ring-emerald-500 w-3 h-3 disabled:opacity-50"
                            />
                            <span className={`truncate text-slate-700 dark:text-slate-300 ${isLocked ? 'font-semibold text-amber-700 dark:text-amber-400' : ''}`}>
                              {header}
                            </span>
                          </label>

                          {/* Super Admin Lock Button */}
                          <div className="flex items-center gap-1 ml-1 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleLockColumn(header);
                              }}
                              className={`p-0.5 rounded transition-colors ${
                                isLocked
                                  ? 'bg-amber-500 text-white hover:bg-amber-600'
                                  : 'bg-slate-200 dark:bg-slate-700 text-slate-500 hover:text-amber-500'
                              }`}
                              title={isLocked ? 'Unlock Column for users' : 'Lock Column for users'}
                            >
                              {isLocked ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Save Columns Button */}
                  <div className="pt-2 mt-2 border-t border-slate-100 dark:border-slate-700">
                    {isColsSaved ? (
                      <div className="flex items-center justify-center gap-1.5 py-1.5 px-3 bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400 font-bold text-[10px] rounded-lg">
                        <Check className="w-3.5 h-3.5 text-emerald-500" />
                        <span>{t.saveSuccess}</span>
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={handleSaveColumnSettings}
                        className="w-full flex items-center justify-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] rounded-lg transition-colors shadow-xs"
                      >
                        <Save className="w-3.5 h-3.5" />
                        <span>{t.saveCols}</span>
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Export Buttons */}
          <button
            onClick={exportToCSV}
            className="flex items-center space-x-1 px-2.5 py-1 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 dark:hover:bg-emerald-900/80 text-emerald-700 dark:text-emerald-300 text-[10px] font-medium rounded-lg transition-all shadow-2xs"
          >
            <FileSpreadsheet className="w-3 h-3" />
            <span>CSV</span>
          </button>

          <button
            onClick={exportToJSON}
            className="flex items-center space-x-1 px-2.5 py-1 bg-blue-50 dark:bg-blue-950/60 border border-blue-200 dark:border-blue-800 hover:bg-blue-100 dark:hover:bg-blue-900/80 text-blue-700 dark:text-blue-300 text-[10px] font-medium rounded-lg transition-all shadow-2xs"
          >
            <Download className="w-3 h-3" />
            <span>JSON</span>
          </button>
        </div>
      </div>

      {/* Main Table / Grid Content */}
      {loading && rows.length === 0 ? (
        <LoadingSpinner
          message={lang === 'bn' ? 'গুগল শিটের লাইভ ডেটা লোড হচ্ছে...' : 'Loading Google Sheet live data...'}
          submessage={lang === 'bn' ? 'অনুগ্রহ করে অপেক্ষা করুন' : 'Please wait while records update'}
        />
      ) : paginatedRows.length === 0 ? (
        <div className="py-12 text-center text-slate-500 dark:text-slate-400">
          <p className="text-[10px] font-medium">{t.noData}</p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="overflow-x-auto w-full max-w-full">
          <table className="w-full text-left text-[10px] border-collapse min-w-[600px] sm:min-w-full">
            <thead>
              <tr className="bg-slate-100/80 dark:bg-slate-800/80 border-b border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold select-none">
                <th className="py-2 px-2 text-center w-8 text-slate-400 dark:text-slate-500 font-normal border-r border-slate-200/50 dark:border-slate-800/80 text-[10px]">
                  #
                </th>
                {visibleHeaders.map((header) => {
                  const isSorted = sortColumn === header;
                  return (
                    <th
                      key={header}
                      onClick={() => handleSort(header)}
                      className="py-2 px-3 font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700/60 cursor-pointer transition-colors border-r border-slate-200/50 dark:border-slate-800/80 whitespace-nowrap text-[10px]"
                    >
                      <div className="flex items-center justify-between gap-1">
                        <span>{header}</span>
                        <ArrowUpDown
                          className={`w-3 h-3 ${
                            isSorted ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400 opacity-50'
                          }`}
                        />
                      </div>
                    </th>
                  );
                })}
                <th className="py-2 px-2 text-center w-12 text-slate-500 dark:text-slate-400 font-medium text-[10px]">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/70 dark:divide-slate-800/80 text-slate-800 dark:text-slate-200 text-[10px]">
              {paginatedRows.map((row, idx) => {
                const rowIndex = (currentPage - 1) * pageSize + idx + 1;
                return (
                  <tr
                    key={row._id || idx}
                    className="hover:bg-emerald-50/40 dark:hover:bg-emerald-950/30 transition-colors group"
                  >
                    <td className="py-2 px-2 text-center text-slate-400 dark:text-slate-500 font-mono text-[10px] border-r border-slate-200/50 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
                      {rowIndex}
                    </td>
                    {visibleHeaders.map((header) => (
                      <td
                        key={header}
                        className="py-2 px-3 border-r border-slate-200/40 dark:border-slate-800/60 max-w-[160px] truncate text-[10px]"
                        title={row[header] || ''}
                      >
                        {row[header] !== undefined && row[header] !== '' ? (
                          row[header]
                        ) : (
                          <span className="text-slate-300 dark:text-slate-600 italic">-</span>
                        )}
                      </td>
                    ))}
                    <td className="py-2 px-2 text-center">
                      <button
                        onClick={() => copyRowToClipboard(row)}
                        className="p-1 text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-100/60 dark:hover:bg-emerald-950/60 rounded transition-colors"
                        title={copiedRowId === row._id ? t.copied : t.copyRow}
                      >
                        {copiedRowId === row._id ? (
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                        ) : (
                          <Copy className="w-3 h-3" />
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
        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {paginatedRows.map((row, idx) => (
            <div
              key={row._id || idx}
              className="bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700/80 p-3 hover:border-emerald-300 dark:hover:border-emerald-500 transition-all shadow-2xs text-[10px]"
            >
              <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-700 pb-1.5 mb-2">
                <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100/80 dark:bg-emerald-950/80 px-1.5 py-0.2 rounded">
                  Row #{(currentPage - 1) * pageSize + idx + 1}
                </span>
                <button
                  onClick={() => copyRowToClipboard(row)}
                  className="flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                >
                  {copiedRowId === row._id ? (
                    <Check className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3" />
                  )}
                  <span>{copiedRowId === row._id ? t.copied : t.copyRow}</span>
                </button>
              </div>

              <div className="space-y-1.5 text-[10px]">
                {visibleHeaders.map((header) => (
                  <div key={header} className="flex justify-between gap-2">
                    <span className="font-semibold text-slate-500 dark:text-slate-400 shrink-0">{header}:</span>
                    <span className="text-slate-900 dark:text-slate-200 font-medium text-right break-words text-[10px]">
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
        <div className="p-3 bg-slate-900 text-emerald-400 font-mono text-[10px] overflow-x-auto max-h-[500px]">
          <pre>
            {JSON.stringify(
              paginatedRows.map((r) => {
                const clean: Record<string, any> = {};
                visibleHeaders.forEach((h) => {
                  clean[h] = r[h];
                });
                return clean;
              }),
              null,
              2
            )}
          </pre>
        </div>
      )}

      {/* Pagination Footer */}
      <div className="p-2.5 sm:p-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-600 dark:text-slate-400">
        <div className="flex items-center space-x-1.5">
          <span>{t.rowsPerPage}</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 rounded px-1.5 py-0.5 text-[10px] focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={-1}>All ({sortedRows.length})</option>
          </select>
        </div>

        <div className="text-[10px]">
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

        <div className="flex items-center space-x-1">
          <button
            onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
            disabled={currentPage === 1}
            className="p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
          <span className="px-1.5 font-medium text-[10px]">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="p-1 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 disabled:opacity-40 transition-colors"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
