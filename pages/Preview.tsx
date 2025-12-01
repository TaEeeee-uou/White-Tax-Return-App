
import React, { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { Layout, BackButton } from '../components/Layout';
import { Download, ZoomIn, ZoomOut, Maximize, Printer, Loader2, CheckCircle } from 'lucide-react';
import { useUser } from '../UserContext';

// Helper component for table cells
const Cell = ({ className = "", children, colSpan, rowSpan, style }: { className?: string; children?: React.ReactNode; colSpan?: number; rowSpan?: number; style?: React.CSSProperties }) => (
  <td colSpan={colSpan} rowSpan={rowSpan} style={style} className={`border-r border-b border-black px-1 py-0.5 text-[9px] leading-tight break-words ${className}`}>
    {children}
  </td>
);

const AmountCell = ({ value, className = "" }: { value?: string | number; className?: string }) => (
  <div className={`w-full h-full flex items-center justify-end px-1 font-mono text-[10px] tracking-wider ${className}`}>
    {value}
  </div>
);

// Vertical Text Helper
const VerticalText = ({ children, className="" }: { children: React.ReactNode, className?: string }) => (
  <div className={`flex items-center justify-center h-full [writing-mode:vertical-rl] tracking-widest text-[9px] w-full ${className}`}>
    {children}
  </div>
);

export const Preview = () => {
  const { profile } = useUser();
  const [zoomLevel, setZoomLevel] = useState(1);
  const [isDownloading, setIsDownloading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-fit logic
  const calculateZoom = () => {
    if (containerRef.current) {
      const targetWidth = 1123 + 80; 
      const availableWidth = containerRef.current.clientWidth;
      let scale = availableWidth / targetWidth;
      scale = Math.min(scale, 1.3);
      scale = Math.max(scale, 0.4);
      setZoomLevel(scale);
    }
  };

  useEffect(() => {
    calculateZoom();
    window.addEventListener('resize', calculateZoom);
    return () => window.removeEventListener('resize', calculateZoom);
  }, []);

  const handleZoomIn = () => setZoomLevel(prev => Math.min(prev + 0.1, 2.0));
  const handleZoomOut = () => setZoomLevel(prev => Math.max(prev - 0.1, 0.3));
  const handleFitScreen = calculateZoom;
  const handlePrint = () => window.print();

  const handleDownload = () => {
    setIsDownloading(true);
    setTimeout(() => {
      setIsDownloading(false);
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }, 2000);
  };

  // Mock Data
  const year = "6"; 
  const incomeTotal = "5,250,000";
  const expensesTotal = "2,180,000";
  const profit = "3,070,000";

  // Fixed row height to fit exactly within page (20 rows total)
  const ROW_HEIGHT = '6.5mm';
  const TABLE_HEIGHT = '130mm'; // 20 rows * 6.5mm
  
  // Grid Row Component
  const GridRow = ({ 
    label, 
    id, 
    val, 
    bgLabel, 
    bgVal,
    labelClass = "",
    noBorderBottom = false,
    labelWidthClass = "flex-1"
  }: { 
    label: React.ReactNode, 
    id?: string, 
    val?: string | number, 
    bgLabel?: string, 
    bgVal?: string,
    labelClass?: string,
    noBorderBottom?: boolean,
    labelWidthClass?: string
  }) => (
    <div className={`flex border-black ${noBorderBottom ? '' : 'border-b'}`} style={{ height: ROW_HEIGHT }}>
        <div className={`${labelWidthClass} px-1 flex items-center text-[9px] leading-tight border-r border-black ${bgLabel || ''} ${labelClass}`}>
            {label}
        </div>
        {id !== undefined && (
            <div className={`w-4 border-r border-black flex items-center justify-center text-[8px] ${bgLabel || 'bg-blue-50/30'}`}>
                {id}
            </div>
        )}
        <div className={`w-20 flex items-center justify-end px-1 font-mono text-[10px] ${bgVal || ''}`}>
            {val}
        </div>
    </div>
  );

  // Filler Rows
  const FillerRows = ({ count }: { count: number }) => (
    <>
      {[...Array(count)].map((_, i) => (
        <div key={`fill-${i}`} className="flex border-b border-black last:border-b-0" style={{ height: ROW_HEIGHT }}>
            <div className="flex-1 border-r border-black"></div>
            <div className="w-4 bg-blue-50/30 border-r border-black"></div>
            <div className="w-20"></div>
        </div>
      ))}
    </>
  );

  return (
    <Layout variant="sidebar">
      <div className="max-w-7xl mx-auto space-y-6 pb-20 print:p-0 print:max-w-none">
        
        {/* Toolbar & Breadcrumbs */}
        <div className="print:hidden space-y-6">
          <div className="flex gap-2 text-sm text-gray-500">
              <NavLink to="/" className="hover:text-primary transition-colors">ダッシュボード</NavLink>
              <span>/</span>
              <NavLink to="/income" className="hover:text-primary transition-colors">データ入力</NavLink>
              <span>/</span>
              <span className="text-gray-900 font-medium">プレビュー</span>
          </div>

          <div className="flex justify-between items-end">
              <div>
                <BackButton />
                <h1 className="text-3xl font-bold text-gray-900 mt-2">収支内訳書プレビュー</h1>
              </div>
          </div>

          <div className="sticky top-4 z-20 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-xl p-2 shadow-sm flex justify-between items-center transition-all">
              <div className="flex items-center gap-1">
                  <button onClick={handleZoomIn} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="拡大"><ZoomIn size={20} /></button>
                  <button onClick={handleZoomOut} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="縮小"><ZoomOut size={20} /></button>
                  <button onClick={handleFitScreen} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="画面に合わせる"><Maximize size={20} /></button>
                  <div className="w-px h-6 bg-gray-200 mx-2"></div>
                  <button onClick={handlePrint} className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg" title="印刷"><Printer size={20} /></button>
              </div>
              
              <div className="flex items-center gap-4">
                <div className={`flex items-center gap-2 text-green-600 transition-opacity duration-300 ${showSuccess ? 'opacity-100' : 'opacity-0'}`}>
                    <CheckCircle size={20} />
                    <span className="text-sm font-medium">保存完了</span>
                </div>
                <button 
                  onClick={handleDownload}
                  disabled={isDownloading}
                  className="bg-primary text-white text-sm font-bold px-4 py-2 rounded-lg hover:bg-primary/90 transition-colors flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                >
                    {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                    {isDownloading ? '準備中...' : 'PDF保存'}
                </button>
              </div>
          </div>
        </div>

        {/* Preview Container */}
        <div ref={containerRef} className="bg-gray-100 p-8 rounded-xl border border-gray-200 overflow-x-hidden flex flex-col items-center gap-8 print:bg-white print:border-none print:p-0 print:block">
             
             {/* ================= PAGE 1 ================= */}
             <div 
               className="bg-white shadow-xl origin-top print:shadow-none print:w-full print:h-full print:transform-none box-border text-black"
               style={{ 
                 width: '297mm', 
                 minHeight: '210mm', 
                 transform: `scale(${zoomLevel})`,
                 padding: '8mm 12mm',
                 marginBottom: `calc(210mm * ${zoomLevel - 1})`
               }}
             >
                {/* Header */}
                <div className="flex justify-between items-start mb-1 h-[20mm]">
                   <div className="text-[10px] border border-black px-1 py-1 [writing-mode:vertical-rl] h-full flex items-center justify-center font-serif leading-none tracking-widest">
                     提出用
                   </div>
                   <div className="flex-1 flex flex-col items-center justify-start pt-1">
                     <h1 className="text-2xl font-serif font-bold tracking-widest mb-1">
                        令和 <span className="border-b border-black px-4 inline-block">{year}</span> 年分収支内訳書（一般用）
                     </h1>
                     <p className="text-[8px] text-gray-600 text-center">
                        （この収支内訳書は機械で読み取りますので、黒のボールペンで書いてください。）
                     </p>
                   </div>
                   <div className="w-[80mm] h-full flex flex-col items-end">
                        <div className="flex text-[9px] mb-1 justify-end items-center gap-1">
                            <span>整理番号</span>
                            <div className="border border-black w-32 h-5 grid grid-cols-8 divide-x divide-black">
                                <div></div><div></div><div></div><div></div><div></div><div></div><div></div><div></div>
                            </div>
                        </div>
                        <div className="text-[8px] text-right font-mono pr-1">FA7000</div>
                   </div>
                </div>

                {/* Profile Box */}
                <div className="border border-black mb-1 flex h-[28mm]">
                  {/* Left: Address/Business */}
                  <div className="w-[60%] border-r border-black flex flex-col">
                     <div className="flex h-1/2 border-b border-black">
                        <div className="w-8 flex items-center justify-center text-[9px] border-r border-black">住所</div>
                        <div className="flex-1 p-1 text-[10px] relative">
                             <div className="absolute top-0 right-1 text-[7px] text-gray-500">フリガナ</div>
                             <div className="mt-2">{profile.address}</div>
                        </div>
                     </div>
                     <div className="flex h-1/2">
                        <div className="w-8 flex items-center justify-center text-[9px] border-r border-black leading-tight">事業所<br/>所在地</div>
                        <div className="flex-1 p-1 text-[10px] border-r border-black">{profile.businessAddress}</div>
                        <div className="w-[40%] flex flex-col">
                             <div className="flex-1 flex border-b border-black">
                                 <div className="w-10 bg-gray-50 flex items-center justify-center text-[9px] border-r border-black">業種名</div>
                                 <div className="flex-1 p-1 text-[10px] flex items-center">{profile.job}</div>
                             </div>
                             <div className="flex-1 flex">
                                 <div className="w-10 bg-gray-50 flex items-center justify-center text-[9px] border-r border-black">屋号</div>
                                 <div className="flex-1 p-1 text-[10px] flex items-center">{profile.businessName}</div>
                             </div>
                        </div>
                     </div>
                  </div>
                  
                  {/* Right: Name/Phone */}
                  <div className="w-[40%] flex flex-col">
                    <div className="flex h-1/2 border-b border-black">
                       <div className="w-8 flex items-center justify-center text-[9px] border-r border-black">氏名</div>
                       <div className="flex-1 p-1 text-base font-serif flex items-center justify-center relative">
                           <div className="absolute top-0 left-1 text-[7px] text-gray-500">フリガナ</div>
                           {profile.name}
                           <div className="absolute top-2 right-2 w-5 h-5 border border-black flex items-center justify-center text-[7px]">印</div>
                       </div>
                       <div className="w-12 border-l border-black flex flex-col text-[8px]">
                           <div className="border-b border-black text-center text-[7px] py-0.5">依頼税理士</div>
                           <div className="flex-1 text-center flex items-center justify-center">氏名</div>
                       </div>
                    </div>
                    <div className="flex h-1/2">
                       <div className="w-8 flex items-center justify-center text-[9px] border-r border-black leading-tight">電話<br/>番号</div>
                       <div className="flex-1 flex flex-col">
                           <div className="flex-1 border-b border-black flex items-center px-1 text-[9px]">
                               <span className="w-10 text-[8px]">（自宅）</span>{profile.phone}
                           </div>
                           <div className="flex-1 flex items-center px-1 text-[9px]">
                               <span className="w-10 text-[8px]">（事業所）</span>
                           </div>
                       </div>
                        <div className="w-12 border-l border-black flex flex-col text-[8px]">
                           <div className="border-b border-black text-center h-4">電話</div>
                           <div className="flex-1 text-center flex items-center justify-center">番号</div>
                       </div>
                    </div>
                  </div>
                </div>

                {/* Date */}
                <div className="flex justify-start items-center gap-1 mb-1 text-[9px] font-serif pl-1">
                   <span>令和</span><span className="w-8 text-center"></span><span>年</span><span className="w-8 text-center"></span><span>月</span><span className="w-8 text-center"></span><span>日</span>
                   <span className="ml-4">（自</span><span className="border-b border-black w-8 text-center">1</span><span>月</span><span className="border-b border-black w-8 text-center">1</span><span>日</span>
                   <span className="mx-2">至</span><span className="border-b border-black w-8 text-center">12</span><span>月</span><span className="border-b border-black w-8 text-center">31</span><span>日）</span>
                </div>

                {/* Main Table Grid (3 Columns) - Fixed Height */}
                <div className="flex border border-black text-[9px]" style={{ height: TABLE_HEIGHT }}>
                   
                   {/* Column 1: Income / Cost (33.3%) */}
                   <div className="w-1/3 border-r border-black flex flex-col h-full">
                      <div className="flex flex-col">
                         <div className="flex h-[26mm]"> {/* 4 rows */}
                             <div className="w-6 bg-blue-50/30 border-r border-b border-black py-2"><VerticalText>収入金額</VerticalText></div>
                             <div className="flex-1 flex flex-col">
                                <GridRow label="売上（収入）金額" id="①" val={incomeTotal} />
                                <GridRow label="家事消費" id="②" val="" />
                                <GridRow label="その他の収入" id="③" val="" />
                                <GridRow label="計（①+②+③）" id="④" val={incomeTotal} bgLabel="bg-blue-50/30" />
                             </div>
                         </div>
                      </div>
                      <div className="flex flex-1">
                         {/* Removed text '売上原価' */}
                         <div className="w-6 bg-blue-50/30 border-r border-black py-2"></div>
                         <div className="flex-1 flex flex-col">
                            <GridRow label="期首商品（製品）棚卸高" id="⑤" val="" labelClass="leading-3" />
                            <GridRow label={<>仕入金額 (<span className="text-[6px]">製品製造原価</span>)</>} id="⑥" val="" labelClass="leading-3" />
                            <GridRow label="小計（⑤+⑥）" id="⑦" val="" />
                            <GridRow label="期末商品（製品）棚卸高" id="⑧" val="" labelClass="leading-3" />
                            <GridRow label="差引原価（⑦-⑧）" id="⑨" val="" />
                            <GridRow label="差引金額（④-⑨）" id="⑩" val={incomeTotal} bgLabel="bg-blue-50/30" bgVal="bg-white" />
                            {/* Filler to reach 20 rows total. 4+6=10. Need 10. */}
                            <FillerRows count={10} />
                         </div>
                      </div>
                   </div>

                   {/* Column 2: Expenses 1 (33.3%) */}
                   <div className="w-1/3 border-r border-black flex h-full">
                      <div className="w-6 bg-blue-50/30 border-r border-black py-2"><VerticalText>経費</VerticalText></div>
                      <div className="flex-1 flex flex-col">
                           <GridRow label="給料賃金" id="⑪" val="" />
                           <GridRow label="外注工賃" id="⑫" val="" />
                           <GridRow label="減価償却費" id="⑬" val="" />
                           <GridRow label="貸倒金" id="⑭" val="" />
                           <GridRow label="地代家賃" id="⑮" val="" />
                           <GridRow label="利子割引料" id="⑯" val="" />
                           <GridRow label="租税公課" id="㋑" val="327,000" />
                           <GridRow label="荷造運賃" id="㋺" val="" />
                           <GridRow label="水道光熱費" id="㋩" val="545,000" />
                           <GridRow label="旅費交通費" id="㋥" val="" />
                           <GridRow label="通信費" id="㋭" val="" />
                           <GridRow label="広告宣伝費" id="㋬" val="" />
                           <GridRow label="接待交際費" id="㋣" val="" />
                           <GridRow label="損害保険料" id="㋠" val="" />
                           <GridRow label="修繕費" id="リ" val="" />
                           <GridRow label="消耗品費" id="ヌ" val="" />
                           {/* 16 rows. Need 4 filler to reach 20. */}
                           <FillerRows count={4} />
                      </div>
                   </div>

                   {/* Column 3: Expenses 2 & Calc (33.3%) */}
                   <div className="w-1/3 flex h-full">
                      <div className="w-6 bg-blue-50/30 border-r border-black py-2"><VerticalText>経費（続き）</VerticalText></div>
                      <div className="flex-1 flex flex-col">
                           <GridRow label="福利厚生費" id="ル" val="" />
                           <GridRow label="雑費" id="ヲ" val="" />
                           <GridRow label="" id="ワ" val="" />
                           <GridRow label="" id="カ" val="" />
                           <GridRow label="" id="ヨ" val="" />
                           <GridRow label="" id="タ" val="" />
                           <GridRow label="" id="レ" val="" />
                           <GridRow label="" id="ソ" val="" />
                           <GridRow label="" id="ツ" val="" />
                           <GridRow label="" id="ネ" val="" />
                           <GridRow label="" id="ナ" val="" />
                           
                           {/* Need 4 empty slots for 11 items + 4 space + 5 calc = 20 */}
                           <GridRow label="" id="" val="" bgLabel="bg-white" />
                           <GridRow label="" id="" val="" bgLabel="bg-white" />
                           <GridRow label="" id="" val="" bgLabel="bg-white" />
                           <GridRow label="" id="" val="" bgLabel="bg-white" />

                           {/* Calc (5 rows) */}
                           <GridRow 
                             label={<div className="text-center w-full">小計 <span className="text-[7px]">（㋑〜ナ計）</span></div>} 
                             id="⑰" val={expensesTotal} bgLabel="bg-blue-50/30" bgVal="bg-white" 
                           />
                           <GridRow 
                             label={<div className="text-center w-full">経費計 <span className="text-[7px]">（⑪〜⑯,⑰計）</span></div>} 
                             id="⑱" val={expensesTotal} bgLabel="bg-blue-50/30" bgVal="bg-white" 
                           />
                           <GridRow 
                             label={<div className="text-right w-full"><span className="text-[7px] mr-1">専従者控除前所得</span>（⑩-⑱）</div>} 
                             id="⑲" val={profit} 
                           />
                           <GridRow label={<div className="text-right w-full">専従者控除</div>} id="⑳" val="" />
                           <GridRow 
                             label={<div className="text-right w-full font-bold">所得金額<span className="font-normal ml-1">（⑲-⑳）</span></div>} 
                             id="㉑" val={profit} bgLabel="bg-blue-50/30" bgVal="bg-white" noBorderBottom 
                           />
                      </div>
                   </div>

                </div>
                
                {/* Footer */}
                <div className="text-center mt-1 text-[10px] font-serif">- 1 -</div>
             </div>

             {/* ================= PAGE 2 ================= */}
             <div 
               className="bg-white shadow-xl origin-top print:shadow-none print:w-full print:h-full print:break-before-page print:transform-none box-border text-black"
               style={{ 
                 width: '297mm', 
                 minHeight: '210mm', 
                 transform: `scale(${zoomLevel})`,
                 padding: '8mm 12mm',
                 marginBottom: `calc(210mm * ${zoomLevel - 1})`
               }}
             >
                {/* Page 2 Layout - Sales/Purchase Details */}
                <div className="flex justify-between mb-2">
                   <div className="text-[10px]">○ 売上（収入）金額の明細</div>
                   <div className="text-[10px]">○ 仕入金額の明細</div>
                </div>

                <div className="flex gap-4 mb-2">
                   {/* Sales Detail */}
                   <div className="w-1/2">
                       <table className="w-full border-collapse border border-black text-[9px]">
                           <thead>
                               <tr className="text-center h-5">
                                   <Cell className="w-24 border-b border-black">売上先名</Cell>
                                   <Cell className="border-b border-black">所　　在　　地</Cell>
                                   <Cell className="w-20 border-b border-black border-r-0">売上（収入）金額</Cell>
                               </tr>
                           </thead>
                           <tbody>
                               <tr className="h-5"><Cell className="border-b border-black">A社</Cell><Cell className="border-b border-black">東京都港区...</Cell><td className="border-b border-black text-right px-1 font-mono">4,500,000</td></tr>
                               <tr className="h-5"><Cell className="border-b border-black">B社</Cell><Cell className="border-b border-black">大阪府大阪市...</Cell><td className="border-b border-black text-right px-1 font-mono">750,000</td></tr>
                               {[...Array(3)].map((_, i) => (
                                   <tr key={i} className="h-5"><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><td className="border-b border-black"></td></tr>
                               ))}
                               <tr className="h-5"><Cell colSpan={2} className="text-center border-b border-black">上記以外の売上先の計</Cell><td className="border-b border-black"></td></tr>
                               <tr className="h-5">
                                   <Cell colSpan={2} className="text-center bg-blue-50/30 border-b-0">
                                       <div className="flex justify-between items-center px-2">
                                           <span className="text-[7px]">右記①のうち軽減税率対象</span>
                                           <span>円</span>
                                           <span className="font-bold">計</span>
                                       </div>
                                   </Cell>
                                   <td className="border-b-0 flex h-5 border-l border-black">
                                       <div className="w-4 bg-blue-50/30 border-r border-black flex items-center justify-center text-[8px]">①</div>
                                       <div className="flex-1 flex items-center justify-end px-1 font-mono">{incomeTotal}</div>
                                   </td>
                               </tr>
                           </tbody>
                       </table>
                   </div>
                   {/* Purchase Detail */}
                   <div className="w-1/2">
                       <table className="w-full border-collapse border border-black text-[9px]">
                           <thead>
                               <tr className="text-center h-5">
                                   <Cell className="w-24 border-b border-black">仕入先名</Cell>
                                   <Cell className="border-b border-black">所　　在　　地</Cell>
                                   <Cell className="w-20 border-b border-black border-r-0">仕入金額</Cell>
                               </tr>
                           </thead>
                           <tbody>
                               {[...Array(5)].map((_, i) => (
                                   <tr key={i} className="h-5"><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><td className="border-b border-black"></td></tr>
                               ))}
                               <tr className="h-5"><Cell colSpan={2} className="text-center border-b border-black">上記以外の仕入先の計</Cell><td className="border-b border-black"></td></tr>
                               <tr className="h-5">
                                   <Cell colSpan={2} className="text-center bg-blue-50/30 border-b-0">
                                       <div className="flex justify-between items-center px-2">
                                           <span className="text-[7px]">右記⑥のうち軽減税率対象</span>
                                           <span>円</span>
                                           <span className="font-bold">計</span>
                                       </div>
                                   </Cell>
                                   <td className="border-b-0 flex h-5 border-l border-black">
                                       <div className="w-4 bg-blue-50/30 border-r border-black flex items-center justify-center text-[8px]">⑥</div>
                                       <div className="flex-1 flex items-center justify-end px-1 font-mono"></div>
                                   </td>
                               </tr>
                           </tbody>
                       </table>
                   </div>
                </div>

                {/* Depreciation */}
                <div className="text-[10px] mb-1">○ 減価償却費の計算</div>
                <div className="border border-black mb-2">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="text-[9px] text-center h-10">
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]">減価償却資産<br/>の名称等</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]">面積<br/>又は<br/>数量</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]">取得<br/>年月</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">イ</span><br/>取得価額<br/>(償却保証額)</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ロ</span><br/>償却の基礎<br/>になる金額</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]">償却<br/>方法</Cell>
                                <Cell className="w-6 border-b border-black bg-blue-50/30 text-[7px]">耐用<br/>年数</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ハ</span>償却率<br/>又は<br/>改定償却率</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ニ</span><br/>本年中の<br/>償却期間</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ホ</span><br/>本年分の<br/>普通償却費</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ヘ</span><br/>特別<br/>償却費</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ト</span><br/>本年分の<br/>償却費合計</Cell>
                                <Cell className="w-8 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">チ</span><br/>事業専<br/>用割合</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">リ</span><br/>本年分の必要<br/>経費算入額</Cell>
                                <Cell className="w-16 border-b border-black bg-blue-50/30 text-[7px]"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-block">ヌ</span><br/>未償却残高<br/>(期末残高)</Cell>
                                <Cell className="border-b border-black bg-blue-50/30 text-[7px] border-r-0">摘要</Cell>
                            </tr>
                        </thead>
                        <tbody>
                            {[...Array(5)].map((_, i) => (
                                <tr key={i} className="h-6">
                                    <Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black border-r-0"></Cell>
                                </tr>
                            ))}
                             <tr className="h-5">
                                <Cell colSpan={13} className="text-center bg-blue-50/30 text-[9px] font-bold border-b-0">計</Cell>
                                <Cell className="text-left align-top border-b-0"><span className="text-[6px] border border-black rounded-full w-3 h-3 inline-flex items-center justify-center">13</span></Cell>
                                <Cell className="bg-gray-200 border-b-0"></Cell>
                                <Cell className="bg-gray-200 border-r-0 border-b-0"></Cell>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div className="text-[8px] mb-2">（注） 平成19年4月1日以後に取得した減価償却資産について定率法を採用する場合にのみ㋑欄のカッコ内に償却保証額を記入します。</div>

                {/* Rent, Interest, Special */}
                <div className="flex gap-4 h-40">
                    <div className="w-1/2 flex flex-col gap-2">
                        {/* Rent */}
                        <div className="flex flex-col flex-1">
                            <div className="text-[10px] mb-1">○ 地代家賃の内訳</div>
                            <table className="w-full border-collapse border border-black flex-1 text-[9px]">
                                 <thead>
                                     <tr className="bg-blue-50/30 h-4 text-center">
                                         <Cell className="border-b border-black">支払先の住所・氏名</Cell>
                                         <Cell className="w-16 border-b border-black">賃借物件</Cell>
                                         <Cell className="w-20 border-b border-black text-[7px] leading-none">本年中の賃借<br/>料・権利金等</Cell>
                                         <Cell className="w-20 border-b border-black text-[7px] leading-none border-r-0">左の賃借料のうち<br/>必要経費算入額</Cell>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <tr className="h-6"><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-r-0 border-b border-black"></Cell></tr>
                                     <tr className="h-6"><Cell className="border-b-0"></Cell><Cell className="border-b-0"></Cell><Cell className="border-b-0"></Cell><Cell className="border-r-0 border-b-0"></Cell></tr>
                                 </tbody>
                            </table>
                        </div>

                        {/* Interest */}
                        <div className="flex flex-col flex-1">
                            <div className="text-[10px] mb-1">○ 利子割引料の内訳 <span className="text-[8px]">（金融機関を除く）</span></div>
                            <table className="w-full border-collapse border border-black flex-1 text-[9px]">
                                 <thead>
                                     <tr className="bg-blue-50/30 h-4 text-center">
                                         <Cell className="border-b border-black">支払先の住所・氏名</Cell>
                                         <Cell className="w-20 border-b border-black text-[7px] leading-none">期末現在の借<br/>入金等の金額</Cell>
                                         <Cell className="w-20 border-b border-black text-[7px] leading-none">本年中の<br/>利子割引料</Cell>
                                         <Cell className="w-20 border-b border-black text-[7px] leading-none border-r-0">左のうち必要<br/>経費算入額</Cell>
                                     </tr>
                                 </thead>
                                 <tbody>
                                     <tr className="h-6"><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-b border-black"></Cell><Cell className="border-r-0 border-b border-black"></Cell></tr>
                                     <tr className="h-6"><Cell className="border-b-0"></Cell><Cell className="border-b-0"></Cell><Cell className="border-b-0"></Cell><Cell className="border-r-0 border-b-0"></Cell></tr>
                                 </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Special Matters */}
                     <div className="w-1/2 flex flex-col">
                        <div className="text-[10px] mb-1">○ 本年中における特殊事情</div>
                        <div className="border border-black flex-1 p-2 text-[9px]">
                             <p className="text-gray-400">（例：店舗改装のため1ヶ月休業）</p>
                        </div>
                    </div>
                </div>

                <div className="text-center mt-auto text-[10px] font-serif">- 2 -</div>
             </div>

        </div>
      </div>
    </Layout>
  );
};
