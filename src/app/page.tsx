'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  Users,
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  UserPlus,
  Send,
  RefreshCw,
  Clock,
  X
} from 'lucide-react';

type RiskLevel = 'RED' | 'YELLOW' | 'GREEN' | 'NEW';

interface EmployeeRow {
  id: number;
  created_at: string;
  full_name: string;
  department: string;
  role: string;
  mentor_name: string;
  hire_date: string;
  telegram_id: number | null;
  status: string;
}

interface PulseCheckRow {
  id: number;
  created_at: string;
  employee_id: number;
  lunch_ok: boolean;
  mentor_helped: boolean;
  tasks_clear: boolean;
  sos_signal: boolean;
  comment: string | null;
  risk_level: RiskLevel;
}

interface BitrixTaskRow {
  employee_id: number;
}

interface EmployeeWithDetails extends EmployeeRow {
  latest_check?: PulseCheckRow;
  has_bitrix_task: boolean;
}

export default function Home() {
  const [employees, setEmployees] = useState<EmployeeWithDetails[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [filterDept, setFilterDept] = useState<string>('Все');

  const [fullName, setFullName] = useState<string>('');
  const [department, setDepartment] = useState<string>('Склад');
  const [role, setRole] = useState<string>('Кладовщик зоны приёмки');
  const [mentorName, setMentorName] = useState<string>('Олег Васильев (Старший смены)');
  const [submitting, setSubmitting] = useState<boolean>(false);

  const fetchData = async () => {
    setLoading(true);
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
      return {
        ...emp,
        latest_check: latestCheck,
        has_bitrix_task: bitrixEmpIds.has(emp.id)
      };
    });

    setEmployees(merged);
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddEmployee = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const { error } = await supabase.from('employees').insert([
      {
        full_name: fullName,
        department,
        role,
        mentor_name: mentorName,
        hire_date: new Date().toISOString().split('T')[0],
      }
    ]);

    if (!error) {
      setFullName('');
      setIsModalOpen(false);
      await fetchData();
    } else {
      alert('Ошибка при добавлении: ' + error.message);
    }
    setSubmitting(false);
  };

  const handleCreateBitrixTask = async (emp: EmployeeWithDetails) => {
    const taskTitle = `Срочно 1-на-1: ${emp.full_name} в зоне риска (${emp.latest_check?.comment || 'Скрытый стресс'})`;

    const { error } = await supabase.from('bitrix_tasks').insert([
      {
        employee_id: emp.id,
        task_title: taskTitle,
        assigned_to: emp.mentor_name,
        status: 'created'
      }
    ]);

    if (!error) {
      alert(`✅ Задача создана в Битрикс24!\n\nИсполнитель: ${emp.mentor_name}\nСуть: Встреча 1-на-1 с ${emp.full_name}`);
      await fetchData();
    }
  };

  const totalEmployees = employees.length;
  const redRisks = employees.filter(e => e.latest_check?.risk_level === 'RED').length;
  const yellowRisks = employees.filter(e => e.latest_check?.risk_level === 'YELLOW').length;
  const sosCount = employees.filter(e => e.latest_check?.sos_signal).length;

  const filteredEmployees = filterDept === 'Все'
    ? employees
    : employees.filter(e => e.department === filterDept);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-500/20">
              Н
            </div>
            <div>
              <h1 className="font-bold text-lg leading-tight flex items-center gap-2">
                СпортТовары: Пульс Новичка
                <span className="text-xs font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full border border-blue-200">
                  Адаптация & Удержание
                </span>
              </h1>
              <p className="text-xs text-slate-500">Система раннего предупреждения увольнений на испытательном сроке</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={fetchData}
              className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
              title="Обновить данные"
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={() => setIsModalOpen(true)}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition shadow-sm"
            >
              <UserPlus className="w-4 h-4" />
              + Новый сотрудник
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 mt-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Всего новичков</p>
              <p className="text-2xl font-bold mt-1 text-slate-800">{totalEmployees}</p>
              <p className="text-xs text-slate-400 mt-1">стаж до 3 месяцев</p>
            </div>
            <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-600">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-red-200 shadow-sm flex items-center justify-between bg-red-50/30">
            <div>
              <p className="text-xs font-semibold text-red-600 uppercase tracking-wider">Критический риск</p>
              <p className="text-2xl font-bold mt-1 text-red-600">{redRisks}</p>
              <p className="text-xs text-red-400 mt-1">требуют срочной встречи</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-red-600">
              <AlertTriangle className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-amber-200 shadow-sm flex items-center justify-between bg-amber-50/30">
            <div>
              <p className="text-xs font-semibold text-amber-600 uppercase tracking-wider">Требуют внимания</p>
              <p className="text-2xl font-bold mt-1 text-amber-600">{yellowRisks}</p>
              <p className="text-xs text-amber-500 mt-1">непонятны задачи</p>
            </div>
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center text-amber-600">
              <Clock className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-rose-200 shadow-sm flex items-center justify-between bg-rose-50/30">
            <div>
              <p className="text-xs font-semibold text-rose-600 uppercase tracking-wider">SOS сигналы</p>
              <p className="text-2xl font-bold mt-1 text-rose-600">{sosCount}</p>
              <p className="text-xs text-rose-400 mt-1">запрос прямой помощи</p>
            </div>
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center text-rose-600">
              <ShieldAlert className="w-6 h-6" />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 w-fit">
          <span className="text-xs font-medium text-slate-500 px-3">Отдел:</span>
          {['Все', 'Склад', 'Магазин', 'Продажи', 'Офис'].map((dept) => (
            <button
              key={dept}
              onClick={() => setFilterDept(dept)}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition ${
                filterDept === dept
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              {dept}
            </button>
          ))}
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
            <h2 className="font-semibold text-sm text-slate-800">
              Мониторинг адаптации новичков
            </h2>
            <span className="text-xs text-slate-500">
              Синхронизировано с Telegram-ботом и задачами Битрикс24
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-50 text-slate-500 text-xs uppercase border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3">Сотрудник / Должность</th>
                  <th className="px-6 py-3">Отдел / Наставник</th>
                  <th className="px-6 py-3 text-center">Статус риска</th>
                  <th className="px-6 py-3">Факторы риска (Обед / Наставник / Задачи)</th>
                  <th className="px-6 py-3 text-right">Действие</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((emp) => {
                  const check = emp.latest_check;
                  const risk: RiskLevel = check?.risk_level || 'NEW';

                  return (
                    <tr key={emp.id} className="hover:bg-slate-50/80 transition">
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-900">{emp.full_name}</div>
                        <div className="text-xs text-slate-500">{emp.role}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-xs font-medium text-slate-700">{emp.department}</div>
                        <div className="text-xs text-slate-400">Наставник: {emp.mentor_name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
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
                      <td className="px-6 py-4">
                        {check ? (
                          <div className="space-y-1">
                            <div className="flex items-center gap-2 text-xs">
                              <span className={check.lunch_ok ? 'text-emerald-600' : 'text-red-600 font-semibold'}>
                                {check.lunch_ok ? '✓ Обед был' : '✗ БЕЗ ОБЕДА'}
                              </span>
                              <span>•</span>
                              <span className={check.mentor_helped ? 'text-emerald-600' : 'text-red-600 font-semibold'}>
                                {check.mentor_helped ? '✓ Наставник помог' : '✗ ОСТАЛСЯ ОДИН'}
                              </span>
                              <span>•</span>
                              <span className={check.tasks_clear ? 'text-emerald-600' : 'text-amber-600'}>
                                {check.tasks_clear ? '✓ Задачи ясны' : '⚠ Задачи не ясны'}
                              </span>
                            </div>
                            {check.comment && (
                              <p className="text-xs text-slate-500 italic bg-slate-50 p-1.5 rounded border border-slate-100">
                                «{check.comment}»
                              </p>
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">Опросов ещё не было</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        {emp.has_bitrix_task ? (
                          <span className="inline-flex items-center gap-1 text-xs text-emerald-600 font-medium bg-emerald-50 px-2.5 py-1 rounded border border-emerald-200">
                            <CheckCircle2 className="w-3.5 h-3.5" /> В Битрикс24
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCreateBitrixTask(emp)}
                            className="inline-flex items-center gap-1.5 text-xs font-medium bg-white hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg border border-slate-300 shadow-sm transition"
                          >
                            <Send className="w-3.5 h-3.5 text-blue-600" />
                            1-на-1 в Битрикс24
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <h3 className="font-bold text-lg text-slate-800">Добавить нового сотрудника</h3>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddEmployee} className="space-y-4 text-sm">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">ФИО сотрудника</label>
                <input
                  type="text"
                  required
                  placeholder="Иван Петров"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Отдел</label>
                  <select
                    value={department}
                    onChange={(e) => setDepartment(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Склад">Склад</option>
                    <option value="Магазин">Магазин</option>
                    <option value="Продажи">Продажи</option>
                    <option value="Офис">Офис</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1">Должность</label>
                  <input
                    type="text"
                    required
                    value={role}
                    onChange={(e) => setRole(e.target.value)}
                    className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">Наставник</label>
                <input
                  type="text"
                  required
                  value={mentorName}
                  onChange={(e) => setMentorName(e.target.value)}
                  className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-lg text-slate-600 hover:bg-slate-100 transition"
                >
                  Отмена
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-sm"
                >
                  {submitting ? 'Сохранение...' : 'Добавить в базу'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
