import React, { useState } from 'react';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Search, Edit, Trash2 } from 'lucide-react';
import { MOCK_CATEGORIES } from '../constants';
import { Category } from '../types';

export const Categories = () => {
  const [categories, setCategories] = useState<Category[]>(MOCK_CATEGORIES);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Form State
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  });

  // Filter categories based on search query
  const filteredCategories = categories.filter(cat => 
    cat.name.includes(searchQuery)
  );

  const handleAddNew = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '' });
  };

  const handleEdit = (category: Category) => {
    setIsEditing(true);
    setEditingId(category.id);
    setFormData({
      name: category.name,
      description: category.description
    });
  };

  const handleDelete = (id: string) => {
    if (window.confirm('このカテゴリを削除してもよろしいですか？')) {
      setCategories(categories.filter(c => c.id !== id));
      // If we deleted the item currently being edited, reset the form
      if (editingId === id) {
        handleAddNew();
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    if (isEditing && editingId) {
      // Update existing category
      setCategories(categories.map(c => 
        c.id === editingId 
          ? { ...c, name: formData.name, description: formData.description }
          : c
      ));
    } else {
      // Create new category
      const newCategory: Category = {
        id: Date.now().toString(),
        name: formData.name,
        description: formData.description
      };
      setCategories([...categories, newCategory]);
    }
    
    // Reset form after save
    handleAddNew();
  };

  return (
    <Layout variant="sidebar">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: List */}
        <div className="lg:col-span-2 space-y-6">
            <BackButton />
            <div className="flex justify-between items-center">
                 <div>
                    <h1 className="text-3xl font-black text-gray-900 mb-2">費目カテゴリ管理</h1>
                    <p className="text-gray-500">支出入力で使用するカテゴリを管理します。</p>
                 </div>
                 <button 
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                 >
                    <Plus size={20} />
                    新規カテゴリを追加
                 </button>
            </div>

            <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input 
                    type="text" 
                    placeholder="カテゴリ名で検索" 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 rounded-lg border-gray-300 focus:ring-primary focus:border-primary" 
                />
            </div>

            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">カテゴリ名</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700">説明・メモ</th>
                            <th className="px-6 py-3 text-left text-sm font-medium text-gray-700 w-32">操作</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                        {filteredCategories.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-8 text-center text-gray-500">
                                    該当するカテゴリが見つかりません
                                </td>
                            </tr>
                        ) : (
                            filteredCategories.map((cat) => (
                                <tr 
                                    key={cat.id} 
                                    className={`
                                        transition-colors
                                        ${editingId === cat.id ? 'bg-primary/10' : 'hover:bg-gray-50'}
                                    `}
                                >
                                    <td className="px-6 py-4 text-gray-900 font-medium">{cat.name}</td>
                                    <td className="px-6 py-4 text-gray-500">{cat.description}</td>
                                    <td className="px-6 py-4">
                                        <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleEdit(cat)}
                                                className={`p-2 rounded-md transition-colors ${editingId === cat.id ? 'text-primary bg-primary/20' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-200'}`}
                                            >
                                                <Edit size={18} />
                                            </button>
                                            <button 
                                                onClick={() => handleDelete(cat.id)}
                                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-md transition-colors"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>
        </div>

        {/* Right Column: Edit Form */}
        <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-xl border border-gray-200 sticky top-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                    {isEditing ? 'カテゴリ編集' : '新規カテゴリ登録'}
                </h2>
                <form className="space-y-5" onSubmit={handleSubmit}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">カテゴリ名 <span className="text-red-500">*</span></label>
                        <input 
                            type="text" 
                            required
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            placeholder="例: 消耗品費"
                            className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary" 
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">説明（任意）</label>
                        <textarea 
                            rows={4} 
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                            placeholder="カテゴリの説明を入力してください"
                            className="w-full border-gray-300 rounded-lg focus:ring-primary focus:border-primary resize-none"
                        ></textarea>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button 
                            type="button" 
                            onClick={handleAddNew}
                            className="px-4 py-2 bg-gray-100 text-gray-700 font-bold rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            キャンセル
                        </button>
                        <button 
                            type="submit" 
                            className="px-4 py-2 bg-primary text-white font-bold rounded-lg hover:bg-primary/90 transition-colors"
                        >
                            {isEditing ? '更新する' : '追加する'}
                        </button>
                    </div>
                </form>
            </div>
        </div>

      </div>
    </Layout>
  );
};