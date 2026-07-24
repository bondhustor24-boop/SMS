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
import { DeviceManagementModal } from './components/DeviceManagementModal';
import { FirebaseUserManagerModal } from './components/FirebaseUserManagerModal';
import { UserProfileModal } from './components/UserProfileModal';
import { seedDefaultSuperAdminInFirebase } from './services/firebaseUserService';
import { getFirebaseUserNotifications, markFirebaseNotificationAsRead } from './services/firebaseDeviceService';

import {
  isUserBlocked,
  getStoredSessions,
  getUserUnreadNotifications,
  markNotificationAsRead,
  getDismissedNotifIds,
  addDismissedNotifId,
  DeviceNotification,
} from './utils/deviceManager';
import { Sparkles, AlertCircle, RefreshCw, Layers, Bell, X } from 'lucide-react';

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
  const [isDeviceModalOpen, setIsDeviceModalOpen] = useState<boolean>(false);
  const [isFirebaseModalOpen, setIsFirebaseModalOpen] = useState<boolean>(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState<boolean>(false);

  // Initialize Firebase default Super Admin if needed
  useEffect(() => {
    seedDefaultSuperAdminInFirebase();
  }, []);

  const [unreadNotifs, setUnreadNotifs] = useState<DeviceNotification[]>([]);
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

  const [isLoggingOut, setIsLoggingOut] = useState<boolean>(false);

  // Periodic check if current logged in user has been blocked or remotely logged out by Super Admin
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      // 1. Check if user is blocked
      if (isUserBlocked(user.username)) {
        alert(
          lang === 'bn'
            ? 'আপনার অ্যাকাউন্টটি সুপার এডমিন দ্বারা ব্লক করা হয়েছে!'
            : 'Your account has been BLOCKED by Super Admin!'
        );
        handleLogout();
        return;
      }

      // 2. Check if user session was remotely terminated
      if (user.sessionId) {
        const sessions = getStoredSessions();
        const currentSess = sessions.find((s) => s.id === user.sessionId);
        if (currentSess && currentSess.status === 'logged_out') {
          alert(
            lang === 'bn'
              ? 'আপনার ডিভাইসটি সুপার এডমিন দ্বারা রিমোট লগআউট করা হয়েছে!'
              : 'Your device was remotely logged out by Super Admin!'
          );
          handleLogout();
          return;
        }
      }

      // 3. Check for Super Admin Notifications (Local + Firebase)
      const notifs = getUserUnreadNotifications(user.username);
      const dismissedIds = getDismissedNotifIds();

      getFirebaseUserNotifications(user.username).then((fbNotifs) => {
        const unreadFbNotifs = fbNotifs.filter((n) => !dismissedIds.includes(n.id) && !n.read);
        const combined = [...notifs, ...unreadFbNotifs];
        
        // Filter out dismissed or already read notifications
        const activeNotifs = combined.filter((n) => !dismissedIds.includes(n.id));
        
        // Deduplicate by ID or timestamp message match
        const unique = Array.from(
          new Map(activeNotifs.map((item) => [item.id || `${item.timestamp}-${item.message}`, item])).values()
        );
        setUnreadNotifs(unique);
      }).catch(() => {
        if (notifs.length > 0) setUnreadNotifs(notifs);
      });
    }, 2000);

    return () => clearInterval(interval);
  }, [user, lang]);

  const handleLoginSuccess = (userSession: UserSession) => {
    setUser(userSession);
    localStorage.setItem('sms333_user_session', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setIsLoggingOut(true);
    setTimeout(() => {
      setUser(null);
      localStorage.removeItem('sms333_user_session');
      setIsDeviceModalOpen(false);
      setIsLoggingOut(false);
    }, 350);
  };

  const handleDismissNotif = (notifId: string) => {
    markNotificationAsRead(notifId);
    markFirebaseNotificationAsRead(notifId);
    addDismissedNotifId(notifId);
    setUnreadNotifs((prev) => prev.filter((n) => n.id !== notifId));
  };

  const handleClearAllNotifs = () => {
    unreadNotifs.forEach((n) => {
      markNotificationAsRead(n.id);
      markFirebaseNotificationAsRead(n.id);
      addDismissedNotifId(n.id);
    });
    setUnreadNotifs([]);
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
        isLoggingOut={isLoggingOut}
        user={user}
        unreadNotifs={unreadNotifs}
        onDismissNotif={handleDismissNotif}
        onClearAllNotifs={handleClearAllNotifs}
        onLoginClick={() => setIsLoginModalOpen(true)}
        onLogoutClick={handleLogout}
        onDevicesClick={() => setIsDeviceModalOpen(true)}
        onFirebaseUsersClick={() => setIsFirebaseModalOpen(true)}
        onProfileClick={() => setIsProfileModalOpen(true)}
        onRefresh={() => fetchSheetData(sheetUrl, false)}
        autoRefreshInterval={autoRefreshInterval}
        setAutoRefreshInterval={setAutoRefreshInterval}
        lang={lang}
        setLang={setLang}
        theme={theme}
        setTheme={setTheme}
      />

      {/* Super Admin Firebase User Database Management Modal */}
      {user?.role === 'super_admin' && (
        <FirebaseUserManagerModal
          isOpen={isFirebaseModalOpen}
          onClose={() => setIsFirebaseModalOpen(false)}
          lang={lang}
        />
      )}

      {/* User Profile Edit Modal */}
      {user && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={user}
          onUpdateSessionUser={(newUsername) => {
            const updated = { ...user, username: newUsername };
            setUser(updated);
            localStorage.setItem('sms333_user_session', JSON.stringify(updated));
          }}
          lang={lang}
        />
      )}

      {/* Super Admin Device & Session Management Modal */}
      {user?.role === 'super_admin' && (
        <DeviceManagementModal
          isOpen={isDeviceModalOpen}
          onClose={() => setIsDeviceModalOpen(false)}
          currentUser={user}
          lang={lang}
        />
      )}


      {/* Real-Time Live Notification Alert Modal */}
      {unreadNotifs.length > 0 && (
        <div className="fixed inset-0 z-70 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 border border-blue-500/50 rounded-2xl p-5 max-w-md w-full shadow-2xl space-y-4 relative">
            {/* Top Right Close Button */}
            <button
              onClick={handleClearAllNotifs}
              className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 bg-slate-100 dark:bg-slate-800 rounded-xl transition-colors"
              title={lang === 'bn' ? 'বন্ধ করুন' : 'Close Notification'}
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center space-x-3 text-blue-500 border-b border-slate-200 dark:border-slate-800 pb-3 pr-8">
              <div className="p-2 bg-blue-500/10 rounded-xl">
                <Bell className="w-6 h-6 text-blue-500 animate-bounce" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm sm:text-base">
                  {lang === 'bn' ? 'সুপার এডমিন বার্তা / নোটিফিকেশন' : 'Super Admin Alert Notification'}
                </h3>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'এডমিন আপনার সেশনে বার্তা পাঠিয়েছেন' : 'Admin sent an official notification to your device'}
                </p>
              </div>
            </div>

            <div className="space-y-3 max-h-[60vh] overflow-y-auto">
              {unreadNotifs.map((notif) => (
                <div
                  key={notif.id}
                  className="p-3 bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/50 rounded-xl text-xs space-y-1.5 relative group"
                >
                  <div className="flex items-center justify-between text-[10px] text-blue-600 dark:text-blue-400 font-bold">
                    <span>Sender: {notif.senderUsername}</span>
                    <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                  </div>
                  <p className="text-slate-800 dark:text-slate-100 font-medium whitespace-pre-wrap pr-4">{notif.message}</p>
                  
                  {/* Single Item Dismiss */}
                  <button
                    onClick={() => handleDismissNotif(notif.id)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-red-500 transition-colors"
                    title="Dismiss"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={handleClearAllNotifs}
              className="w-full py-2 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl transition-colors shadow-xs flex items-center justify-center space-x-1.5"
            >
              <X className="w-4 h-4" />
              <span>{lang === 'bn' ? 'বুঝেছি / পঠিত হিসাবে বন্ধ করুন' : 'Acknowledge & Close All'}</span>
            </button>
          </div>
        </div>
      )}

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
            {/* Google Sheet URL Bar & Controls (Super Admin Only) */}
            {user.role === 'super_admin' && (
              <SheetUrlInput
                currentUrl={sheetUrl}
                onLoadUrl={handleLoadNewUrl}
                lang={lang}
                userRole={user.role}
              />
            )}

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
              userRole={user.role}
            />

            {/* Interactive Data Table & Controls */}
            <DataTable
              headers={data?.headers || []}
              rows={data?.rows || []}
              loading={loading}
              lang={lang}
              userRole={user.role}
            />
          </>
        )}
      </main>
    </div>
  );
}
