export interface IncomeEntry {
  id: string;
  date: string;
  type: string; // "sales" | "consumption" | "other"
  description: string;
  amount: number;
  memo: string;
  receiptUrl?: string;
  receiptDriveFileId?: string;
}

export interface ExpenseEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  memo: string;
  receiptUrl?: string;
  receiptDriveFileId?: string;
}

export interface Category {
  id: string;
  name: string;
  description: string;
  color?: string;
}

export interface PastRecord {
  id: string;
  year: string; // e.g., "令和6年"
  title: string;
  createdDate: string;
  status: 'draft' | 'completed';
}

export interface DepreciationEntry {
  id: string;
  name: string; // 減価償却資産の名称等
  quantity: string; // 面積又は数量
  acquisitionDate: string; // 取得年月
  acquisitionCost: number; // 取得価額
  basisAmount: number; // 償却の基礎になる金額
  method: string; // 償却方法 (定額法など)
  life: number; // 耐用年数
  rate: number; // 償却率
  currentYearDepreciation: number; // 本年分の普通償却費
  specialDepreciation: number; // 特別償却費
  totalDepreciation: number; // 本年分の償却費合計
  businessRatio: number; // 事業専用割合 (%)
  deductibleAmount: number; // 本年分の必要経費算入額
  remainingBalance: number; // 未償却残高
}

export type LayoutVariant = 'sidebar' | 'header';