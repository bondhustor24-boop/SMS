import React, { useState, useEffect, useCallback, useRef } from 'react';
import { SheetDataResponse, SheetRow, UserSession, UserRole } from './types';
import { fetchGoogleSheetData } from './utils/sheetFetcher';
import { Header } from './components/Header';
import { SheetUrlInput } from './components/SheetUrlInput';
import { MetricsOverview } from './components/MetricsOverview';
import { RecentSmsWidget } from './components/RecentSmsWidget';
import { DataTable } from './components/DataTable';
import { AccessInstructionsModal } from './components/AccessInstructionsModal';
import { LoginModal } from './components/LoginModal';
import { Sparkles, AlertCircle, RefreshCw, Layers } from 'lucide-react';

const DEFAULT_SHEET_URL =
  'https://docs.google.com/spreadsheets/d/1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM/edit?gid=193362198#gid=193362198';

export default function App() {
  const [sheetUrl, setSheetUrl] = useState<string>(() => {
    return localStorage.getItem('sms333_sheet_url') || DEFAULT_SHEET_URL;
  });
  const [user, setUser] = useState<UserSession | null>(() => {
    const saved = localStorage.getItem('sms333_user_session');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return null;
      }
    }
    return null;
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [data, setData] = useState<SheetDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [accessError, setAccessError] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [autoRefreshInterval, setAutoRefreshInterval] = useState<number>(5);
  const [lang, setLang] = useState<'bn' | 'en'>('bn');
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem('sms333_theme') as 'light' | 'dark') || 'light';
  });

  // Sync theme class to html element & localStorage
  useEffect(() => {
    localStorage.setItem('sms333_theme', theme);
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  const handleLoginSuccess = (userSession: UserSession) => {
    setUser(userSession);
    localStorage.setItem('sms333_user_session', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('sms333_user_session');
  };

  // Save active sheet URL in local storage
  useEffect(() => {
    localStorage.setItem('sms333_sheet_url', sheetUrl);
  }, [sheetUrl]);

  const dataRef = useRef<SheetDataResponse | null>(null);
  dataRef.current = data;

  const fetchSheetData = useCallback(async (targetUrl: string, isBackground = false) => {
    const hasExistingData = dataRef.current !== null;

    if (!hasExistingData || !isBackground) {
      setLoading(true);
    } else {
      setIsSyncing(true);
    }
    setAccessError(false);
    setErrorMessage(null);

    try {
      const json = await fetchGoogleSheetData(targetUrl);

      if (json.rows && json.rows.length > 0) {
        setData(json);
      }

      if (json.error === 'ACCESS_RESTRICTED' && (!json.rows || json.rows.length === 0)) {
        setAccessError(true);
      } else if (json.error && (!json.rows || json.rows.length === 0)) {
        setErrorMessage(json.message || 'Failed to fetch Google Sheet data.');
      }
    } catch (error: any) {
      console.error('Error fetching sheet data:', error);
      if (!dataRef.current) {
        setErrorMessage(
          error?.message || 'Network error while reaching server or loading Google Sheet.'
        );
      }
    } finally {
      setLoading(false);
      setIsSyncing(false);
    }
  }, []);

  // Initial load
  useEffect(() => {
    fetchSheetData(sheetUrl, false);
  }, [sheetUrl]);

  // Auto Refresh Timer
  useEffect(() => {
    if (autoRefreshInterval <= 0) return;

    const timer = setInterval(() => {
      fetchSheetData(sheetUrl, true);
    }, autoRefreshInterval * 1000);

    return () => clearInterval(timer);
  }, [autoRefreshInterval, fetchSheetData, sheetUrl]);

  const handleLoadNewUrl = (newUrl: string) => {
    setSheetUrl(newUrl);
    fetchSheetData(newUrl);
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 font-sans selection:bg-emerald-500 selection:text-white pb-12 transition-colors duration-200">
      {/* Top Header */}
      <Header
        sheetTitle="SMS333 Google Sheet"
        sheetUrl={data?.sheetUrl || sheetUrl}
        lastUpdated={data?.updatedAt || null}
        loading={loading}
        isSyncing={isSyncing}
        user={user}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onRefresh={() => fetchSheetData(sheetUrl, false)}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      <main className="max-w-7xl mx-auto px-2.5 sm:px-6 pt-3 sm:pt-6">
        {!user ? (
          /* Locked Dashboard Message & Login Screen */
          <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-6">
            <LoginModal
              isOpen={true}
              onLoginSuccess={handleLoginSuccess}
              lang={lang}
              currentSheetUrl={sheetUrl}
              currentSheetRows={data?.rows || []}
            />
          </div>
        ) : (
          /* Full Unlocked Dashboard Content */
          <>
            {/* Google Sheet URL Bar & Controls */}
            <SheetUrlInput
              currentUrl={sheetUrl}
              onLoadUrl={handleLoadNewUrl}
              lang={lang}
              userRole={user.role}
            />

            {/* Access Restricted Warning Banner / Instructions */}
            {accessError && (
              <AccessInstructionsModal
                sheetUrl={data?.sheetUrl || sheetUrl}
                onRetry={() => fetchSheetData(sheetUrl)}
                lang={lang}
              />
            )}

            {/* General Error Alert */}
            {errorMessage && !accessError && (
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6 flex items-center space-x-3 text-red-800 text-xs sm:text-sm">
                <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
                <div className="flex-1">
                  <p className="font-bold">Error Loading Sheet</p>
                  <p>{errorMessage}</p>
                </div>
                <button
                  onClick={() => fetchSheetData(sheetUrl)}
                  className="px-3 py-1.5 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium text-xs transition-colors shrink-0"
                >
                  Try Again
                </button>
              </div>
            )}

            {/* Metrics Overview Cards */}
            <MetricsOverview
              totalRows={data?.totalRows || 0}
              filteredRows={data?.rows?.length || 0}
              totalColumns={data?.headers?.length || 0}
              updatedAt={data?.updatedAt || null}
              lang={lang}
            />

            {/* Featured Last 3 SMS & Timestamps Widget */}
            <RecentSmsWidget
              rows={data?.rows || []}
              headers={data?.headers || []}
              loading={loading}
              lang={lang}
            />

            {/* Interactive Data Table & Controls */}
            <DataTable
              headers={data?.headers || []}
              rows={data?.rows || []}
              loading={loading}
              lang={lang}
            />
          </>
        )}
      </main>
    </div>
  );
}
