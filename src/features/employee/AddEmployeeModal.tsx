'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { DEPARTMENTS } from '@/shared/constants/departments';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { full_name: string; department: string; role: string; mentor_name: string }) => Promise<void>;
}

export const AddEmployeeModal: React.FC<Props> = ({ isOpen, onClose, onSubmit }) => {
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('Склад');
  const [role, setRole] = useState(DEPARTMENTS['Склад'].roles[0]);
  const [mentorName, setMentorName] = useState(DEPARTMENTS['Склад'].mentor);
  const [submitting, setSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleDeptChange = (newDept: string) => {
    setDepartment(newDept);
    const config = DEPARTMENTS[newDept] || DEPARTMENTS['Склад'];
    setRole(config.roles[0]);
    setMentorName(config.mentor);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSubmitting(true);
    await onSubmit({
      full_name: fullName.trim(),
      department,
      role,
      mentor_name: mentorName,
    });
    setSubmitting(false);
    setFullName('');
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
          <h3 className="font-bold text-lg text-slate-800">Добавить нового сотрудника</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-sm">
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">ФИО сотрудника</label>
            <input
              type="text"
              required
              placeholder="Иван Петров"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Отдел компании</label>
            <select
              value={department}
              onChange={(e) => handleDeptChange(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              <option value="Склад">Склад (Опт & Логистика)</option>
              <option value="Магазин">Магазин (Розничная сеть)</option>
              <option value="Продажи">Отдел продаж (B2B/Опт)</option>
              <option value="Офис">Офис & Аналитика</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Должность (список отдела)</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full border border-slate-300 rounded-xl px-3.5 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
            >
              {DEPARTMENTS[department]?.roles.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1">Наставник (закреплён за отделом)</label>
            <input
              type="text"
              required
              value={mentorName}
              readOnly
              className="w-full border border-slate-200 bg-slate-50 text-slate-700 rounded-xl px-3.5 py-2 text-sm focus:outline-none"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">Наставник закрепляется согласно штатному расписанию</span>
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
              disabled={submitting}
              className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-xs cursor-pointer"
            >
              {submitting ? 'Сохранение...' : 'Добавить сотрудника'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
