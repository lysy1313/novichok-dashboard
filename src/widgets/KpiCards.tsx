'use client';

import React from 'react';
import { Users, AlertTriangle, Clock, ShieldAlert } from 'lucide-react';

interface Props {
  total: number;
  redRisks: number;
  yellowRisks: number;
  sosCount: number;
}

export const KpiCards: React.FC<Props> = ({ total, redRisks, yellowRisks, sosCount }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-slate-500 uppercase tracking-wider">Всего новичков</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-slate-800">{total}</p>
          <p className="text-[11px] text-slate-400 mt-0.5">стаж до 3 месяцев</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
          <Users className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-red-200 shadow-xs flex items-center justify-between bg-red-50/30">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-red-600 uppercase tracking-wider">Критический риск</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-red-600">{redRisks}</p>
          <p className="text-[11px] text-red-400 mt-0.5">срочная встреча</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
          <AlertTriangle className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-amber-200 shadow-xs flex items-center justify-between bg-amber-50/30">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-amber-600 uppercase tracking-wider">Внимание</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-amber-600">{yellowRisks}</p>
          <p className="text-[11px] text-amber-500 mt-0.5">непонятны задачи</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
          <Clock className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>

      <div className="bg-white p-4 sm:p-5 rounded-2xl border border-rose-200 shadow-xs flex items-center justify-between bg-rose-50/30">
        <div>
          <p className="text-[11px] sm:text-xs font-semibold text-rose-600 uppercase tracking-wider">SOS сигналы</p>
          <p className="text-xl sm:text-2xl font-bold mt-1 text-rose-600">{sosCount}</p>
          <p className="text-[11px] text-rose-400 mt-0.5">запрос помощи</p>
        </div>
        <div className="w-10 h-10 sm:w-12 sm:h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
          <ShieldAlert className="w-5 h-5 sm:w-6 sm:h-6" />
        </div>
      </div>
    </div>
  );
};
