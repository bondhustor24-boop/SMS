import React from 'react';
import { RefreshCw, ExternalLink, ShieldCheck, Globe, Database, User, LogIn, LogOut, Crown, Lock } from 'lucide-react';
import { UserSession } from '../types';

interface HeaderProps {
  sheetTitle: string;
  sheetUrl: string;
  lastUpdated: string | null;
  loading: boolean;
  isSyncing?: boolean;
  user: UserSession | null;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onRefresh: () => void;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (seconds: number) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
}

export const Header: React.FC<HeaderProps> = ({
  sheetTitle,
  sheetUrl,
  lastUpdated,
  loading,
  isSyncing = false,
  user,
  onLoginClick,
  onLogoutClick,
  onRefresh,
  autoRefreshInterval,
  setAutoRefreshInterval,
  lang,
  setLang,
}) => {
  const t = {
    en: {
      title: "SMS333 Google Sheet Live Viewer",
      subtitle: "Real-time web display and data viewer for Google Sheets",
      openInSheets: "Open Google Sheet",
      lastSync: "Last Synced",
      autoRefresh: "Auto Sync",
      off: "Off",
      secs: "s",
      login: "Login",
      logout: "Logout",
    },
    bn: {
      title: "SMS333 গুগল শিট লাইভ ভিউয়ার",
      subtitle: "গুগল শিটের তথ্য ওয়েবে লাইভ প্রদর্শন ও বিশ্লেষণ",
      openInSheets: "গুগল শিটে খুলুন",
      lastSync: "সর্বশেষ সিঙ্ক",
      autoRefresh: "অটো সিঙ্ক",
      off: "বন্ধ",
      secs: "সেকেন্ড",
      login: "লগইন",
      logout: "লগআউট",
    },
  }[lang];

  return (
    <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          {/* Brand & Status */}
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-lg font-bold tracking-tight text-slate-100">
                  {sheetTitle || t.title}
                </h1>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'} mr-1.5`}></span>
                  {isSyncing ? (lang === 'bn' ? 'সিঙ্ক হচ্ছে...' : 'Syncing...') : 'Live'}
                </span>
              </div>
              <p className="text-xs text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-2 text-sm">
            {/* Auto Refresh Select (Unlocked for Super Admin, locked for others) */}
            <div
              className={`flex items-center bg-slate-800 border ${
                user?.role === 'super_admin' ? 'border-amber-500/50' : 'border-slate-700'
              } rounded-lg px-2.5 py-1 text-xs text-slate-300 relative group`}
              title={
                user?.role === 'super_admin'
                  ? 'Auto Sync Settings (Super Admin unlocked)'
                  : 'Auto Sync interval is locked. Only Super Admin can change sync settings.'
              }
            >
              <span className="mr-1.5 text-slate-400 flex items-center gap-1">
                {user?.role === 'super_admin' ? (
                  <Crown className="w-3 h-3 text-amber-400" />
                ) : (
                  <Lock className="w-3 h-3 text-slate-500" />
                )}
                <span>{t.autoRefresh}:</span>
              </span>
              <select
                value={autoRefreshInterval}
                disabled={user?.role !== 'super_admin'}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className={`bg-transparent font-medium focus:outline-none ${
                  user?.role === 'super_admin'
                    ? 'text-amber-400 cursor-pointer'
                    : 'text-slate-400 cursor-not-allowed opacity-80'
                }`}
              >
                <option value={0} className="bg-slate-800 text-slate-300">{t.off}</option>
                <option value={5} className="bg-slate-800 text-slate-300">5{t.secs}</option>
                <option value={10} className="bg-slate-800 text-slate-300">10{t.secs}</option>
                <option value={15} className="bg-slate-800 text-slate-300">15{t.secs}</option>
                <option value={30} className="bg-slate-800 text-slate-300">30{t.secs}</option>
                <option value={60} className="bg-slate-800 text-slate-300">60{t.secs}</option>
              </select>
            </div>

            {/* Refresh Button */}
            <button
              onClick={onRefresh}
              disabled={loading || isSyncing}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isSyncing ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            {/* External Link */}
            {sheetUrl && (
              <a
                href={sheetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
              >
                <span>{t.openInSheets}</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            )}

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="flex items-center space-x-1 px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs transition-colors"
              title="Toggle language (English / বাংলা)"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="font-semibold text-blue-300">{lang === 'en' ? 'BN' : 'EN'}</span>
            </button>

            {/* Login / User Status */}
            {user ? (
              <div
                className={`flex items-center space-x-1.5 border rounded-lg px-2.5 py-1 text-xs ${
                  user.role === 'super_admin'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    : user.role === 'admin'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    : 'bg-blue-950/80 border-blue-500/40 text-blue-200'
                }`}
              >
                <div className="flex items-center space-x-1 font-semibold">
                  {user.role === 'super_admin' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <User className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="capitalize">{user.username}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full uppercase font-bold ${
                      user.role === 'super_admin'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : user.role === 'admin'
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                        : 'bg-blue-500/30 text-blue-200 border border-blue-500/40'
                    }`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </div>
                <button
                  onClick={onLogoutClick}
                  className="p-1 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors ml-1"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="flex items-center space-x-1 px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium text-xs transition-colors shadow-xs"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-200" />
                <span>{t.login}</span>
              </button>
            )}
          </div>

        </div>

        {/* Sync Info Footer inside Header */}
        {lastUpdated && (
          <div className="mt-2 text-[11px] text-slate-400 flex items-center justify-between border-t border-slate-800 pt-1.5">
            <span className="flex items-center gap-1 text-slate-400">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              {t.lastSync}: {new Date(lastUpdated).toLocaleTimeString()} ({new Date(lastUpdated).toLocaleDateString()})
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline">
              Spreadsheet ID: 1hLt1v3C8...
            </span>
          </div>
        )}
      </div>
    </header>
  );
};
