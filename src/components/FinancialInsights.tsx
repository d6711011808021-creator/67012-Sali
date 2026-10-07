import React from 'react';
import { Sparkles, TrendingUp, TrendingDown, AlertTriangle, CheckCircle2, Lightbulb, ShieldCheck } from 'lucide-react';
import { Transaction } from '../types/finance';
import { formatCurrency } from '../utils/formatters';

interface FinancialInsightsProps {
  transactions: Transaction[];
  selectedMonth: string;
  monthlyBudget: number;
}

export const FinancialInsights: React.FC<FinancialInsightsProps> = ({
  transactions,
  selectedMonth,
  monthlyBudget,
}) => {
  const currentMonthTransactions = transactions.filter((t) => t.date.startsWith(selectedMonth));
  const incomeItems = currentMonthTransactions.filter((t) => t.type === 'income');
  const expenseItems = currentMonthTransactions.filter((t) => t.type === 'expense');

  const totalIncome = incomeItems.reduce((acc, t) => acc + t.amount, 0);
  const totalExpense = expenseItems.reduce((acc, t) => acc + t.amount, 0);
  const netBalance = totalIncome - totalExpense;

  if (currentMonthTransactions.length === 0) {
    return null;
  }

  // Days in month
  const [yearStr, monthStr] = selectedMonth.split('-');
  const daysInMonth = new Date(parseInt(yearStr, 10), parseInt(monthStr, 10), 0).getDate();
  const avgDailyExpense = totalExpense / daysInMonth;

  // Find top expense category
  const expenseByCat: { [key: string]: number } = {};
  expenseItems.forEach((t) => {
    expenseByCat[t.category] = (expenseByCat[t.category] || 0) + t.amount;
  });
  const sortedExpenseCats = Object.entries(expenseByCat).sort((a, b) => b[1] - a[1]);
  const topExpense = sortedExpenseCats[0];

  // Financial health signals
  const savingsRate = totalIncome > 0 ? (netBalance / totalIncome) * 100 : 0;

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white rounded-3xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
      {/* Decorative background glows */}
      <div className="absolute top-0 right-0 -mr-12 -mt-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 -ml-12 -mb-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header */}
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight text-white flex items-center gap-2">
              <span>บทวิเคราะห์สุขภาพการเงินประจำเดือน</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 font-medium">
                AI Analytics
              </span>
            </h4>
            <p className="text-xs text-slate-400">สรุปแนวโน้มและคำแนะนำในการจัดการสภาพคล่อง</p>
          </div>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 relative z-10 mb-4">
        {/* Metric 1: Top Expense */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-slate-400 block mb-1">หมวดหมู่ที่จ่ายมากที่สุด</span>
          {topExpense ? (
            <div>
              <span className="font-bold text-sm text-amber-300 block truncate">
                {topExpense[0]}
              </span>
              <div className="flex items-baseline justify-between mt-1">
                <span className="text-xs font-semibold text-white">
                  {formatCurrency(topExpense[1])}
                </span>
                <span className="text-[10px] text-slate-400">
                  {totalExpense > 0 ? `${((topExpense[1] / totalExpense) * 100).toFixed(0)}% ของรายจ่าย` : ''}
                </span>
              </div>
            </div>
          ) : (
            <span className="text-xs text-slate-500">ไม่มีข้อมูล</span>
          )}
        </div>

        {/* Metric 2: Daily Average */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-slate-400 block mb-1">ค่าใช้จ่ายเฉลี่ยต่อวัน</span>
          <span className="font-bold text-sm text-cyan-300 block">
            {formatCurrency(avgDailyExpense)}
          </span>
          <span className="text-[10px] text-slate-400 mt-1 block">
            คำนวณจาก {daysInMonth} วันในเดือนนี้
          </span>
        </div>

        {/* Metric 3: Savings Health */}
        <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xs">
          <span className="text-[11px] text-slate-400 block mb-1">อัตราการออมเงิน</span>
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold text-sm ${
                savingsRate >= 20 ? 'text-emerald-300' : savingsRate >= 0 ? 'text-amber-300' : 'text-rose-400'
              }`}
            >
              {savingsRate.toFixed(1)}%
            </span>
            {savingsRate >= 20 ? (
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            ) : savingsRate < 0 ? (
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            ) : null}
          </div>
          <span className="text-[10px] text-slate-400 mt-1 block">
            {savingsRate >= 20
              ? 'สถานะดีเยี่ยม (เกินเกณฑ์ 20%)'
              : savingsRate >= 0
              ? 'พอใช้ (ควรเพิ่มเงินออม)'
              : 'รายจ่ายเกินรายรับ!'}
          </span>
        </div>
      </div>

      {/* Contextual Smart Tips */}
      <div className="p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-100 flex items-start gap-2.5 relative z-10">
        <Lightbulb className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
        <div className="space-y-0.5">
          <span className="font-bold text-emerald-300 block">คำแนะนำทางการเงิน:</span>
          <p className="text-slate-300 text-[11px] leading-relaxed">
            {savingsRate >= 25
              ? `ยอดเยี่ยมมาก! คุณมีเงินออมสุทธิ ${formatCurrency(netBalance)} ลองพิจารณานำเงินส่วนนี้ไปลงทุนเพื่อสร้างผลตอบแทนงอกเงย`
              : savingsRate < 0
              ? `เดือนนี้คุณใช้จ่ายเกินตัวไปแล้ว ${formatCurrency(Math.abs(netBalance))} ควรชะลอการใช้จ่ายในหมวด "${topExpense?.[0] || 'ไม่จำเป็น'}" ในช่วงที่เหลือของเดือน`
              : monthlyBudget > 0 && totalExpense > monthlyBudget
              ? `รายจ่ายรวมเกินงบประมาณที่ตั้งไว้ (${formatCurrency(monthlyBudget)}) ตรวจสอบรายการช้อปปิ้งหรือหมวดที่ไม่จำเป็น`
              : `พยายามแบ่งเงินออมไว้ล่วงหน้าอย่างน้อย 10-20% ทันทีที่เงินเดือนหรือรายรับเข้ามาเพื่อความมั่นคงทางการเงินระยะยาว`}
          </p>
        </div>
      </div>
    </div>
  );
};
