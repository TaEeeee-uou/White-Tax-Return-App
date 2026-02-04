import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2 } from 'lucide-react';
import { MOCK_INCOME, INCOME_TYPES } from '../constants';
import { IncomeEntry } from '../types';

export const IncomeInput = () => {
  const [incomes, setIncomes] = useState<IncomeEntry[]>(MOCK_INCOME);

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setIncomes([...incomes, {
      id: newId,
      date: '',
      type: 'sales', // Default
      description: '',
      amount: 0,
      memo: ''
    }]);
  };

  const handleDeleteRow = (id: string) => {
    setIncomes(incomes.filter(item => item.id !== id));
  };

  return (
    <Layout variant="header">
      <div className="space-y-6">
        
        {/* Page Heading */}
        <div>
           <BackButton />
           <h1 className="text-3xl font-black text-gray-900 mb-2">収入の入力</h1>
           <p className="text-gray-500">事業に関する収入をすべて入力してください。</p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[15%]">日付</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[20%]">区分</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[25%]">項目名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[15%]">金額</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[20%]">備考</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[5%]"></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {incomes.map((item) => (
                <tr key={item.id} className="group hover:bg-gray-50">
                  <td className="px-2 py-1.5 align-top">
                    <input type="text" defaultValue={item.date} placeholder="YYYY/MM/DD" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-400 text-sm" />
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <select 
                      defaultValue={item.type} 
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                    >
                      {INCOME_TYPES.map(type => (
                        <option key={type.id} value={type.id}>{type.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <input type="text" defaultValue={item.description} placeholder="例：売上（A社）" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-400 text-sm" />
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <input type="text" defaultValue={item.amount > 0 ? item.amount.toLocaleString() : ''} placeholder="金額を入力" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-right text-gray-900 placeholder:text-gray-400 text-sm" />
                  </td>
                  <td className="px-2 py-1.5 align-top">
                    <input type="text" defaultValue={item.memo} placeholder="例：4月分" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-400 text-sm" />
                  </td>
                  <td className="px-2 py-1.5 align-top text-center">
                    <button 
                      onClick={() => handleDeleteRow(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-full transition-colors mt-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Add Button */}
        <div>
           <button 
             onClick={handleAddRow}
             className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
           >
              <Plus size={20} />
              行を追加
           </button>
        </div>

        <hr className="border-gray-200" />

        {/* Summary */}
        <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center">
            <span className="font-bold text-gray-600">収入合計</span>
            <span className="font-bold text-2xl text-gray-900">¥200,000</span>
        </div>

      </div>
    </Layout>
  );
};