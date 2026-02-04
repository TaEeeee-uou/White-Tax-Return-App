import React from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2, Camera, Image as ImageIcon, X } from 'lucide-react';
import { MOCK_CATEGORIES } from '../constants';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { ExpenseEntryWithImage } from '../db';

export const ExpenseInput = () => {
  // Load expenses from DB
  const expenses = useLiveQuery(() => db.expenses.toArray()) || [];

  const handleAddRow = async () => {
    const newId = Date.now().toString();
    await db.expenses.add({
      id: newId,
      date: new Date().toISOString().split('T')[0],
      description: '',
      amount: 0,
      category: '消耗品費',
      memo: ''
    });
  };

  const handleDeleteRow = async (id: string) => {
    await db.expenses.delete(id);
  };

  const handleUpdate = async (id: string, field: keyof ExpenseEntryWithImage, value: any) => {
    await db.expenses.update(id, { [field]: value });
  };

  const handleImageUpload = async (id: string, file: File) => {
    await db.expenses.update(id, { receiptImage: file });
  };

  const handleRemoveImage = async (id: string) => {
    // "delete" operator on an optional field works if we update it to undefined
    // Dexie update accepts partial object
    // However, to "unset" a property in Dexie, we might need to overwrite it.
    // Let's check Dexie documentation or just set it to null/undefined if schema allows.
    // Based on TS definition, it is optional.
    await db.expenses.update(id, { receiptImage: undefined });
  };

  const totalAmount = expenses.reduce((sum, item) => sum + (+item.amount || 0), 0);

  return (
    <Layout variant="header">
      <div className="space-y-6">

        {/* Page Heading */}
        <div>
          <BackButton />
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-black text-gray-900">支出の入力 (レシート・経費)</h1>
          </div>
          <p className="text-gray-500 text-sm mt-1">
            レシートを撮影またはアップロードして保存できます。データはブラウザ内に保存されます。
          </p>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[12%]">日付</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[18%]">項目名</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[12%]">金額 (円)</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[15%]">費目カテゴリ</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[10%]">レシート</th>
                <th className="px-4 py-3 text-left text-sm font-medium text-gray-700 w-[20%]">備考</th>
                <th className="px-4 py-3 text-center text-sm font-medium text-gray-700 w-[7%]">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {expenses.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-2 py-2 align-top">
                    <input
                      type="date"
                      value={item.date}
                      onChange={(e) => handleUpdate(item.id, 'date', e.target.value)}
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="text"
                      value={item.description}
                      onChange={(e) => handleUpdate(item.id, 'description', e.target.value)}
                      placeholder="例: 事務用品"
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="number"
                      value={item.amount === 0 ? '' : item.amount}
                      onChange={(e) => handleUpdate(item.id, 'amount', parseInt(e.target.value || '0', 10))}
                      placeholder="0"
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-right text-gray-900 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 align-top">
                    <select
                      value={item.category}
                      onChange={(e) => handleUpdate(item.id, 'category', e.target.value)}
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                    >
                      {MOCK_CATEGORIES.map(category => (
                        <option key={category.id} value={category.name}>{category.name}</option>
                      ))}
                    </select>
                  </td>
                  <td className="px-2 py-2 align-top text-center">
                    {item.receiptImage ? (
                      <div className="relative group w-12 h-12 mx-auto">
                        <img
                          src={URL.createObjectURL(item.receiptImage)}
                          alt="receipt"
                          className="w-full h-full object-cover rounded border border-gray-300 cursor-pointer"
                          onClick={() => window.open(URL.createObjectURL(item.receiptImage as Blob), '_blank')}
                        />
                        <button
                          onClick={() => handleRemoveImage(item.id)}
                          className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X size={10} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-center gap-1">
                        <label className="cursor-pointer p-2 bg-gray-100 rounded hover:bg-gray-200 text-gray-600">
                          <input
                            type="file"
                            accept="image/*"
                            capture="environment"
                            className="hidden"
                            onChange={(e) => {
                              if (e.target.files?.[0]) handleImageUpload(item.id, e.target.files[0]);
                            }}
                          />
                          <Camera size={18} />
                        </label>
                      </div>
                    )}
                  </td>
                  <td className="px-2 py-2 align-top">
                    <input
                      type="text"
                      value={item.memo}
                      onChange={(e) => handleUpdate(item.id, 'memo', e.target.value)}
                      placeholder="備考"
                      className="w-full h-9 border-gray-300 rounded focus:ring-primary focus:border-primary text-gray-900 text-sm"
                    />
                  </td>
                  <td className="px-2 py-2 align-top text-center">
                    <button
                      onClick={() => handleDeleteRow(item.id)}
                      className="text-gray-400 hover:text-red-500 p-1.5 rounded-full transition-colors mt-0.5"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}

              {expenses.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400 text-sm">
                    データがありません。「行を追加」ボタンから入力を開始してください。
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center bg-white p-4 rounded-lg border border-gray-200 sticky bottom-4 shadow-lg">
          <button
            onClick={handleAddRow}
            className="flex items-center gap-2 px-6 py-3 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors shadow-sm"
          >
            <Plus size={20} />
            行を追加
          </button>
          <div className="text-right">
            <span className="text-sm text-gray-500 mr-4">税引前合計</span>
            <span className="text-3xl font-bold text-gray-900">¥ {totalAmount.toLocaleString()}</span>
          </div>
        </div>

      </div>
    </Layout>
  );
};