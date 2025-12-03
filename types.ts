export interface Expense {
  id: string;
  part: string; // Repuesto
  date: string; // Fecha (ISO string YYYY-MM-DD)
  cost: number; // Valor
  description: string; // Descripción
  createdAt: number;
}

export type ViewState = 'dashboard' | 'add' | 'edit' | 'reports';

export interface AggregatedData {
  name: string;
  value: number;
}
