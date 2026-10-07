export type TransactionType = 'income' | 'expense';

export interface Transaction {
  id: string;
  userId: string;
  title: string;
  amount: number;
  type: TransactionType;
  category: string;
  date: string; // YYYY-MM-DD
  notes?: string;
  paymentMethod?: string;
  createdAt?: any;
  updatedAt?: any;
}

export interface MonthlyBudget {
  id: string;
  userId: string;
  month: string; // YYYY-MM
  monthlyBudget: number;
  savingsGoal?: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface CategoryDef {
  id: string;
  name: string;
  type: TransactionType;
  icon: string;
  color: string;
  bgLight: string;
}

export const INCOME_CATEGORIES: CategoryDef[] = [
  { id: 'salary', name: 'เงินเดือน/ค่าจ้าง', type: 'income', icon: 'Briefcase', color: '#10b981', bgLight: '#ecfdf5' },
  { id: 'business', name: 'ธุรกิจ/ค้าขาย', type: 'income', icon: 'Store', color: '#06b6d4', bgLight: '#ecfeff' },
  { id: 'bonus', name: 'โบนัส/ค่าคอมมิชชัน', type: 'income', icon: 'Gift', color: '#f59e0b', bgLight: '#fffbeb' },
  { id: 'investment', name: 'ผลตอบแทนการลงทุน/ปันผล', type: 'income', icon: 'TrendingUp', color: '#8b5cf6', bgLight: '#f5f3ff' },
  { id: 'freelance', name: 'งานเสริม/ฟรีแลนซ์', type: 'income', icon: 'Laptop', color: '#3b82f6', bgLight: '#eff6ff' },
  { id: 'other_income', name: 'รายรับอื่นๆ', type: 'income', icon: 'Coins', color: '#64748b', bgLight: '#f8fafc' },
];

export const EXPENSE_CATEGORIES: CategoryDef[] = [
  { id: 'food', name: 'อาหารและเครื่องดื่ม', type: 'expense', icon: 'Utensils', color: '#f97316', bgLight: '#fff7ed' },
  { id: 'transport', name: 'การเดินทาง/น้ำมัน', type: 'expense', icon: 'Car', color: '#3b82f6', bgLight: '#eff6ff' },
  { id: 'housing', name: 'ที่อยู่อาศัย/ค่าน้ำค่าไฟ', type: 'expense', icon: 'Home', color: '#6366f1', bgLight: '#eef2ff' },
  { id: 'shopping', name: 'ช้อปปิ้ง/ของใช้', type: 'expense', icon: 'ShoppingBag', color: '#ec4899', bgLight: '#fdf2f8' },
  { id: 'entertainment', name: 'บันเทิง/พักผ่อน', type: 'expense', icon: 'Gamepad2', color: '#8b5cf6', bgLight: '#f5f3ff' },
  { id: 'health', name: 'สุขภาพและยา', type: 'expense', icon: 'HeartPulse', color: '#ef4444', bgLight: '#fef2f2' },
  { id: 'education', name: 'การศึกษา/พัฒนาตนเอง', type: 'expense', icon: 'GraduationCap', color: '#14b8a6', bgLight: '#f0fdfa' },
  { id: 'family', name: 'ครอบครัว/พ่อแม่/ลูก', type: 'expense', icon: 'Users', color: '#eab308', bgLight: '#fefce8' },
  { id: 'insurance', name: 'ประกัน/ภาษี', type: 'expense', icon: 'ShieldCheck', color: '#64748b', bgLight: '#f1f5f9' },
  { id: 'other_expense', name: 'รายจ่ายอื่นๆ', type: 'expense', icon: 'CircleEllipsis', color: '#94a3b8', bgLight: '#f8fafc' },
];

export const ALL_CATEGORIES = [...EXPENSE_CATEGORIES, ...INCOME_CATEGORIES];

export const PAYMENT_METHODS = [
  'เงินสด',
  'โอนเงิน / พร้อมเพย์',
  'บัตรเครดิต',
  'บัตรเดบิต',
  'TrueMoney Wallet',
  'Rabbit LINE Pay',
  'อื่นๆ',
];
