'use client';

import React, { useState } from 'react';
import { X, Megaphone } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onBroadcast: (targetDept: string, title: string) => Promise<void>;
}

export const BroadcastTaskModal: React.FC<Props> = ({ isOpen, onClose, onBroadcast }) => {
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [targetDept, setTargetDept] = useState('Все');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle.trim()) return;

    setIsSubmitting(true);
    await onBroadcast(targetDept, broadcastTitle.trim());
    setIsSubmitting(false);
    setBroadcastTitle('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center">
              <Megaphone className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-lg text-slate-800">Общая задача для новичков</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer p-1">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Кому назначить</label>
            <select
              value={targetDept}
              onChange={(e) => setTargetDept(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
            >
              <option value="Все">Всем новичкам (все отделы)</option>
              <option value="Склад">Только сотрудникам Склада</option>
              <option value="Магазин">Только сотрудникам Магазинов</option>
              <option value="Продажи">Только Отделу продаж</option>
              <option value="Офис">Только Офису</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Текст задачи</label>
            <input
              type="text"
              required
              placeholder="Например: Пройти инструктаж по пожарной безопасности"
              value={broadcastTitle}
              onChange={(e) => setBroadcastTitle(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 transition cursor-pointer"
            >
              Отмена
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !broadcastTitle.trim()}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-medium transition shadow-xs cursor-pointer"
            >
              {isSubmitting ? 'Назначение...' : 'Назначить'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
