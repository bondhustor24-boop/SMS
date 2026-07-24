import React, { useState } from 'react';
import { Link2, Search, Check, Sparkles, AlertCircle, ChevronDown, ChevronUp, Settings2, Lock } from 'lucide-react';
import { UserRole } from '../types';

interface SheetUrlInputProps {
  currentUrl: string;
  onLoadUrl: (url: string) => void;
  lang: 'bn' | 'en';
  userRole?: UserRole;
}

export const SheetUrlInput: React.FC<SheetUrlInputProps> = ({
  currentUrl,
  onLoadUrl,
  lang,
  userRole = 'user',
}) => {
  const [inputUrl, setInputUrl] = useState(currentUrl);
  const [isExpanded, setIsExpanded] = useState(false);

  const defaultSms333Url = "https://docs.google.com/spreadsheets/d/1hLt1v3C83j7aTu4nev35w9j7dwiVdYRD1QzyUTgWzLM/edit?gid=193362198#gid=193362198";

  const isSuperAdmin = userRole === 'super_admin';

  if (!isSuperAdmin) {
    return null;
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSuperAdmin && inputUrl.trim()) {
      onLoadUrl(inputUrl.trim());
    }
  };

  const handleResetToDefault = () => {
    if (isSuperAdmin) {
      setInputUrl(defaultSms333Url);
      onLoadUrl(defaultSms333Url);
    }
  };

  const t = {
    en: {
      label: "Google Sheet Source Settings",
      toggleShow: "Show Sheet URL Input",
      toggleHide: "Hide Sheet URL Input",
      placeholder: "Paste Google Sheet URL (e.g. https://docs.google.com/spreadsheets/d/...)",
      loadBtn: "Load Sheet",
      defaultBtn: "Reset SMS333 Sheet",
      tip: "Tip: Make sure the Google Sheet is shared with 'Anyone with the link can view' for instant syncing.",
      lockedNotice: "🔒 Changing Google Sheet source requires Super Admin permission. Current mode: View-Only.",
    },
    bn: {
      label: "গুগল শিট সোর্স সেটিংস",
      toggleShow: "গুগল শিট লিঙ্ক পরিবর্তনের বক্স দেখান",
      toggleHide: "শিট লিঙ্ক ইনপুট হাইড করুন",
      placeholder: "গুগল শিট লিঙ্ক পেস্ট করুন (যেমন: https://docs.google.com/spreadsheets/d/...)",
      loadBtn: "শিট লোড করুন",
      defaultBtn: "SMS333 ডিফল্ট শিট",
      tip: "টিপস: শিটটি দেখতে গুগল শিটে 'Anyone with the link can view' পারমিশন দেওয়া থাকতে হবে।",
      lockedNotice: "🔒 গুগল শিট সোর্স লিঙ্ক পরিবর্তনের ক্ষমতা শুধুমাত্র Super Admin এর রয়েছে। বর্তমান রোল: ভিউ-অনলি (View Only)।",
    },
  }[lang];

  return (
    <div className="mb-4">
      {/* Hidden toggle header button */}
      <div className="flex justify-end">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="inline-flex items-center space-x-1 text-[10px] text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 rounded-lg px-2.5 py-1 transition-all shadow-2xs font-medium"
        >
          <Settings2 className="w-3 h-3 text-slate-400" />
          <span>{isExpanded ? t.toggleHide : t.toggleShow}</span>
          {isExpanded ? (
            <ChevronUp className="w-3 h-3" />
          ) : (
            <ChevronDown className="w-3 h-3" />
          )}
        </button>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <div className="bg-white dark:bg-slate-900 rounded-xl p-3 border border-slate-200 dark:border-slate-800 shadow-xs mt-1.5 animate-in fade-in duration-200 text-[10px]">
          {!isSuperAdmin && (
            <div className="mb-2 p-2 bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800/50 rounded-lg text-[10px] text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>{t.lockedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-[10px] font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider space-x-1">
                <Link2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>{t.label}</span>
              </label>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center space-x-1 text-[10px] text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 font-medium underline transition-colors"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{t.defaultBtn}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-1.5">
              <div className="relative flex-1">
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={t.placeholder}
                  className={`w-full pl-3 pr-8 py-1.5 text-[10px] border rounded-lg font-mono ${
                    isSuperAdmin
                      ? 'bg-slate-50 dark:bg-slate-800 border-slate-300 dark:border-slate-700 focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-800 dark:text-slate-100'
                      : 'bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 cursor-not-allowed'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={!isSuperAdmin}
                className={`px-3 py-1.5 font-medium text-[10px] rounded-lg transition-all shadow-xs flex items-center justify-center space-x-1 shrink-0 ${
                  isSuperAdmin
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSuperAdmin ? <Search className="w-3.5 h-3.5 text-emerald-400" /> : <Lock className="w-3.5 h-3.5 text-slate-500" />}
                <span>{t.loadBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1 text-slate-500 text-[10px]">
              <AlertCircle className="w-3 h-3 text-amber-500 shrink-0" />
              <span>{t.tip}</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

