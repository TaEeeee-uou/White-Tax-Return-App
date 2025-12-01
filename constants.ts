import { IncomeEntry, ExpenseEntry, Category, PastRecord, DepreciationEntry } from './types';

export const INCOME_TYPES = [
  { id: 'sales', name: '売上（収入）金額' },
  { id: 'consumption', name: '家事消費' },
  { id: 'other', name: 'その他の収入' },
];

export const MOCK_INCOME: IncomeEntry[] = [
  { id: '1', date: '2023/04/01', type: 'sales', description: '売上（A社）', amount: 150000, memo: '4月分' },
  { id: '2', date: '2023/04/15', type: 'other', description: '雑収入（デザイン料）', amount: 50000, memo: '' },
];

export const MOCK_EXPENSES: ExpenseEntry[] = [
  { id: '1', date: '2023-10-26', description: '事務用品', amount: 1500, category: '消耗品費', memo: 'ペン、ノート' },
  { id: '2', date: '2023-10-25', description: '電車代', amount: 880, category: '旅費交通費', memo: 'クライアント訪問' },
  { id: '3', date: '2023-10-24', description: 'インターネット料金', amount: 5500, category: '通信費', memo: '10月分' },
];

// 令和6年分収支内訳書（一般用）の項目に準拠
export const MOCK_CATEGORIES: Category[] = [
  { id: '1', name: '給料賃金', description: '従業員への給料など' },
  { id: '2', name: '外注工賃', description: '外部業者への委託費など' },
  { id: '3', name: '減価償却費', description: '固定資産の償却費' },
  { id: '4', name: '貸倒金', description: '回収不能となった売掛金など' },
  { id: '5', name: '地代家賃', description: '事務所・店舗の家賃など' },
  { id: '6', name: '利子割引料', description: '事業用借入金の利子など' },
  { id: '7', name: '租税公課', description: '事業税、固定資産税、印紙税など' },
  { id: '8', name: '荷造運賃', description: '商品の発送費用など' },
  { id: '9', name: '水道光熱費', description: '電気代、ガス代、水道代など' },
  { id: '10', name: '旅費交通費', description: '電車代、バス代、タクシー代、宿泊費など' },
  { id: '11', name: '通信費', description: '電話代、インターネット料金、切手代など' },
  { id: '12', name: '広告宣伝費', description: 'チラシ、Web広告、看板など' },
  { id: '13', name: '接待交際費', description: '取引先との飲食代、贈答品など' },
  { id: '14', name: '損害保険料', description: '火災保険、自動車保険など' },
  { id: '15', name: '修繕費', description: '店舗・設備の修理代など' },
  { id: '16', name: '消耗品費', description: '10万円未満の備品、文房具など' },
  { id: '17', name: '福利厚生費', description: '従業員の慰安旅行、健康診断など' },
  { id: '18', name: '雑費', description: '他の科目に当てはまらない費用' },
];

export const MOCK_HISTORY: PastRecord[] = [
  { id: '1', year: '令和6年', title: '収支内訳書 (一般用)', createdDate: '2025/02/15', status: 'draft' },
  { id: '2', year: '令和5年', title: '収支内訳書 (不動産所得用)', createdDate: '2024/03/10', status: 'completed' },
  { id: '3', year: '令和4年', title: '収支内訳書 (一般用)', createdDate: '2023/03/05', status: 'completed' },
  { id: '4', year: '令和3年', title: '収支内訳書 (一般用)', createdDate: '2022/02/28', status: 'completed' },
];

export const MOCK_DEPRECIATION: DepreciationEntry[] = [
  {
    id: '1',
    name: 'ノートPC',
    quantity: '1',
    acquisitionDate: '2023/04',
    acquisitionCost: 150000,
    basisAmount: 150000,
    method: '定額法',
    life: 4,
    rate: 0.250,
    currentYearDepreciation: 37500,
    specialDepreciation: 0,
    totalDepreciation: 37500,
    businessRatio: 100,
    deductibleAmount: 37500,
    remainingBalance: 112500
  }
];

export const CHART_DATA_HISTORY = [
  { name: '令和3年', income: 400, expense: 240 },
  { name: '令和4年', income: 450, expense: 300 },
  { name: '令和5年', income: 550, expense: 350 },
  { name: '令和6年', income: 300, expense: 200 },
];

export const CHART_DATA_EXPENSES = [
  { name: '売上原価', value: 40, color: '#14b8a6' }, // Teal
  { name: '水道光熱費', value: 25, color: '#f97316' }, // Orange
  { name: '租税公課', value: 15, color: '#a855f7' }, // Purple
  { name: 'その他', value: 20, color: '#cbd5e1' }, // Gray
];