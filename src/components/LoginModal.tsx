import React, { useState } from 'react';
import { Lock, User, Key, LogIn, ShieldAlert, CheckCircle, Eye, EyeOff, Sparkles, RefreshCw, Crown } from 'lucide-react';
import { UserRole, UserSession } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose?: () => void;
  onLoginSuccess: (user: UserSession) => void;
  lang: 'bn' | 'en';
  currentSheetUrl?: string;
  currentSheetRows?: Record<string, string>[];
}

const AUTH_SHEET_URL = "https://docs.google.com/spreadsheets/d/1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM/edit?gid=2040050330";

export const LoginModal: React.FC<LoginModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  lang,
  currentSheetRows = [],
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const t = {
    en: {
      title: "SMS333 Portal Login",
      subtitle: "Please enter your Username & Password from Google Sheet to unlock the Dashboard",
      usernameLabel: "Username",
      passwordLabel: "Password",
      loginBtn: "Login to Dashboard",
      verifying: "Verifying credentials with Google Sheet...",
      invalid: "Invalid Username or Password! Please check your Google Sheet credentials.",
      adminBadge: "Admin Access",
      successMsg: "Login Successful!",
    },
    bn: {
      title: "SMS333 পোর্টাল লগইন",
      subtitle: "ড্যাশবোর্ড দেখতে আপনার গুগল শিটের Username ও Password লিখুন",
      usernameLabel: "ইউজারনেম (Username)",
      passwordLabel: "পাসওয়ার্ড (Password)",
      loginBtn: "লগইন করুন",
      verifying: "গুগল শিট থেকে তথ্য যাচাই করা হচ্ছে...",
      invalid: "ভুল ইউজারনেম বা পাসওয়ার্ড! গুগল শিটের সঠিক তথ্য দিন।",
      adminBadge: "অ্যাডমিন অ্যাক্সেস",
      successMsg: "সফলভাবে লগইন হয়েছে!",
    },
  }[lang];

  // Helper to extract column value case-insensitively
  const getColVal = (row: Record<string, string>, targetCol: string): string => {
    const key = Object.keys(row).find(
      (k) => k.trim().toLowerCase() === targetCol.toLowerCase()
    );
    return key ? (row[key] || '').toString().trim() : '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const inputUser = username.trim();
    const inputPass = password.trim();

    if (!inputUser || !inputPass) {
      setError(t.invalid);
      setLoading(false);
      return;
    }

    try {
      let candidateRows: Record<string, string>[] = [...currentSheetRows];

      // Fetch official auth sheet data from API
      try {
        const res = await fetch(`/api/sheet-data?url=${encodeURIComponent(AUTH_SHEET_URL)}`, {
          signal: AbortSignal.timeout(15000),
        });
        const contentType = res.headers.get('content-type') || '';
        if (res.ok && contentType.includes('application/json')) {
          const authData = await res.json();
          if (authData && Array.isArray(authData.rows) && authData.rows.length > 0) {
            candidateRows = authData.rows;
          }
        }
      } catch (err) {
        console.warn('Could not fetch external auth sheet, falling back to local or hardcoded checks:', err);
      }

      // Check if matching row exists in sheet
      const matchedRow = candidateRows.find((row) => {
        const u = getColVal(row, 'Username');
        const p = getColVal(row, 'Password');
        return u.toLowerCase() === inputUser.toLowerCase() && p === inputPass;
      });

      if (matchedRow) {
        const uName = getColVal(matchedRow, 'Username') || inputUser;
        const rawRole = getColVal(matchedRow, 'Role').toLowerCase().replace(/[^a-z0-9]/g, '');
        
        let role: UserRole = 'user';
        if (rawRole.includes('superadmin') || rawRole.includes('super') || rawRole.includes('master') || rawRole.includes('owner')) {
          role = 'super_admin';
        } else if (rawRole.includes('admin')) {
          role = 'admin';
        } else {
          role = 'user';
        }

        onLoginSuccess({
          username: uName,
          role: role,
        });
        onClose?.();
        setLoading(false);
        return;
      }

      // Hardcoded fallback demo credentials
      if (inputUser.toLowerCase() === 'superadmin' || inputUser.toLowerCase() === 'super') {
        if (inputPass === '333' || inputPass === 'admin') {
          onLoginSuccess({ username: 'Super Admin', role: 'super_admin' });
          onClose?.();
          setLoading(false);
          return;
        }
      }

      if (inputUser.toLowerCase() === 'admin' || inputUser === '333') {
        if (inputPass === '333' || inputPass === 'admin') {
          onLoginSuccess({ username: 'Admin', role: 'admin' });
          onClose?.();
          setLoading(false);
          return;
        }
      }

      if (inputUser.toLowerCase() === 'user' && inputPass === '333') {
        onLoginSuccess({ username: 'User', role: 'user' });
        onClose?.();
        setLoading(false);
        return;
      }

      // If no match found in sheet
      setError(t.invalid);
    } catch (err: any) {
      console.error('Error during login verification:', err);
      setError(t.invalid);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-md w-full p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200 relative overflow-hidden">
        {/* Top Decorative accent */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600"></div>

        {/* Header */}
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-200 dark:border-emerald-800 mx-auto flex items-center justify-center mb-3 shadow-xs">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-slate-100">{t.title}</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{t.subtitle}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 dark:bg-red-950/60 border border-red-200 dark:border-red-800 rounded-xl text-xs text-red-700 dark:text-red-300 flex items-center gap-2 animate-in fade-in">
              <ShieldAlert className="w-4 h-4 text-red-500 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.usernameLabel}
            </label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Username"
                className="w-full pl-10 pr-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-medium"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {t.passwordLabel}
            </label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs sm:text-sm text-slate-800 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all font-mono"
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

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md flex items-center justify-center space-x-2"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 text-emerald-200 animate-spin" />
                <span>{t.verifying}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-emerald-200" />
                <span>{t.loginBtn}</span>
              </>
            )}
          </button>

          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-full py-2 text-xs text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors font-medium text-center"
            >
              Close Window
            </button>
          )}
        </form>
      </div>
    </div>
  );
};
