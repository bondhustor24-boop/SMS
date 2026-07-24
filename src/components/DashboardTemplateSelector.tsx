import React from 'react';
import { Layout, Shield, Cpu, BarChart3, Feather, Layers, Check } from 'lucide-react';

export type DashboardTemplateId = 'executive' | 'cyber' | 'navy' | 'minimal' | 'operations';

export interface DashboardTemplateOption {
  id: DashboardTemplateId;
  nameEn: string;
  nameBn: string;
  descriptionEn: string;
  descriptionBn: string;
  icon: React.ComponentType<{ className?: string }>;
  colorBg: string;
  badgeBg: string;
  borderColor: string;
}

export const DASHBOARD_TEMPLATES: DashboardTemplateOption[] = [
  {
    id: 'executive',
    nameEn: 'Executive Emerald',
    nameBn: '১. এক্সিকিউটিভ প্রফেশনাল',
    descriptionEn: 'Modern emerald accents, clean white/slate cards, balanced executive metrics.',
    descriptionBn: 'আধুনিক এমারেল্ড থিম, সুবিন্যস্ত কার্ড এবং এক্সিকিউটিভ ড্যাশবোর্ড।',
    icon: Shield,
    colorBg: 'bg-emerald-500',
    badgeBg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
    borderColor: 'hover:border-emerald-500',
  },
  {
    id: 'cyber',
    nameEn: 'Cyber Command',
    nameBn: '২. সাইবার কমান্ড সেন্টার',
    descriptionEn: 'High-tech dark HUD mode with glowing cyan/neon indicators.',
    descriptionBn: 'হাই-টেক গ্লোয়িং ডার্ক মোড এবং সাইবার কমান্ড সেন্টার ভিউ।',
    icon: Cpu,
    colorBg: 'bg-cyan-500',
    badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/30',
    borderColor: 'hover:border-cyan-400',
  },
  {
    id: 'navy',
    nameEn: 'Corporate Analytics',
    nameBn: '৩. করপোরেট অ্যানালিটিক্স',
    descriptionEn: 'Deep navy & indigo financial analytics layout with high contrast stats.',
    descriptionBn: 'গভীর নেভি ব্লু এবং অ্যানালিটিক্স রিচ করপোরেট ড্যাশবোর্ড।',
    icon: BarChart3,
    colorBg: 'bg-indigo-600',
    badgeBg: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    borderColor: 'hover:border-indigo-500',
  },
  {
    id: 'minimal',
    nameEn: 'Studio Minimalist',
    nameBn: '৪. মিনিমাল স্টুডিও',
    descriptionEn: 'Ultra-clean warm neutral design with elegant spacing and subtle details.',
    descriptionBn: 'স্পেসিয়াস ও মার্জিত মিনিমালিস্টিক লাইট ইন্টারফেস।',
    icon: Feather,
    colorBg: 'bg-slate-700',
    badgeBg: 'bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-400/20',
    borderColor: 'hover:border-slate-400',
  },
  {
    id: 'operations',
    nameEn: 'Field Operations Matrix',
    nameBn: '৫. ফিল্ড অপারেটিভ মেট্রিক্স',
    descriptionEn: 'High-density operational view optimized for fast SMS data searching.',
    descriptionBn: 'দ্রুত এসএমএস সার্চিং এবং ফিল্ড ডাটা মনিটরিং ডাটা গ্রিড।',
    icon: Layers,
    colorBg: 'bg-amber-500',
    badgeBg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    borderColor: 'hover:border-amber-500',
  },
];

interface DashboardTemplateSelectorProps {
  currentTemplate: DashboardTemplateId;
  onSelectTemplate: (templateId: DashboardTemplateId) => void;
  lang: 'bn' | 'en';
}

export const DashboardTemplateSelector: React.FC<DashboardTemplateSelectorProps> = ({
  currentTemplate,
  onSelectTemplate,
  lang,
}) => {
  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3 sm:p-4 mb-5 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3 pb-2.5 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg border border-emerald-500/20">
            <Layout className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 tracking-tight flex items-center gap-2">
              <span>{lang === 'bn' ? 'ড্যাশবোর্ড ৫ টি প্রফেশনাল টেমপ্লেট' : 'Dashboard 5 Professional Templates'}</span>
              <span className="text-[9px] font-bold bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                5 Themes Live
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              {lang === 'bn'
                ? 'আপনার পছন্দ অনুযায়ী ড্যাশবোর্ড লেআউট সিলেক্ট করুন'
                : 'Select your preferred professional dashboard interface template'}
            </p>
          </div>
        </div>
      </div>

      {/* 5 Template Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2.5">
        {DASHBOARD_TEMPLATES.map((tmpl) => {
          const Icon = tmpl.icon;
          const isSelected = currentTemplate === tmpl.id;

          return (
            <button
              key={tmpl.id}
              onClick={() => onSelectTemplate(tmpl.id)}
              className={`p-2.5 sm:p-3 rounded-xl border text-left transition-all relative flex flex-col justify-between group ${
                isSelected
                  ? 'bg-slate-50 dark:bg-slate-800/90 border-emerald-500 dark:border-emerald-400 ring-2 ring-emerald-500/20 shadow-sm'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-2xs'
              }`}
            >
              {isSelected && (
                <span className="absolute top-2 right-2 p-0.5 bg-emerald-500 text-white rounded-full">
                  <Check className="w-2.5 h-2.5" />
                </span>
              )}

              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <div
                    className={`p-1.5 rounded-lg text-white ${tmpl.colorBg} shadow-2xs group-hover:scale-105 transition-transform`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[10.5px] font-extrabold text-slate-900 dark:text-slate-100 truncate">
                    {lang === 'bn' ? tmpl.nameBn : tmpl.nameEn}
                  </span>
                </div>

                <p className="text-[9.5px] text-slate-500 dark:text-slate-400 font-medium line-clamp-2 leading-relaxed">
                  {lang === 'bn' ? tmpl.descriptionBn : tmpl.descriptionEn}
                </p>
              </div>

              <div className="mt-2 pt-1.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between">
                <span
                  className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded border ${tmpl.badgeBg}`}
                >
                  {isSelected ? (lang === 'bn' ? 'সক্রিয়' : 'Active') : (lang === 'bn' ? 'নির্বাচন করুন' : 'Select')}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
