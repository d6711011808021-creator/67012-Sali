# Security Specification: Income & Expense Tracker (67021 Sali)

## Data Invariants
1. A transaction document must belong to the authenticated user (`userId == request.auth.uid`).
2. Only verified authenticated users can create or modify transactions and monthly budgets.
3. Transaction amount must be positive (> 0) and not exceed 1,000,000,000 THB.
4. Transaction type must be strictly 'income' or 'expense'.
5. Dates must strictly follow ISO date format YYYY-MM-DD.
6. Monthly budgets must belong to the authenticated user and follow YYYY-MM format.
7. Creation timestamps (`createdAt`) must be immutable and match `request.time`.
8. Updating timestamps (`updatedAt`) must match `request.time`.
9. No user can read, list, update, or delete another user's transactions or budgets.
10. Default deny is enforced for all paths unless explicitly matched.

## The Dirty Dozen Attack Payloads & Test Scenarios
1. **Unauthenticated Read/Write**: Attempt to list or create transactions without auth -> REJECTED.
2. **Identity Spoofing**: User A attempts to create a transaction with `userId: "user_B"` -> REJECTED.
3. **Cross-User Data Leak**: User A attempts to get or list User B's transactions -> REJECTED.
4. **Shadow Update / Ghost Field**: User attempts to update a transaction with injected `isAdmin: true` -> REJECTED.
5. **Negative or Zero Amount**: User attempts to create a transaction with amount <= 0 -> REJECTED.
6. **Denial-of-Wallet Long Payload**: User attempts to create a title with > 100 characters or 1MB notes -> REJECTED.
7. **Invalid Type Injection**: User attempts to submit `type: "loan"` or non-standard enum -> REJECTED.
8. **Invalid Date Format**: User attempts to submit `date: "not-a-date"` or SQL/NoSQL injection string -> REJECTED.
9. **Tampering with Creation Timestamp**: User attempts to update `createdAt` to arbitrary timestamp -> REJECTED.
10. **Path Poisoning**: Document ID containing illegal special characters or oversized key -> REJECTED.
11. **Cross-User Delete**: User A attempts to delete User B's transaction -> REJECTED.
12. **Unverified Email Bypass**: User with unverified credentials attempts to mutate records -> REJECTED.
