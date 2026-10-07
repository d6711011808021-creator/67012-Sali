import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  query,
  where,
  serverTimestamp,
  getDoc,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Transaction, MonthlyBudget } from '../types/finance';

const TRANSACTIONS_COLLECTION = 'transactions';
const BUDGETS_COLLECTION = 'budgets';

/**
 * Generate a safe ID for Firestore
 */
export function generateId(): string {
  return `${Date.now().toString(36)}_${Math.random().toString(36).substring(2, 9)}`;
}

/**
 * Subscribe to real-time transactions for the current user
 */
export function subscribeUserTransactions(
  userId: string,
  onData: (transactions: Transaction[]) => void,
  onError?: (error: unknown) => void
): () => void {
  const path = TRANSACTIONS_COLLECTION;
  const q = query(
    collection(db, path),
    where('userId', '==', userId)
  );

  return onSnapshot(
    q,
    (snapshot) => {
      const items: Transaction[] = [];
      snapshot.forEach((docSnap) => {
        const data = docSnap.data();
        items.push({
          id: docSnap.id,
          userId: data.userId,
          title: data.title,
          amount: Number(data.amount) || 0,
          type: data.type,
          category: data.category,
          date: data.date,
          notes: data.notes || '',
          paymentMethod: data.paymentMethod || 'เงินสด',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      });
      // Sort in memory by date descending, then createdAt descending
      items.sort((a, b) => {
        if (b.date !== a.date) {
          return b.date.localeCompare(a.date);
        }
        return 0;
      });
      onData(items);
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.LIST, path);
    }
  );
}

/**
 * Create a new transaction in Firestore
 */
export async function createTransaction(
  userId: string,
  data: Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>
): Promise<string> {
  const transactionId = generateId();
  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  // Sanitization & boundary checks matching firebase-blueprint.json
  const cleanTitle = (data.title || '').trim().slice(0, 100);
  const cleanCategory = (data.category || '').trim().slice(0, 50);
  const cleanAmount = Math.max(0.01, Math.min(1000000000, Number(data.amount) || 0));
  const cleanNotes = (data.notes || '').trim().slice(0, 500);
  const cleanPaymentMethod = (data.paymentMethod || 'เงินสด').trim().slice(0, 50);

  const payload = {
    userId,
    title: cleanTitle,
    amount: cleanAmount,
    type: data.type,
    category: cleanCategory,
    date: data.date,
    notes: cleanNotes,
    paymentMethod: cleanPaymentMethod,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  try {
    await setDoc(docRef, payload);
    return transactionId;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, `${TRANSACTIONS_COLLECTION}/${transactionId}`);
  }
}

/**
 * Update an existing transaction
 */
export async function updateTransaction(
  transactionId: string,
  userId: string,
  data: Partial<Omit<Transaction, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>
): Promise<void> {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);

  const updateData: Record<string, any> = {
    updatedAt: serverTimestamp(),
  };

  if (data.title !== undefined) updateData.title = data.title.trim().slice(0, 100);
  if (data.amount !== undefined) updateData.amount = Math.max(0.01, Math.min(1000000000, Number(data.amount) || 0));
  if (data.type !== undefined) updateData.type = data.type;
  if (data.category !== undefined) updateData.category = data.category.trim().slice(0, 50);
  if (data.date !== undefined) updateData.date = data.date;
  if (data.notes !== undefined) updateData.notes = data.notes.trim().slice(0, 500);
  if (data.paymentMethod !== undefined) updateData.paymentMethod = data.paymentMethod.trim().slice(0, 50);

  try {
    await updateDoc(docRef, updateData);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${TRANSACTIONS_COLLECTION}/${transactionId}`);
  }
}

/**
 * Delete a transaction
 */
export async function deleteTransaction(transactionId: string): Promise<void> {
  const docRef = doc(db, TRANSACTIONS_COLLECTION, transactionId);
  try {
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${TRANSACTIONS_COLLECTION}/${transactionId}`);
  }
}

/**
 * Subscribe to monthly budget
 */
export function subscribeMonthlyBudget(
  userId: string,
  month: string,
  onData: (budget: MonthlyBudget | null) => void,
  onError?: (error: unknown) => void
): () => void {
  const budgetDocId = `${userId}_${month}`;
  const docRef = doc(db, BUDGETS_COLLECTION, budgetDocId);

  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        onData({
          id: docSnap.id,
          userId: data.userId,
          month: data.month,
          monthlyBudget: Number(data.monthlyBudget) || 0,
          savingsGoal: Number(data.savingsGoal) || 0,
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });
      } else {
        onData(null);
      }
    },
    (error) => {
      if (onError) onError(error);
      handleFirestoreError(error, OperationType.GET, `${BUDGETS_COLLECTION}/${budgetDocId}`);
    }
  );
}

/**
 * Set or update monthly budget
 */
export async function saveMonthlyBudget(
  userId: string,
  month: string,
  monthlyBudget: number,
  savingsGoal: number = 0
): Promise<void> {
  const budgetDocId = `${userId}_${month}`;
  const docRef = doc(db, BUDGETS_COLLECTION, budgetDocId);

  try {
    const existing = await getDoc(docRef);
    if (existing.exists()) {
      await updateDoc(docRef, {
        monthlyBudget: Math.max(0, Math.min(1000000000, Number(monthlyBudget) || 0)),
        savingsGoal: Math.max(0, Math.min(1000000000, Number(savingsGoal) || 0)),
        updatedAt: serverTimestamp(),
      });
    } else {
      await setDoc(docRef, {
        userId,
        month,
        monthlyBudget: Math.max(0, Math.min(1000000000, Number(monthlyBudget) || 0)),
        savingsGoal: Math.max(0, Math.min(1000000000, Number(savingsGoal) || 0)),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `${BUDGETS_COLLECTION}/${budgetDocId}`);
  }
}
