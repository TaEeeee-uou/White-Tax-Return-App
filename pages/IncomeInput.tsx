import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2 } from 'lucide-react';
import { INCOME_TYPES } from '../constants';
import { IncomeEntry } from '../types';
import { GoogleDriveUploader } from '../components/GoogleDriveUploader';
import { useUser } from '../UserContext';
import { syncSheetData } from '../lib/googleSheets';

export const IncomeInput = () => {
  const { incomes, setIncomes, googleToken, spreadsheetId } = useUser();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  // DBへ変更を同期するヘルパー関数
  const syncToDb = async (newIncomes: IncomeEntry[]) => {
    if (!googleToken || !spreadsheetId) return;
    setIsSaving(true);
    try {
      await syncSheetData(
        googleToken,
        spreadsheetId,
        'Incomes',
        ['id', 'date', 'type', 'description', 'amount', 'memo', 'receiptUrl', 'receiptDriveFileId'],
        newIncomes
      );
    } catch (err) {
      console.error("Failed to sync incomes to DB:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    const newIncomes = [...incomes, {
      id: newId,
      date: '',
      type: 'sales', // Default
      description: '',
      amount: 0,
      memo: ''
    }];
    setIncomes(newIncomes);
    syncToDb(newIncomes);
  };

  const handleDeleteRow = (id: string) => {
    const newIncomes = incomes.filter(item => item.id !== id);
    setIncomes(newIncomes);
    syncToDb(newIncomes);
  };

  const handleUpdateItem = (id: string, field: keyof IncomeEntry, value: any) => {
    const newIncomes = incomes.map(item => item.id === id ? { ...item, [field]: value } : item);
    setIncomes(newIncomes);
    syncToDb(newIncomes);
  };

  const totalIncome = incomes.reduce((sum, item) => sum + (item.amount || 0), 0);

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
                      <input
                        type="date"
                        value={item.date}
                        onChange={e => handleUpdateItem(item.id, 'date', e.target.value)}
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <select
                        value={item.type}
                        onChange={e => handleUpdateItem(item.id, 'type', e.target.value)}
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      >
                        {INCOME_TYPES.map(type => (
                          <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="例：売上（A社）"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-400 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e => handleUpdateItem(item.id, 'amount', Number(e.target.value))}
                        placeholder="金額を入力"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-right text-gray-900 placeholder:text-gray-400 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="text"
                        value={item.memo}
                        onChange={e => handleUpdateItem(item.id, 'memo', e.target.value)}
                        placeholder="例：4月分"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 placeholder:text-gray-400 text-sm"
                      />
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
                            const newIncomes = incomes.map(inc =>
                              inc.id === item.id
                                ? { ...inc, receiptUrl: webViewLink, receiptDriveFileId: fileId }
                                : inc
                            );
                            setIncomes(newIncomes);
                            syncToDb(newIncomes);
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
        <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center border-l-4 border-primary">
          <span className="font-bold text-gray-600">収入合計</span>
          <span className="font-bold text-3xl text-gray-900 tracking-tight">¥ {totalIncome.toLocaleString()}</span>
        </div>

      </div>
    </Layout>
  );
};