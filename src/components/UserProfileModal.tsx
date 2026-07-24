import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Key,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Save,
  Eye,
  EyeOff,
  Sparkles,
  Crown,
  Shield,
  Copy,
  Check,
  Lock,
} from 'lucide-react';
import { UserSession, FirebaseUserRecord } from '../types';
import {
  getFirebaseUserByUsername,
  saveUserToFirebase,
  fetchClientIpAddress,
} from '../services/firebaseUserService';
import { saveDeviceSessionToFirebase } from '../services/firebaseDeviceService';
import { parseUserAgent } from '../utils/deviceManager';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserSession | null;
  onUpdateSessionUser: (newUsername: string) => void;
  lang: 'bn' | 'en';
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateSessionUser,
  lang,
}) => {
  const [activeTab, setActiveTab] = useState<'info' | 'security' | 'device'>('info');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedIp, setCopiedIp] = useState(false);
  const [userRecord, setUserRecord] = useState<FirebaseUserRecord | null>(null);

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [ipAddress, setIpAddress] = useState('');
  const [deviceName, setDeviceName] = useState('Infinix Note 30');

  // Device Specs (Auto Detected)
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: 'mobile' as 'desktop' | 'mobile' | 'tablet',
    browser: 'Chrome Browser',
    os: 'Android 13',
    deviceName: 'Infinix Note 30',
  });

  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(
    null
  );

  const loadUserData = async () => {
    if (!currentUser?.username) return;
    setLoading(true);
    setStatusMsg(null);

    // 1. Auto detect live client IP & User Agent specs
    const liveIp = await fetchClientIpAddress();
    setIpAddress(liveIp);

    const specs = parseUserAgent();
    setDeviceInfo(specs);
    setDeviceName(specs.deviceName || 'Infinix Note 30');

    // 2. Fetch record from Firebase Firestore
    try {
      const fbUser = await getFirebaseUserByUsername(currentUser.username);
      if (fbUser) {
        setUserRecord(fbUser);
        setFullName(fbUser.fullName || fbUser.username);
        setUsername(fbUser.username);
        setEmailAddress(fbUser.emailAddress || `${fbUser.username}@sms333.com`);
        setPassword(fbUser.password || '******');
        if (fbUser.deviceName) {
          setDeviceName(fbUser.deviceName);
        }
        if (fbUser.ipAddress && fbUser.ipAddress !== '127.0.0.1') {
          setIpAddress(fbUser.ipAddress);
        }
      } else {
        // Default fallbacks if user record not in FB yet
        setFullName(currentUser.username);
        setUsername(currentUser.username);
        setEmailAddress(`${currentUser.username.toLowerCase()}@sms333.com`);
        setPassword('123456');
      }
    } catch (err) {
      console.error('Error loading profile data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUserData();
    }
  }, [isOpen, currentUser]);

  if (!isOpen || !currentUser) return null;

  const handleRefreshIp = async () => {
    setLoading(true);
    const liveIp = await fetchClientIpAddress();
    setIpAddress(liveIp);
    setLoading(false);
  };

  const handleCopyIp = () => {
    navigator.clipboard.writeText(ipAddress);
    setCopiedIp(true);
    setTimeout(() => setCopiedIp(false), 2000);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      setStatusMsg({
        type: 'error',
        text:
          lang === 'bn'
            ? 'ইউজারনেম এবং পাসওয়ার্ড পূরণ করুন!'
            : 'Username and Password cannot be empty!',
      });
      return;
    }

    setSaving(true);
    setStatusMsg(null);

    try {
      // Refresh current IP before saving
      const currentIp = await fetchClientIpAddress();

      // Save User Record
      await saveUserToFirebase({
        id: userRecord?.id,
        fullName: fullName.trim() || username.trim(),
        username: username.trim(),
        password: password.trim(),
        emailAddress: emailAddress.trim() || `${username.trim()}@sms333.com`,
        ipAddress: currentIp || ipAddress,
        deviceName: deviceName.trim() || 'Infinix Note 30',
        role: currentUser.role,
        status: userRecord?.status || 'active',
        createdAt: userRecord?.createdAt || new Date().toISOString(),
      });

      // Also Sync Device Session directly to Firebase Firestore
      await saveDeviceSessionToFirebase({
        username: username.trim(),
        role: currentUser.role,
        deviceName: deviceName.trim() || 'Infinix Note 30',
        deviceType: deviceInfo.deviceType,
        browser: deviceInfo.browser,
        os: deviceInfo.os,
        ipAddress: currentIp || ipAddress,
        location: 'Dhaka, Bangladesh',
        status: 'active',
        isCurrentSession: true,
      }).catch((err) => console.warn('Could not sync device session to Firebase:', err));

      setStatusMsg({
        type: 'success',
        text:
          lang === 'bn'
            ? 'আপনার প্রোফাইল সফলভাবে আপডেট হয়েছে!'
            : 'Your profile was updated successfully!',
      });

      // Update session state if username changed
      if (username.trim() !== currentUser.username) {
        onUpdateSessionUser(username.trim());
      }
    } catch (err: any) {
      console.error('Error saving user profile:', err);
      setStatusMsg({
        type: 'error',
        text:
          err.message ||
          (lang === 'bn' ? 'প্রোফাইল সেভ ব্যর্থ হয়েছে!' : 'Failed to update profile!'),
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full my-auto text-[11px] relative overflow-hidden transition-all">
        
        {/* Top Header Banner Section with User Profile Info */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-700 p-4 sm:p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-1.5 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition-colors"
            title={lang === 'bn' ? 'বন্ধ করুন' : 'Close'}
          >
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-center space-x-3.5 pr-8">
            {/* Avatar Badge */}
            <div className="w-14 h-14 rounded-2xl bg-slate-950/90 border-2 border-white/30 shadow-lg flex items-center justify-center text-emerald-400 font-extrabold text-xl shrink-0">
              {fullName ? fullName.charAt(0).toUpperCase() : currentUser.username.charAt(0).toUpperCase()}
            </div>
            
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
                  {fullName || currentUser.username}
                </h2>
                <span
                  className={`px-2 py-0.5 rounded-full text-[8.5px] font-black uppercase tracking-wider border shrink-0 ${
                    currentUser.role === 'super_admin'
                      ? 'bg-amber-400/20 text-amber-200 border-amber-300/40'
                      : 'bg-emerald-400/20 text-emerald-200 border-emerald-300/40'
                  }`}
                >
                  {currentUser.role.replace('_', ' ')}
                </span>
              </div>
              
              <p className="text-[11px] text-teal-100/90 font-medium flex flex-wrap items-center gap-1.5 mt-0.5">
                <span>@{currentUser.username}</span>
                <span>•</span>
                <span className="text-amber-300 font-bold">
                  {lang === 'bn' ? 'ইউজার প্রোফাইল টেবিল সিস্টেম' : 'User Profile Table System'}
                </span>
              </p>
            </div>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-3">
          {/* Status Alert Banner */}
          {statusMsg && (
            <div
              className={`p-2.5 rounded-xl text-[10.5px] font-semibold flex items-center gap-2 ${
                statusMsg.type === 'success'
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-600 dark:text-emerald-400'
                  : 'bg-red-500/10 border border-red-500/30 text-red-600 dark:text-red-400'
              }`}
            >
              {statusMsg.type === 'success' ? (
                <CheckCircle className="w-4 h-4 shrink-0" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0" />
              )}
              <span>{statusMsg.text}</span>
            </div>
          )}

          <form onSubmit={handleSaveProfile} className="space-y-3">
            {/* Unified Structured Table Container */}
            <div className="border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs bg-slate-50/50 dark:bg-slate-950/40">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-slate-100 dark:bg-slate-800/80 text-[9.5px] uppercase tracking-wider text-slate-500 dark:text-slate-400 font-bold border-b border-slate-200 dark:border-slate-800">
                    <th className="py-2 px-3 w-1/3">{lang === 'bn' ? 'ফিল্ড / আইটেম' : 'Field Name'}</th>
                    <th className="py-2 px-3">{lang === 'bn' ? 'ডিটেইলস / ইনপুট তথ্য' : 'Value / Settings'}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200/80 dark:divide-slate-800 text-[11px]">
                  {/* Full Name Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ফুল নাম' : 'Full Name'}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Md. Rahat Hossain"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* Username Row (Locked) */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ইউজারনেম' : 'Username'}</span>
                    </td>
                    <td className="py-1.5 px-3 flex items-center justify-between gap-2">
                      <span className="font-mono font-extrabold text-slate-800 dark:text-slate-200">
                        @{username}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[8.5px] font-bold bg-amber-500/10 text-amber-500 border border-amber-500/20 flex items-center gap-0.5">
                        <Lock className="w-2.5 h-2.5" />
                        {lang === 'bn' ? 'অপরিবর্তনযোগ্য' : 'Locked'}
                      </span>
                    </td>
                  </tr>

                  {/* Email Address Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ইমেইল এড্রেস' : 'Email Address'}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="email"
                        required
                        value={emailAddress}
                        onChange={(e) => setEmailAddress(e.target.value)}
                        placeholder="user@sms333.com"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* Password Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{lang === 'bn' ? 'পাসওয়ার্ড' : 'Password'}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <div className="relative">
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className="w-full pl-2.5 pr-8 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
                        >
                          {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Account Role Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Crown className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ইউজার রোল' : 'Account Role'}</span>
                    </td>
                    <td className="py-2 px-3">
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                        {currentUser.role.replace('_', ' ')}
                      </span>
                    </td>
                  </tr>

                  {/* Network IP Address Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Globe className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ক্লায়েন্ট আইপি (IP)' : 'Client IP Address'}</span>
                    </td>
                    <td className="py-1.5 px-3 flex items-center justify-between gap-2">
                      <div className="flex items-center space-x-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                          {ipAddress || 'Detecting...'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <button
                          type="button"
                          onClick={handleRefreshIp}
                          className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-500 dark:text-slate-400"
                          title="Refresh IP"
                        >
                          <RefreshCw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={handleCopyIp}
                          className="px-2 py-0.5 text-[8.5px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded hover:bg-emerald-500/20"
                        >
                          {copiedIp ? 'Copied' : 'Copy'}
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* Device Model Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ডিভাইসের মডেল' : 'Device Model'}</span>
                    </td>
                    <td className="py-1.5 px-3">
                      <input
                        type="text"
                        value={deviceName}
                        onChange={(e) => setDeviceName(e.target.value)}
                        placeholder="e.g. Infinix Note 30 VIP, Samsung S24"
                        className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded-lg text-[11px] font-semibold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
                      />
                    </td>
                  </tr>

                  {/* OS & Browser Detection Row */}
                  <tr className="hover:bg-slate-100/50 dark:hover:bg-slate-800/30 transition-colors">
                    <td className="py-2 px-3 font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Monitor className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                      <span>{lang === 'bn' ? 'ওএস ও ব্রাউজার' : 'OS & Browser'}</span>
                    </td>
                    <td className="py-2 px-3 text-[10px] font-bold text-slate-700 dark:text-slate-300">
                      {deviceInfo.os} • {deviceInfo.browser}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold rounded-xl transition-colors"
              >
                {lang === 'bn' ? 'বাতিল' : 'Cancel'}
              </button>

              <button
                type="submit"
                disabled={saving}
                className="flex items-center space-x-1.5 px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{lang === 'bn' ? 'প্রোফাইল সেভ করুন' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
