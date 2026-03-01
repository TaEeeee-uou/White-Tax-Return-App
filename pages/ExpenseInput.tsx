import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2 } from 'lucide-react';
import { MOCK_EXPENSES, MOCK_CATEGORIES } from '../constants';
import { ExpenseEntry } from '../types';
import { GoogleDriveUploader } from '../components/GoogleDriveUploader';

export const ExpenseInput = () => {
  const [expenses, setExpenses] = useState<ExpenseEntry[]>(MOCK_EXPENSES);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

  const handleAddRow = () => {
    const newId = Date.now().toString();
    setExpenses([...expenses, {
      id: newId,
      date: '',
      description: '',
      amount: 0,
      category: '消耗品費',
      memo: ''
    }]);
  };

  const handleDeleteRow = (id: string) => {
    setExpenses(expenses.filter(item => item.id !== id));
  };

  return (
    <Layout variant="header">
      <div className="space-y-6">

        {/* Page Heading */}
        <div>
          <BackButton />
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">支出の入力</h1>
          </div>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[12%]">日付</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[20%]">項目名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[18%]">金額 (円)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[15%]">費目カテゴリ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[28%]">備考</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-[7%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((item) => (
                <React.Fragment key={item.id}>
                  <tr className={`hover:bg-gray-50 ${expandedRowId === item.id ? 'bg-blue-50/20' : ''}`}>
                    <td className="px-2 py-1.5 align-top">
                      <input type="date" defaultValue={item.date} className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm" />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input type="text" defaultValue={item.description} placeholder="例: 事務用品" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm" />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input type="text" defaultValue={item.amount > 0 ? item.amount.toLocaleString() : ''} placeholder="例: 1500" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-right text-gray-900 text-sm" />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <select
                        defaultValue={item.category}
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      >
                        {MOCK_CATEGORIES.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input type="text" defaultValue={item.memo} placeholder="例: クライアント訪問" className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm" />
                    </td>
                    <td className="px-2 py-1.5 align-top text-center">
                      <div className="flex items-center justify-center gap-1 mt-0.5">
                        <button
                          onClick={() => setExpandedRowId(expandedRowId === item.id ? null : item.id)}
                          className={`p-1.5 rounded transition-colors text-xs font-bold ${item.receiptDriveFileId
                            ? 'text-green-600 bg-green-50 hover:bg-green-100'
                            : 'text-primary bg-blue-50 hover:bg-blue-100'
                            }`}
                          title="領収書・請求書を添付"
                        >
                          {item.receiptDriveFileId ? '添付済' : '添付'}
                        </button>
                        <button
                          onClick={() => handleDeleteRow(item.id)}
                          className="text-gray-400 hover:text-red-500 p-1.5 rounded transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  {expandedRowId === item.id && (
                    <tr className="bg-blue-50/50">
                      <td colSpan={6} className="px-4 py-4 border-t border-blue-100">
                        <GoogleDriveUploader
                          documentType="receipt"
                          onUploadSuccess={(fileId, webViewLink) => {
                            setExpenses(expenses.map(exp =>
                              exp.id === item.id
                                ? { ...exp, receiptUrl: webViewLink, receiptDriveFileId: fileId }
                                : exp
                            ));
                            setExpandedRowId(null);
                          }}
                        />
                        {item.receiptUrl && (
                          <div className="mt-3 text-sm">
                            <span className="text-gray-600 mr-2">現在の添付ファイル:</span>
                            <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                              Google Driveで確認 ↗
                            </a>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors"
          >
            <Plus size={20} />
            行を追加
          </button>
          <h2 className="text-2xl font-bold text-gray-900">支出合計: ¥ 7,880</h2>
        </div>

      </div>
    </Layout>
  );
};