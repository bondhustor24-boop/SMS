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

  // Device Specs (Auto Detected)
  const [deviceInfo, setDeviceInfo] = useState({
    deviceType: 'desktop' as 'desktop' | 'mobile' | 'tablet',
    browser: 'Chrome Browser',
    os: 'Windows 11',
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

    // 2. Fetch record from Firebase Firestore
    try {
      const fbUser = await getFirebaseUserByUsername(currentUser.username);
      if (fbUser) {
        setUserRecord(fbUser);
        setFullName(fbUser.fullName || fbUser.username);
        setUsername(fbUser.username);
        setEmailAddress(fbUser.emailAddress || `${fbUser.username}@sms333.com`);
        setPassword(fbUser.password || '******');
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

      await saveUserToFirebase({
        id: userRecord?.id,
        fullName: fullName.trim() || username.trim(),
        username: username.trim(),
        password: password.trim(),
        emailAddress: emailAddress.trim() || `${username.trim()}@sms333.com`,
        ipAddress: currentIp || ipAddress,
        role: currentUser.role,
        status: userRecord?.status || 'active',
        createdAt: userRecord?.createdAt || new Date().toISOString(),
      });

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
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-lg w-full p-5 my-auto text-[11px] relative overflow-hidden">
        {/* Subtle Decorative Glow */}
        <div className="absolute -right-16 -top-16 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 mb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/30">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <span>{lang === 'bn' ? 'ইউজার প্রোফাইল এডিট' : 'Edit User Profile'}</span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase border ${
                    currentUser.role === 'super_admin'
                      ? 'bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                  }`}
                >
                  {currentUser.role.replace('_', ' ')}
                </span>
              </h2>
              <p className="text-[10px] text-slate-500 dark:text-slate-400">
                {lang === 'bn'
                  ? 'আপনার ব্যক্তিগত তথ্য, পাসওয়ার্ড ও আইপি ডিটেইলস আপডেট করুন'
                  : 'Manage your profile credentials, password & auto IP detection'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Status Alert Banner */}
        {statusMsg && (
          <div
            className={`p-3 rounded-xl text-[10px] font-medium flex items-center gap-2 mb-4 ${
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

        <form onSubmit={handleSaveProfile} className="space-y-3.5">
          {/* Full Name */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'bn' ? 'ফুল নাম (Full Name)' : 'Full Name'}</span>
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Md. Rahat Hossain"
              className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
            />
          </div>

          {/* Username & Email Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Username (Read Only / Locked) */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Shield className="w-3.5 h-3.5 text-emerald-500" />
                  <span>{lang === 'bn' ? 'ইউজারনেম (Username)' : 'Username'}</span>
                </span>
                <span className="text-[8.5px] font-semibold text-slate-400 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.2 rounded flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5 text-amber-500" />
                  {lang === 'bn' ? 'অপরিবর্তনযোগ্য' : 'Locked'}
                </span>
              </label>
              <input
                type="text"
                readOnly
                disabled
                value={username}
                className="w-full px-3 py-2 bg-slate-200/60 dark:bg-slate-800/60 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400 cursor-not-allowed select-none opacity-80"
              />
            </div>

            {/* Email Address */}
            <div>
              <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-emerald-500" />
                <span>{lang === 'bn' ? 'ইমেইল এড্রেস (Email)' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                required
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                placeholder="user@sms333.com"
                className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-medium text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div>
            <label className="block text-[10px] font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5 text-emerald-500" />
              <span>{lang === 'bn' ? 'পাসওয়ার্ড (Password)' : 'Password'}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-3 pr-10 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-[11px] font-mono font-bold text-slate-900 dark:text-slate-100 focus:ring-2 focus:ring-emerald-500/50 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* AUTO IP ADDRESS & DEVICE SPECS BOX */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                <Globe className="w-4 h-4 text-emerald-500" />
                <span>
                  {lang === 'bn' ? 'অটো আইপি ও ডিভাইস ডিটেইলস' : 'Auto IP & Device Details'}
                </span>
                <Sparkles className="w-3 h-3 text-amber-500" />
              </div>

              <button
                type="button"
                onClick={handleRefreshIp}
                className="p-1 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-md text-slate-500 dark:text-slate-400 transition-colors"
                title="Refresh IP Address"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              </button>
            </div>

            {/* IP Address Row */}
            <div className="flex items-center justify-between p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400">
                  {lang === 'bn' ? 'আপনার আইপি:' : 'IP Address:'}
                </span>
                <span className="font-mono font-bold text-slate-900 dark:text-slate-100 text-[11px]">
                  {ipAddress || 'Detecting...'}
                </span>
              </div>

              <button
                type="button"
                onClick={handleCopyIp}
                className="flex items-center space-x-1 px-2 py-0.5 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 rounded-md hover:bg-emerald-500/20 transition-colors"
              >
                {copiedIp ? (
                  <>
                    <Check className="w-3 h-3" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    <span>Copy IP</span>
                  </>
                )}
              </button>
            </div>

            {/* Device Name & Specs Row */}
            <div className="grid grid-cols-2 gap-2 text-[9.5px]">
              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                {deviceInfo.deviceType === 'mobile' ? (
                  <Smartphone className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : deviceInfo.deviceType === 'tablet' ? (
                  <Tablet className="w-4 h-4 text-emerald-500 shrink-0" />
                ) : (
                  <Monitor className="w-4 h-4 text-emerald-500 shrink-0" />
                )}
                <div className="min-w-0">
                  <p className="text-[8.5px] text-slate-400 uppercase font-bold">Device Name / OS</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {deviceInfo.os}
                  </p>
                </div>
              </div>

              <div className="p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center space-x-2">
                <Globe className="w-4 h-4 text-sky-500 shrink-0" />
                <div className="min-w-0">
                  <p className="text-[8.5px] text-slate-400 uppercase font-bold">Browser Version</p>
                  <p className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    {deviceInfo.browser}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-2 pt-3 border-t border-slate-100 dark:border-slate-800">
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
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              <span>{lang === 'bn' ? 'প্রোফাইল সেভ করুন' : 'Save Profile'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
