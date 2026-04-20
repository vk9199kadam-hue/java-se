import React, { useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  Calendar,
  AlertCircle
} from 'lucide-react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
} from 'chart.js';
import { Doughnut, Line } from 'react-chartjs-2';
import { motion } from 'framer-motion';
import { useBudget } from '../hooks/useBudget';
import { useExpenses } from '../hooks/useExpenses';
import { format, subMonths, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { formatCurrency } from '../utils/validators';

ChartJS.register(
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Filler
);

const Dashboard: React.FC = () => {
  const { totalMonthlyBudget, totalSpent, remainingBudget, dailyAverage, categoryBreakdown, getBudgetColor } = useBudget();
  const { expenses } = useExpenses();

  const doughnutData = {
    labels: categoryBreakdown.map(c => c.name),
    datasets: [
      {
        data: categoryBreakdown.map(c => c.spent),
        backgroundColor: categoryBreakdown.map(c => c.color),
        borderWidth: 0,
        hoverOffset: 4,
      },
    ],
  };

  const lineChartData = useMemo(() => {
    const last3Months = [2, 1, 0].map(m => subMonths(new Date(), m));
    const labels = last3Months.map(d => format(d, 'MMM'));
    
    const data = last3Months.map(d => {
      const start = startOfMonth(d);
      const end = endOfMonth(d);
      return expenses
        .filter(e => isWithinInterval(new Date(e.date), { start, end }))
        .reduce((sum, e) => sum + e.amount, 0);
    });

    return {
      labels,
      datasets: [
        {
          fill: true,
          label: 'Spending',
          data,
          borderColor: '#0ea5e9',
          backgroundColor: 'rgba(14, 165, 233, 0.1)',
          tension: 0.4,
        },
      ],
    };
  }, [expenses]);

  const stats = [
    { label: 'Total Spent', value: formatCurrency(totalSpent), icon: TrendingUp, color: 'text-rose-500 bg-rose-500/10' },
    { label: 'Remaining', value: formatCurrency(remainingBudget), icon: Wallet, color: 'text-emerald-500 bg-emerald-500/10' },
    { label: 'Daily Average', value: formatCurrency(dailyAverage), icon: Calendar, color: 'text-blue-500 bg-blue-500/10' },
    { label: 'Monthly Budget', value: formatCurrency(totalMonthlyBudget), icon: TrendingDown, color: 'text-primary-500 bg-primary-500/10' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="space-y-8 pb-12"
    >
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold">Dashboard</h2>
          <p className="text-slate-500">Overview of your financial health</p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="glass-card p-6 rounded-2xl">
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl ${stat.color}`}>
                <stat.icon size={24} />
              </div>
              <div>
                <p className="text-sm font-medium text-slate-500">{stat.label}</p>
                <p className="text-2xl font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Category Breakdown (Doughnut) */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-1">
          <h3 className="text-lg font-bold mb-6">Category Breakdown</h3>
          <div className="relative h-64">
            <Doughnut 
              data={doughnutData} 
              options={{ maintainAspectRatio: false, plugins: { legend: { position: 'bottom' } } }} 
            />
          </div>
        </div>

        {/* 3-Month Trend (Line) */}
        <div className="glass-card p-6 rounded-2xl lg:col-span-2">
          <h3 className="text-lg font-bold mb-6">3-Month Spending Trend</h3>
          <div className="h-64">
            <Line 
              data={lineChartData} 
              options={{ 
                maintainAspectRatio: false,
                scales: { y: { beginAtZero: true } },
                plugins: { legend: { display: false } } 
              }} 
            />
          </div>
        </div>
      </div>

      {/* Recent Transactions & Budget Progress */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            Budget Status
            {totalSpent > totalMonthlyBudget && (
              <span className="flex items-center gap-1 text-xs font-bold text-rose-500 animate-pulse-fast bg-rose-500/10 px-2 py-1 rounded-full border border-rose-500/20">
                <AlertCircle size={14} /> LIMIT EXCEEDED
              </span>
            )}
          </h3>
          <div className="space-y-6">
            {categoryBreakdown.filter(c => c.budget > 0).map((cat) => {
              const colorClass = getBudgetColor(cat.percentage).split(' ')[1];
              return (
                <div key={cat.id} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="font-semibold">{cat.name}</span>
                      <span className="text-sm text-slate-500 ml-2">
                        {formatCurrency(cat.spent)} / {formatCurrency(cat.budget)}
                      </span>
                    </div>
                    <span className={`font-bold ${getBudgetColor(cat.percentage).split(' ')[0]}`}>
                      {Math.round(cat.percentage)}%
                    </span>
                  </div>
                  <div className="h-3 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(cat.percentage, 100)}%` }}
                      transition={{ duration: 1, ease: "easeOut" }}
                      className={`h-full ${colorClass}`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>
          <div className="space-y-4">
            {expenses.slice(0, 5).map((exp) => (
              <div key={exp.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white shadow-lg" style={{ backgroundColor: categoryBreakdown.find(c => c.name === exp.category)?.color || '#94a3b8' }}>
                    {exp.category[0]}
                  </div>
                  <div>
                    <p className="font-bold text-sm leading-tight">{exp.description}</p>
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider font-bold mt-0.5">{exp.category} • {format(new Date(exp.date), 'MMM d')}</p>
                  </div>
                </div>
                <p className="font-bold text-rose-500">-{formatCurrency(exp.amount)}</p>
              </div>
            ))}
            {expenses.length === 0 && (
              <p className="text-center py-8 text-slate-400 text-sm">No transactions yet.</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default Dashboard;
