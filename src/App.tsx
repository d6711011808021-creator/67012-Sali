/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo } from 'react';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PieChart,
  BarChart3,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Plus,
  LogIn,
  LogOut,
  Database,
  ShieldCheck,
  Sparkles,
  Layers,
  ArrowRight,
  Info,
} from 'lucide-react';
import { onAuthStateChanged, User } from 'firebase/auth';
import confetti from 'canvas-confetti';
import {
  auth,
  testConnection,
  loginWithGoogle,
  logoutUser,
} from './lib/firebase';
import {
  subscribeUserTransactions,
  createTransaction,
  updateTransaction,
  deleteTransaction,
  subscribeMonthlyBudget,
  saveMonthlyBudget,
} from './services/financeService';
import { Transaction, MonthlyBudget, TransactionType } from './types/finance';
import {
  getCurrentMonth,
  formatMonthYearThai,
  shiftMonth,
} from './utils/formatters';
import { getDemoTransactions } from './utils/mockData';
import { MonthlySummaryCards } from './components/MonthlySummaryCards';
import { CategoryDonutChart } from './components/charts/CategoryDonutChart';
import { DailyTrendChart } from './components/charts/DailyTrendChart';
import { MultiMonthComparisonChart } from './components/charts/MultiMonthComparisonChart';
import { FinancialInsights } from './components/FinancialInsights';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { BudgetModal } from './components/BudgetModal';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState<boolean>(true);
  const [firebaseConnected, setFirebaseConnected] = useState<boolean>(false);

  // Month state (YYYY-MM)
  const [selectedMonth, setSelectedMonth] = useState<string>(getCurrentMonth());

  // Data state
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [monthlyBudget, setMonthlyBudget] = useState<MonthlyBudget | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);

  // UI state
  const [graphTab, setGraphTab] = useState<'category' | 'daily' | 'comparison'>('category');
  const [categoryGraphType, setCategoryGraphType] = useState<TransactionType>('expense');
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState<boolean>(false);
  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 1. Connection check on initial boot
  useEffect(() => {
    async function initFirebase() {
      const ok = await testConnection();
      setFirebaseConnected(ok);
    }
    initFirebase();
  }, []);

  // 2. Auth listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);

      if (!currentUser) {
        // Fallback to interactive demo mode
        setIsDemoMode(true);
        setTransactions(getDemoTransactions());
        setMonthlyBudget({
          id: 'demo-budget',
          userId: 'demo-user',
          month: selectedMonth,
          monthlyBudget: 25000,
          savingsGoal: 10000,
        });
      } else {
        setIsDemoMode(false);
      }
    });

    return () => unsubscribe();
  }, [selectedMonth]);

  // 3. Real-time Firestore sync when authenticated
  useEffect(() => {
    if (!user) return;

    // Subscribe to transactions
    const unsubTransactions = subscribeUserTransactions(
      user.uid,
      (items) => {
        setTransactions(items);
      },
      (err) => {
        console.error('Error fetching transactions:', err);
      }
    );

    // Subscribe to monthly budget
    const unsubBudget = subscribeMonthlyBudget(
      user.uid,
      selectedMonth,
      (budget) => {
        setMonthlyBudget(budget);
      },
      (err) => {
        console.error('Error fetching budget:', err);
      }
    );

    return () => {
      unsubTransactions();
      unsubBudget();
    };
  }, [user, selectedMonth]);

  // Calculate monthly stats
  const currentMonthTransactions = useMemo(() => {
    return transactions.filter((t) => t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const { totalIncome, totalExpense } = useMemo(() => {
    let income = 0;
    let expense = 0;
    currentMonthTransactions.forEach((t) => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { totalIncome: income, totalExpense: expense };
  }, [currentMonthTransactions]);

  // Handlers
  const handleLogin = async () => {
    try {
      await loginWithGoogle();
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
      showToast('เข้าสู่ระบบสำเร็จ เชื่อมต่อ Firebase เรียบร้อย');
    } catch (err: any) {
      alert('ไม่สามารถเข้าสู่ระบบได้: ' + (err.message || 'โปรดลองใหม่อีกครั้ง'));
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      showToast('ออกจากระบบเรียบร้อย');
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleSaveTransaction = async (
    data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
  ) => {
    if (user) {
      if (editingTransaction) {
        await updateTransaction(editingTransaction.id, user.uid, data);
        showToast('แก้ไขรายการสำเร็จ');
      } else {
        await createTransaction(user.uid, data);
        showToast('บันทึกรายการลง Firebase เรียบร้อย');
        if (data.type === 'income') {
          confetti({ particleCount: 50, spread: 50, origin: { y: 0.7 } });
        }
      }
    } else {
      // In demo mode, mutate local state
      if (editingTransaction) {
        setTransactions((prev) =>
          prev.map((t) => (t.id === editingTransaction.id ? { ...t, ...data } : t))
        );
        showToast('แก้ไขรายการ (โหมดทดลอง)');
      } else {
        const newDemoItem: Transaction = {
          id: `demo-${Date.now()}`,
          userId: 'demo-user',
          ...data,
        };
        setTransactions((prev) => [newDemoItem, ...prev]);
        showToast('บันทึกรายการ (โหมดทดลอง - เข้าสู่ระบบเพื่อซิงค์ Firebase)');
      }
    }
  };

  const handleDeleteTransaction = async (id: string) => {
    if (user) {
      await deleteTransaction(id);
      showToast('ลบรายการสำเร็จ');
    } else {
      setTransactions((prev) => prev.filter((t) => t.id !== id));
      showToast('ลบรายการ (โหมดทดลอง)');
    }
  };

  const handleSaveBudget = async (budgetAmount: number, savingsGoalAmount: number) => {
    if (user) {
      await saveMonthlyBudget(user.uid, selectedMonth, budgetAmount, savingsGoalAmount);
      showToast('บันทึกงบประมาณประจำเดือนสำเร็จ');
    } else {
      setMonthlyBudget({
        id: 'demo-budget',
        userId: 'demo-user',
        month: selectedMonth,
        monthlyBudget: budgetAmount,
        savingsGoal: savingsGoalAmount,
      });
      showToast('บันทึกงบประมาณ (โหมดทดลอง)');
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 pb-16 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-top-3 duration-200">
          <Sparkles className="w-4 h-4 text-emerald-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Navigation Bar */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 text-white flex items-center justify-center shadow-md shadow-emerald-500/20">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base sm:text-lg text-slate-900 tracking-tight leading-tight">
                  67021 Sali
                </h1>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Firebase Sync
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">ระบบจัดการรายรับรายจ่าย</p>
            </div>
          </div>

          {/* User Auth Info & Controls */}
          <div className="flex items-center gap-3">
            {authLoading ? (
              <div className="w-24 h-8 bg-slate-100 rounded-xl animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-3">
                <div className="hidden md:flex flex-col text-right">
                  <span className="text-xs font-bold text-slate-800 truncate max-w-[150px]">
                    {user.displayName || 'ผู้ใช้งาน'}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate max-w-[150px]">
                    {user.email}
                  </span>
                </div>
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || 'Avatar'}
                    className="w-9 h-9 rounded-full ring-2 ring-emerald-500/30 object-cover"
                  />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs">
                    {(user.displayName || user.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                  title="ออกจากระบบ"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={handleLogin}
                className="py-2 px-3.5 sm:px-4 rounded-xl text-xs sm:text-sm font-bold bg-slate-900 text-white hover:bg-slate-800 shadow-md shadow-slate-900/10 transition-all flex items-center gap-2"
              >
                <LogIn className="w-4 h-4 text-emerald-400" />
                <span>เข้าสู่ระบบ Google</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Demo Mode Notice Banner */}
      {isDemoMode && !authLoading && (
        <div className="bg-gradient-to-r from-amber-500/10 via-emerald-500/10 to-teal-500/10 border-b border-amber-200/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-slate-700">
              <Info className="w-4 h-4 text-amber-600 shrink-0" />
              <span>
                กำลังแสดงข้อมูลตัวอย่าง (Demo Mode) • กด{' '}
                <strong>"เข้าสู่ระบบ Google"</strong> เพื่อบันทึกข้อมูลส่วนตัวจริงลง Firebase โปรเจกต์ <strong>67021 Sali</strong>
              </span>
            </div>
            <button
              onClick={handleLogin}
              className="self-start sm:self-auto px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg shadow-xs flex items-center gap-1 transition-colors shrink-0 text-[11px]"
            >
              <span>เชื่อมต่อ Firebase เดี๋ยวนี้</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-6">
        {/* Month Selector & Quick Actions */}
        <div className="bg-white p-4 rounded-3xl border border-slate-100 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, -1))}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="เดือนก่อนหน้า"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-emerald-600" />
              <h2 className="text-base sm:text-lg font-black text-slate-800 min-w-[150px]">
                {formatMonthYearThai(selectedMonth)}
              </h2>
            </div>

            <button
              onClick={() => setSelectedMonth((m) => shiftMonth(m, 1))}
              className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors"
              title="เดือนถัดไป"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {selectedMonth !== getCurrentMonth() && (
              <button
                onClick={() => setSelectedMonth(getCurrentMonth())}
                className="ml-2 px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
              >
                เดือนปัจจุบัน
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            <button
              onClick={() => {
                setEditingTransaction(null);
                setIsTransactionModalOpen(true);
              }}
              className="py-2.5 px-4 text-xs sm:text-sm font-bold rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/25 transition-all flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>บันทึกรายรับ-รายจ่าย</span>
            </button>
          </div>
        </div>

        {/* 1. Monthly Summary Cards */}
        <MonthlySummaryCards
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          monthlyBudget={monthlyBudget?.monthlyBudget || 0}
          savingsGoal={monthlyBudget?.savingsGoal || 0}
          onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
        />

        {/* 2. Financial Insights (Smart Analytics) */}
        <FinancialInsights
          transactions={transactions}
          selectedMonth={selectedMonth}
          monthlyBudget={monthlyBudget?.monthlyBudget || 0}
        />

        {/* 3. Data Analysis Graphs Section */}
        <div className="bg-white rounded-3xl border border-slate-100 shadow-sm p-4 sm:p-6 space-y-5">
          {/* Graph Header & Tab Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="text-lg font-black text-slate-800 flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-emerald-600" />
                <span>กราฟวิเคราะห์ข้อมูลการเงิน</span>
              </h3>
              <p className="text-xs text-slate-400">
                วิเคราะห์สัดส่วนและแนวโน้มการเงินประจำเดือน {formatMonthYearThai(selectedMonth)}
              </p>
            </div>

            {/* View Mode Tabs */}
            <div className="flex rounded-2xl bg-slate-100 p-1 text-xs font-semibold">
              <button
                onClick={() => setGraphTab('category')}
                className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
                  graphTab === 'category'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <PieChart className="w-3.5 h-3.5" />
                <span>สัดส่วนหมวดหมู่</span>
              </button>
              <button
                onClick={() => setGraphTab('daily')}
                className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
                  graphTab === 'daily'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>กระแสรายวัน</span>
              </button>
              <button
                onClick={() => setGraphTab('comparison')}
                className={`py-1.5 px-3 rounded-xl transition-all flex items-center gap-1.5 ${
                  graphTab === 'comparison'
                    ? 'bg-white text-slate-800 shadow-xs font-bold'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="w-3.5 h-3.5" />
                <span>เปรียบเทียบ 6 เดือน</span>
              </button>
            </div>
          </div>

          {/* Graph Content */}
          {graphTab === 'category' && (
            <div className="space-y-4">
              {/* Category sub-switch: Expense vs Income */}
              <div className="flex justify-end">
                <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-xs font-medium">
                  <button
                    onClick={() => setCategoryGraphType('expense')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      categoryGraphType === 'expense'
                        ? 'bg-rose-500 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    วิเคราะห์รายจ่าย
                  </button>
                  <button
                    onClick={() => setCategoryGraphType('income')}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      categoryGraphType === 'income'
                        ? 'bg-emerald-500 text-white font-bold shadow-xs'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    วิเคราะห์รายรับ
                  </button>
                </div>
              </div>

              <CategoryDonutChart
                transactions={currentMonthTransactions}
                type={categoryGraphType}
              />
            </div>
          )}

          {graphTab === 'daily' && (
            <DailyTrendChart
              transactions={currentMonthTransactions}
              selectedMonth={selectedMonth}
            />
          )}

          {graphTab === 'comparison' && (
            <MultiMonthComparisonChart
              transactions={transactions}
              currentMonth={selectedMonth}
            />
          )}
        </div>

        {/* 4. Transactions List */}
        <TransactionList
          transactions={currentMonthTransactions}
          onEdit={(t) => {
            setEditingTransaction(t);
            setIsTransactionModalOpen(true);
          }}
          onDelete={handleDeleteTransaction}
          onAddNew={() => {
            setEditingTransaction(null);
            setIsTransactionModalOpen(true);
          }}
          selectedMonth={selectedMonth}
        />
      </main>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isTransactionModalOpen}
        onClose={() => {
          setIsTransactionModalOpen(false);
          setEditingTransaction(null);
        }}
        onSave={handleSaveTransaction}
        editItem={editingTransaction}
        defaultDate={`${selectedMonth}-01`}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetModalOpen}
        onClose={() => setIsBudgetModalOpen(false)}
        month={selectedMonth}
        currentBudget={monthlyBudget?.monthlyBudget || 0}
        currentSavingsGoal={monthlyBudget?.savingsGoal || 0}
        onSave={handleSaveBudget}
      />
    </div>
  );
}
