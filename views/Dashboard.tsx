import React, { useState } from 'react';
import { Expense } from '../types';
import { Wrench, Trash2, CalendarDays, Edit2, Check, X, Search } from 'lucide-react';
import { Card } from '../components/Card';

interface DashboardProps {
  expenses: Expense[];
  bikeName: string;
  onUpdateBikeName: (name: string) => void;
  onDelete: (id: string) => void;
  onEdit: (id: string) => void;
}

// Helper to generate a consistent color based on a string
const stringToColor = (str: string) => {
  const colors = [
    'bg-red-100 text-red-600',
    'bg-orange-100 text-orange-600',
    'bg-amber-100 text-amber-600',
    'bg-green-100 text-green-600',
    'bg-emerald-100 text-emerald-600',
    'bg-teal-100 text-teal-600',
    'bg-cyan-100 text-cyan-600',
    'bg-sky-100 text-sky-600',
    'bg-blue-100 text-blue-600',
    'bg-indigo-100 text-indigo-600',
    'bg-violet-100 text-violet-600',
    'bg-purple-100 text-purple-600',
    'bg-fuchsia-100 text-fuchsia-600',
    'bg-pink-100 text-pink-600',
    'bg-rose-100 text-rose-600',
  ];
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

export const Dashboard: React.FC<DashboardProps> = ({ 
  expenses, 
  bikeName, 
  onUpdateBikeName, 
  onDelete, 
  onEdit 
}) => {
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(bikeName);
  const [searchTerm, setSearchTerm] = useState('');

  const sortedExpenses = [...expenses]
    .filter(e => 
        e.part.toLowerCase().includes(searchTerm.toLowerCase()) || 
        e.description.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const renderCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr: string) => {
      const date = new Date(dateStr);
      return date.toLocaleDateString('es-CO', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const saveName = () => {
    if (tempName.trim()) {
        onUpdateBikeName(tempName);
    } else {
        setTempName(bikeName); // Revert if empty
    }
    setIsEditingName(false);
  };

  return (
    <div className="pb-24 animate-in fade-in duration-500">
      
      {/* Header Section with Gradient */}
      <div className="bg-gradient-to-br from-violet-600 via-indigo-600 to-blue-600 pt-8 pb-12 px-6 rounded-b-[2.5rem] shadow-xl text-white relative mb-6">
        <div className="flex justify-between items-start mb-4">
            <div className="flex-1">
                <p className="text-indigo-100 text-xs font-semibold tracking-wider uppercase mb-1">Registro de mantenimiento</p>
                
                {isEditingName ? (
                    <div className="flex items-center gap-2 mt-1">
                        <input 
                            value={tempName}
                            onChange={(e) => setTempName(e.target.value)}
                            className="bg-white/20 backdrop-blur-sm text-white font-bold text-2xl px-2 py-1 rounded-lg outline-none border border-white/30 w-full max-w-[200px]"
                            autoFocus
                            onKeyDown={(e) => e.key === 'Enter' && saveName()}
                        />
                        <button onClick={saveName} className="p-2 bg-white/20 rounded-full hover:bg-white/30 transition-colors">
                            <Check size={18} />
                        </button>
                        <button onClick={() => { setIsEditingName(false); setTempName(bikeName); }} className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <X size={18} />
                        </button>
                    </div>
                ) : (
                    <div className="flex items-center gap-2 group cursor-pointer" onClick={() => { setIsEditingName(true); setTempName(bikeName); }}>
                        <h1 className="text-3xl font-bold">{bikeName}</h1>
                        <Edit2 size={16} className="text-indigo-200 opacity-70 group-hover:opacity-100 transition-opacity" />
                    </div>
                )}
            </div>
            
            <div className="bg-white/10 backdrop-blur-md px-4 py-2 rounded-2xl border border-white/10 flex flex-col items-end">
                <span className="text-indigo-100 text-xs">Total Gastado</span>
                <span className="text-xl font-bold">
                    {renderCurrency(expenses.reduce((acc, curr) => acc + curr.cost, 0))}
                </span>
            </div>
        </div>

        {/* Search Bar Floating */}
        <div className="absolute -bottom-6 left-6 right-6">
            <div className="bg-white p-2 rounded-2xl shadow-lg shadow-indigo-900/10 flex items-center gap-2 border border-slate-100">
                <Search className="text-slate-400 ml-2" size={20} />
                <input 
                    type="text" 
                    placeholder="Buscar repuesto..." 
                    className="w-full bg-transparent outline-none text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-8 space-y-4">
        {expenses.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="bg-indigo-50 p-6 rounded-full mb-4">
                    <Wrench size={40} className="text-indigo-300" />
                </div>
                <h3 className="text-lg font-medium text-slate-700">Sin registros aún</h3>
                <p className="text-slate-400 max-w-xs mx-auto mt-2">
                    Toca el botón <span className="text-indigo-600 font-bold">+</span> para agregar tu primer mantenimiento.
                </p>
            </div>
        ) : (
            <>
                <div className="flex justify-between items-center px-2">
                    <h3 className="font-semibold text-slate-700">Historial</h3>
                    <span className="text-xs text-slate-400 bg-slate-100 px-2 py-1 rounded-full">{sortedExpenses.length} reg.</span>
                </div>

                {sortedExpenses.map((expense) => {
                    const colorClass = stringToColor(expense.part);
                    
                    return (
                        <Card 
                          key={expense.id} 
                          className="relative group overflow-hidden active:scale-[0.98] transition-all cursor-pointer border-l-4 border-l-transparent hover:border-l-indigo-500"
                          onClick={() => onEdit(expense.id)}
                        >
                            <div className="flex justify-between items-start pr-8">
                                <div className="flex gap-4">
                                    <div className={`mt-1 p-3 rounded-2xl h-fit ${colorClass}`}>
                                        <Wrench size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <h3 className="font-bold text-slate-800 text-lg leading-snug">{expense.part}</h3>
                                        <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mt-1 uppercase tracking-wide">
                                            <CalendarDays size={12} />
                                            <span>{formatDate(expense.date)}</span>
                                        </div>
                                        {expense.description && (
                                            <p className="text-slate-500 text-sm mt-2 line-clamp-2 leading-relaxed">
                                                {expense.description}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            
                            <div className="absolute top-4 right-4 text-right">
                                <span className="block font-bold text-slate-900 text-lg">
                                    {renderCurrency(expense.cost)}
                                </span>
                            </div>

                            {/* Delete Button */}
                            <button 
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onDelete(expense.id);
                                }}
                                className="absolute bottom-0 right-0 p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-tl-2xl transition-all z-10"
                                aria-label="Borrar registro"
                            >
                                <Trash2 size={18} />
                            </button>
                        </Card>
                    );
                })}
            </>
        )}
      </div>
    </div>
  );
};
