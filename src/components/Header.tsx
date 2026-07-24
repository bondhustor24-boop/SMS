import React, { useState } from 'react';
import { RefreshCw, ShieldCheck, Globe, Database, UserCheck, LogIn, LogOut, Crown, Lock, Sun, Moon, Monitor, Target, Bell, BellRing, X, Menu } from 'lucide-react';
import { UserSession, DeviceNotification } from '../types';

interface HeaderProps {
  sheetTitle: string;
  sheetUrl: string;
  lastUpdated: string | null;
  loading: boolean;
  isSyncing?: boolean;
  user: UserSession | null;
  unreadNotifs?: DeviceNotification[];
  onDismissNotif?: (id: string) => void;
  onClearAllNotifs?: () => void;
  onLoginClick: () => void;
  onLogoutClick: () => void;
  onDevicesClick?: () => void;
  onFirebaseUsersClick?: () => void;
  onProfileClick?: () => void;
  onRefresh: () => void;
  autoRefreshInterval: number;
  setAutoRefreshInterval: (seconds: number) => void;
  lang: 'bn' | 'en';
  setLang: (lang: 'bn' | 'en') => void;
  theme: 'light' | 'dark';
  setTheme: (theme: 'light' | 'dark') => void;
}


export const Header: React.FC<HeaderProps> = ({
  sheetTitle,
  sheetUrl,
  lastUpdated,
  loading,
  isSyncing = false,
  user,
  unreadNotifs = [],
  onDismissNotif,
  onClearAllNotifs,
  onLoginClick,
  onLogoutClick,
  onDevicesClick,
  onFirebaseUsersClick,
  onProfileClick,
  onRefresh,
  autoRefreshInterval,
  setAutoRefreshInterval,
  lang,
  setLang,
  theme,
  setTheme,
}) => {
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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
    <header className="bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white sticky top-0 z-30 shadow-md">
      <div className="max-w-7xl mx-auto px-3 sm:px-4 py-2">
        <div className="flex items-center justify-between gap-2">
          {/* Brand & Status with Uniform Mini Icons */}
          <div className="flex items-center space-x-2 min-w-0">
            <div className="p-1.5 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400 shrink-0 flex items-center justify-center">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <h1 className="text-xs sm:text-sm font-bold tracking-tight text-slate-100 truncate max-w-[180px] sm:max-w-none">
                  {sheetTitle || t.title}
                </h1>

                {/* Goal Mini Badge */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/30">
                  <Target className="w-3 h-3 text-amber-400 mr-1 animate-pulse" />
                  <span>Goal: Live Sync</span>
                </span>

                {/* Live Status Badge */}
                <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-[9.5px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className={`w-1.5 h-1.5 rounded-full ${isSyncing ? 'bg-amber-400 animate-ping' : 'bg-emerald-400 animate-pulse'} mr-1`}></span>
                  {isSyncing ? (lang === 'bn' ? 'সিঙ্ক...' : 'Syncing...') : 'Live'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium truncate hidden sm:block">{t.subtitle}</p>
            </div>
          </div>

          {/* Desktop Action Bar */}
          <div className="hidden lg:flex items-center gap-1.5 text-[10.5px]">
            {/* Notification Bell Dropdown Button */}
            <div className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className="h-7 inline-flex items-center space-x-1.5 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 transition-all text-[10.5px] font-semibold"
                title={lang === 'bn' ? 'নোটিফিকেশন সেন্টার' : 'Notifications'}
              >
                <BellRing className={`w-3.5 h-3.5 ${unreadNotifs.length > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
                <span>
                  {lang === 'bn' ? 'নোটিফিকেশন' : 'Alerts'}
                </span>
                {unreadNotifs.length > 0 && (
                  <span className="bg-red-500 text-white font-extrabold text-[9px] px-1.5 py-0.2 rounded-full border border-red-400 animate-pulse">
                    {unreadNotifs.length}
                  </span>
                )}
              </button>

              {/* Notification Popup */}
              {isNotifOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-700 shadow-2xl rounded-xl p-3 z-50 animate-in fade-in slide-in-from-top-2">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <Bell className="w-3.5 h-3.5 text-amber-400" />
                      <h4 className="font-bold text-slate-100 text-xs">
                        {lang === 'bn' ? 'নোটিফিকেশন প্যানেল' : 'Notifications'} ({unreadNotifs.length})
                      </h4>
                    </div>
                    <button
                      onClick={() => setIsNotifOpen(false)}
                      className="p-1 hover:bg-slate-800 rounded-md text-slate-400 hover:text-white transition-colors"
                      title={lang === 'bn' ? 'বন্ধ করুন' : 'Close Panel'}
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {unreadNotifs.length === 0 ? (
                    <div className="py-5 text-center text-slate-500 text-[10.5px] font-medium">
                      {lang === 'bn' ? 'কোন নতুন নোটিফিকেশন নেই' : 'No new notifications'}
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                      {unreadNotifs.map((notif) => (
                        <div key={notif.id} className="p-2 bg-slate-800/80 border border-slate-700/80 rounded-lg text-[10px] relative group">
                          <div className="flex items-center justify-between text-slate-400 text-[9px] font-bold mb-1">
                            <span className="text-emerald-400">{notif.senderUsername}</span>
                            <span>{new Date(notif.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-slate-200 font-medium whitespace-pre-wrap pr-5">{notif.message}</p>
                          <button
                            onClick={() => onDismissNotif?.(notif.id)}
                            className="absolute top-2 right-2 p-0.5 text-slate-400 hover:text-red-400 transition-colors"
                            title={lang === 'bn' ? 'মুছে ফেলুন' : 'Dismiss'}
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {unreadNotifs.length > 0 && (
                    <div className="mt-2 pt-2 border-t border-slate-800 flex justify-between items-center">
                      <span className="text-[9.5px] text-slate-400 font-medium">
                        {lang === 'bn' ? 'লাইভ সিস্টেম' : 'Live System'}
                      </span>
                      <button
                        onClick={() => {
                          onClearAllNotifs?.();
                          setIsNotifOpen(false);
                        }}
                        className="text-[10px] font-bold text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2 py-0.5 rounded border border-amber-500/30 transition-colors flex items-center gap-1"
                      >
                        <X className="w-3.5 h-3.5" />
                        <span>{lang === 'bn' ? 'সব মুছে বন্ধ করুন' : 'Clear All & Close'}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Auto Refresh Select */}
            <div
              className={`h-7 inline-flex items-center bg-slate-800/90 border ${
                user?.role === 'super_admin' ? 'border-amber-500/50' : 'border-slate-700/80'
              } rounded-lg px-2 text-[10.5px] text-slate-300 relative group`}
              title={
                user?.role === 'super_admin'
                  ? 'Auto Sync Settings (Super Admin unlocked)'
                  : 'Auto Sync interval is locked. Only Super Admin can change sync settings.'
              }
            >
              <span className="mr-1 text-slate-400 inline-flex items-center gap-1 font-semibold">
                {user?.role === 'super_admin' ? (
                  <Crown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                )}
                <span>{t.autoRefresh}:</span>
              </span>
              <select
                value={autoRefreshInterval}
                disabled={user?.role !== 'super_admin'}
                onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                className={`bg-transparent font-bold focus:outline-none text-[10.5px] ${
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
              className="h-7 inline-flex items-center space-x-1.5 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading || isSyncing ? 'animate-spin' : ''}`} />
              <span>{lang === 'bn' ? 'রিফ্রেশ' : 'Refresh'}</span>
            </button>

            {/* Theme Switcher */}
            <button
              onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
              className="h-7 inline-flex items-center space-x-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-[10.5px] font-semibold transition-all"
              title={theme === 'light' ? 'Switch to Dark Mode' : 'Switch to Light Mode'}
            >
              {theme === 'light' ? (
                <>
                  <Moon className="w-3.5 h-3.5 text-amber-300" />
                  <span className="text-slate-200">{lang === 'bn' ? 'ডার্ক' : 'Dark'}</span>
                </>
              ) : (
                <>
                  <Sun className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  <span className="text-amber-300">{lang === 'bn' ? 'লাইট' : 'Light'}</span>
                </>
              )}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => setLang(lang === 'en' ? 'bn' : 'en')}
              className="h-7 inline-flex items-center space-x-1 px-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 text-[10.5px] font-semibold transition-all"
              title="Toggle language"
            >
              <Globe className="w-3.5 h-3.5 text-blue-400" />
              <span className="text-blue-300">{lang === 'en' ? 'BN' : 'EN'}</span>
            </button>

            {/* Super Admin Control Buttons */}
            {user?.role === 'super_admin' && onFirebaseUsersClick && (
              <button
                onClick={onFirebaseUsersClick}
                className="h-7 inline-flex items-center space-x-1 px-2 rounded-lg bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 border border-orange-500/40 text-[10.5px] font-bold transition-all"
                title="Firebase User Database Control"
              >
                <Crown className="w-3.5 h-3.5 text-orange-400" />
                <span>{lang === 'bn' ? 'ইউজারস' : 'Users'}</span>
              </button>
            )}

            {user?.role === 'super_admin' && onDevicesClick && (
              <button
                onClick={onDevicesClick}
                className="h-7 inline-flex items-center space-x-1 px-2 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-[10.5px] font-bold transition-all"
                title="Super Admin Live Device & Session Control"
              >
                <Monitor className="w-3.5 h-3.5 text-amber-400" />
                <span>{lang === 'bn' ? 'ডিভাইস' : 'Devices'}</span>
              </button>
            )}

            {/* Single Clean Integrated User Profile Badge + Logout */}
            {user ? (
              <div
                className={`h-7 inline-flex items-center space-x-1.5 border rounded-lg px-2 text-[10.5px] ${
                  user.role === 'super_admin'
                    ? 'bg-amber-950/80 border-amber-500/50 text-amber-200'
                    : user.role === 'admin'
                    ? 'bg-emerald-950/80 border-emerald-500/40 text-emerald-200'
                    : 'bg-blue-950/80 border-blue-500/40 text-blue-200'
                }`}
              >
                <button
                  onClick={onProfileClick}
                  className="inline-flex items-center space-x-1 font-bold hover:underline"
                  title="Click to view/edit profile"
                >
                  {user.role === 'super_admin' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
                  )}
                  <span className="capitalize">{user.username}</span>
                  <span
                    className={`text-[8.5px] px-1 py-0.2 rounded uppercase font-black tracking-wider ${
                      user.role === 'super_admin'
                        ? 'bg-amber-500/30 text-amber-300 border border-amber-500/40'
                        : user.role === 'admin'
                        ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-500/40'
                        : 'bg-blue-500/30 text-blue-200 border border-blue-500/40'
                    }`}
                  >
                    {user.role.replace('_', ' ')}
                  </span>
                </button>
                <button
                  onClick={onLogoutClick}
                  className="p-0.5 hover:bg-slate-800 text-slate-400 hover:text-red-400 rounded transition-colors ml-0.5"
                  title={t.logout}
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onLoginClick}
                className="h-7 inline-flex items-center space-x-1 px-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10.5px] transition-all"
              >
                <LogIn className="w-3.5 h-3.5 text-emerald-200" />
                <span>{t.login}</span>
              </button>
            )}
          </div>

          {/* Mobile Actions Right Side: Notification Bell + Hamburger Menu Button */}
          <div className="flex lg:hidden items-center space-x-1.5 shrink-0">
            {/* Quick Notification Bell on Mobile Header */}
            <button
              onClick={() => setIsNotifOpen(!isNotifOpen)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700/80 relative"
              title={lang === 'bn' ? 'নোটিফিকেশন' : 'Notifications'}
            >
              <BellRing className={`w-4 h-4 ${unreadNotifs.length > 0 ? 'text-amber-400 animate-bounce' : 'text-slate-400'}`} />
              {unreadNotifs.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white font-extrabold text-[9px] w-4 h-4 flex items-center justify-center rounded-full border border-red-400">
                  {unreadNotifs.length}
                </span>
              )}
            </button>

            {/* Hamburger Menu Toggle Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white border border-emerald-500 transition-colors"
              title={isMobileMenuOpen ? "Close Menu" : "Open Menu"}
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Collapsible Mobile Hamburger Drawer Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden mt-2 pt-2 border-t border-slate-800 space-y-2.5 animate-in slide-in-from-top-2">
            <div className="grid grid-cols-2 gap-2 text-[11px]">
              {/* Refresh Button */}
              <button
                onClick={() => {
                  onRefresh();
                  setIsMobileMenuOpen(false);
                }}
                disabled={loading || isSyncing}
                className="py-2 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center space-x-1.5"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading || isSyncing ? 'animate-spin' : ''}`} />
                <span>{lang === 'bn' ? 'রিফ্রেশ ডাটা' : 'Refresh Data'}</span>
              </button>

              {/* Theme Switcher */}
              <button
                onClick={() => {
                  setTheme(theme === 'light' ? 'dark' : 'light');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center space-x-1.5"
              >
                {theme === 'light' ? (
                  <>
                    <Moon className="w-3.5 h-3.5 text-amber-300" />
                    <span>{lang === 'bn' ? 'ডার্ক মোড' : 'Dark Mode'}</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'লাইট মোড' : 'Light Mode'}</span>
                  </>
                )}
              </button>

              {/* Language Switcher */}
              <button
                onClick={() => {
                  setLang(lang === 'en' ? 'bn' : 'en');
                  setIsMobileMenuOpen(false);
                }}
                className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold flex items-center justify-center space-x-1.5"
              >
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Language: <strong className="text-blue-300">{lang === 'en' ? 'বাংলা' : 'English'}</strong></span>
              </button>

              {/* Auto Sync Interval Selector */}
              <div className="py-1.5 px-2.5 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-between text-slate-300">
                <span className="text-[10px] font-semibold text-slate-400 inline-flex items-center gap-1">
                  {user?.role === 'super_admin' ? (
                    <Crown className="w-3.5 h-3.5 text-amber-400" />
                  ) : (
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                  )}
                  {t.autoRefresh}:
                </span>
                <select
                  value={autoRefreshInterval}
                  disabled={user?.role !== 'super_admin'}
                  onChange={(e) => setAutoRefreshInterval(Number(e.target.value))}
                  className="bg-transparent font-bold focus:outline-none text-[11px] text-amber-400"
                >
                  <option value={0} className="bg-slate-800 text-slate-300">{t.off}</option>
                  <option value={5} className="bg-slate-800 text-slate-300">5s</option>
                  <option value={10} className="bg-slate-800 text-slate-300">10s</option>
                  <option value={15} className="bg-slate-800 text-slate-300">15s</option>
                  <option value={30} className="bg-slate-800 text-slate-300">30s</option>
                  <option value={60} className="bg-slate-800 text-slate-300">60s</option>
                </select>
              </div>
            </div>

            {/* Super Admin Mobile Actions */}
            {user?.role === 'super_admin' && (
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                {onFirebaseUsersClick && (
                  <button
                    onClick={() => {
                      onFirebaseUsersClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-orange-500/20 text-orange-300 border border-orange-500/40 font-bold flex items-center justify-center space-x-1.5"
                  >
                    <Crown className="w-3.5 h-3.5 text-orange-400" />
                    <span>{lang === 'bn' ? 'ফায়ারবেস ইউজারস' : 'Firebase Users'}</span>
                  </button>
                )}
                {onDevicesClick && (
                  <button
                    onClick={() => {
                      onDevicesClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2.5 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 font-bold flex items-center justify-center space-x-1.5"
                  >
                    <Monitor className="w-3.5 h-3.5 text-amber-400" />
                    <span>{lang === 'bn' ? 'ডিভাইস কন্ট্রোল' : 'Devices Control'}</span>
                  </button>
                )}
              </div>
            )}

            {/* Mobile User Profile Bar */}
            <div className="pt-1 border-t border-slate-800 flex items-center justify-between">
              {user ? (
                <div className="w-full flex items-center justify-between p-2 rounded-xl bg-slate-800/80 border border-slate-700">
                  <button
                    onClick={() => {
                      onProfileClick?.();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center space-x-2 text-left"
                  >
                    <UserCheck className="w-4 h-4 text-emerald-400" />
                    <div>
                      <div className="text-xs font-bold text-slate-100 capitalize">{user.username}</div>
                      <div className="text-[9.5px] text-emerald-400 uppercase font-black tracking-wider">{user.role}</div>
                    </div>
                  </button>
                  <button
                    onClick={() => {
                      onLogoutClick();
                      setIsMobileMenuOpen(false);
                    }}
                    className="p-1.5 text-slate-400 hover:text-red-400 bg-slate-700/50 rounded-lg transition-colors flex items-center space-x-1 text-xs"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>{t.logout}</span>
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onLoginClick();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2 bg-emerald-600 text-white font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5"
                >
                  <LogIn className="w-4 h-4" />
                  <span>{t.login}</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Sync Info Footer inside Header */}
        {lastUpdated && (
          <div className="mt-1.5 text-[10px] text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-1">
            <span className="flex items-center gap-1 text-slate-400 text-[10px] font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              {t.lastSync}: <span className="font-mono text-slate-200">{new Date(lastUpdated).toLocaleTimeString()}</span>
            </span>
            <span className="font-mono text-slate-500 hidden sm:inline text-[10px]">
              Sheet ID: 1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM
            </span>
          </div>
        )}
      </div>
    </header>
  );
};

