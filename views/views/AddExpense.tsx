import React, { useState, useMemo, useEffect } from 'react';
import { ArrowLeft, Save, Wrench, Calendar, DollarSign, FileText, Trash2, AlertCircle } from 'lucide-react';
import { Expense } from '../types';
import { Button } from '../components/Button';

interface AddExpenseProps {
  onSave: (expense: Omit<Expense, 'id' | 'createdAt'>) => void;
  onCancel: () => void;
  onDelete?: () => void;
  existingExpenses: Expense[];
  initialData?: Expense;
}

export const AddExpense: React.FC<AddExpenseProps> = ({ 
  onSave, 
  onCancel, 
  onDelete,
  existingExpenses, 
  initialData 
}) => {
  const [part, setPart] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [cost, setCost] = useState('');
  const [description, setDescription] = useState('');

  // Pre-fill data if editing
  useEffect(() => {
    if (initialData) {
      setPart(initialData.part);
      setDate(initialData.date);
      setCost(initialData.cost.toString());
      setDescription(initialData.description);
    }
  }, [initialData]);

  // Derive unique parts for autocomplete
  const uniqueParts = useMemo(() => {
    const parts = new Set(existingExpenses.map(e => e.part));
    return Array.from(parts).sort();
  }, [existingExpenses]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!part || !date || !cost) return;

    onSave({
      part,
      date,
      cost: parseFloat(cost),
      description
    });
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.preventDefault(); // Ensure it doesn't trigger form submit
    e.stopPropagation();
    if (onDelete) {
        onDelete();
    }
  };

  return (
    <div className="h-full flex flex-col bg-slate-50">
      {/* Header */}
      <header className="bg-white p-4 pt-safe flex items-center justify-between shadow-sm sticky top-0 z-10 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <button onClick={onCancel} className="p-2 -ml-2 text-slate-600 hover:bg-slate-100 rounded-full transition-colors">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-slate-800 leading-none">
                {initialData ? 'Editar Gasto' : 'Nuevo Gasto'}
            </h1>
            <p className="text-xs text-slate-400 mt-1">
                {initialData ? 'Modifica los detalles' : 'Registra un nuevo mantenimiento'}
            </p>
          </div>
        </div>
        {initialData && onDelete && (
          <button 
            type="button"
            onClick={handleDeleteClick}
            className="p-2 text-red-500 bg-red-50 hover:bg-red-100 rounded-full transition-colors"
            aria-label="Eliminar gasto"
          >
            <Trash2 size={20} />
          </button>
        )}
      </header>

      {/* Form */}
      <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-6">
        
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 space-y-5">
            {/* Part Selection with Datalist */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <div className="bg-indigo-100 p-1.5 rounded-lg text-indigo-600">
                    <Wrench size={16} />
                </div>
                Repuesto / Servicio
                </label>
                <input
                list="parts-list"
                value={part}
                onChange={(e) => setPart(e.target.value)}
                placeholder="Ej. Cambio de Aceite..."
                className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                required
                autoComplete="off"
                />
                <datalist id="parts-list">
                {uniqueParts.map((p) => (
                    <option key={p} value={p} />
                ))}
                </datalist>
                <div className="flex items-center gap-1.5 ml-1">
                    <AlertCircle size={12} className="text-indigo-400" />
                    <p className="text-xs text-slate-400">
                        Selecciona de la lista o escribe uno nuevo.
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {/* Date */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <div className="bg-blue-100 p-1.5 rounded-lg text-blue-600">
                        <Calendar size={16} />
                    </div>
                    Fecha
                    </label>
                    <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    required
                    />
                </div>

                {/* Cost */}
                <div className="flex flex-col gap-2">
                    <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                    <div className="bg-emerald-100 p-1.5 rounded-lg text-emerald-600">
                        <DollarSign size={16} />
                    </div>
                    Valor
                    </label>
                    <input
                    type="number"
                    inputMode="decimal"
                    value={cost}
                    onChange={(e) => setCost(e.target.value)}
                    placeholder="0.00"
                    className="w-full px-4 py-3.5 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 font-medium focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all"
                    required
                    />
                </div>
            </div>

            {/* Description */}
            <div className="flex flex-col gap-2">
                <label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                <div className="bg-amber-100 p-1.5 rounded-lg text-amber-600">
                    <FileText size={16} />
                </div>
                Descripción (Opcional)
                </label>
                <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detalles adicionales (marca, mecánico, kilometraje...)"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:bg-white transition-all min-h-[120px] resize-none"
                />
            </div>
        </div>

        <div className="space-y-3 pt-2">
          <Button type="submit" fullWidth className="bg-gradient-to-r from-violet-600 to-indigo-600 shadow-xl shadow-indigo-200 hover:shadow-indigo-300 py-4 text-lg">
            <Save size={20} />
            {initialData ? 'Actualizar Gasto' : 'Guardar Gasto'}
          </Button>
          
          {initialData && onDelete && (
             <Button 
                type="button" 
                variant="danger" 
                fullWidth 
                onClick={handleDeleteClick} 
                className="bg-white border-2 border-red-50 shadow-none text-red-500 hover:bg-red-50 hover:border-red-100"
             >
               Eliminar este registro
             </Button>
          )}
        </div>

      </form>
    </div>
  );
};
