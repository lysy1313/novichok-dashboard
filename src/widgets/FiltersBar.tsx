'use client';

import React from 'react';
import { ArrowUpDown } from 'lucide-react';

interface Props {
  selectedDept: string;
  onSelectDept: (dept: string) => void;
  sortByRisk: boolean;
  onToggleSort: () => void;
}

export const FiltersBar: React.FC<Props> = ({
  selectedDept,
  onSelectDept,
  sortByRisk,
  onToggleSort,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
      {/* Вкладки отделов */}
      <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
        <span className="text-xs font-semibold text-slate-400 px-2.5">Отдел:</span>
        {['Все', 'Склад', 'Магазин', 'Продажи', 'Офис'].map((dept) => (
          <button
            key={dept}
            onClick={() => onSelectDept(dept)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              selectedDept === dept
                ? 'bg-blue-600 text-white shadow-xs font-semibold'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {dept}
          </button>
        ))}
      </div>

      {/* Кнопка сортировки */}
      <button
        onClick={onToggleSort}
        className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border transition self-start sm:self-auto cursor-pointer ${
          sortByRisk
            ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
            : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
        }`}
      >
        <ArrowUpDown className="w-3.5 h-3.5" />
        <span>{sortByRisk ? 'Сортировка: Сначала в зоне риска (🔴)' : 'Сортировка: По дате добавления'}</span>
      </button>
    </div>
  );
};
