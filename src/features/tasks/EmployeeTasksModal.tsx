'use client';

import React, { useState } from 'react';
import { X, CheckSquare, Square, Trash2, Plus } from 'lucide-react';
import { EmployeeWithDetails } from '@/shared/types';

interface Props {
  employee: EmployeeWithDetails | null;
  onClose: () => void;
  onToggleTask: (taskId: number, currentCompleted: boolean) => Promise<void>;
  onDeleteTask: (taskId: number) => Promise<void>;
  onAddTask: (employeeId: number, title: string) => Promise<void>;
}

export const EmployeeTasksModal: React.FC<Props> = ({
  employee,
  onClose,
  onToggleTask,
  onDeleteTask,
  onAddTask,
}) => {
  const [taskInput, setTaskInput] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!employee) return null;

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    setIsSubmitting(true);
    await onAddTask(employee.id, taskInput.trim());
    setTaskInput('');
    setIsSubmitting(false);
  };

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 z-50">
      <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-slate-100 space-y-4 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-start pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-800 leading-snug">
              Задачи смены: {employee.full_name}
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              {employee.role} ({employee.department}) • Наставник: {employee.mentor_name}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Список задач */}
        <div className="space-y-2 overflow-y-auto pr-1 flex-1 min-h-[120px]">
          {employee.tasks_list.length === 0 ? (
            <p className="text-xs sm:text-sm text-slate-400 py-6 text-center italic bg-slate-50 rounded-2xl">
              Задач пока нет. Добавьте первый пункт ниже!
            </p>
          ) : (
            employee.tasks_list.map((task) => (
              <div
                key={task.id}
                className={`flex items-center justify-between p-3 rounded-xl border text-xs sm:text-sm transition ${
                  task.is_completed
                    ? 'bg-emerald-50/50 border-emerald-200 text-slate-500 line-through'
                    : 'bg-white border-slate-200 text-slate-800 shadow-xs'
                }`}
              >
                <button
                  type="button"
                  onClick={() => onToggleTask(task.id, task.is_completed)}
                  className="flex items-center gap-2.5 text-left flex-1 cursor-pointer"
                >
                  {task.is_completed ? (
                    <CheckSquare className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                  ) : (
                    <Square className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                  <span>{task.title}</span>
                </button>
                <button
                  type="button"
                  onClick={() => onDeleteTask(task.id)}
                  className="text-slate-300 hover:text-red-500 p-1 transition ml-2 cursor-pointer"
                  title="Удалить задачу"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        {/* Форма добавления: на мобилке кнопка снизу инпута! */}
        <form onSubmit={handleAdd} className="pt-2 border-t border-slate-100 flex flex-col gap-2">
          <label className="block text-xs font-semibold text-slate-600">
            Добавить пункт в чеклист новичка:
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              placeholder="Например: Пройти инструктаж по сканеру ТСД..."
              value={taskInput}
              onChange={(e) => setTaskInput(e.target.value)}
              className="flex-1 border border-slate-300 rounded-xl px-3.5 py-2 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
            />
            <button
              type="submit"
              disabled={isSubmitting || !taskInput.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition shadow-xs flex items-center justify-center gap-1 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Добавить</span>
            </button>
          </div>
        </form>

        <div className="pt-2 flex justify-between items-center text-[11px] text-slate-400">
          <span>Синхронизировано с Telegram-ботом</span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg font-medium transition cursor-pointer"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
};
