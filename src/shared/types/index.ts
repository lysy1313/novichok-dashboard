export type RiskLevel = 'RED' | 'YELLOW' | 'GREEN' | 'NEW';
export type ToastType = 'success' | 'warning' | 'info' | 'error';

export interface ToastState {
  message: string;
  type: ToastType;
}

export interface EmployeeRow {
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

export interface PulseCheckRow {
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

export interface EmployeeTaskRow {
  id: number;
  employee_id: number;
  title: string;
  is_completed: boolean;
}

export interface BitrixTaskRow {
  employee_id: number;
}

export interface EmployeeWithDetails extends EmployeeRow {
  latest_check?: PulseCheckRow;
  has_bitrix_task: boolean;
  tasks_total: number;
  tasks_completed: number;
  tasks_list: EmployeeTaskRow[];
}
