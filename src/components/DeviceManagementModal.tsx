import React, { useState, useEffect } from 'react';
import {
  Monitor,
  Smartphone,
  Tablet,
  Shield,
  ShieldAlert,
  ShieldCheck,
  User,
  LogOut,
  Lock,
  Unlock,
  RefreshCw,
  Search,
  Clock,
  Globe,
  Crown,
  X,
  AlertTriangle,
  CheckCircle,
  Zap,
  Bell,
  Send,
  MessageSquare,
  Sparkles,
} from 'lucide-react';
import { DeviceSession, UserSession } from '../types';
import {
  getStoredSessions,
  saveSessions,
  getBlockedUsers,
  toggleBlockUser,
  terminateSession,
  terminateAllOtherSessions,
  isUserBlocked,
  sendNotificationToDevice,
} from '../utils/deviceManager';
import {
  getAllFirebaseDeviceSessions,
  subscribeFirebaseDeviceSessions,
  terminateDeviceSessionInFirebase,
  terminateAllOtherFirebaseSessions,
  toggleBlockUserInFirebase,
  sendFirebaseDeviceNotification,
} from '../services/firebaseDeviceService';

interface DeviceManagementModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  lang: 'bn' | 'en';
}

export const DeviceManagementModal: React.FC<DeviceManagementModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  lang,
}) => {
  const [sessions, setSessions] = useState<DeviceSession[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'blocked' | 'logged_out'>('all');
  const [blockedList, setBlockedList] = useState<string[]>([]);
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Notification Modal State
  const [notifModalOpen, setNotifModalOpen] = useState(false);
  const [targetSession, setTargetSession] = useState<DeviceSession | null>(null);
  const [notifText, setNotifText] = useState('');

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (isOpen) {
      // 1. Initial load from Firebase
      getAllFirebaseDeviceSessions().then((fbSessions) => {
        if (fbSessions.length > 0) {
          setSessions(fbSessions);
        } else {
          setSessions(getStoredSessions());
        }
      });

      // 2. Real-time Firebase Firestore Subscription
      unsubscribe = subscribeFirebaseDeviceSessions((liveSessions) => {
        if (liveSessions && liveSessions.length > 0) {
          setSessions(liveSessions);
        }
      });

      setBlockedList(getBlockedUsers());
    }

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [isOpen]);

  const refreshData = async () => {
    try {
      const fbSessions = await getAllFirebaseDeviceSessions();
      setSessions(fbSessions);
      setBlockedList(getBlockedUsers());
    } catch (e) {
      setSessions(getStoredSessions());
    }
  };

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await refreshData();
    setActionMessage(lang === 'bn' ? 'ফায়ারবেস ডিভাইস তথ্য রিফ্রেশ করা হয়েছে!' : 'Firebase device session list refreshed!');
    setTimeout(() => {
      setIsRefreshing(false);
      setActionMessage(null);
    }, 1500);
  };

  if (!isOpen) return null;

  const t = {
    en: {
      title: "Device & Session Control Center",
      subtitle: "Super Admin Live Security & Active Device Management",
      searchPlaceholder: "Search by Username, IP, OS or Browser...",
      refreshBtn: "Refresh",
      activeDevices: "Active Devices",
      blockedUsers: "Blocked Accounts",
      totalSessions: "Total Sessions",
      allStatus: "All Status",
      activeStatus: "Active Only",
      blockedStatus: "Blocked",
      loggedOutStatus: "Logged Out Devices",
      terminateAllBtn: "Terminate All Other Devices",
      thisDevice: "This Device",
      remoteLogout: "Remote Logout",
      blockUser: "Block User",
      unblockUser: "Unlock User",
      sendNotif: "Send Alert",
      blockedBadge: "BLOCKED",
      activeBadge: "ACTIVE",
      loggedOutBadge: "TERMINATED / LOGGED OUT",
      username: "User Name & Role",
      deviceOs: "Device & Browser",
      networkIp: "IP & Location",
      loginTime: "Login Time",
      userActivity: "Live Activity / Action",
      status: "Status",
      actions: "Actions",
      noSessions: "No devices found matching criteria.",
      confirmTerminateAll: "Are you sure you want to log out all other active devices?",
      sendNotifTitle: "Send Notification to Device",
      sendNotifPlaceholder: "Type warning or notice message for this user...",
      sendBtn: "Send Notification",
      cancelBtn: "Cancel",
    },
    bn: {
      title: "ডিভাইস ও সেশন কন্ট্রোল সেন্টার",
      subtitle: "সুপার এডমিন লাইভ সিকিউরিটি ও ডিভাইস ম্যানেজমেন্ট",
      searchPlaceholder: "ইউজারনেম, IP, OS বা ব্রাউজার দিয়ে খুঁজুন...",
      refreshBtn: "রিফ্রেশ করুন",
      activeDevices: "এক্টিভ ডিভাইস",
      blockedUsers: "ব্লকড অ্যাকাউন্ট",
      totalSessions: "মোট সেশন",
      allStatus: "সব স্ট্যাটাস",
      activeStatus: "শুধু এক্টিভ",
      blockedStatus: "ব্লকড",
      loggedOutStatus: "লগআউট করা ডিভাইস",
      terminateAllBtn: "অন্য সব ডিভাইস লগআউট করুন",
      thisDevice: "এই ডিভাইস",
      remoteLogout: "রিমোট লগআউট",
      blockUser: "ব্লক করুন",
      unblockUser: "আনব্লক করুন",
      sendNotif: "মেসেজ/নোটিফিকেশন",
      blockedBadge: "ব্লকড",
      activeBadge: "এক্টিভ",
      loggedOutBadge: "টার্মিনেটেড / লগআউট",
      username: "ইউজার নেম ও রোল",
      deviceOs: "ডিভাইস ও ব্রাউজার",
      networkIp: "IP ও লোকেশন",
      loginTime: "লগইন সময়",
      userActivity: "লাইভ অ্যাক্টিভিটি / কাজ",
      status: "স্ট্যাটাস",
      actions: "অ্যাকশন",
      noSessions: "কোনো ডিভাইস পাওয়া যায়নি।",
      confirmTerminateAll: "আপনি কি নিশ্চিত যে অন্য সব এক্টিভ ডিভাইস রিমোট লগআউট করবেন?",
      sendNotifTitle: "ডিভাইসে নোটিফিকেশন পাঠান",
      sendNotifPlaceholder: "ইউজারের জন্য ওয়ার্নিং বা বার্তা লিখুন...",
      sendBtn: "পাঠান",
      cancelBtn: "বাতিল",
    },
  }[lang];

  const handleRemoteLogout = async (sessionId: string, username: string) => {
    try {
      await terminateDeviceSessionInFirebase(sessionId);
      terminateSession(sessionId); // local sync fallback
      setActionMessage(`${username} - Device session terminated in Firebase.`);
    } catch (e) {
      const updated = terminateSession(sessionId);
      setSessions(updated);
      setActionMessage(`${username} - Local session terminated.`);
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleToggleBlock = async (username: string) => {
    try {
      const result = await toggleBlockUserInFirebase(username);
      toggleBlockUser(username); // local sync fallback
      setActionMessage(
        result.isBlocked
          ? `User '${username}' blocked & suspended in Firebase!`
          : `User '${username}' unblocked in Firebase!`
      );
    } catch (e) {
      const result = toggleBlockUser(username);
      setSessions(result.updatedSessions);
      setBlockedList(getBlockedUsers());
      setActionMessage(
        result.isBlocked
          ? `User '${username}' BLOCKED locally.`
          : `User '${username}' UNLOCKED locally.`
      );
    }
    setTimeout(() => setActionMessage(null), 3000);
  };

  const handleTerminateAllOthers = async () => {
    if (window.confirm(t.confirmTerminateAll)) {
      const currentSessionId = currentUser?.sessionId;
      try {
        await terminateAllOtherFirebaseSessions(currentSessionId);
        terminateAllOtherSessions(currentSessionId);
        setActionMessage("All other active devices terminated in Firebase!");
      } catch (e) {
        const updated = terminateAllOtherSessions(currentSessionId);
        setSessions(updated);
        setActionMessage("All other active devices logged out locally!");
      }
      setTimeout(() => setActionMessage(null), 3000);
    }
  };

  const openNotifModal = (session: DeviceSession) => {
    setTargetSession(session);
    setNotifText('');
    setNotifModalOpen(true);
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetSession || !notifText.trim()) return;

    try {
      await sendFirebaseDeviceNotification(
        targetSession.username,
        notifText.trim(),
        currentUser?.username || 'Super Admin',
        targetSession.id
      );
      sendNotificationToDevice(
        targetSession.username,
        notifText.trim(),
        currentUser?.username || 'Super Admin',
        targetSession.id
      );
      setActionMessage(`Alert notification sent to ${targetSession.username} via Firebase!`);
    } catch (err) {
      sendNotificationToDevice(
        targetSession.username,
        notifText.trim(),
        currentUser?.username || 'Super Admin',
        targetSession.id
      );
      setActionMessage(`Alert notification sent to ${targetSession.username}!`);
    }

    setNotifModalOpen(false);
    setTimeout(() => setActionMessage(null), 3000);
  };

  // Filtered sessions
  const filteredSessions = sessions.filter((s) => {
    const matchesSearch =
      s.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.os.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.browser.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ipAddress.includes(searchTerm);

    const isBlocked = isUserBlocked(s.username);

    if (statusFilter === 'active') return matchesSearch && s.status === 'active' && !isBlocked;
    if (statusFilter === 'blocked') return matchesSearch && (s.status === 'blocked' || isBlocked);
    if (statusFilter === 'logged_out') return matchesSearch && s.status === 'logged_out';

    return matchesSearch;
  });

  const activeCount = sessions.filter((s) => s.status === 'active' && !isUserBlocked(s.username)).length;
  const blockedCount = blockedList.length;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-5xl w-full max-h-[92vh] flex flex-col overflow-hidden text-[10px] sm:text-xs">
        {/* Header Bar */}
        <div className="p-3 sm:p-4 bg-slate-900 border-b border-slate-800 text-white flex items-center justify-between">
          <div className="flex items-center space-x-2.5">
            <div className="p-2 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-400">
              <Crown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-sm sm:text-base font-bold text-slate-100">{t.title}</h2>
                <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-full text-[9px] font-bold">
                  SUPER ADMIN
                </span>
              </div>
              <p className="text-[10px] text-slate-400">{t.subtitle}</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Action Message Alert */}
        {actionMessage && (
          <div className="p-2.5 bg-emerald-500/10 border-b border-emerald-500/30 text-emerald-400 font-semibold flex items-center justify-between px-4 animate-in fade-in">
            <div className="flex items-center gap-1.5">
              <CheckCircle className="w-4 h-4 text-emerald-400" />
              <span>{actionMessage}</span>
            </div>
          </div>
        )}

        {/* Control Bar & Stats */}
        <div className="p-3 sm:p-4 bg-slate-50 dark:bg-slate-900/50 border-b border-slate-200 dark:border-slate-800 space-y-3">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3">
            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <div className="p-2 bg-emerald-500/10 text-emerald-500 rounded-lg">
                <Monitor className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.activeDevices}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{activeCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <div className="p-2 bg-red-500/10 text-red-500 rounded-lg">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.blockedUsers}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{blockedCount}</p>
              </div>
            </div>

            <div className="bg-white dark:bg-slate-800 p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
              <div className="p-2 bg-blue-500/10 text-blue-500 rounded-lg">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <p className="text-[9px] text-slate-500 dark:text-slate-400 uppercase font-semibold">{t.totalSessions}</p>
                <p className="text-sm font-bold text-slate-900 dark:text-slate-100">{sessions.length}</p>
              </div>
            </div>
          </div>

          {/* Search, Filter & Terminate All */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="relative flex-1 w-full max-w-md">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t.searchPlaceholder}
                className="w-full pl-8 pr-3 py-1.5 text-[10px] bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-1 focus:ring-amber-500 text-slate-800 dark:text-slate-100"
              />
            </div>

            <div className="flex items-center space-x-2 w-full sm:w-auto justify-between sm:justify-end">
              {/* Refresh Button */}
              <button
                onClick={handleManualRefresh}
                disabled={isRefreshing}
                className="flex items-center space-x-1 px-2.5 py-1 bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 rounded-lg font-medium text-[10px] transition-colors shrink-0 border border-slate-300 dark:border-slate-700"
                title={t.refreshBtn}
              >
                <RefreshCw className={`w-3 h-3 text-amber-500 ${isRefreshing ? 'animate-spin' : ''}`} />
                <span>{t.refreshBtn}</span>
              </button>

              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg px-2 py-1 text-[10px] text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-1 focus:ring-amber-500 font-medium"
              >
                <option value="all">{t.allStatus}</option>
                <option value="active">{t.activeStatus}</option>
                <option value="blocked">{t.blockedStatus}</option>
                <option value="logged_out">{t.loggedOutStatus}</option>
              </select>

              <button
                onClick={handleTerminateAllOthers}
                className="flex items-center space-x-1 px-2.5 py-1 bg-red-600 hover:bg-red-500 text-white rounded-lg font-medium text-[10px] transition-colors shadow-2xs shrink-0"
              >
                <Zap className="w-3 h-3 text-red-200" />
                <span>{t.terminateAllBtn}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Sessions Table Area */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {filteredSessions.length === 0 ? (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400">
              <Shield className="w-8 h-8 text-slate-400 mx-auto mb-2 opacity-50" />
              <p className="font-medium">{t.noSessions}</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[650px]">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-slate-700 text-[10px]">
                    <th className="p-2 sm:p-2.5">{t.username}</th>
                    <th className="p-2 sm:p-2.5">{t.deviceOs}</th>
                    <th className="p-2 sm:p-2.5">{t.networkIp}</th>
                    <th className="p-2 sm:p-2.5">{t.loginTime}</th>
                    <th className="p-2 sm:p-2.5">{t.userActivity}</th>
                    <th className="p-2 sm:p-2.5">{t.status}</th>
                    <th className="p-2 sm:p-2.5 text-right">{t.actions}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 text-slate-800 dark:text-slate-200">
                  {filteredSessions.map((session) => {
                    const isBlocked = isUserBlocked(session.username) || session.status === 'blocked';
                    const isTerminated = session.status === 'logged_out';
                    const isCurrent = currentUser?.username === session.username || session.isCurrentSession;

                    return (
                      <tr
                        key={session.id}
                        className={`hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors ${
                          isBlocked ? 'bg-red-500/5' : isTerminated ? 'opacity-60 bg-slate-500/5' : ''
                        }`}
                      >
                        {/* Username & Role */}
                        <td className="p-2 sm:p-2.5">
                          <div className="flex items-center space-x-2">
                            <div
                              className={`p-1.5 rounded-lg border ${
                                session.role === 'super_admin'
                                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-500'
                                  : session.role === 'admin'
                                  ? 'bg-blue-500/10 border-blue-500/30 text-blue-500'
                                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500'
                              }`}
                            >
                              <User className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-1 font-bold text-slate-900 dark:text-slate-100">
                                <span>{session.username}</span>
                                {isCurrent && (
                                  <span className="px-1 py-0.1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded text-[8px] uppercase font-bold">
                                    {t.thisDevice}
                                  </span>
                                )}
                              </div>
                              <span
                                className={`text-[8px] uppercase font-bold px-1 rounded ${
                                  session.role === 'super_admin'
                                    ? 'bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300'
                                    : session.role === 'admin'
                                    ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                                }`}
                              >
                                {session.role}
                              </span>
                            </div>
                          </div>
                        </td>

                        {/* Device Name & Specs */}
                        <td className="p-2 sm:p-2.5">
                          <div className="flex items-start space-x-2">
                            <div className="p-1 bg-slate-100 dark:bg-slate-800 rounded-lg mt-0.5">
                              {session.deviceType === 'mobile' ? (
                                <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                              ) : session.deviceType === 'tablet' ? (
                                <Tablet className="w-4 h-4 text-purple-500 shrink-0" />
                              ) : (
                                <Monitor className="w-4 h-4 text-sky-500 shrink-0" />
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="flex items-center gap-1 font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                                <span className="truncate">{session.deviceName || 'Infinix Note 30'}</span>
                                {session.deviceName?.toLowerCase().includes('infinix') && (
                                  <span className="px-1 py-0.2 bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/30 rounded text-[7.5px] font-black uppercase">
                                    XOS
                                  </span>
                                )}
                              </div>
                              <p className="text-[9.5px] font-medium text-slate-500 dark:text-slate-400">
                                {session.os} • {session.browser}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* IP & Location */}
                        <td className="p-2 sm:p-2.5">
                          <div className="font-mono text-[10px] text-slate-700 dark:text-slate-300">
                            <p>{session.ipAddress}</p>
                            <p className="text-[9px] text-slate-400 font-sans">{session.location}</p>
                          </div>
                        </td>

                        {/* Login Time */}
                        <td className="p-2 sm:p-2.5">
                          <div className="flex items-center text-[10px] text-slate-600 dark:text-slate-400 space-x-1">
                            <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                            <span>{new Date(session.loginTime).toLocaleTimeString()}</span>
                          </div>
                        </td>

                        {/* User Activity / Action */}
                        <td className="p-2 sm:p-2.5">
                          <div className="space-y-0.5">
                            <span className="inline-block px-2 py-0.5 rounded text-[9px] font-semibold bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                              {session.lastAction || (lang === 'bn' ? 'সিস্টেমে সক্রিয় আছেন' : 'Active in System')}
                            </span>
                            <p className="text-[8px] text-slate-400 font-mono">
                              {lang === 'bn' ? 'সর্বশেষ এক্টিভ: ' : 'Last seen: '}
                              {new Date(session.lastActive).toLocaleTimeString()}
                            </p>
                          </div>
                        </td>

                        {/* Status Badge */}
                        <td className="p-2 sm:p-2.5">
                          {isBlocked ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800">
                              <ShieldAlert className="w-2.5 h-2.5 mr-1 text-red-500" />
                              {t.blockedBadge}
                            </span>
                          ) : isTerminated ? (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-700">
                              <LogOut className="w-2.5 h-2.5 mr-1" />
                              {t.loggedOutBadge}
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1"></span>
                              {t.activeBadge}
                            </span>
                          )}
                        </td>

                        {/* Action Buttons */}
                        <td className="p-2 sm:p-2.5 text-right">
                          <div className="flex items-center justify-end space-x-1.5">
                            {/* Send Notification / Alert to Active Device */}
                            {!isTerminated && !isBlocked && (
                              <button
                                onClick={() => openNotifModal(session)}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400 border border-blue-500/30 transition-colors"
                                title={t.sendNotif}
                              >
                                <Bell className="w-2.5 h-2.5" />
                                <span>{t.sendNotif}</span>
                              </button>
                            )}

                            {/* Block / Unlock Toggle */}
                            <button
                              onClick={() => handleToggleBlock(session.username)}
                              className={`flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-semibold transition-colors border ${
                                isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-600'
                                  : 'bg-red-500/10 hover:bg-red-500/20 text-red-600 dark:text-red-400 border-red-500/30'
                              }`}
                              title={isBlocked ? t.unblockUser : t.blockUser}
                            >
                              {isBlocked ? (
                                <>
                                  <Unlock className="w-2.5 h-2.5" />
                                  <span>{t.unblockUser}</span>
                                </>
                              ) : (
                                <>
                                  <Lock className="w-2.5 h-2.5" />
                                  <span>{t.blockUser}</span>
                                </>
                              )}
                            </button>

                            {/* Remote Logout Button */}
                            {!isTerminated && (
                              <button
                                onClick={() => handleRemoteLogout(session.id, session.username)}
                                className="flex items-center space-x-1 px-2 py-0.5 rounded text-[9px] font-semibold bg-slate-200 dark:bg-slate-800 hover:bg-red-600 hover:text-white text-slate-700 dark:text-slate-300 transition-colors border border-slate-300 dark:border-slate-700"
                                title={t.remoteLogout}
                              >
                                <LogOut className="w-2.5 h-2.5" />
                                <span>{t.remoteLogout}</span>
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Send Notification Sub-Modal */}
      {notifModalOpen && targetSession && (
        <div className="fixed inset-0 z-60 bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 animate-in fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 p-4 max-w-md w-full shadow-2xl space-y-3">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
              <div className="flex items-center space-x-2 text-blue-500">
                <Bell className="w-5 h-5" />
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{t.sendNotifTitle}</h3>
              </div>
              <button
                onClick={() => setNotifModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-100 dark:bg-slate-800/60 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700 text-xs text-slate-700 dark:text-slate-300 space-y-1">
              <p className="font-bold text-slate-900 dark:text-slate-100">
                Target User: <span className="text-amber-500">{targetSession.username}</span> ({targetSession.role})
              </p>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                Device: {targetSession.os} • {targetSession.browser} ({targetSession.ipAddress})
              </p>
            </div>

            <form onSubmit={handleSendNotification} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Notification Message / Alert
                </label>
                <textarea
                  value={notifText}
                  onChange={(e) => setNotifText(e.target.value)}
                  placeholder={t.sendNotifPlaceholder}
                  rows={3}
                  required
                  className="w-full p-2.5 text-xs bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-1">
                <button
                  type="button"
                  onClick={() => setNotifModalOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-700 rounded-lg"
                >
                  {t.cancelBtn}
                </button>
                <button
                  type="submit"
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors shadow-xs"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{t.sendBtn}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
