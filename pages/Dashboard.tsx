import React from 'react';
import { Layout, BackButton } from '../components/Layout';
import { CheckCircle, Minus, Edit3, Calendar } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { NavLink, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { COLORS } from '../constants';
import { useUser } from '../UserContext';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { targetYear, setTargetYear } = useUser();

  // Define year range for selector (e.g., current year - 3 to current year + 1)
  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 3 + i);

  // Filter keys by year string prefix
  const startOfYear = `${targetYear}-01-01`;
  const endOfYear = `${targetYear}-12-31`;

  const incomes = useLiveQuery(() => db.incomes.where('date').between(startOfYear, endOfYear, true, true).toArray(), [targetYear]) || [];
  const expenses = useLiveQuery(() => db.expenses.where('date').between(startOfYear, endOfYear, true, true).toArray(), [targetYear]) || [];

  // For depreciation, it's more complex. Ideally, we check valid assets.
  // For now, let's just show all for simplicity, or maybe filter by acquisitionDate <= targetYear?
  // Let's assume all registered assets apply to the current year report.
  const depreciations = useLiveQuery(() => db.depreciations.toArray()) || [];

  // Calculate totals
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDepreciation = depreciations.reduce((acc, curr) => acc + curr.totalDepreciation, 0);

  const totalDeductions = totalExpense + totalDepreciation;
  const profit = totalIncome - totalDeductions;

  // Chart Data Preparation
  const expenseByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const chartData = Object.entries(expenseByCategory).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length] || '#CCCCCC'
  }));

  // Progress Calculation 
  let progress = 0;
  if (incomes.length > 0) progress += 33;
  if (expenses.length > 0) progress += 33;
  if (depreciations.length > 0) progress += 34;


  return (
    <Layout variant="sidebar">
      <div className="max-w-6xl mx-auto space-y-8">

        {/* Header */}
        <div>
          <BackButton />
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-black text-gray-900">ダッシュボード</h1>
            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-gray-300 shadow-sm">
              <Calendar size={18} className="text-gray-500" />
              <select
                value={targetYear}
                onChange={(e) => setTargetYear(Number(e.target.value))}
                className="bg-transparent border-none text-gray-900 font-bold focus:ring-0 cursor-pointer"
              >
                {years.map(y => (
                  <option key={y} value={y}>{y}年分 (令和{y - 2018}年)</option>
                ))}
              </select>
            </div>
          </div>
          <p className="text-gray-500">収支の概要と作成の進捗を確認できます。</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">総収入金額</p>
            <p className="text-3xl font-bold text-gray-900">¥{totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">総経費 (減価償却含)</p>
            <p className="text-3xl font-bold text-gray-900">¥{totalDeductions.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">差引金額 (所得)</p>
            <p className={`text-3xl font-bold ${profit >= 0 ? 'text-gray-900' : 'text-red-600'}`}>¥{profit.toLocaleString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">

            {/* Progress Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">収支内訳書 作成進捗</h2>
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-gray-700">全体進捗</span>
                <span className="font-bold text-gray-900">{progress}%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div className="bg-primary h-2.5 rounded-full duration-500 transition-all" style={{ width: `${progress}%` }}></div>
              </div>

              <div className="space-y-4 mt-6">
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${incomes.length > 0 ? 'bg-green-500' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle size={18} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">収入の入力</span>
                  <span className="text-sm text-gray-500">{incomes.length > 0 ? '入力済' : '未入力'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${expenses.length > 0 ? 'bg-green-500' : 'bg-gray-200 text-gray-400'}`}>
                    <CheckCircle size={18} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">経費の入力</span>
                  <span className="text-sm text-gray-500">{expenses.length > 0 ? '入力済' : '未入力'}</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${depreciations.length > 0 ? 'bg-green-500' : 'bg-gray-200 text-gray-400'}`}>
                    {depreciations.length > 0 ? <CheckCircle size={18} /> : <Minus size={18} />}
                  </div>
                  <span className="flex-1 font-medium text-gray-900">減価償却費の計算</span>
                  <span className="text-sm text-gray-500">{depreciations.length > 0 ? '入力済' : '未入力'}</span>
                </div>
              </div>
            </div>

            {/* Incomplete Items / Suggestions */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">入力ショートカット</h2>
              <div className="grid grid-cols-2 gap-4">
                <button onClick={() => navigate('/income')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-sm text-gray-500">売上・収入</div>
                  <div className="text-lg font-bold text-primary">収入を入力</div>
                </button>
                <button onClick={() => navigate('/expense')} className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
                  <div className="text-sm text-gray-500">経費・レシート</div>
                  <div className="text-lg font-bold text-primary">経費を入力</div>
                </button>
              </div>
            </div>

          </div>

          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">レポート確認</h2>
              <p className="text-gray-500 text-sm mb-6">現在の入力状況で収支内訳書をプレビュー・PDF保存します。</p>
              <button
                onClick={() => navigate('/preview')}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Edit3 size={18} />
                プレビューを見る
              </button>
            </div>

            {/* Expense Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">経費の内訳</h2>
              {chartData.length > 0 ? (
                <>
                  <div className="h-64 relative">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={chartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="value"
                        >
                          {chartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `¥${value.toLocaleString()}`} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                      <span className="text-xs text-gray-500">総経費</span>
                      <span className="text-xl font-bold text-gray-900">¥{totalExpense.toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-3 mt-2">
                    {chartData.map((item) => (
                      <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">¥{item.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="h-64 flex items-center justify-center text-gray-400">
                  経費データがありません
                </div>
              )}
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};