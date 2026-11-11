'use client';

import React from 'react';
import { CheckCircle, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { ToastState } from '@/shared/types';

interface Props {
  toast: ToastState | null;
  onClose: () => void;
}

export const ToastNotification: React.FC<Props> = ({ toast, onClose }) => {
  if (!toast) return null;

  return (
    <div className="fixed top-16 sm:top-20 right-4 left-4 sm:left-auto sm:right-6 z-50 sm:max-w-md animate-in fade-in slide-in-from-top-4 duration-200">
      <div
        className={`p-3.5 sm:p-4 rounded-2xl shadow-2xl border flex items-start gap-3 backdrop-blur-md ${
          toast.type === 'success'
            ? 'bg-emerald-50/95 border-emerald-300 text-emerald-900'
            : toast.type === 'warning'
              ? 'bg-amber-50/95 border-amber-300 text-amber-900'
              : toast.type === 'error'
                ? 'bg-rose-50/95 border-rose-300 text-rose-900'
                : 'bg-blue-50/95 border-blue-300 text-blue-900'
        }`}
      >
        {toast.type === 'success' && <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />}
        {toast.type === 'warning' && <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
        {toast.type === 'error' && <XCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />}
        {toast.type === 'info' && <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />}

        <div className="flex-1 text-xs sm:text-sm font-medium leading-snug">
          {toast.message}
        </div>

        <button
          onClick={onClose}
          className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
