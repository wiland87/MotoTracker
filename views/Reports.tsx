import React, { useMemo, useState } from 'react';
import { Expense, AggregatedData } from '../types';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Filter, CalendarRange, ArrowRight } from 'lucide-react';
import { Card } from '../components/Card';

interface ReportsProps {
  expenses: Expense[];
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#06b6d4', '#3b82f6'];

type FilterType = 'all' | 'month' | 'year' | 'custom';

export const Reports: React.FC<ReportsProps> = ({ expenses }) => {
  const [timeFilter, setTimeFilter] = useState<FilterType>('all');
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');

  const filteredExpenses = useMemo(() => {
    const now = new Date();
    return expenses.filter(e => {
      // Fix: Parse date correctly handling timezone offsets roughly for comparison
      // or simply rely on string comparison if format is YYYY-MM-DD
      const d = new Date(e.date + 'T00:00:00'); 
      const nowYear = now.getFullYear();
      const nowMonth = now.getMonth();

      if (timeFilter === 'month') {
        return d.getMonth() === nowMonth && d.getFullYear() === nowYear;
      }
      if (timeFilter === 'year') {
        return d.getFullYear() === nowYear;
      }
      if (timeFilter === 'custom') {
        if (!customStart || !customEnd) return true;
        return e.date >= customStart && e.date <= customEnd;
      }
      return true;
    });
  }, [expenses, timeFilter, customStart, customEnd]);

  const totalSpent = useMemo(() => {
    return filteredExpenses.reduce((acc, curr) => acc + curr.cost, 0);
  }, [filteredExpenses]);

  const dataByPart = useMemo(() => {
    const map: Record<string, number> = {};
    filteredExpenses.forEach(e => {
      map[e.part] = (map[e.part] || 0) + e.cost;
    });
    const data: AggregatedData[] = Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);
    return data;
  }, [filteredExpenses]);

  const renderCurrency = (val: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(val);
  };

  return (
    <div className="pb-24 p-4 space-y-6 animate-in fade-in duration-500">
      
      {/* Header & Filter */}
      <div className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold text-slate-800">Reportes</h2>
        
        <div className="bg-white p-1.5 rounded-xl shadow-sm border border-slate-100 overflow-x-auto no-scrollbar">
            <div className="flex gap-1 min-w-max">
                <button 
                    onClick={() => setTimeFilter('all')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeFilter === 'all' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Histórico
                </button>
                <button 
                    onClick={() => setTimeFilter('year')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeFilter === 'year' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Este Año
                </button>
                <button 
                    onClick={() => setTimeFilter('month')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${timeFilter === 'month' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    Este Mes
                </button>
                <button 
                    onClick={() => setTimeFilter('custom')}
                    className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1 ${timeFilter === 'custom' ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200' : 'text-slate-500 hover:bg-slate-50'}`}
                >
                    <CalendarRange size={14} />
                    Rango
                </button>
            </div>
        </div>

        {/* Custom Range Picker */}
        {timeFilter === 'custom' && (
            <div className="bg-white p-3 rounded-xl border border-indigo-100 flex items-center gap-2 animate-in slide-in-from-top-2">
                <input 
                    type="date" 
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
                <ArrowRight size={16} className="text-slate-300" />
                <input 
                    type="date" 
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500/20 outline-none"
                />
            </div>
        )}
      </div>

      {/* Total Card */}
      <Card className="bg-gradient-to-br from-indigo-600 to-indigo-800 text-white border-none">
        <div className="flex flex-col items-center justify-center py-4">
          <span className="text-indigo-100 text-sm font-medium mb-1">
            {timeFilter === 'all' && 'Gasto Total Histórico'}
            {timeFilter === 'year' && 'Gasto Total del Año'}
            {timeFilter === 'month' && 'Gasto Total del Mes'}
            {timeFilter === 'custom' && 'Gasto en Periodo Seleccionado'}
          </span>
          <span className="text-4xl font-bold tracking-tight">{renderCurrency(totalSpent)}</span>
        </div>
      </Card>

      {/* Chart Section */}
      {dataByPart.length > 0 ? (
        <>
            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-700 flex items-center gap-2">
                    <PieChart size={20} className="text-slate-400" />
                    Distribución por Repuesto
                </h3>
                <Card className="h-64 flex items-center justify-center">
                    <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                        data={dataByPart}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                        >
                        {dataByPart.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                        </Pie>
                        <Tooltip 
                            formatter={(value: number) => renderCurrency(value)}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                    </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>

            <div className="space-y-2">
                <h3 className="text-lg font-semibold text-slate-700">Detalle de Gastos</h3>
                <div className="space-y-3">
                    {dataByPart.map((item, idx) => (
                        <div key={item.name} className="flex items-center justify-between bg-white p-3 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                                <span className="font-medium text-slate-700">{item.name}</span>
                            </div>
                            <span className="font-bold text-slate-900">{renderCurrency(item.value)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </>
      ) : (
        <div className="flex flex-col items-center justify-center h-64 text-slate-400 bg-slate-100 rounded-2xl border-dashed border-2 border-slate-200">
            <Filter size={48} className="mb-2 opacity-50" />
            <p>No hay gastos en este periodo.</p>
        </div>
      )}
    </div>
  );
};
