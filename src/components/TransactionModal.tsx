import React, { useState, useEffect } from 'react';
import { X, Check, Utensils, Briefcase, Plus, Calendar, Tag, CreditCard, FileText } from 'lucide-react';
import {
  Transaction,
  TransactionType,
  EXPENSE_CATEGORIES,
  INCOME_CATEGORIES,
  PAYMENT_METHODS,
} from '../types/finance';
import { getTodayDate } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  editItem?: Transaction | null;
  defaultDate?: string;
}

const QUICK_AMOUNTS = [50, 100, 200, 500, 1000, 5000];

const EXPENSE_SHORTCUTS = ['อาหารกลางวัน', 'กาแฟ', 'BTS / MRT', 'เติมน้ำมัน', 'ช้อปปิ้ง 7-Eleven', 'ค่าน้ำค่าไฟ', 'สั่งอาหารเดลิเวอรี'];
const INCOME_SHORTCUTS = ['เงินเดือน', 'ค่าคอมมิชชั่น', 'รับเงินโอน', 'ขายของออนไลน์', 'เงินปันผลหุ้น', 'งานฟรีแลนซ์'];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editItem,
  defaultDate,
}) => {
  const [type, setType] = useState<TransactionType>('expense');
  const [amount, setAmount] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [date, setDate] = useState<string>(defaultDate || getTodayDate());
  const [paymentMethod, setPaymentMethod] = useState<string>('เงินสด');
  const [notes, setNotes] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string>('');

  useEffect(() => {
    if (editItem) {
      setType(editItem.type);
      setAmount(String(editItem.amount));
      setTitle(editItem.title);
      setCategory(editItem.category);
      setDate(editItem.date);
      setPaymentMethod(editItem.paymentMethod || 'เงินสด');
      setNotes(editItem.notes || '');
    } else {
      setType('expense');
      setAmount('');
      setTitle('');
      setCategory(EXPENSE_CATEGORIES[0].name);
      setDate(defaultDate || getTodayDate());
      setPaymentMethod('เงินสด');
      setNotes('');
    }
    setErrorMsg('');
  }, [editItem, isOpen, defaultDate]);

  // When type changes, switch default category if not matching
  const handleTypeChange = (newType: TransactionType) => {
    setType(newType);
    if (newType === 'expense') {
      setCategory(EXPENSE_CATEGORIES[0].name);
    } else {
      setCategory(INCOME_CATEGORIES[0].name);
    }
  };

  const handleQuickAddAmount = (addVal: number) => {
    const cur = parseFloat(amount) || 0;
    setAmount(String(cur + addVal));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(amount);

    if (isNaN(numAmount) || numAmount <= 0) {
      setErrorMsg('กรุณาระบุจำนวนเงินที่มากกว่า 0');
      return;
    }
    if (!title.trim()) {
      setErrorMsg('กรุณากรอกชื่อรายการ');
      return;
    }
    if (!category.trim()) {
      setErrorMsg('กรุณาเลือกหมวดหมู่');
      return;
    }

    try {
      setIsSubmitting(true);
      setErrorMsg('');
      await onSave({
        title: title.trim(),
        amount: numAmount,
        type,
        category,
        date,
        paymentMethod,
        notes: notes.trim(),
      });
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'เกิดข้อผิดพลาดในการบันทึก');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const currentCategories = type === 'expense' ? EXPENSE_CATEGORIES : INCOME_CATEGORIES;
  const currentShortcuts = type === 'expense' ? EXPENSE_SHORTCUTS : INCOME_SHORTCUTS;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden my-auto animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 pt-5 pb-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={`p-2 rounded-xl ${type === 'expense' ? 'bg-rose-50 text-rose-600' : 'bg-emerald-50 text-emerald-600'}`}>
              {type === 'expense' ? <Utensils className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                {editItem ? 'แก้ไขรายการ' : 'เพิ่มรายการใหม่'}
              </h2>
              <p className="text-xs text-slate-400">บันทึกลงฐานข้อมูล Firebase (67021 Sali)</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-xl">
              {errorMsg}
            </div>
          )}

          {/* Type Switcher */}
          <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl">
            <button
              type="button"
              onClick={() => handleTypeChange('expense')}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                type === 'expense'
                  ? 'bg-rose-500 text-white shadow-md shadow-rose-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายจ่าย (Expense)
            </button>
            <button
              type="button"
              onClick={() => handleTypeChange('income')}
              className={`py-2.5 text-sm font-bold rounded-xl transition-all cursor-pointer ${
                type === 'income'
                  ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              รายรับ (Income)
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              จำนวนเงิน (บาท) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-2xl font-bold text-slate-400">
                ฿
              </span>
              <input
                type="number"
                step="any"
                min="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-2xl font-extrabold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Quick Amount Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {QUICK_AMOUNTS.map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleQuickAddAmount(val)}
                  className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                >
                  +{val}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setAmount('')}
                className="px-2 py-1 text-xs text-slate-400 hover:text-slate-600"
              >
                ล้าง
              </button>
            </div>
          </div>

          {/* Title / Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5">
              ชื่อรายการ / รายละเอียด *
            </label>
            <input
              type="text"
              placeholder="เช่น ข้าวหมูกรอบ, กาแฟอเมซอน, เงินเดือน"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={100}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
            {/* Quick title shortcuts */}
            <div className="flex flex-wrap gap-1 mt-1.5">
              {currentShortcuts.map((sc) => (
                <button
                  key={sc}
                  type="button"
                  onClick={() => setTitle(sc)}
                  className="px-2 py-0.5 text-[11px] rounded-md bg-slate-50 border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-100 transition-colors"
                >
                  {sc}
                </button>
              ))}
            </div>
          </div>

          {/* Category Selector Grid */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center justify-between">
              <span>หมวดหมู่ *</span>
              <span className="text-[11px] text-emerald-600 font-bold">{category}</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-36 overflow-y-auto p-1 border border-slate-100 rounded-xl bg-slate-50/50">
              {currentCategories.map((cat) => {
                const isSelected = category === cat.name;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => setCategory(cat.name)}
                    className={`p-2 rounded-xl text-xs font-semibold flex items-center gap-2 border transition-all text-left ${
                      isSelected
                        ? 'bg-white border-emerald-500 text-emerald-700 shadow-xs ring-1 ring-emerald-400'
                        : 'bg-white/80 border-slate-200 text-slate-600 hover:bg-white hover:border-slate-300'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color }}
                    />
                    <span className="truncate">{cat.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Payment Method */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" /> วันที่ทำรายการ
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1.5 flex items-center gap-1">
                <CreditCard className="w-3.5 h-3.5" /> ช่องทางชำระเงิน
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              >
                {PAYMENT_METHODS.map((pm) => (
                  <option key={pm} value={pm}>
                    {pm}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 mb-1 flex items-center gap-1">
              <FileText className="w-3.5 h-3.5" /> หมายเหตุ (ไม่บังคับ)
            </label>
            <input
              type="text"
              placeholder="ระบุสถานที่ หรือรายละเอียดเพิ่มเติม..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              maxLength={500}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
            />
          </div>

          {/* Submit Buttons */}
          <div className="pt-2 flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 border border-slate-200 rounded-2xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`flex-1 py-3 px-4 rounded-2xl text-sm font-bold text-white transition-all flex items-center justify-center gap-2 shadow-lg ${
                type === 'expense'
                  ? 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/25'
                  : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/25'
              }`}
            >
              {isSubmitting ? (
                <span>กำลังบันทึก...</span>
              ) : (
                <>
                  <Check className="w-4 h-4" />
                  <span>{editItem ? 'บันทึกการแก้ไข' : 'บันทึกรายการ'}</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
