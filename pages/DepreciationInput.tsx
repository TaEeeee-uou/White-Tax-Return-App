import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Trash2, Edit } from 'lucide-react';
import { MOCK_DEPRECIATION } from '../constants';
import { DepreciationEntry } from '../types';

export const DepreciationInput = () => {
  const [assets, setAssets] = useState<DepreciationEntry[]>(MOCK_DEPRECIATION);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form state
  const initialFormState = {
    name: '',
    quantity: '',
    acquisitionDate: '',
    acquisitionCost: 0,
    method: '定額法',
    life: 0,
    businessRatio: 100
  };
  const [formData, setFormData] = useState(initialFormState);

  const handleAddNew = () => {
    setIsEditing(true);
    setEditingId(null);
    setFormData(initialFormState);
  };

  const handleEdit = (asset: DepreciationEntry) => {
    setIsEditing(true);
    setEditingId(asset.id);
    setFormData({
      name: asset.name,
      quantity: asset.quantity,
      acquisitionDate: asset.acquisitionDate,
      acquisitionCost: asset.acquisitionCost,
      method: asset.method,
      life: asset.life,
      businessRatio: asset.businessRatio
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この資産を削除してもよろしいですか？')) {
      setAssets(assets.filter(a => a.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // 簡易的な計算ロジック（実際は償却率テーブルなどが必要）
    // 定額法の簡易計算: 取得価額 / 耐用年数 * (月数/12)
    const rate = formData.life > 0 ? 1 / formData.life : 0;
    const currentYearDepreciation = Math.floor(formData.acquisitionCost * rate); 
    const deductibleAmount = Math.floor(currentYearDepreciation * (formData.businessRatio / 100));
    
    const newEntry: DepreciationEntry = {
      id: editingId || Date.now().toString(),
      name: formData.name,
      quantity: formData.quantity,
      acquisitionDate: formData.acquisitionDate,
      acquisitionCost: formData.acquisitionCost,
      basisAmount: formData.acquisitionCost, // 簡易的に取得価額と同じ
      method: formData.method,
      life: formData.life,
      rate: Number(rate.toFixed(3)),
      currentYearDepreciation: currentYearDepreciation,
      specialDepreciation: 0,
      totalDepreciation: currentYearDepreciation,
      businessRatio: formData.businessRatio,
      deductibleAmount: deductibleAmount,
      remainingBalance: formData.acquisitionCost - currentYearDepreciation // 簡易計算
    };

    if (editingId) {
      setAssets(assets.map(a => a.id === editingId ? newEntry : a));
    } else {
      setAssets([...assets, newEntry]);
    }
    
    setIsEditing(false);
  };

  const totalDeductible = assets.reduce((sum, asset) => sum + asset.deductibleAmount, 0);

  return (
    <Layout variant="header">
      <div className="space-y-6">
        
        <div>
           <BackButton />
           <div className="flex justify-between items-center">
             <div>
                <h1 className="text-3xl font-black text-gray-900 mb-2">減価償却費の計算</h1>
                <p className="text-gray-500">減価償却資産の内容と償却費を入力してください。</p>
             </div>
             {!isEditing && (
                 <button 
                 onClick={handleAddNew}
                 className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    資産を追加
                </button>
             )}
           </div>
        </div>

        {/* Form Area */}
        {isEditing && (
            <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm animate-in slide-in-from-top-4">
                <h2 className="text-lg font-bold text-gray-900 mb-4">{editingId ? '資産情報の編集' : '新規資産の登録'}</h2>
                <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">減価償却資産の名称等</label>
                        <input type="text" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" placeholder="例: ノートPC" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">面積又は数量</label>
                        <input type="text" value={formData.quantity} onChange={e => setFormData({...formData, quantity: e.target.value})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" placeholder="1" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">取得年月</label>
                        <input type="month" required value={formData.acquisitionDate} onChange={e => setFormData({...formData, acquisitionDate: e.target.value})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">取得価額 (円)</label>
                        <input type="number" required min="0" value={formData.acquisitionCost} onChange={e => setFormData({...formData, acquisitionCost: Number(e.target.value)})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">償却方法</label>
                        <select value={formData.method} onChange={e => setFormData({...formData, method: e.target.value})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary">
                            <option value="定額法">定額法</option>
                            <option value="定率法">定率法</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">耐用年数 (年)</label>
                        <input type="number" required min="1" value={formData.life} onChange={e => setFormData({...formData, life: Number(e.target.value)})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" />
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">事業専用割合 (%)</label>
                        <input type="number" required min="0" max="100" value={formData.businessRatio} onChange={e => setFormData({...formData, businessRatio: Number(e.target.value)})} className="w-full border-gray-300 rounded focus:ring-primary focus:border-primary" />
                    </div>
                    
                    <div className="md:col-span-2 flex justify-end gap-3 mt-4 border-t border-gray-100 pt-4">
                        <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg font-bold hover:bg-gray-200">キャンセル</button>
                        <button type="submit" className="px-4 py-2 bg-primary text-white rounded-lg font-bold hover:bg-primary/90">保存する</button>
                    </div>
                </form>
            </div>
        )}

        {/* Table Container */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full min-w-[1000px]">
            <thead className="bg-gray-50 border-b border-gray-200 text-xs">
              <tr>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-32">名称</th>
                <th className="px-4 py-3 text-left font-medium text-gray-700 w-16">取得年月</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 w-24">取得価額</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-16">償却方法</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-16">耐用年数</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 w-24">本年償却額</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 w-20">事業割合</th>
                <th className="px-4 py-3 text-right font-medium text-gray-700 w-24 bg-blue-50">経費算入額</th>
                <th className="px-4 py-3 text-center font-medium text-gray-700 w-24">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 text-sm">
              {assets.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">{item.name}</td>
                  <td className="px-4 py-3">{item.acquisitionDate}</td>
                  <td className="px-4 py-3 text-right">¥{item.acquisitionCost.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">{item.method}</td>
                  <td className="px-4 py-3 text-center">{item.life}年</td>
                  <td className="px-4 py-3 text-right">¥{item.totalDepreciation.toLocaleString()}</td>
                  <td className="px-4 py-3 text-right">{item.businessRatio}%</td>
                  <td className="px-4 py-3 text-right font-bold bg-blue-50/50">¥{item.deductibleAmount.toLocaleString()}</td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex justify-center gap-2">
                         <button 
                          onClick={() => handleEdit(item)}
                          className="text-gray-500 hover:text-primary transition-colors"
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          onClick={() => handleDelete(item.id)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                    </div>
                  </td>
                </tr>
              ))}
              {assets.length === 0 && (
                  <tr>
                      <td colSpan={9} className="px-4 py-8 text-center text-gray-500">
                          登録された資産はありません
                      </td>
                  </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Summary Footer */}
        <div className="flex justify-end items-center bg-gray-50 p-6 rounded-lg border border-gray-100">
           <div className="flex items-center gap-4">
               <span className="text-gray-600 font-medium">必要経費算入額 合計</span>
               <span className="text-2xl font-bold text-gray-900">¥{totalDeductible.toLocaleString()}</span>
           </div>
        </div>

      </div>
    </Layout>
  );
};