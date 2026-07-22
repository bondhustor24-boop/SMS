import React from 'react';
import { Lock, ExternalLink, Globe, CheckCircle, Copy, AlertTriangle } from 'lucide-react';

interface AccessInstructionsModalProps {
  sheetUrl: string;
  onRetry: () => void;
  lang: 'bn' | 'en';
}

export const AccessInstructionsModal: React.FC<AccessInstructionsModalProps> = ({
  sheetUrl,
  onRetry,
  lang,
}) => {
  const [copied, setCopied] = React.useState(false);

  const copyUrl = () => {
    navigator.clipboard.writeText(sheetUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const t = {
    en: {
      title: "Google Sheet Access Restricted",
      desc: "This Google Sheet is currently set to private. To display it live on the web, please follow these quick steps in Google Sheets:",
      step1Title: "1. Open Google Sheet",
      step1Desc: "Click the button below to open your SMS333 Google Sheet.",
      step2Title: "2. Click 'Share' (শেয়ার)",
      step2Desc: "Click the blue 'Share' button at the top-right corner.",
      step3Title: "3. General Access Settings",
      step3Desc: "Under General Access, change from 'Restricted' to 'Anyone with the link' (Viewer).",
      step4Title: "4. Done & Reload",
      step4Desc: "Click 'Done', then click 'Retry Loading Sheet' below.",
      openSheet: "Open Google Sheet in New Tab",
      retryBtn: "Retry Loading Sheet",
      copyLink: "Copy Sheet Link",
    },
    bn: {
      title: "গুগল শিট পারমিশন প্রয়োজন",
      subtitle: "এই গুগল শিটটি বর্তমানে প্রাইভেট অবস্থায় আছে। ওয়েবে দেখানোর জন্য গুগল শিটে নিচের ধাপগুলো সম্পন্ন করুন:",
      step1Title: "১. গুগল শিট খুলুন",
      step1Desc: "নিচের বাটনে ক্লিক করে SMS333 গুগল শিটে যান।",
      step2Title: "২. 'Share' বাটনে ক্লিক করুন",
      step2Desc: "উপরে ডানপাশে থাকা নীল 'Share' (শেয়ার) বাটনে চাপ দিন।",
      step3Title: "৩. General Access পরিবর্তন করুন",
      step3Desc: "'Restricted' থেকে পরিবর্তন করে 'Anyone with the link' (Viewer) অপশনটি বেছে নিন।",
      step4Title: "৪. সেভ করুন এবং রিলোড দিন",
      step4Desc: "'Done' বাটনে চাপ দিয়ে নিচে 'পুনরায় চেষ্টা করুন' বাটনে ক্লিক করুন।",
      openSheet: "গুগল শিটে লিংকটি খুলুন",
      retryBtn: "পুনরায় শিট লোড করুন",
      copyLink: "লিংক কপি করুন",
    },
  }[lang];

  return (
    <div className="bg-amber-50/80 border border-amber-200 rounded-2xl p-5 sm:p-6 mb-6 shadow-xs">
      <div className="flex items-start space-x-3.5">
        <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-600 shrink-0">
          <Lock className="w-6 h-6" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-bold text-amber-900 flex items-center gap-2">
            <span>{t.title}</span>
            <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-200 text-amber-800 rounded-full uppercase">
              Action Required
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-amber-800/90 mt-1">
            {t.desc}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs">
              <p className="font-bold text-slate-800 mb-1">{t.step1Title}</p>
              <p className="text-slate-600">{t.step1Desc}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs">
              <p className="font-bold text-slate-800 mb-1">{t.step2Title}</p>
              <p className="text-slate-600">{t.step2Desc}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs">
              <p className="font-bold text-slate-800 mb-1">{t.step3Title}</p>
              <p className="text-slate-600">{t.step3Desc}</p>
            </div>
            <div className="bg-white p-3.5 rounded-xl border border-amber-200/80 text-xs">
              <p className="font-bold text-slate-800 mb-1">{t.step4Title}</p>
              <p className="text-slate-600">{t.step4Desc}</p>
            </div>
          </div>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a
              href={sheetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center space-x-2"
            >
              <span>{t.openSheet}</span>
              <ExternalLink className="w-4 h-4 text-emerald-400" />
            </a>

            <button
              onClick={onRetry}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-xs flex items-center space-x-2"
            >
              <CheckCircle className="w-4 h-4" />
              <span>{t.retryBtn}</span>
            </button>

            <button
              onClick={copyUrl}
              className="px-3.5 py-2.5 bg-white border border-amber-300 hover:bg-amber-100 text-amber-900 font-medium text-xs sm:text-sm rounded-xl transition-all flex items-center space-x-1.5"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'Copied!' : t.copyLink}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
