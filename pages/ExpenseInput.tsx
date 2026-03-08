/*
 * Version: 0.0.1
 * Update: 自動同期を廃止し、保存ボタン押下時のみスプレッドシートへ反映するよう変更
 * Date: 2026-03-08
 */
import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2, CheckCircle, Loader2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '../constants';
import { ExpenseEntry } from '../types';
import { GoogleDriveUploader } from '../components/GoogleDriveUploader';
import { useUser } from '../UserContext';
import { syncSheetData } from '../lib/googleSheets';

export const ExpenseInput = () => {
  const { expenses, setExpenses, googleToken, spreadsheetId } = useUser();
  const [expandedRowId, setExpandedRowId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // OCRの生テキストを保持するステート (行ID -> テキスト)
  const [ocrRawText, setOcrRawText] = useState<Record<string, string>>({});

  const syncToDb = async (newExpenses: ExpenseEntry[]) => {
    if (!googleToken || !spreadsheetId) return;
    setIsSaving(true);
    try {
      await syncSheetData(
        googleToken,
        spreadsheetId,
        'Expenses',
        ['id', 'date', 'description', 'amount', 'category', 'memo', 'receiptUrl', 'receiptDriveFileId'],
        newExpenses
      );
    } catch (err) {
      console.error("Failed to sync expenses to DB:", err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    await syncToDb(expenses);
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
    }, 3000);
  };

  const handleAddRow = () => {
    const newId = Date.now().toString();
    const newExpenses = [...expenses, {
      id: newId,
      date: '',
      description: '',
      amount: 0,
      category: '消耗品費',
      memo: ''
    }];
    setExpenses(newExpenses);
    // 自動同期なし: 保存ボタン押下時のみ syncToDb を呼ぶ
  };

  const handleDeleteRow = (id: string) => {
    const newExpenses = expenses.filter(item => item.id !== id);
    setExpenses(newExpenses);
    // 自動同期なし: 保存ボタン押下時のみ syncToDb を呼ぶ
  };

  const handleUpdateItem = (id: string, field: keyof ExpenseEntry, value: any) => {
    const newExpenses = expenses.map(item => item.id === id ? { ...item, [field]: value } : item);
    setExpenses(newExpenses);
    // 自動同期なし: 保存ボタン押下時のみ syncToDb を呼ぶ
  };

  const totalExpense = expenses.reduce((sum, item) => sum + (item.amount || 0), 0);

  return (
    <Layout variant="header">
      <div className="space-y-6 pb-28">

        {/* Page Heading */}
        <div>
          <BackButton />
          <div className="flex justify-between items-center mb-2">
            <h1 className="text-3xl font-black text-gray-900">支出の入力</h1>
          </div>
          <p className="text-gray-500">事業に必要な様々な経費を入力してください。</p>
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
                      <input
                        type="date"
                        value={item.date}
                        onChange={e => handleUpdateItem(item.id, 'date', e.target.value)}
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="text"
                        value={item.description}
                        onChange={e => handleUpdateItem(item.id, 'description', e.target.value)}
                        placeholder="例: 事務用品"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="number"
                        value={item.amount || ''}
                        onChange={e => handleUpdateItem(item.id, 'amount', Number(e.target.value))}
                        placeholder="例: 1500"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-right text-gray-900 text-sm"
                      />
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <select
                        value={item.category}
                        onChange={e => handleUpdateItem(item.id, 'category', e.target.value)}
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                      >
                        {MOCK_CATEGORIES.map(category => (
                          <option key={category.id} value={category.name}>{category.name}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-2 py-1.5 align-top">
                      <input
                        type="text"
                        value={item.memo}
                        onChange={e => handleUpdateItem(item.id, 'memo', e.target.value)}
                        placeholder="例: クライアント訪問"
                        className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
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
                          documentType="receipt"
                          onUploadSuccess={(fileId, webViewLink, text, amount, date) => {
                            const newExpenses = expenses.map(exp => {
                              if (exp.id === item.id) {
                                let newDate = exp.date;
                                if (date) {
                                  // YYYY/MM/DD → YYYY-MM-DD に簡易変換
                                  newDate = date.replace(/\//g, '-');
                                }
                                return {
                                  ...exp,
                                  receiptUrl: webViewLink,
                                  receiptDriveFileId: fileId,
                                  amount: amount ? amount : exp.amount,
                                  date: newDate,
                                  memo: text ? (exp.memo ? `${exp.memo} (OCR)` : 'OCR読取あり') : exp.memo
                                };
                              }
                              return exp;
                            });
                            setExpenses(newExpenses);
                            // 自動同期なし: 保存ボタン押下時のみ syncToDb を呼ぶ

                            if (text) {
                              setOcrRawText(prev => ({ ...prev, [item.id]: text }));
                            }
                            // プレビュー用に開いたままにする（手直ししやすくするため）
                            // setExpandedRowId(null); 
                          }}
                        />
                        {item.receiptUrl && (
                          <div className="mt-3 text-sm flex gap-4">
                            <div>
                              <span className="text-gray-600 mr-2">現在の添付ファイル:</span>
                              <a href={item.receiptUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline font-medium">
                                Google Driveで確認 ↗
                              </a>
                            </div>
                            {ocrRawText[item.id] && (
                              <div className="border-l-2 border-blue-200 pl-4 w-1/2">
                                <span className="text-xs font-bold text-gray-500 block mb-1">OCR読取テキスト (コピー用):</span>
                                <div className="bg-white border rounded p-2 text-xs text-gray-700 h-24 overflow-y-auto font-mono whitespace-pre-wrap">
                                  {ocrRawText[item.id]}
                                </div>
                              </div>
                            )}
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
        <hr className="border-gray-200" />
        <div className="bg-gray-50 p-6 rounded-lg flex justify-between items-center border-l-4 border-red-500">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-6 py-2 bg-gray-200 text-gray-800 font-bold rounded-lg hover:bg-gray-300 transition-colors shadow-sm"
          >
            <Plus size={20} />
            行を追加
          </button>
          <div className="flex items-center gap-4">
            <span className="font-bold text-gray-600">支出合計</span>
            <span className="font-bold text-3xl text-gray-900 tracking-tight">¥ {totalExpense.toLocaleString()}</span>
          </div>
        </div>

        {/* Floating Footer for Save Button */}
        <div className="fixed bottom-0 right-0 w-full lg:w-[calc(100%-16rem)] border-t border-gray-200 bg-white/90 backdrop-blur-sm p-4 flex justify-end items-center gap-4 z-10">
          <div className={`flex items-center gap-2 text-green-600 transition-opacity duration-300 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
            <CheckCircle size={20} />
            <span className="text-sm font-medium">保存しました</span>
          </div>
          <button
            onClick={handleSave}
            disabled={isSaving || !googleToken || !spreadsheetId}
            className="bg-primary text-white font-bold h-12 px-8 rounded-lg hover:bg-primary/90 transition-colors shadow-lg disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
          >
            {isSaving && <Loader2 className="animate-spin" size={20} />}
            {isSaving ? '保存中...' : '保存する'}
          </button>
        </div>

      </div>
    </Layout>
  );
};