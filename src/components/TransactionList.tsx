import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Calendar,
  CreditCard,
  FileText,
  ArrowUpDown,
  Utensils,
  Plus,
} from 'lucide-react';
import { Transaction, TransactionType, ALL_CATEGORIES } from '../types/finance';
import { formatCurrency, formatDateThai, exportToCSV } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (transaction: Transaction) => void;
  onDelete: (transactionId: string) => void;
  onAddNew: () => void;
  selectedMonth: string;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onAddNew,
  selectedMonth,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | TransactionType>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'>('date-desc');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Filter & sort
  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((t) => {
        // Search
        if (searchTerm.trim()) {
          const term = searchTerm.toLowerCase();
          const matchTitle = (t.title || '').toLowerCase().includes(term);
          const matchCategory = (t.category || '').toLowerCase().includes(term);
          const matchNotes = (t.notes || '').toLowerCase().includes(term);
          if (!matchTitle && !matchCategory && !matchNotes) return false;
        }

        // Type
        if (typeFilter !== 'all' && t.type !== typeFilter) return false;

        // Category
        if (categoryFilter !== 'all' && t.category !== categoryFilter) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'date-desc') return b.date.localeCompare(a.date);
        if (sortBy === 'date-asc') return a.date.localeCompare(b.date);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
        return 0;
      });
  }, [transactions, searchTerm, typeFilter, categoryFilter, sortBy]);

  const handleExport = () => {
    exportToCSV(filteredTransactions, `รายการรายรับรายจ่าย_${selectedMonth}`);
  };

  const getCategoryColor = (catName: string) => {
    const found = ALL_CATEGORIES.find((c) => c.name === catName);
    return found ? found.color : '#64748b';
  };

  return (
    <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-4">
      {/* Top Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <span>รายการบันทึก</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              {filteredTransactions.length} รายการ
            </span>
          </h3>
          <p className="text-xs text-slate-400">ประวัติการใช้จ่ายและรายรับทั้งหมดในเดือนนี้</p>
        </div>

        <div className="flex items-center gap-2">
          {filteredTransactions.length > 0 && (
            <button
              onClick={handleExport}
              className="py-2 px-3 text-xs font-semibold rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors flex items-center gap-1.5"
              title="ส่งออกไฟล์ CSV"
            >
              <Download className="w-3.5 h-3.5 text-slate-500" />
              <span>ส่งออก CSV</span>
            </button>
          )}

          <button
            onClick={onAddNew}
            className="py-2 px-4 text-xs font-bold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-600/20 transition-all flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>เพิ่มรายการ</span>
          </button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5">
        {/* Search */}
        <div className="sm:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="ค้นหาชื่อรายการ, หมวดหมู่, หมายเหตุ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
          />
        </div>

        {/* Type Filter */}
        <div className="sm:col-span-3 flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
          <button
            onClick={() => setTypeFilter('all')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              typeFilter === 'all' ? 'bg-white font-bold text-slate-800 shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            ทั้งหมด
          </button>
          <button
            onClick={() => setTypeFilter('expense')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              typeFilter === 'expense' ? 'bg-rose-500 font-bold text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายจ่าย
          </button>
          <button
            onClick={() => setTypeFilter('income')}
            className={`flex-1 py-1.5 rounded-lg text-center transition-all ${
              typeFilter === 'income' ? 'bg-emerald-500 font-bold text-white shadow-xs' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            รายรับ
          </button>
        </div>

        {/* Category Filter */}
        <div className="sm:col-span-2">
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">ทุกหมวดหมู่</option>
            {ALL_CATEGORIES.map((c) => (
              <option key={c.id} value={c.name}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {/* Sort By */}
        <div className="sm:col-span-2">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="w-full py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
          >
            <option value="date-desc">วันที่ล่าสุด</option>
            <option value="date-asc">วันที่เก่าสุด</option>
            <option value="amount-desc">ยอดเงินมากไปน้อย</option>
            <option value="amount-asc">ยอดเงินน้อยไปมาก</option>
          </select>
        </div>
      </div>

      {/* Transaction List Items */}
      {filteredTransactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-slate-200 bg-slate-50/50">
          <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3 text-slate-400">
            <Utensils className="w-5 h-5" />
          </div>
          <h4 className="font-bold text-slate-700 text-sm mb-1">ไม่พบรายการที่ค้นหา</h4>
          <p className="text-xs text-slate-400 mb-4 max-w-sm">
            {searchTerm || typeFilter !== 'all' || categoryFilter !== 'all'
              ? 'ลองปรับเปลี่ยนตัวกรอง หรือคำค้นหาใหม่อีกครั้ง'
              : 'ยังไม่มีรายการบันทึกในเดือนนี้ เริ่มต้นบันทึกรายรับหรือรายจ่ายรายการแรกกันเลย'}
          </p>
          <button
            onClick={onAddNew}
            className="py-2 px-4 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            เพิ่มรายการแรก
          </button>
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filteredTransactions.map((item) => {
            const isExpense = item.type === 'expense';
            const catColor = getCategoryColor(item.category);

            return (
              <div
                key={item.id}
                className="py-3 sm:py-3.5 flex items-center justify-between gap-3 hover:bg-slate-50/80 px-2 rounded-2xl transition-colors group"
              >
                {/* Left: icon & details */}
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-xs"
                    style={{ backgroundColor: `${catColor}15`, color: catColor }}
                  >
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: catColor }} />
                  </div>

                  <div className="min-w-0 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-800 truncate">
                        {item.title}
                      </span>
                      <span
                        className="text-[10px] font-semibold px-2 py-0.5 rounded-md border shrink-0"
                        style={{
                          borderColor: `${catColor}30`,
                          color: catColor,
                          backgroundColor: `${catColor}10`,
                        }}
                      >
                        {item.category}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-400">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateThai(item.date)}
                      </span>
                      {item.paymentMethod && (
                        <span className="flex items-center gap-1 text-slate-500">
                          • {item.paymentMethod}
                        </span>
                      )}
                      {item.notes && (
                        <span className="truncate max-w-[150px] sm:max-w-[200px] text-slate-400 italic">
                          ({item.notes})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right: amount & actions */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="text-right">
                    <span
                      className={`text-sm sm:text-base font-extrabold tracking-tight ${
                        isExpense ? 'text-rose-600' : 'text-emerald-600'
                      }`}
                    >
                      {isExpense ? '-' : '+'}{formatCurrency(item.amount)}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center opacity-80 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => onEdit(item)}
                      className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors"
                      title="แก้ไข"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>

                    {deletingId === item.id ? (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            onDelete(item.id);
                            setDeletingId(null);
                          }}
                          className="px-2 py-1 text-[10px] font-bold bg-rose-600 text-white rounded-md hover:bg-rose-700"
                        >
                          ยืนยัน
                        </button>
                        <button
                          onClick={() => setDeletingId(null)}
                          className="px-2 py-1 text-[10px] font-bold bg-slate-200 text-slate-600 rounded-md hover:bg-slate-300"
                        >
                          ยกเลิก
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setDeletingId(item.id)}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="ลบรายการ"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
