import React from 'react';
import {
  TrendingUp,
  TrendingDown,
  Wallet,
  PiggyBank,
  Target,
  AlertCircle,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { formatCurrency } from '../utils/formatters';

interface MonthlySummaryCardsProps {
  totalIncome: number;
  totalExpense: number;
  monthlyBudget: number;
  savingsGoal: number;
  onOpenBudgetModal: () => void;
}

export const MonthlySummaryCards: React.FC<MonthlySummaryCardsProps> = ({
  totalIncome,
  totalExpense,
  monthlyBudget,
  savingsGoal,
  onOpenBudgetModal,
}) => {
  const netBalance = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;

  // Budget calculations
  const hasBudget = monthlyBudget > 0;
  const budgetUsagePercent = hasBudget ? (totalExpense / monthlyBudget) * 100 : 0;
  const budgetRemaining = hasBudget ? monthlyBudget - totalExpense : 0;
  const isOverBudget = hasBudget && totalExpense > monthlyBudget;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* 1. รายรับรวม (Total Income) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            รายรับรวม
          </span>
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {formatCurrency(totalIncome)}
          </h3>
          <p className="text-xs text-emerald-600 font-semibold flex items-center gap-1">
            <span>+ รายได้ทั้งหมดของเดือน</span>
          </p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-50 rounded-full opacity-30 pointer-events-none" />
      </div>

      {/* 2. รายจ่ายรวม (Total Expense) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            รายจ่ายรวม
          </span>
          <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
            <TrendingDown className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-2xl font-black text-slate-800 tracking-tight">
            {formatCurrency(totalExpense)}
          </h3>
          <p className="text-xs text-rose-500 font-semibold flex items-center gap-1">
            <span>- ค่าใช้จ่ายทั้งหมดของเดือน</span>
          </p>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-rose-50 rounded-full opacity-30 pointer-events-none" />
      </div>

      {/* 3. ยอดคงเหลือสุทธิ (Net Balance) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            ยอดคงเหลือสุทธิ
          </span>
          <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
            netBalance >= 0 ? 'bg-teal-50 text-teal-600' : 'bg-amber-50 text-amber-600'
          }`}>
            <Wallet className="w-5 h-5" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className={`text-2xl font-black tracking-tight ${
            netBalance >= 0 ? 'text-teal-700' : 'text-amber-600'
          }`}>
            {formatCurrency(netBalance)}
          </h3>
          <div className="flex items-center gap-1.5 text-xs">
            <span className={`px-2 py-0.5 rounded-full font-bold text-[11px] ${
              savingsRate >= 20
                ? 'bg-emerald-100 text-emerald-800'
                : savingsRate > 0
                ? 'bg-blue-100 text-blue-800'
                : 'bg-rose-100 text-rose-800'
            }`}>
              ออมได้ {savingsRate.toFixed(1)}%
            </span>
            <span className="text-slate-400 text-[11px]">ของรายรับ</span>
          </div>
        </div>
        <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-teal-50 rounded-full opacity-30 pointer-events-none" />
      </div>

      {/* 4. งบประมาณรายเดือน (Monthly Budget Tracker) */}
      <div className="bg-white p-5 rounded-3xl border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
            งบประมาณรายจ่าย
          </span>
          <button
            onClick={onOpenBudgetModal}
            className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors"
            title="ตั้งค่างบประมาณ"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>

        {hasBudget ? (
          <div>
            <div className="flex items-baseline justify-between mb-1.5">
              <span className="text-lg font-black text-slate-800">
                {formatCurrency(totalExpense)}
              </span>
              <span className="text-xs text-slate-400 font-semibold">
                / {formatCurrency(monthlyBudget)}
              </span>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-2">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  isOverBudget
                    ? 'bg-rose-500'
                    : budgetUsagePercent > 80
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(budgetUsagePercent, 100)}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-[11px]">
              <span className={`font-bold flex items-center gap-1 ${
                isOverBudget ? 'text-rose-600' : 'text-slate-500'
              }`}>
                {isOverBudget ? (
                  <>
                    <AlertCircle className="w-3.5 h-3.5 text-rose-500" />
                    เกินงบ {formatCurrency(Math.abs(budgetRemaining))}
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    เหลืองบ {formatCurrency(budgetRemaining)}
                  </>
                )}
              </span>
              <span className="font-semibold text-slate-400">
                {budgetUsagePercent.toFixed(0)}%
              </span>
            </div>
          </div>
        ) : (
          <div className="py-2">
            <p className="text-xs text-slate-500 mb-2">ยังไม่ได้กำหนดงบรายจ่าย</p>
            <button
              onClick={onOpenBudgetModal}
              className="w-full py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-xs rounded-xl transition-colors flex items-center justify-center gap-1.5"
            >
              <Target className="w-3.5 h-3.5" />
              ตั้งงบประมาณเดือนนี้
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
