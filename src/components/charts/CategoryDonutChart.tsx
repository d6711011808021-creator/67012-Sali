import React, { useState } from 'react';
import { Transaction, TransactionType } from '../../types/finance';
import { formatCurrency } from '../../utils/formatters';

interface CategoryDonutChartProps {
  transactions: Transaction[];
  type: TransactionType;
}

interface CategoryGroup {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

const PALETTE = [
  '#f97316', '#3b82f6', '#10b981', '#ec4899', '#8b5cf6',
  '#eab308', '#06b6d4', '#ef4444', '#14b8a6', '#64748b',
  '#a855f7', '#6366f1', '#84cc16'
];

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ transactions, type }) => {
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  const filtered = transactions.filter((t) => t.type === type);
  const totalAmount = filtered.reduce((sum, t) => sum + t.amount, 0);

  // Group by category
  const groupMap = new Map<string, { total: number; count: number }>();
  filtered.forEach((t) => {
    const cur = groupMap.get(t.category) || { total: 0, count: 0 };
    cur.total += t.amount;
    cur.count += 1;
    groupMap.set(t.category, cur);
  });

  const categories: CategoryGroup[] = Array.from(groupMap.entries())
    .map(([category, val], idx) => ({
      category,
      total: val.total,
      count: val.count,
      percentage: totalAmount > 0 ? (val.total / totalAmount) * 100 : 0,
      color: PALETTE[idx % PALETTE.length],
    }))
    .sort((a, b) => b.total - a.total);

  if (categories.length === 0 || totalAmount === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-slate-400 min-h-[260px]">
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-2 text-slate-400">
          ∅
        </div>
        <p className="text-sm font-medium">ยังไม่มีข้อมูล{type === 'expense' ? 'รายจ่าย' : 'รายรับ'}ในเดือนนี้</p>
        <p className="text-xs text-slate-400 mt-1">เพิ่มรายการเพื่อเริ่มวิเคราะห์สัดส่วน</p>
      </div>
    );
  }

  // Calculate SVG arc paths for donut
  const size = 200;
  const strokeWidth = 32;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  let cumulativePercent = 0;

  return (
    <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
      {/* SVG Donut Visual */}
      <div className="md:col-span-5 flex flex-col items-center justify-center relative">
        <div className="relative w-[200px] h-[200px]">
          <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
            <circle
              cx={size / 2}
              cy={size / 2}
              r={radius}
              fill="transparent"
              stroke="#f1f5f9"
              strokeWidth={strokeWidth}
            />
            {categories.map((cat, idx) => {
              const strokeDasharray = `${(cat.percentage / 100) * circumference} ${circumference}`;
              const strokeDashoffset = -((cumulativePercent / 100) * circumference);
              cumulativePercent += cat.percentage;
              const isHovered = hoveredIdx === idx;

              return (
                <circle
                  key={cat.category}
                  cx={size / 2}
                  cy={size / 2}
                  r={radius}
                  fill="transparent"
                  stroke={cat.color}
                  strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                  strokeDasharray={strokeDasharray}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                  className="transition-all duration-300 cursor-pointer"
                  onMouseEnter={() => setHoveredIdx(idx)}
                  onMouseLeave={() => setHoveredIdx(null)}
                />
              );
            })}
          </svg>

          {/* Center text */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4">
            <span className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              {hoveredIdx !== null ? categories[hoveredIdx].category : `ยอดรวม${type === 'expense' ? 'รายจ่าย' : 'รายรับ'}`}
            </span>
            <span className="text-base sm:text-lg font-bold text-slate-800 tracking-tight">
              {hoveredIdx !== null
                ? formatCurrency(categories[hoveredIdx].total)
                : formatCurrency(totalAmount)}
            </span>
            <span className="text-[11px] font-semibold text-slate-500">
              {hoveredIdx !== null
                ? `${categories[hoveredIdx].percentage.toFixed(1)}%`
                : `${categories.length} หมวดหมู่`}
            </span>
          </div>
        </div>
      </div>

      {/* Legend & Breakdown list */}
      <div className="md:col-span-7 space-y-2.5 max-h-[250px] overflow-y-auto pr-1">
        {categories.map((cat, idx) => (
          <div
            key={cat.category}
            onMouseEnter={() => setHoveredIdx(idx)}
            onMouseLeave={() => setHoveredIdx(null)}
            className={`p-2.5 rounded-xl transition-all cursor-pointer border ${
              hoveredIdx === idx
                ? 'bg-slate-100/80 border-slate-300 shadow-sm'
                : 'bg-white hover:bg-slate-50/80 border-slate-100'
            }`}
          >
            <div className="flex items-center justify-between text-xs sm:text-sm font-medium mb-1.5">
              <div className="flex items-center gap-2 min-w-0">
                <span
                  className="w-3 h-3 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="truncate font-semibold text-slate-700">{cat.category}</span>
                <span className="text-[11px] text-slate-400">({cat.count} รายการ)</span>
              </div>
              <div className="text-right shrink-0">
                <span className="font-bold text-slate-800">{formatCurrency(cat.total)}</span>
                <span className="ml-1.5 text-xs text-slate-400">({cat.percentage.toFixed(1)}%)</span>
              </div>
            </div>
            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${cat.percentage}%`,
                  backgroundColor: cat.color,
                }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
