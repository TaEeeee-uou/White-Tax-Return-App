import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Layout, BackButton } from '../components/Layout';
import { Plus, Search, Filter, Eye, Edit, FileText, Trash2, X, Download, CheckCircle, Loader2 } from 'lucide-react';
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { MOCK_HISTORY, CHART_DATA_HISTORY } from '../constants';
import { PastRecord } from '../types';

export const History = () => {
  const navigate = useNavigate();
  const [historyItems, setHistoryItems] = useState<PastRecord[]>(MOCK_HISTORY);
  const [previewItem, setPreviewItem] = useState<PastRecord | null>(null);
  const [isDownloading, setIsDownloading] = useState<string | null>(null); // Stores ID of item being downloaded
  const [showDownloadSuccess, setShowDownloadSuccess] = useState(false);

  // Filter & Search (Mock implementation)
  const [searchQuery, setSearchQuery] = useState('');

  const filteredItems = historyItems.filter(item => 
    item.title.includes(searchQuery) || item.year.includes(searchQuery)
  );

  const handleCreateNew = () => {
    const newRecord: PastRecord = {
      id: Date.now().toString(),
      year: '令和7年',
      title: '収支内訳書 (一般用)',
      createdDate: new Date().toLocaleDateString('ja-JP'),
      status: 'draft'
    };
    setHistoryItems([newRecord, ...historyItems]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm('この履歴を削除してもよろしいですか？')) {
      setHistoryItems(historyItems.filter(item => item.id !== id));
    }
  };

  const handleEdit = (id: string) => {
    // Navigate to dashboard or input pages contextually
    // For now, just go to dashboard
    navigate('/');
  };

  const handleDownload = (id: string) => {
    setIsDownloading(id);
    setTimeout(() => {
      setIsDownloading(null);
      setShowDownloadSuccess(true);
      setTimeout(() => setShowDownloadSuccess(false), 3000);
    }, 2000);
  };

  const handleView = (item: PastRecord) => {
    setPreviewItem(item);
  };

  return (
    <Layout variant="sidebar">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Header */}
        <div>
            <BackButton />
            <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">過去の収支内訳書一覧</h1>
                    <p className="text-gray-500">過去に作成した収支内訳書を確認、編集、出力できます。</p>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="flex items-center gap-2 bg-primary text-white font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors"
                >
                    <Plus size={20} />
                    新規作成
                </button>
            </div>
        </div>

        {/* Chart Section */}
        <div className="bg-white p-6 rounded-xl border border-gray-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">収支の推移</h2>
                    <p className="text-sm text-gray-500">年ごとの収入と支出の合計額</p>
                </div>
                <div className="flex gap-4">
                    <div className="flex items-center gap-2">
                        <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                        <span className="text-sm text-gray-600">収入</span>
                    </div>
                    <div className="flex items-center gap-2">
                         <div className="w-3 h-3 rounded-full bg-orange-400"></div>
                        <span className="text-sm text-gray-600">支出</span>
                    </div>
                </div>
            </div>
            <div className="h-64">
                 <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={CHART_DATA_HISTORY} barGap={0} barCategoryGap="20%">
                        <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} dy={10} />
                        <Tooltip cursor={{fill: 'transparent'}} />
                        <Bar dataKey="income" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={40} />
                        <Bar dataKey="expense" fill="#fb923c" radius={[4, 4, 0, 0]} barSize={40} />
                    </BarChart>
                 </ResponsiveContainer>
            </div>
        </div>

        {/* Filter & Search */}
        <div className="flex flex-col gap-4">
            <div className="flex flex-wrap justify-between items-center gap-4">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                      type="search" 
                      placeholder="キーワードで検索..." 
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-10 pr-4 h-10 rounded-lg border-gray-300 focus:ring-primary focus:border-primary" 
                    />
                </div>
                <button className="w-10 h-10 flex items-center justify-center border border-gray-300 rounded-lg bg-white text-gray-700 hover:bg-gray-50">
                    <Filter size={20} />
                </button>
            </div>
            <div className="flex flex-wrap gap-2">
                <button className="px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium">すべて表示</button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">令和6年</button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">令和5年</button>
                <button className="px-3 py-1.5 rounded-full bg-gray-100 text-gray-600 text-sm font-medium hover:bg-gray-200">令和4年</button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
             <table className="w-full text-left">
                <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                        <th className="px-6 py-4 text-sm font-medium text-gray-600">書類名</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-600">対象年</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-600">作成日</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-600">ステータス</th>
                        <th className="px-6 py-4 text-sm font-medium text-gray-600 text-right">アクション</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                    {filteredItems.map((item) => (
                        <tr key={item.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 font-medium text-gray-900">{item.title}</td>
                            <td className="px-6 py-4 text-gray-600">{item.year}</td>
                            <td className="px-6 py-4 text-gray-600">{item.createdDate}</td>
                            <td className="px-6 py-4">
                                {item.status === 'draft' ? (
                                    <span className="bg-yellow-100 text-yellow-800 text-xs px-2.5 py-0.5 rounded-full font-medium">下書き</span>
                                ) : (
                                    <span className="bg-green-100 text-green-800 text-xs px-2.5 py-0.5 rounded-full font-medium">完了</span>
                                )}
                            </td>
                            <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                    <button 
                                      onClick={() => handleView(item)}
                                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" 
                                      title="プレビュー"
                                    >
                                      <Eye size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleEdit(item.id)}
                                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded" 
                                      title="編集"
                                    >
                                      <Edit size={18} />
                                    </button>
                                    <button 
                                      onClick={() => handleDownload(item.id)}
                                      disabled={isDownloading === item.id}
                                      className="p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-200 rounded disabled:opacity-50" 
                                      title="PDFダウンロード"
                                    >
                                      {isDownloading === item.id ? <Loader2 className="animate-spin" size={18} /> : <FileText size={18} />}
                                    </button>
                                    <button 
                                      onClick={() => handleDelete(item.id)}
                                      className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded" 
                                      title="削除"
                                    >
                                      <Trash2 size={18} />
                                    </button>
                                </div>
                            </td>
                        </tr>
                    ))}
                </tbody>
             </table>
             <div className="px-6 py-4 border-t border-gray-200 flex justify-between items-center">
                 <p className="text-sm text-gray-600">{filteredItems.length}件中 <span className="font-medium">1-{Math.min(4, filteredItems.length)}</span> 件を表示</p>
                 <div className="flex gap-2">
                     <button disabled className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-500 bg-white disabled:opacity-50">前へ</button>
                     <button className="px-3 py-1.5 border border-gray-300 rounded text-sm text-gray-700 bg-white hover:bg-gray-50">次へ</button>
                 </div>
             </div>
        </div>

      </div>

      {/* Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-5xl h-[90vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between bg-white z-10">
              <div>
                <h3 className="text-xl font-bold text-gray-900">{previewItem.title}</h3>
                <p className="text-sm text-gray-500">{previewItem.year} - {previewItem.createdDate}</p>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handleDownload(previewItem.id)}
                  disabled={isDownloading === previewItem.id}
                  className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/10 rounded-lg transition-colors"
                >
                  {isDownloading === previewItem.id ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                  ダウンロード
                </button>
                <button 
                  onClick={() => setPreviewItem(null)}
                  className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>
            
            {/* Modal Content (Preview) */}
            <div className="flex-1 overflow-auto bg-gray-100 p-8 flex justify-center">
               <div className="bg-white shadow-lg max-w-[210mm] w-full min-h-[297mm]">
                  <img 
                    src="https://lh3.googleusercontent.com/aida-public/AB6AXuDU8g9pG3AJzRJhgtiWGdEQCjGvyvlXR1y0fpnRkNh5yc6Eb6DfiXoq2YO4W-z7l9p1d3qeK5CezzehxPEkUDHnm-dmo5o4NZp_6NLCAgEENdnpvRPhGHgSir9HGvnzyBb5k2Ue0jhH1jStKf9FVJmsRma1hW3JyZYFgtq9_i0-nXdSzozvUaAXTcc7cJjkHUMCoxXCCga1U5sPiCpsFjHE49p1xbgRazpX3b5O5WwlGj7qimtrWP7-QDFl8-qwA_8dHLeomMf8ziQ" 
                    alt="Document Preview"
                    className="w-full h-full object-contain"
                  />
               </div>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {showDownloadSuccess && (
        <div className="fixed bottom-8 right-8 bg-white border border-gray-200 shadow-lg rounded-lg p-4 flex items-center gap-3 animate-in slide-in-from-bottom-5 duration-300 z-[60]">
          <div className="text-green-500">
            <CheckCircle size={24} />
          </div>
          <div>
            <h4 className="font-bold text-gray-900">ダウンロード完了</h4>
            <p className="text-sm text-gray-500">ファイルが保存されました。</p>
          </div>
        </div>
      )}

    </Layout>
  );
};