import React from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency, THAI_MONTHS_SHORT, shiftMonth } from '../../utils/formatters';

interface MultiMonthComparisonProps {
  transactions: Transaction[];
  currentMonth: string; // YYYY-MM
}

export const MultiMonthComparisonChart: React.FC<MultiMonthComparisonProps> = ({
  transactions,
  currentMonth,
}) => {
  // Generate list of the past 6 months
  const months: string[] = [];
  for (let i = 5; i >= 0; i--) {
    months.push(shiftMonth(currentMonth, -i));
  }

  const monthStats = months.map((mStr) => {
    const [yStr, mNumStr] = mStr.split('-');
    const monthIdx = parseInt(mNumStr, 10) - 1;
    const label = `${THAI_MONTHS_SHORT[monthIdx]} ${yStr.slice(2)}`;

    let income = 0;
    let expense = 0;

    transactions.forEach((t) => {
      if (t.date.startsWith(mStr)) {
        if (t.type === 'income') income += t.amount;
        else expense += t.amount;
      }
    });

    const net = income - expense;
    return {
      monthStr: mStr,
      label,
      income,
      expense,
      net,
      isCurrent: mStr === currentMonth,
    };
  });

  const maxVal = Math.max(
    ...monthStats.map((m) => Math.max(m.income, m.expense)),
    5000
  );

  return (
    <div className="space-y-4">
      {/* Legend & Summary */}
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
        <div className="flex items-center gap-4 font-medium text-slate-600">
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-emerald-500" /> รายรับ (Income)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-sm bg-rose-500" /> รายจ่าย (Expense)
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-600" /> คงเหลือสุทธิ
          </span>
        </div>
        <span className="text-slate-400 text-[11px]">ย้อนหลัง 6 เดือน</span>
      </div>

      {/* Chart container */}
      <div className="grid grid-cols-6 gap-2 sm:gap-4 h-[220px] items-end pt-8 pb-2 border-b border-slate-100">
        {monthStats.map((item) => {
          const incHeight = maxVal > 0 ? (item.income / maxVal) * 140 : 0;
          const expHeight = maxVal > 0 ? (item.expense / maxVal) * 140 : 0;

          return (
            <div
              key={item.monthStr}
              className={`flex flex-col items-center justify-end h-full p-1.5 rounded-xl transition-all ${
                item.isCurrent
                  ? 'bg-emerald-50/60 ring-1 ring-emerald-200'
                  : 'hover:bg-slate-50'
              }`}
            >
              {/* Bars */}
              <div className="w-full flex items-end justify-center gap-1 h-[150px] relative">
                {/* Income */}
                <div
                  style={{ height: `${Math.max(incHeight, item.income > 0 ? 6 : 0)}px` }}
                  className="w-3 sm:w-5 bg-emerald-500 rounded-t-md transition-all duration-300 relative group cursor-pointer"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <span>รายรับ: {formatCurrency(item.income)}</span>
                  </div>
                </div>

                {/* Expense */}
                <div
                  style={{ height: `${Math.max(expHeight, item.expense > 0 ? 6 : 0)}px` }}
                  className="w-3 sm:w-5 bg-rose-500 rounded-t-md transition-all duration-300 relative group cursor-pointer"
                >
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 hidden group-hover:flex flex-col items-center bg-slate-900 text-white text-[10px] py-1 px-2 rounded pointer-events-none whitespace-nowrap z-20 shadow-lg">
                    <span>รายจ่าย: {formatCurrency(item.expense)}</span>
                  </div>
                </div>
              </div>

              {/* Month label and net */}
              <div className="mt-2 text-center w-full">
                <span
                  className={`block text-[11px] font-bold ${
                    item.isCurrent ? 'text-emerald-700' : 'text-slate-700'
                  }`}
                >
                  {item.label}
                </span>
                <span
                  className={`block text-[10px] font-medium truncate ${
                    item.net >= 0 ? 'text-emerald-600' : 'text-rose-500'
                  }`}
                >
                  {item.net !== 0 ? (item.net > 0 ? `+${formatCurrency(item.net)}` : formatCurrency(item.net)) : '-'}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
