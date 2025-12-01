import React from 'react';
import { Layout, BackButton } from '../components/Layout';
import { CheckCircle, Minus, Edit3, ArrowUpRight } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { CHART_DATA_EXPENSES } from '../constants';
import { NavLink, useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();

  return (
    <Layout variant="sidebar">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div>
          <BackButton />
          <h1 className="text-3xl font-black text-gray-900 mb-2">ダッシュボード (令和X年分)</h1>
          <p className="text-gray-500">収支の概要と作成の進捗を確認できます。</p>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">総収入金額</p>
            <p className="text-3xl font-bold text-gray-900">¥5,250,000</p>
            <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
              +5.2% vs 前年
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">総経費</p>
            <p className="text-3xl font-bold text-gray-900">¥2,180,000</p>
            <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
              +8.1% vs 前年
            </p>
          </div>
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
            <p className="text-gray-500 font-medium mb-1">差引金額 (所得)</p>
            <p className="text-3xl font-bold text-gray-900">¥3,070,000</p>
            <p className="text-green-600 text-sm font-medium mt-2 flex items-center gap-1">
              +3.5% vs 前年
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            
            {/* Progress Section */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">収支内訳書 作成進捗</h2>
              <div className="flex justify-between items-end mb-2">
                <span className="font-medium text-gray-700">全体進捗</span>
                <span className="font-bold text-gray-900">66%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2.5 mb-2">
                <div className="bg-primary h-2.5 rounded-full" style={{ width: '66%' }}></div>
              </div>
              <p className="text-gray-500 text-sm mb-6">完了まであと少しです</p>

              <div className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle size={18} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">収入の入力</span>
                  <span className="text-sm text-gray-500">完了</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center text-white">
                    <CheckCircle size={18} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">経費の入力</span>
                  <span className="text-sm text-gray-500">完了</span>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                    <Minus size={18} />
                  </div>
                  <span className="flex-1 font-medium text-gray-900">減価償却費の計算</span>
                  <span className="text-sm text-gray-500">未完了</span>
                </div>
              </div>
            </div>

            {/* Incomplete Items */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">未完了の項目</h2>
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="pb-3 text-sm font-medium text-gray-500">日付</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">内容</th>
                    <th className="pb-3 text-sm font-medium text-gray-500">ステータス</th>
                    <th className="pb-3 text-sm font-medium text-gray-500 text-right">アクション</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  <tr>
                    <td className="py-4 text-sm text-gray-900">11月5日</td>
                    <td className="py-4 text-sm text-gray-900">減価償却費の計算</td>
                    <td className="py-4">
                      <span className="bg-red-100 text-red-700 text-xs px-2 py-1 rounded-full font-medium">要対応</span>
                    </td>
                    <td className="py-4 text-right">
                        <button 
                          onClick={() => navigate('/depreciation')}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          入力する
                        </button>
                    </td>
                  </tr>
                  <tr>
                    <td className="py-4 text-sm text-gray-900">10月28日</td>
                    <td className="py-4 text-sm text-gray-900">経費のカテゴリ未分類</td>
                    <td className="py-4">
                      <span className="bg-yellow-100 text-yellow-700 text-xs px-2 py-1 rounded-full font-medium">確認待ち</span>
                    </td>
                    <td className="py-4 text-right">
                        <button 
                          onClick={() => navigate('/expense')}
                          className="text-primary text-sm font-semibold hover:underline"
                        >
                          確認する
                        </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

          </div>

          <div className="space-y-6">
            {/* Next Steps */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm text-center">
              <h2 className="text-xl font-bold text-gray-900 mb-2">次のステップ</h2>
              <p className="text-gray-500 text-sm mb-6">減価償却費の計算を行いましょう。</p>
              <button 
                onClick={() => navigate('/depreciation')}
                className="w-full bg-primary text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 hover:bg-primary/90 transition-colors"
              >
                <Edit3 size={18} />
                未入力の項目を埋める
              </button>
            </div>

            {/* Expense Chart */}
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm">
              <h2 className="text-xl font-bold text-gray-900 mb-4">経費の内訳</h2>
              <div className="h-64 relative">
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={CHART_DATA_EXPENSES}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {CHART_DATA_EXPENSES.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                     <span className="text-xs text-gray-500">総経費</span>
                     <span className="text-xl font-bold text-gray-900">¥218万</span>
                  </div>
              </div>
              <div className="space-y-3 mt-2">
                {CHART_DATA_EXPENSES.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                            <span className="text-gray-700">{item.name}</span>
                        </div>
                        <span className="font-medium text-gray-900">{item.value}%</span>
                    </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>
    </Layout>
  );
};