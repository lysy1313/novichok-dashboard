'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/lib/supabase';
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

export function useOnboarding() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterDept, setFilterDept] = useState<string>('Все');
  const [sortByRisk, setSortByRisk] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState | null>(null);

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

  const addEmployee = async (data: { full_name: string; department: string; role: string; mentor_name: string }) => {
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

  const createBitrixTask = async (emp: EmployeeWithDetails) => {
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

  const sendTelegramReminder = async () => {
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

  const toggleTask = async (taskId: number, currentCompleted: boolean) => {
    await supabase.from('employee_tasks').update({ is_completed: !currentCompleted }).eq('id', taskId);
    await fetchData();
  };

  const deleteTask = async (taskId: number) => {
    await supabase.from('employee_tasks').delete().eq('id', taskId);
    await fetchData();
  };

  const addTask = async (employeeId: number, title: string) => {
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

  const broadcastTask = async (targetDept: string, title: string) => {
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

  // Снятие тревоги SOS со стороны HR
  const resolveSos = async (checkId: number, check: PulseCheckRow) => {
    // Пересчитываем реальный уровень риска без фактора SOS
    let recalculatedRisk: RiskLevel = 'GREEN';
    if (!check.lunch_ok || !check.mentor_helped) {
      recalculatedRisk = 'RED';
    } else if (!check.tasks_clear) {
      recalculatedRisk = 'YELLOW';
    }

    const { error } = await supabase
      .from('pulse_checks')
      .update({
        sos_signal: false,
        risk_level: recalculatedRisk,
        comment: (check.comment || '') + ' [Вопрос решён HR]',
      })
      .eq('id', checkId);

    if (!error) {
      showToast('✅ Тревога SOS снята, вопрос с сотрудником урегулирован', 'success');
      await fetchData();
    } else {
      showToast('Ошибка снятия тревоги: ' + error.message, 'error');
    }
  };

  const kpi = {
    total: employees.length,
    redRisks: employees.filter((e) => e.latest_check?.risk_level === 'RED').length,
    yellowRisks: employees.filter((e) => e.latest_check?.risk_level === 'YELLOW').length,
    sosCount: employees.filter((e) => e.latest_check?.sos_signal).length,
  };

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

  return {
    employees: processedEmployees,
    rawEmployees: employees,
    loading,
    kpi,
    filterDept,
    setFilterDept,
    sortByRisk,
    setSortByRisk,
    toast,
    setToast,
    refresh: fetchData,
    actions: {
      addEmployee,
      createBitrixTask,
      sendTelegramReminder,
      toggleTask,
      deleteTask,
      addTask,
      broadcastTask,
      resolveSos,
    },
  };
}
