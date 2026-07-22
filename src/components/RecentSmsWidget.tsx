import React from 'react';
import { SheetRow } from '../types';
import { MessageSquare, Clock, ArrowRight, Copy, Check, Calendar, Sparkles } from 'lucide-react';

interface RecentSmsWidgetProps {
  rows: SheetRow[];
  headers: string[];
  loading: boolean;
  lang: 'bn' | 'en';
}

export const RecentSmsWidget: React.FC<RecentSmsWidgetProps> = ({
  rows,
  headers,
  loading,
  lang,
}) => {
  const [copiedIndex, setCopiedIndex] = React.useState<number | null>(null);

  // Take the last 3 rows (or top 3 if non-empty)
  const last3Rows = React.useMemo(() => {
    if (!rows || rows.length === 0) return [];
    // If the sheet is ordered chronologically, the last 3 items are at the end, or reverse order
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
      title: "Last 3 SMS Messages & Timestamps",
      subtitle: "Most recent incoming/outgoing SMS records from Google Sheet",
      copyAll: "Copy",
      copied: "Copied!",
      noData: "No SMS records available yet in sheet.",
      timeLabel: "Time/Date",
      smsLabel: "SMS Content",
      rowNum: "Row",
    },
    bn: {
      title: "সর্বশেষ ৩টি এসএমেস (SMS) ও সময়সূচী",
      subtitle: "গুগল শিটের সবচেয়ে নতুন ৩টি বার্তা এবং প্রেরণের সময়",
      copyAll: "কপি",
      copied: "কপি হয়েছে!",
      noData: "শিটে এখনও কোনো মেসেজ রেকর্ড পাওয়া যায়নি।",
      timeLabel: "সময়/তারিখ",
      smsLabel: "এসএমএস মেসেজ",
      rowNum: "সারি নং",
    },
  }[lang];

  if (loading && last3Rows.length === 0) {
    return (
      <div className="bg-white rounded-2xl border border-slate-200 p-5 mb-6 shadow-2xs">
        <div className="flex items-center space-x-2 mb-3">
          <MessageSquare className="w-5 h-5 text-emerald-600 animate-pulse" />
          <h2 className="text-sm font-bold text-slate-800">{t.title}</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="h-28 bg-slate-100 rounded-xl animate-pulse p-4"
            ></div>
          ))}
        </div>
      </div>
    );
  }

  if (last3Rows.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-emerald-200/80 p-5 mb-6 shadow-xs relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute -right-10 -top-10 w-40 h-40 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none"></div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-xl border border-emerald-500/20">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <span>{t.title}</span>
              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-700 rounded-full border border-emerald-200">
                Latest 3
              </span>
            </h2>
            <p className="text-xs text-slate-500">{t.subtitle}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
        {last3Rows.map((row, idx) => {
          const smsText = messageCol ? row[messageCol] : '';
          const timeText = timeCol ? row[timeCol] : '';
          const senderText = senderCol ? row[senderCol] : null;

          return (
            <div
              key={row._id || idx}
              className="bg-slate-50/80 border border-slate-200 hover:border-emerald-400 rounded-xl p-4 transition-all hover:shadow-sm flex flex-col justify-between group relative"
            >
              <div>
                {/* Header row with badge & copy */}
                <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-200/60">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
                    <span className="text-[11px] font-mono font-bold text-slate-600">
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
                    className="flex items-center space-x-1 text-[11px] font-medium text-slate-500 hover:text-emerald-600 transition-colors bg-white border border-slate-200 rounded-lg px-2 py-1"
                    title="Copy SMS & Timestamp"
                  >
                    {copiedIndex === idx ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span className="text-emerald-600 font-bold">
                          {t.copied}
                        </span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3" />
                        <span>{t.copyAll}</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Sender info if present */}
                {senderText && (
                  <div className="text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                    <span className="text-slate-400">From:</span>
                    <span className="bg-slate-200/60 px-1.5 py-0.5 rounded text-slate-800 font-mono">
                      {senderText}
                    </span>
                  </div>
                )}

                {/* SMS Content */}
                <div className="text-xs text-slate-800 font-medium leading-relaxed bg-white p-2.5 rounded-lg border border-slate-200/80 mb-3 min-h-[48px] break-words">
                  {smsText || <span className="text-slate-400 italic">Empty SMS text</span>}
                </div>
              </div>

              {/* Timestamp footer */}
              <div className="flex items-center text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1.5 rounded-lg border border-emerald-200/60 mt-1">
                <Clock className="w-3.5 h-3.5 mr-1.5 text-emerald-600 shrink-0" />
                <span className="truncate">
                  {timeText || 'No timestamp specified'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
