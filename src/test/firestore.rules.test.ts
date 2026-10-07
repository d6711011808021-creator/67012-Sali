/**
 * Security Rule Test Suite for firestore.rules
 * Verifies validation blueprints and access control for 67021 Sali
 */

export interface TestPayload {
  description: string;
  expectedResult: 'PERMISSION_DENIED' | 'ALLOWED';
  auth: { uid?: string; email_verified?: boolean } | null;
  path: string;
  operation: 'create' | 'update' | 'delete' | 'get' | 'list';
  data?: any;
}

export const DIRTY_DOZEN_TESTS: TestPayload[] = [
  {
    description: '1. Unauthenticated read attempt on transactions',
    expectedResult: 'PERMISSION_DENIED',
    auth: null,
    path: 'transactions/tx123',
    operation: 'get',
  },
  {
    description: '2. Identity spoofing: User A writes with User B uid in payload',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx123',
    operation: 'create',
    data: {
      userId: 'user_B',
      title: 'Spoofed Transaction',
      amount: 100,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: '2026-10-06',
    },
  },
  {
    description: '3. Cross-user reading: User A attempts to read User B transaction',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx_owned_by_B',
    operation: 'get',
  },
  {
    description: '4. Shadow update: injecting shadow privilege fields',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx_owned_by_A',
    operation: 'update',
    data: {
      isAdmin: true,
      role: 'superadmin',
    },
  },
  {
    description: '5. Negative amount payload injection',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx123',
    operation: 'create',
    data: {
      userId: 'user_A',
      title: 'Negative Amount',
      amount: -500,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: '2026-10-06',
    },
  },
  {
    description: '6. Oversized title payload (Denial of Wallet)',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx123',
    operation: 'create',
    data: {
      userId: 'user_A',
      title: 'A'.repeat(500),
      amount: 100,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: '2026-10-06',
    },
  },
  {
    description: '7. Invalid transaction type enum injection',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx123',
    operation: 'create',
    data: {
      userId: 'user_A',
      title: 'Invalid Type',
      amount: 100,
      type: 'loan_arbitrage',
      category: 'อาหารและเครื่องดื่ม',
      date: '2026-10-06',
    },
  },
  {
    description: '8. Malformed date string (not matching YYYY-MM-DD)',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx123',
    operation: 'create',
    data: {
      userId: 'user_A',
      title: 'Bad Date',
      amount: 100,
      type: 'expense',
      category: 'อาหารและเครื่องดื่ม',
      date: '06/10/2026; DROP TABLE transactions',
    },
  },
  {
    description: '9. Mutating immutable createdAt timestamp',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/tx_owned_by_A',
    operation: 'update',
    data: {
      createdAt: '1970-01-01T00:00:00Z',
    },
  },
  {
    description: '10. Path poisoning with invalid document ID characters',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'transactions/<script>alert(1)</script>',
    operation: 'create',
  },
  {
    description: '11. Cross-user delete: User A attempting to delete User B budget',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'user_A', email_verified: true },
    path: 'budgets/user_B_2026-10',
    operation: 'delete',
  },
  {
    description: '12. Unverified email user trying to write to transactions',
    expectedResult: 'PERMISSION_DENIED',
    auth: { uid: 'unverified_user', email_verified: false },
    path: 'transactions/tx999',
    operation: 'create',
  },
];
