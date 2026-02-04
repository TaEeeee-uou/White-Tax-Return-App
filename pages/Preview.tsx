
import React, { useState, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, BackButton } from '../components/Layout';
import { Download, Loader2, CheckCircle, FileText, PieChart as PieChartIcon, ArrowRight } from 'lucide-react';
import { useUser } from '../UserContext';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../db';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { COLORS } from '../constants'; // COLORS is now exported

export const Preview = () => {
  const { profile, targetYear } = useUser();
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);

  // Define date range
  const startOfYear = `${targetYear}-01-01`;
  const endOfYear = `${targetYear}-12-31`;
  const yearStr = targetYear.toString();
  const reiwaYear = targetYear - 2018;

  // Live Queries for Real Data
  const incomes = useLiveQuery(() => db.incomes.where('date').between(startOfYear, endOfYear, true, true).toArray(), [targetYear]) || [];
  const expenses = useLiveQuery(() => db.expenses.where('date').between(startOfYear, endOfYear, true, true).toArray(), [targetYear]) || [];

  // Depreciations: In a real app we might filter. For now show all or current ones.
  const depreciations = useLiveQuery(() => db.depreciations.toArray()) || [];

  // --- Calculations ---
  const totalIncome = incomes.reduce((acc, curr) => acc + curr.amount, 0);
  const totalExpense = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const totalDepreciation = depreciations.reduce((acc, curr) => acc + curr.totalDepreciation, 0);
  const totalDeductions = totalExpense + totalDepreciation;
  const profit = totalIncome - totalDeductions;

  // Chart Data: Expense Category Breakdown
  const expenseByCategory = expenses.reduce((acc, curr) => {
    acc[curr.category] = (acc[curr.category] || 0) + curr.amount;
    return acc;
  }, {} as Record<string, number>);

  const pieData = Object.entries(expenseByCategory).map(([name, value], index) => ({
    name,
    value,
    color: COLORS[index % COLORS.length] || '#CCCCCC'
  })).sort((a, b) => b.value - a.value);

  // Chart Data: Monthly Cashflow (Simplified based on date)
  const monthlyData = Array.from({ length: 12 }, (_, i) => {
    const month = i + 1;
    // Simple filter by month string in 'YYYY-MM-DD'
    const inc = incomes.filter(x => new Date(x.date).getMonth() + 1 === month).reduce((a, c) => a + c.amount, 0);
    const exp = expenses.filter(x => new Date(x.date).getMonth() + 1 === month).reduce((a, c) => a + c.amount, 0);
    return { name: `${month}月`, income: inc, expense: exp };
  });

  // --- PDF Export Logic ---
  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    setIsDownloading(true);

    try {
      // 1. Capture the report div as canvas
      const canvas = await html2canvas(reportRef.current, {
        scale: 2, // Higher quality
        useCORS: true,
        backgroundColor: '#ffffff'
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'p',
        unit: 'mm',
        format: 'a4'
      });

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();

      const imgWidth = pdfWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;

      // Add first page
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;

      // Add subsequent pages if content is long
      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // 2. Save file using Directory Picker if available (Chrome/Edge)
      // @ts-ignore - showDirectoryPicker is not in standard TS lib yet
      if (window.showDirectoryPicker) {
        try {
          // @ts-ignore
          const dirHandle = await window.showDirectoryPicker();
          const fileName = `WhiteTaxReturn_${new Date().getFullYear()}.pdf`;
          const fileHandle = await dirHandle.getFileHandle(fileName, { create: true });
          const writable = await fileHandle.createWritable();
          await writable.write(pdf.output('blob'));
          await writable.close();

          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
          console.error('File Picker Cancelled/Error:', err);
          // Fallback to auto-downlaod if picker fails or cancelled
          pdf.save(`WhiteTaxReturn_${new Date().getFullYear()}.pdf`);
        }
      } else {
        // Fallback for Firefox/Safari
        pdf.save(`WhiteTaxReturn_${new Date().getFullYear()}.pdf`);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 3000);
      }

    } catch (error) {
      console.error('PDF Generation Error:', error);
      alert('PDFの作成に失敗しました');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <Layout variant="sidebar">
      <div className="max-w-4xl mx-auto space-y-8 pb-20">

        {/* Toolbar */}
        <div className="flex justify-between items-end print:hidden">
          <div>
            <div className="flex gap-2 text-sm text-gray-500 mb-2">
              <NavLink to="/" className="hover:text-primary transition-colors">ダッシュボード</NavLink>
              <span>/</span>
              <span className="text-gray-900 font-medium">レポート</span>
            </div>
            <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FileText size={32} className="text-primary" />
              収支内訳レポート
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <div className={`flex items-center gap-2 text-green-600 transition-opacity duration-300 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
              <CheckCircle size={20} />
              <span className="text-sm font-medium">PDF保存完了</span>
            </div>
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-primary text-white text-sm font-bold px-6 py-3 rounded-xl hover:bg-primary/90 transition-all shadow-lg hover:shadow-xl flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isDownloading ? <Loader2 className="animate-spin" size={20} /> : <Download size={20} />}
              {isDownloading ? '生成中...' : 'PDFを保存'}
            </button>
          </div>
        </div>

        {/* --- REPORT CONTENT (To be captured) --- */}
        <div ref={reportRef} className="bg-white p-[15mm] shadow-2xl rounded-sm text-gray-900 min-h-[297mm] print:shadow-none print:p-0">

          {/* Report Header */}
          <div className="border-b-2 border-primary pb-6 mb-8 flex justify-between items-end">
            <div>
              <h2 className="text-2xl font-bold mb-1">令和{reiwaYear}年分 収支内訳書</h2>
              <p className="text-gray-500 text-sm">作成日: {new Date().toLocaleDateString('ja-JP')}</p>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-3 gap-6 mb-10 bg-gray-50 p-6 rounded-xl border border-gray-100">
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold">総収入金額 (A)</p>
              <p className="text-2xl font-black text-gray-800">¥ {totalIncome.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold">必要経費 (B)</p>
              <p className="text-2xl font-black text-gray-800">¥ {totalDeductions.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500 mb-1 font-bold">所得金額 (A - B)</p>
              <p className={`text-2xl font-black ${profit >= 0 ? 'text-primary' : 'text-red-500'}`}>
                ¥ {profit.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-2 gap-8 mb-10">
            {/* Pie Chart */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <PieChartIcon size={20} className="text-gray-400" />
                経費の内訳
              </h3>
              {pieData.length > 0 ? (
                <div className="border border-gray-200 rounded-xl p-4 h-[250px] flex items-center">
                  <div className="w-[180px] h-[180px] relative flex-shrink-0">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                          {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="flex-1 ml-4 space-y-1 overflow-y-auto max-h-[200px] text-xs">
                    {pieData.map((d, i) => (
                      <div key={i} className="flex justify-between items-center">
                        <span className="flex items-center gap-1.5 truncate">
                          <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: d.color }}></span>
                          {d.name}
                        </span>
                        <span className="font-mono">¥{d.value.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="h-[250px] border border-gray-200 rounded-xl flex items-center justify-center text-gray-400 text-sm">
                  データなし
                </div>
              )}
            </div>

            {/* Bar Chart */}
            <div>
              <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                <ArrowRight size={20} className="text-gray-400" />
                月次推移
              </h3>
              <div className="border border-gray-200 rounded-xl p-4 h-[250px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
                    <Tooltip />
                    <Bar dataKey="income" name="収入" fill="#2563eb" radius={[2, 2, 0, 0]} />
                    <Bar dataKey="expense" name="経費" fill="#cbd5e1" radius={[2, 2, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Tables Section */}
          <div className="space-y-8">

            {/* Income */}
            <div>
              <h3 className="text-lg font-bold mb-3 border-l-4 border-primary pl-3">収入の明細</h3>
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2 border-b">日付</th>
                    <th className="p-2 border-b">種別</th>
                    <th className="p-2 border-b">取引先・内容</th>
                    <th className="p-2 border-b text-right">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {incomes.map(item => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="p-2 font-mono text-gray-500">{item.date}</td>
                      <td className="p-2"><span className="bg-blue-50 text-blue-800 text-xs px-2 py-1 rounded inline-block">{item.type}</span></td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right font-mono">¥{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {incomes.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">データがありません</td></tr>}
                </tbody>
                <tfoot className="font-bold bg-gray-50">
                  <tr>
                    <td colSpan={3} className="p-2 text-right">合計</td>
                    <td className="p-2 text-right">¥{totalIncome.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Expenses */}
            <div>
              <h3 className="text-lg font-bold mb-3 border-l-4 border-gray-400 pl-3">経費の明細</h3>
              <table className="w-full text-sm text-left border-collapse">
                <thead className="bg-gray-100 text-gray-600">
                  <tr>
                    <th className="p-2 border-b">日付</th>
                    <th className="p-2 border-b">カテゴリ</th>
                    <th className="p-2 border-b">支払先・内容</th>
                    <th className="p-2 border-b text-right">金額</th>
                  </tr>
                </thead>
                <tbody>
                  {expenses.map(item => (
                    <tr key={item.id} className="border-b border-gray-100">
                      <td className="p-2 font-mono text-gray-500">{item.date}</td>
                      <td className="p-2"><span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded inline-block">{item.category}</span></td>
                      <td className="p-2">{item.description}</td>
                      <td className="p-2 text-right font-mono">¥{item.amount.toLocaleString()}</td>
                    </tr>
                  ))}
                  {expenses.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-gray-400">データがありません</td></tr>}
                </tbody>
                <tfoot className="font-bold bg-gray-50">
                  <tr>
                    <td colSpan={3} className="p-2 text-right">合計</td>
                    <td className="p-2 text-right">¥{totalExpense.toLocaleString()}</td>
                  </tr>
                </tfoot>
              </table>
            </div>

            {/* Depreciation */}
            {depreciations.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-3 border-l-4 border-orange-400 pl-3">減価償却費</h3>
                <table className="w-full text-sm text-left border-collapse">
                  <thead className="bg-gray-100 text-gray-600">
                    <tr>
                      <th className="p-2 border-b">資産名称</th>
                      <th className="p-2 border-b">取得年月</th>
                      <th className="p-2 border-b">取得価額</th>
                      <th className="p-2 border-b text-right">本年償却額</th>
                    </tr>
                  </thead>
                  <tbody>
                    {depreciations.map(item => (
                      <tr key={item.id} className="border-b border-gray-100">
                        <td className="p-2">{item.name}</td>
                        <td className="p-2 font-mono text-gray-500">{item.acquisitionDate}</td>
                        <td className="p-2 font-mono">¥{item.acquisitionCost.toLocaleString()}</td>
                        <td className="p-2 text-right font-mono">¥{item.totalDepreciation.toLocaleString()}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="font-bold bg-gray-50">
                    <tr>
                      <td colSpan={3} className="p-2 text-right">合計</td>
                      <td className="p-2 text-right">¥{totalDepreciation.toLocaleString()}</td>
                    </tr>
                  </tfoot>
                </table>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="mt-12 pt-8 border-t border-gray-200 text-center text-xs text-gray-400">
            White Tax Return App Generated Report
          </div>

        </div>
      </div>
    </Layout>
  );
};
