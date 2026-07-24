import React from 'react';
import { RefreshCw, MessageSquare, Database, Sparkles } from 'lucide-react';

interface LoadingSpinnerProps {
  message?: string;
  submessage?: string;
  fullScreen?: boolean;
  inline?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  message = 'Loading Live SMS Data...',
  submessage = 'Connecting to Google Sheets & Syncing...',
  fullScreen = false,
  inline = false,
}) => {
  if (inline) {
    return (
      <div className="flex items-center justify-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium text-xs py-2">
        <RefreshCw className="w-4 h-4 animate-spin text-emerald-500" />
        <span>{message}</span>
      </div>
    );
  }

  const content = (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-4">
      {/* Outer Glowing Ring & Rotating Spinner */}
      <div className="relative flex items-center justify-center">
        {/* Glowing Background Pulsing Ring */}
        <div className="absolute w-16 h-16 rounded-full bg-emerald-500/20 dark:bg-emerald-500/30 animate-ping"></div>
        <div className="absolute w-20 h-20 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 animate-pulse"></div>

        {/* Outer Rotating Border Spinner */}
        <div className="w-14 h-14 border-4 border-emerald-200 dark:border-emerald-950 border-t-emerald-600 dark:border-t-emerald-400 rounded-full animate-spin"></div>

        {/* Inner Pulsing Icon */}
        <div className="absolute flex items-center justify-center p-2.5 bg-emerald-600 text-white rounded-full shadow-lg">
          <MessageSquare className="w-5 h-5 animate-bounce" />
        </div>
      </div>

      {/* Loading Status Text */}
      <div className="space-y-1 max-w-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-slate-100 flex items-center justify-center gap-1.5">
          <span>{message}</span>
          <Sparkles className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
        </h3>
        {submessage && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {submessage}
          </p>
        )}
      </div>

      {/* Progress Dots */}
      <div className="flex items-center justify-center gap-1.5 pt-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
      </div>
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl">
          {content}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm p-6 my-4">
      {content}
    </div>
  );
};
