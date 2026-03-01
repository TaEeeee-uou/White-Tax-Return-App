import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2 } from 'lucide-react';
import { MOCK_INCOME, INCOME_TYPES } from '../constants';
import { IncomeEntry } from '../types';
import { GoogleDriveUploader } from '../components/GoogleDriveUploader';

export const IncomeInput = () => {
  const [incomes, setIncomes] = useState<IncomeEntry[]>(MOCK_INCOME);
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);

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
                <React.Fragment key={item.id}>
                  <tr className={`group hover:bg-gray-50 ${expandedRowId === item.id ? 'bg-blue-50/20' : ''}`}>
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
                          documentType="invoice"
                          onUploadSuccess={(fileId, webViewLink) => {
                            setIncomes(incomes.map(inc =>
                              inc.id === item.id
                                ? { ...inc, receiptUrl: webViewLink, receiptDriveFileId: fileId }
                                : inc
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