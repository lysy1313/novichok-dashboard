'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
import { ArrowUpDown } from 'lucide-react';
import {
  EmployeeRow,
  PulseCheckRow,
  EmployeeTaskRow,
  BitrixTaskRow,
  EmployeeWithDetails,
  RiskLevel,
  ToastState,
  ToastType,
} from '@/shared/types';
import { Header } from '@/widgets/Header';
import { KpiCards } from '@/widgets/KpiCards';
import { EmployeeTable } from '@/widgets/EmployeeTable';
import { ToastNotification } from '@/widgets/ToastNotification';
import { AddEmployeeModal } from '@/features/employee/AddEmployeeModal';
import { EmployeeTasksModal } from '@/features/tasks/EmployeeTasksModal';
import { BroadcastTaskModal } from '@/features/tasks/BroadcastTaskModal';

export default function Home() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterDept, setFilterDept] = useState<string>('Все');
  const [sortByRisk, setSortByRisk] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedEmpForTasks, setSelectedEmpForTasks] = useState<EmployeeWithDetails | null>(null);

  const showToast = useCallback((message: string, type: ToastType = 'info') => {
    setToast({ message, type });
  }, []);

  const fetchData = useCallback(async () => {
    const { data: empData, error: empError } = await supabase
      .from('employees')
      .select('*')
      .order('id', { ascending: false })
      .returns<EmployeeRow[]>();

    const { data: checkData } = await supabase
      .from('pulse_checks')
      .select('*')
      .order('id', { ascending: false })
      .returns<PulseCheckRow[]>();

    const { data: tasksData } = await supabase
      .from('employee_tasks')
      .select('id, employee_id, title, is_completed')
      .order('id', { ascending: true })
      .returns<EmployeeTaskRow[]>();

    const { data: bitrixData } = await supabase
      .from('bitrix_tasks')
      .select('employee_id')
      .returns<BitrixTaskRow[]>();

    if (empError) {
      console.error(empError);
      setLoading(false);
      return;
    }

    const bitrixEmpIds = new Set<number>((bitrixData ?? []).map((b: BitrixTaskRow) => b.employee_id));

    const merged: EmployeeWithDetails[] = (empData ?? []).map((emp: EmployeeRow) => {
      const latestCheck = (checkData ?? []).find((c: PulseCheckRow) => c.employee_id === emp.id);
      const empTasks = (tasksData ?? []).filter((t: EmployeeTaskRow) => t.employee_id === emp.id);
      const completedCount = empTasks.filter((t: EmployeeTaskRow) => t.is_completed).length;

      return {
        ...emp,
        latest_check: latestCheck,
        has_bitrix_task: bitrixEmpIds.has(emp.id),
        tasks_total: empTasks.length,
        tasks_completed: completedCount,
        tasks_list: empTasks,
      };
    });

    setEmployees(merged);
    setLoading(false);

    setSelectedEmpForTasks((prev) => {
      if (!prev) return null;
      return merged.find((e) => e.id === prev.id) || null;
    });
  }, []);

  useEffect(() => {
    let active = true;

    async function initialLoad() {
      if (active) {
        await fetchData();
      }
    }

    initialLoad();

    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'pulse_checks' }, () => {
        if (active) fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employees' }, () => {
        if (active) fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'employee_tasks' }, () => {
        if (active) fetchData();
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'bitrix_tasks' }, () => {
        if (active) fetchData();
      })
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [fetchData]);

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4500);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  const handleAddEmployee = async (data: { full_name: string; department: string; role: string; mentor_name: string }) => {
    const { error } = await supabase.from('employees').insert([
      {
        full_name: data.full_name,
        department: data.department,
        role: data.role,
        mentor_name: data.mentor_name,
        hire_date: new Date().toISOString().split('T')[0],
      },
    ]);

    if (!error) {
      showToast(`✅ Сотрудник ${data.full_name} успешно добавлен`, 'success');
      await fetchData();
    } else {
      showToast('Ошибка при добавлении: ' + error.message, 'error');
    }
  };

  const handleCreateBitrixTask = async (emp: EmployeeWithDetails) => {
    const taskTitle = `Срочно 1-на-1: ${emp.full_name} в зоне риска (${emp.latest_check?.comment || 'Скрытый стресс'})`;

    const { error } = await supabase.from('bitrix_tasks').insert([
      {
        employee_id: emp.id,
        task_title: taskTitle,
        assigned_to: emp.mentor_name,
        status: 'created',
      },
    ]);

    if (!error) {
      showToast(`✅ Задача в Битрикс24 назначена: ${emp.mentor_name}`, 'success');
      await fetchData();
    }
  };

  const handleRemind = async () => {
    try {
      const res = await fetch('/api/remind', { method: 'POST' });
      const data = await res.json();
      if (data.sentCount > 0) {
        showToast(`🔔 Реальное напоминание отправлено ${data.sentCount} новичкам в Telegram!`, 'success');
      } else if (data.totalUnchecked > 0) {
        showToast(`ℹ️ Без чекина ${data.totalUnchecked} чел., но у них не привязан Telegram (выберите профиль в боте).`, 'warning');
      } else {
        showToast('Все активные сотрудники уже прошли пульс-опрос сегодня!', 'info');
      }
    } catch {
      showToast('Ошибка при отправке напоминаний через Telegram Bot API', 'error');
    }
  };

  const handleToggleTask = async (taskId: number, currentCompleted: boolean) => {
    await supabase.from('employee_tasks').update({ is_completed: !currentCompleted }).eq('id', taskId);
    await fetchData();
  };

  const handleDeleteTask = async (taskId: number) => {
    await supabase.from('employee_tasks').delete().eq('id', taskId);
    await fetchData();
  };

  const handleAddTask = async (employeeId: number, title: string) => {
    const { error } = await supabase.from('employee_tasks').insert([
      { employee_id: employeeId, title, is_completed: false },
    ]);
    if (!error) {
      showToast(`Пункт «${title}» добавлен`, 'success');
      await fetchData();
    } else {
      showToast('Ошибка добавления задачи: ' + error.message, 'error');
    }
  };

  const handleBroadcast = async (targetDept: string, title: string) => {
    const targetEmployees = targetDept === 'Все'
      ? employees
      : employees.filter((e) => e.department === targetDept);

    if (targetEmployees.length === 0) {
      showToast('Нет активных сотрудников в выбранном отделе', 'warning');
      return;
    }

    const payload = targetEmployees.map((emp) => ({
      employee_id: emp.id,
      title,
      is_completed: false,
    }));

    const { error } = await supabase.from('employee_tasks').insert(payload);
    if (!error) {
      showToast(`📢 Задача «${title}» назначена ${targetEmployees.length} сотрудникам!`, 'success');
      await fetchData();
    } else {
      showToast('Ошибка назначения: ' + error.message, 'error');
    }
  };

  const totalEmployees = employees.length;
  const redRisks = employees.filter((e) => e.latest_check?.risk_level === 'RED').length;
  const yellowRisks = employees.filter((e) => e.latest_check?.risk_level === 'YELLOW').length;
  const sosCount = employees.filter((e) => e.latest_check?.sos_signal).length;

  const processedEmployees = useMemo(() => {
    const baseList = filterDept === 'Все'
      ? [...employees]
      : employees.filter((e) => e.department === filterDept);

    if (sortByRisk) {
      const riskWeight: Record<RiskLevel, number> = {
        'RED': 4,
        'YELLOW': 3,
        'NEW': 2,
        'GREEN': 1,
      };
      baseList.sort((a, b) => {
        const riskA = a.latest_check?.risk_level || 'NEW';
        const riskB = b.latest_check?.risk_level || 'NEW';
        return riskWeight[riskB] - riskWeight[riskA];
      });
    }

    return baseList;
  }, [employees, filterDept, sortByRisk]);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <Header
        loading={loading}
        onRefresh={fetchData}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onRemind={handleRemind}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        <KpiCards
          total={totalEmployees}
          redRisks={redRisks}
          yellowRisks={yellowRisks}
          sosCount={sosCount}
        />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-1.5 bg-white p-1.5 rounded-xl border border-slate-200 overflow-x-auto">
            <span className="text-xs font-semibold text-slate-400 px-2.5">Отдел:</span>
            {['Все', 'Склад', 'Магазин', 'Продажи', 'Офис'].map((dept) => (
              <button
                key={dept}
                onClick={() => setFilterDept(dept)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  filterDept === dept
                    ? 'bg-blue-600 text-white shadow-xs font-semibold'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <button
            onClick={() => setSortByRisk(!sortByRisk)}
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

        <EmployeeTable
          employees={processedEmployees}
          onOpenTasksModal={(emp) => setSelectedEmpForTasks(emp)}
          onCreateBitrixTask={handleCreateBitrixTask}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddEmployee}
      />

      <EmployeeTasksModal
        employee={selectedEmpForTasks}
        onClose={() => setSelectedEmpForTasks(null)}
        onToggleTask={handleToggleTask}
        onDeleteTask={handleDeleteTask}
        onAddTask={handleAddTask}
      />

      <BroadcastTaskModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={handleBroadcast}
      />
    </div>
  );
}
