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
          className="inline-flex items-center space-x-1.5 text-xs text-slate-500 hover:text-slate-800 bg-white border border-slate-200 hover:border-slate-300 rounded-xl px-3 py-1.5 transition-all shadow-2xs font-medium"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-400" />
          <span>{isExpanded ? t.toggleHide : t.toggleShow}</span>
          {isExpanded ? (
            <ChevronUp className="w-3.5 h-3.5" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Expandable Form */}
      {isExpanded && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200 shadow-sm mt-2 animate-in fade-in duration-200">
          {!isSuperAdmin && (
            <div className="mb-3 p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800 flex items-center gap-2">
              <Lock className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{t.lockedNotice}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="flex items-center text-xs font-semibold text-slate-700 uppercase tracking-wider space-x-1.5">
                <Link2 className="w-4 h-4 text-emerald-600" />
                <span>{t.label}</span>
              </label>
              {isSuperAdmin && (
                <button
                  type="button"
                  onClick={handleResetToDefault}
                  className="inline-flex items-center space-x-1 text-xs text-emerald-600 hover:text-emerald-700 font-medium underline transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>{t.defaultBtn}</span>
                </button>
              )}
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <input
                  type="text"
                  disabled={!isSuperAdmin}
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder={t.placeholder}
                  className={`w-full pl-3.5 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl font-mono ${
                    isSuperAdmin
                      ? 'bg-slate-50 border-slate-300 focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-slate-800'
                      : 'bg-slate-100 border-slate-200 text-slate-500 cursor-not-allowed'
                  }`}
                />
              </div>

              <button
                type="submit"
                disabled={!isSuperAdmin}
                className={`px-5 py-2.5 font-medium text-xs sm:text-sm rounded-xl transition-all shadow-sm flex items-center justify-center space-x-2 shrink-0 ${
                  isSuperAdmin
                    ? 'bg-slate-900 hover:bg-slate-800 text-white cursor-pointer'
                    : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                }`}
              >
                {isSuperAdmin ? <Search className="w-4 h-4 text-emerald-400" /> : <Lock className="w-4 h-4 text-slate-500" />}
                <span>{t.loadBtn}</span>
              </button>
            </div>

            <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
              <span>{t.tip}</span>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

