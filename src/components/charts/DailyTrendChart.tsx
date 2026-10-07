import React, { useState } from 'react';
import { Transaction } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface DailyTrendChartProps {
  transactions: Transaction[];
  selectedMonth: string; // YYYY-MM
}

interface DayData {
  day: number;
  dateStr: string;
  income: number;
  expense: number;
  net: number;
  count: number;
}

export const DailyTrendChart: React.FC<DailyTrendChartProps> = ({ transactions, selectedMonth }) => {
  const [hoveredDay, setHoveredDay] = useState<DayData | null>(null);

  if (!selectedMonth || !selectedMonth.includes('-')) return null;

  const [yearStr, monthStr] = selectedMonth.split('-');
  const year = parseInt(yearStr, 10);
  const month = parseInt(monthStr, 10);
  const daysInMonth = new Date(year, month, 0).getDate();

  // Aggregate by day
  const daysMap = new Map<number, DayData>();
  for (let d = 1; d <= daysInMonth; d++) {
    const dStr = `${selectedMonth}-${String(d).padStart(2, '0')}`;
    daysMap.set(d, {
      day: d,
      dateStr: dStr,
      income: 0,
      expense: 0,
      net: 0,
      count: 0,
    });
  }

  transactions.forEach((t) => {
    if (t.date.startsWith(selectedMonth)) {
      const d = parseInt(t.date.split('-')[2], 10);
      const cur = daysMap.get(d);
      if (cur) {
        if (t.type === 'income') cur.income += t.amount;
        else cur.expense += t.amount;
        cur.net = cur.income - cur.expense;
        cur.count += 1;
      }
    }
  });

  const dailyList = Array.from(daysMap.values());
  const maxVal = Math.max(
    ...dailyList.map((d) => Math.max(d.income, d.expense)),
    1000
  );

  return (
    <div className="space-y-4">
      {/* Detail tooltip header */}
      <div className="min-h-[32px] flex items-center justify-between text-xs bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
        {hoveredDay ? (
          <div className="flex flex-wrap items-center gap-3">
            <span className="font-semibold text-slate-700">วันที่ {hoveredDay.day}:</span>
            <span className="text-emerald-600 font-medium">รายรับ {formatCurrency(hoveredDay.income)}</span>
            <span className="text-rose-500 font-medium">รายจ่าย {formatCurrency(hoveredDay.expense)}</span>
            <span className={`font-semibold ${hoveredDay.net >= 0 ? 'text-teal-600' : 'text-amber-600'}`}>
              สุทธิ {formatCurrency(hoveredDay.net)}
            </span>
          </div>
        ) : (
          <div className="text-slate-400 flex items-center gap-2">
            <span>แตะหรือชี้ที่แท่งกราฟเพื่อดูรายละเอียดรายวัน</span>
          </div>
        )}
        <div className="flex items-center gap-3 text-[11px] shrink-0 font-medium">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" /> รายรับ
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-rose-500" /> รายจ่าย
          </span>
        </div>
      </div>

      {/* Bar Chart Container */}
      <div className="h-[200px] flex items-end gap-1 sm:gap-1.5 pt-6 pb-2 px-1 overflow-x-auto select-none">
        {dailyList.map((item) => {
          const incHeight = maxVal > 0 ? (item.income / maxVal) * 140 : 0;
          const expHeight = maxVal > 0 ? (item.expense / maxVal) * 140 : 0;
          const isHovered = hoveredDay?.day === item.day;
          const hasData = item.income > 0 || item.expense > 0;

          return (
            <div
              key={item.day}
              onMouseEnter={() => setHoveredDay(item)}
              onMouseLeave={() => setHoveredDay(null)}
              className="flex-1 min-w-[14px] flex flex-col items-center h-full justify-end group cursor-pointer"
            >
              <div className="w-full flex items-end justify-center gap-0.5 h-[150px]">
                {/* Income bar */}
                <div
                  style={{ height: `${Math.max(incHeight, item.income > 0 ? 4 : 0)}px` }}
                  className={`w-1.5 sm:w-2 rounded-t-sm transition-all duration-200 ${
                    isHovered ? 'bg-emerald-400 brightness-110' : 'bg-emerald-500'
                  } ${item.income === 0 ? 'opacity-0' : 'opacity-100'}`}
                />
                {/* Expense bar */}
                <div
                  style={{ height: `${Math.max(expHeight, item.expense > 0 ? 4 : 0)}px` }}
                  className={`w-1.5 sm:w-2 rounded-t-sm transition-all duration-200 ${
                    isHovered ? 'bg-rose-400 brightness-110' : 'bg-rose-500'
                  } ${item.expense === 0 ? 'opacity-0' : 'opacity-100'}`}
                />
              </div>

              {/* Day label */}
              <span
                className={`text-[10px] mt-1 font-mono transition-colors ${
                  isHovered
                    ? 'font-bold text-slate-900 scale-110'
                    : hasData
                    ? 'text-slate-600 font-medium'
                    : 'text-slate-300'
                }`}
              >
                {item.day}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
