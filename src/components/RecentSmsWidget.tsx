import React, { useState, useEffect } from 'react';
import { SheetRow, UserRole } from '../types';
import {
  MessageSquare,
  Clock,
  Copy,
  Check,
  Sparkles,
  PhoneCall,
  User,
  LayoutGrid,
  MessageCircle,
  ListFilter,
  Send,
  Smartphone,
  Save,
  Crown,
  Lock,
} from 'lucide-react';
import { LoadingSpinner } from './LoadingSpinner';

interface RecentSmsWidgetProps {
  rows: SheetRow[];
  headers: string[];
  loading: boolean;
  lang: 'bn' | 'en';
  userRole?: UserRole;
}

type TemplateStyle = 'cards' | 'chat' | 'compact';

export const RecentSmsWidget: React.FC<RecentSmsWidgetProps> = ({
  rows,
  headers,
  loading,
  lang,
  userRole,
}) => {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [templateStyle, setTemplateStyle] = useState<TemplateStyle>(() => {
    try {
      const saved = localStorage.getItem('sms333_sms_template');
      return (saved as TemplateStyle) || 'cards';
    } catch {
      return 'cards';
    }
  });
  const [isSaved, setIsSaved] = useState(false);

  // Sync template setting live across all active user dashboards
  useEffect(() => {
    const syncTemplate = () => {
      try {
        const saved = localStorage.getItem('sms333_sms_template');
        if (saved && (saved === 'cards' || saved === 'chat' || saved === 'compact')) {
          setTemplateStyle(saved as TemplateStyle);
        }
      } catch (err) {
        console.error('Error syncing SMS template:', err);
      }
    };

    syncTemplate();
    window.addEventListener('sms333_template_updated', syncTemplate);
    window.addEventListener('storage', syncTemplate);
    const interval = setInterval(syncTemplate, 1000);

    return () => {
      window.removeEventListener('sms333_template_updated', syncTemplate);
      window.removeEventListener('storage', syncTemplate);
      clearInterval(interval);
    };
  }, []);

  const handleSelectAndSaveTemplate = (selected: TemplateStyle) => {
    setTemplateStyle(selected);
    localStorage.setItem('sms333_sms_template', selected);
    window.dispatchEvent(new Event('sms333_template_updated'));
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 1200);
  };

  // Take the last 3 rows (or top 3 if non-empty)
  const last3Rows = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    return [...rows].slice(-3).reverse();
  }, [rows]);

  // Find column candidates for message, phone/sender, date/time
  const findColumn = (keywords: string[]) => {
    return headers.find((h) =>
      keywords.some((kw) => h.toLowerCase().includes(kw))
    );
  };

  const messageCol =
    findColumn(['message', 'sms', 'body', 'text', 'content', 'বার্তা', 'মেসেজ']) ||
    headers[1] ||
    headers[0];
  const timeCol =
    findColumn(['time', 'date', 'created', 'timestamp', 'তারিখ', 'সময়']) ||
    headers.find((h) => h !== messageCol) ||
    headers[0];
  const senderCol = findColumn([
    'sender',
    'phone',
    'number',
    'from',
    'mobile',
    'নাম্বার',
    'প্রেরক',
  ]);

  const copyText = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const t = {
    en: {
      title: "Last 3 SMS Messages & Template Design",
      subtitle: "Live preview of the 3 most recent incoming & outgoing SMS",
      copyAll: "Copy",
      copied: "Copied!",
      noData: "No SMS records found in sheet yet.",
      rowNum: "Row",
      latestBadge: "Latest Live SMS",
      templateCards: "Cards Template",
      templateChat: "Phone Chat Template",
      templateCompact: "Compact Template",
      loadingText: "Loading Latest 3 SMS Messages...",
    },
    bn: {
      title: "সর্বশেষ ৩টি এসএমেস টেমপ্লেট ডিজাইন",
      subtitle: "গুগল শিটের সবচেয়ে নতুন ৩টি এসএমএস লাইভ টেমপ্লেটে দেখুন",
      copyAll: "কপি",
      copied: "কপি হয়েছে!",
      noData: "শিটে এখনও কোনো এসএমএস বার্তা পাওয়া যায়নি।",
      rowNum: "সারি",
      latestBadge: "লাইভ ৩টি এসএমএস",
      templateCards: "কার্ড টেমপ্লেট",
      templateChat: "ফোন চ্যাট টেমপ্লেট",
      templateCompact: "কমপ্যাক্ট টেমপ্লেট",
      loadingText: "সর্বশেষ ৩টি এসএমএস লোড হচ্ছে...",
    },
  }[lang];

  if (loading && last3Rows.length === 0) {
    return (
      <LoadingSpinner
        message={t.loadingText}
        submessage={lang === 'bn' ? 'গুগল শিট থেকে ডেটা প্রসেস হচ্ছে...' : 'Processing Google Sheet data...'}
      />
    );
  }

  if (last3Rows.length === 0) return null;

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-emerald-500/30 dark:border-slate-800 p-4 mb-5 shadow-sm relative overflow-hidden text-[10px]">
      {/* Background Subtle Gradient Glow */}
      <div className="absolute -right-12 -top-12 w-40 h-40 bg-emerald-500/10 dark:bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3.5 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 rounded-xl border border-emerald-500/30 shadow-xs">
            <MessageSquare className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <span>{t.title}</span>
              <span className="px-2 py-0.5 text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-amber-500" />
                {t.latestBadge}
              </span>
            </h2>
            <p className="text-[10px] text-slate-500 dark:text-slate-400">{t.subtitle}</p>
          </div>
        </div>

        {/* Template Style Selector */}
        <div className="flex items-center gap-1.5">
          {userRole === 'super_admin' ? (
            <div className="flex items-center space-x-1 bg-slate-100 dark:bg-slate-800 p-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
              <span className="text-[8px] font-bold text-amber-500 bg-amber-500/10 px-1.5 py-0.5 rounded flex items-center gap-0.5 border border-amber-500/20 mr-0.5">
                <Crown className="w-2.5 h-2.5" /> Admin Control
              </span>

              <button
                onClick={() => handleSelectAndSaveTemplate('cards')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-all ${
                  templateStyle === 'cards'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <LayoutGrid className="w-3 h-3" />
                <span>{t.templateCards}</span>
              </button>

              <button
                onClick={() => handleSelectAndSaveTemplate('chat')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-all ${
                  templateStyle === 'chat'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>{t.templateChat}</span>
              </button>

              <button
                onClick={() => handleSelectAndSaveTemplate('compact')}
                className={`flex items-center space-x-1 px-2 py-1 rounded-md text-[9px] font-semibold transition-all ${
                  templateStyle === 'compact'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <ListFilter className="w-3 h-3" />
                <span>{t.templateCompact}</span>
              </button>

              {isSaved && (
                <span className="flex items-center gap-1 text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30 animate-pulse">
                  <Check className="w-3 h-3 text-emerald-500" />
                  {lang === 'bn' ? 'সেভ হয়েছে!' : 'Saved for all!'}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-1.5 bg-slate-100 dark:bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-[9px] font-semibold text-slate-700 dark:text-slate-300">
              <Lock className="w-3 h-3 text-amber-500" />
              <span>
                {lang === 'bn' ? 'এডমিন নির্বাচিত টেমপ্লেট:' : 'Admin Template:'}
              </span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                {templateStyle === 'cards'
                  ? t.templateCards
                  : templateStyle === 'chat'
                  ? t.templateChat
                  : t.templateCompact}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* TEMPLATE 1: Modern Executive Cards */}
      {templateStyle === 'cards' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {last3Rows.map((row, idx) => {
            const smsText = messageCol ? row[messageCol] : '';
            const timeText = timeCol ? row[timeCol] : '';
            const senderText = senderCol ? row[senderCol] : null;

            return (
              <div
                key={row._id || idx}
                className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 hover:border-emerald-500 dark:hover:border-emerald-500 rounded-2xl p-3.5 transition-all shadow-xs hover:shadow-md flex flex-col justify-between group relative text-[11px]"
              >
                <div>
                  {/* Top Badge Row */}
                  <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-slate-100 dark:border-slate-800">
                    <div className="flex items-center space-x-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                        #{idx + 1} ({t.rowNum} {row._id})
                      </span>
                    </div>

                    <button
                      onClick={() =>
                        copyText(
                          `SMS: ${smsText || ''}\nTime: ${timeText || ''}`,
                          idx
                        )
                      }
                      className="flex items-center space-x-1 text-[10px] font-bold text-slate-700 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-2.5 py-1 shadow-2xs hover:bg-slate-100 dark:hover:bg-slate-700"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                          <span className="text-emerald-600 dark:text-emerald-400">
                            {t.copied}
                          </span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3 h-3 text-slate-500" />
                          <span>{t.copyAll}</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* Sender Header if available */}
                  {senderText && (
                    <div className="flex items-center gap-1.5 text-[10px] font-semibold text-slate-700 dark:text-slate-300 mb-2">
                      <PhoneCall className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span className="text-slate-400">From:</span>
                      <span className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-bold border border-emerald-500/20">
                        {senderText}
                      </span>
                    </div>
                  )}

                  {/* SMS Bubble Text */}
                  <div className="text-[11px] text-slate-900 dark:text-slate-100 font-medium leading-relaxed bg-slate-50 dark:bg-slate-800/80 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/80 mb-2.5 min-h-[48px] break-words shadow-2xs">
                    {smsText || <span className="text-slate-400 italic">Empty SMS text</span>}
                  </div>
                </div>

                {/* Footer Timestamp */}
                <div className="flex items-center text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700">
                  <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-500 shrink-0" />
                  <span className="truncate font-mono">{timeText || 'N/A'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TEMPLATE 2: Smartphone Chat Bubbles */}
      {templateStyle === 'chat' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {last3Rows.map((row, idx) => {
            const smsText = messageCol ? row[messageCol] : '';
            const timeText = timeCol ? row[timeCol] : '';
            const senderText = senderCol ? row[senderCol] : `SMS Sender #${idx + 1}`;

            return (
              <div
                key={row._id || idx}
                className="bg-slate-900 dark:bg-slate-950 text-slate-100 rounded-2xl p-3.5 border border-slate-800 shadow-xl flex flex-col justify-between relative overflow-hidden"
              >
                {/* Glow detail */}
                <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none"></div>

                {/* Simulated Phone Top Bar */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5 mb-3 relative z-10">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px] shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="font-bold text-[11px] text-slate-100 truncate max-w-[120px]">
                        {senderText}
                      </p>
                      <span className="text-[8.5px] font-bold text-emerald-400 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        Live Incoming SMS
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => copyText(smsText, idx)}
                    className="p-1.5 hover:bg-slate-800 text-slate-400 hover:text-emerald-400 rounded-lg transition-colors border border-slate-800"
                    title="Copy SMS"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>

                {/* Chat Bubble Message */}
                <div className="relative bg-emerald-600 text-white p-3 rounded-2xl rounded-tl-xs mb-3 text-[11px] leading-relaxed shadow-sm font-medium">
                  <p className="break-words">{smsText || 'Empty SMS message'}</p>
                </div>

                {/* Timestamp */}
                <div className="flex items-center justify-end space-x-1.5 text-[9px] text-slate-400 font-mono font-semibold">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{timeText || 'No timestamp'}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TEMPLATE 3: Compact Executive List */}
      {templateStyle === 'compact' && (
        <div className="space-y-2">
          {last3Rows.map((row, idx) => {
            const smsText = messageCol ? row[messageCol] : '';
            const timeText = timeCol ? row[timeCol] : '';

            return (
              <div
                key={row._id || idx}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-xl hover:border-emerald-500 dark:hover:border-emerald-500 transition-all shadow-xs hover:shadow-md"
              >
                <div className="flex items-start space-x-3 min-w-0 flex-1">
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-mono font-bold rounded-md text-[10px] shrink-0 mt-0.5 border border-emerald-500/20">
                    #{idx + 1}
                  </span>
                  <p className="text-[11px] text-slate-900 dark:text-slate-100 font-medium truncate">
                    {smsText || 'No text'}
                  </p>
                </div>

                <div className="flex items-center justify-between sm:justify-end space-x-3 shrink-0">
                  <span className="text-[10px] font-mono font-semibold text-slate-500 dark:text-slate-400 flex items-center gap-1.5 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-700">
                    <Clock className="w-3.5 h-3.5 text-emerald-500" />
                    {timeText}
                  </span>

                  <button
                    onClick={() => copyText(smsText, idx)}
                    className="p-1.5 text-slate-500 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors bg-slate-100 dark:bg-slate-800 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700"
                    title="Copy SMS"
                  >
                    {copiedIndex === idx ? (
                      <Check className="w-3.5 h-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
