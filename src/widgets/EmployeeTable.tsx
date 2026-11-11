'use client';

import React from 'react';
import { CheckSquare, CheckCircle2, Send } from 'lucide-react';
import { EmployeeWithDetails, RiskLevel } from '@/shared/types';

interface Props {
  employees: EmployeeWithDetails[];
  onOpenTasksModal: (emp: EmployeeWithDetails) => void;
  onCreateBitrixTask: (emp: EmployeeWithDetails) => void;
}

export const EmployeeTable: React.FC<Props> = ({
  employees,
  onOpenTasksModal,
  onCreateBitrixTask,
}) => {
  return (
    <div className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-slate-50/50">
        <h2 className="font-semibold text-sm text-slate-800">
          Мониторинг адаптации новичков ({employees.length})
        </h2>
        <span className="text-xs text-slate-500">
          Кликните по счётчику задач для просмотра и управления чеклистом
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm min-w-[700px]">
          <thead className="bg-slate-50/80 text-slate-500 text-xs uppercase font-semibold border-b border-slate-200 tracking-wider">
            <tr>
              <th className="px-5 py-3.5">Сотрудник / Должность</th>
              <th className="px-5 py-3.5">Отдел / Наставник</th>
              <th className="px-5 py-3.5 text-center">Задачи смены</th>
              <th className="px-5 py-3.5 text-center">Статус риска</th>
              <th className="px-5 py-3.5">Факторы риска и комментарий</th>
              <th className="px-5 py-3.5 text-right">Действие</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {employees.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-8 text-center text-slate-400 italic">
                  Сотрудников в этом отделе пока нет.
                </td>
              </tr>
            ) : (
              employees.map((emp) => {
                const check = emp.latest_check;
                const risk: RiskLevel = check?.risk_level || 'NEW';

                return (
                  <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-900">{emp.full_name}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{emp.role}</div>
                    </td>
                    <td className="px-5 py-4">
                      <div className="text-xs font-semibold text-slate-700">{emp.department}</div>
                      <div className="text-xs text-slate-400 mt-0.5">Наставник: {emp.mentor_name}</div>
                    </td>

                    <td className="px-5 py-4 text-center">
                      <button
                        onClick={() => onOpenTasksModal(emp)}
                        className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition shadow-xs cursor-pointer ${
                          emp.tasks_total === 0
                            ? 'bg-slate-50 hover:bg-slate-100 text-slate-500 border-dashed border-slate-300'
                            : emp.tasks_completed === emp.tasks_total
                              ? 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-300 font-semibold'
                              : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-200'
                        }`}
                        title="Открыть задачи сотрудника"
                      >
                        <CheckSquare className="w-3.5 h-3.5" />
                        <span>{emp.tasks_total === 0 ? '+ Назначить' : `${emp.tasks_completed} / ${emp.tasks_total}`}</span>
                      </button>
                    </td>

                    <td className="px-5 py-4 text-center">
                      {risk === 'RED' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                          🔴 Критический
                        </span>
                      )}
                      {risk === 'YELLOW' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                          🟡 Внимание
                        </span>
                      )}
                      {risk === 'GREEN' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">
                          🟢 В норме
                        </span>
                      )}
                      {risk === 'NEW' && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-100 text-slate-600">
                          ⚪ Ждёт смены
                        </span>
                      )}
                    </td>

                    <td className="px-5 py-4">
                      {check ? (
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-xs">
                            <span className={check.lunch_ok ? 'text-emerald-600 font-medium' : 'text-red-600 font-bold'}>
                              {check.lunch_ok ? '✓ Обед был' : '✗ БЕЗ ОБЕДА'}
                            </span>
                            <span>•</span>
                            <span className={check.mentor_helped ? 'text-emerald-600 font-medium' : 'text-red-600 font-bold'}>
                              {check.mentor_helped ? '✓ Наставник помог' : '✗ ОСТАЛСЯ ОДИН'}
                            </span>
                            <span>•</span>
                            <span className={check.tasks_clear ? 'text-emerald-600 font-medium' : 'text-amber-600 font-medium'}>
                              {check.tasks_clear ? '✓ Задачи ясны' : '⚠ Задачи не ясны'}
                            </span>
                          </div>
                          {check.comment && (
                            <p className="text-xs text-slate-700 italic bg-amber-50/70 p-2 rounded-xl border border-amber-200/70">
                              💬 «{check.comment}»
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Опросов ещё не было</span>
                      )}
                    </td>

                    <td className="px-5 py-4 text-right">
                      {emp.has_bitrix_task ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200">
                          <CheckCircle2 className="w-3.5 h-3.5" /> В Битрикс24
                        </span>
                      ) : (
                        <button
                          onClick={() => onCreateBitrixTask(emp)}
                          className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 shadow-xs transition cursor-pointer"
                        >
                          <Send className="w-3.5 h-3.5 text-blue-600" />
                          <span>1-на-1 в Битрикс24</span>
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
