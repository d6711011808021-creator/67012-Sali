import React, { useState, useEffect } from 'react';
import { X, Check, Target, PiggyBank, DollarSign } from 'lucide-react';
import { formatMonthYearThai } from '../utils/formatters';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  month: string; // YYYY-MM
  currentBudget: number;
  currentSavingsGoal: number;
  onSave: (monthlyBudget: number, savingsGoal: number) => Promise<void>;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  month,
  currentBudget,
  currentSavingsGoal,
  onSave,
}) => {
  const [budgetVal, setBudgetVal] = useState<string>('');
  const [savingsVal, setSavingsVal] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setBudgetVal(currentBudget > 0 ? String(currentBudget) : '');
      setSavingsVal(currentSavingsGoal > 0 ? String(currentSavingsGoal) : '');
      setError('');
    }
  }, [isOpen, currentBudget, currentSavingsGoal]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const budgetNum = parseFloat(budgetVal) || 0;
    const savingsNum = parseFloat(savingsVal) || 0;

    if (budgetNum < 0 || savingsNum < 0) {
      setError('จำนวนเงินต้องไม่ติดลบ');
      return;
    }

    try {
      setIsSubmitting(true);
      await onSave(budgetNum, savingsNum);
      onClose();
    } catch (err: any) {
      setError(err.message || 'บันทึกไม่สำเร็จ');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
              <Target className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base">ตั้งค่างบประมาณรายเดือน</h3>
              <p className="text-xs text-slate-400">สำหรับ {formatMonthYearThai(month)}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <DollarSign className="w-4 h-4 text-emerald-600" />
              งบประมาณรายจ่ายสูงสุด (บาท)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              กำหนดวงเงินที่ตั้งใจจะใช้จ่ายไม่เกินในเดือนนี้
            </p>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="เช่น 15000"
              value={budgetVal}
              onChange={(e) => setBudgetVal(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1 flex items-center gap-1.5">
              <PiggyBank className="w-4 h-4 text-cyan-600" />
              เป้าหมายเงินออม (บาท)
            </label>
            <p className="text-[11px] text-slate-400 mb-2">
              จำนวนเงินที่ต้องการเก็บออมในเดือนนี้
            </p>
            <input
              type="number"
              step="any"
              min="0"
              placeholder="เช่น 5000"
              value={savingsVal}
              onChange={(e) => setSavingsVal(e.target.value)}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-base font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white"
            />
          </div>

          <div className="pt-3 flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-2.5 border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700 shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              บันทึกงบประมาณ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
