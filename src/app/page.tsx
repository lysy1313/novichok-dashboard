'use client';

import { useState } from 'react';
import { useOnboarding } from '@/shared/hooks/useOnboarding';
import { EmployeeWithDetails } from '@/shared/types';
import { Header } from '@/widgets/Header';
import { KpiCards } from '@/widgets/KpiCards';
import { FiltersBar } from '@/widgets/FiltersBar';
import { EmployeeTable } from '@/widgets/EmployeeTable';
import { ToastNotification } from '@/widgets/ToastNotification';
import { AddEmployeeModal } from '@/features/employee/AddEmployeeModal';
import { EmployeeTasksModal } from '@/features/tasks/EmployeeTasksModal';
import { BroadcastTaskModal } from '@/features/tasks/BroadcastTaskModal';

export default function Home() {
  const {
    employees,
    rawEmployees,
    loading,
    kpi,
    filterDept,
    setFilterDept,
    sortByRisk,
    setSortByRisk,
    toast,
    setToast,
    refresh,
    actions,
  } = useOnboarding();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [selectedEmpId, setSelectedEmpId] = useState<number | null>(null);

  // Всегда актуальный сотрудник для модалки задач
  const selectedEmpForTasks: EmployeeWithDetails | null = selectedEmpId
    ? rawEmployees.find((e) => e.id === selectedEmpId) || null
    : null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      <ToastNotification toast={toast} onClose={() => setToast(null)} />

      <Header
        loading={loading}
        onRefresh={refresh}
        onOpenAddModal={() => setIsAddModalOpen(true)}
        onOpenBroadcastModal={() => setIsBroadcastModalOpen(true)}
        onRemind={actions.sendTelegramReminder}
      />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 mt-6 space-y-6">
        <KpiCards
          total={kpi.total}
          redRisks={kpi.redRisks}
          yellowRisks={kpi.yellowRisks}
          sosCount={kpi.sosCount}
        />

        <FiltersBar
          selectedDept={filterDept}
          onSelectDept={setFilterDept}
          sortByRisk={sortByRisk}
          onToggleSort={() => setSortByRisk(!sortByRisk)}
        />

        <EmployeeTable
          employees={employees}
          onOpenTasksModal={(emp) => setSelectedEmpId(emp.id)}
          onCreateBitrixTask={actions.createBitrixTask}
        />
      </main>

      <AddEmployeeModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={actions.addEmployee}
      />

      <EmployeeTasksModal
        employee={selectedEmpForTasks}
        onClose={() => setSelectedEmpId(null)}
        onToggleTask={actions.toggleTask}
        onDeleteTask={actions.deleteTask}
        onAddTask={actions.addTask}
      />

      <BroadcastTaskModal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        onBroadcast={actions.broadcastTask}
      />
    </div>
  );
}
