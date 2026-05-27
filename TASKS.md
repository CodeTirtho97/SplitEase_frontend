# SplitEase Frontend — Audit Task List

> Delete this file once all tasks are completed.
> Cross-references to backend TASKS.md items are noted where relevant.

---

## 🔴 CRITICAL — Broken Functionality Right Now

- [x] **FC1. `next.config.ts` has conflicting ESM/CJS exports — Cloudinary image config is never applied** — `next.config.ts:3-24`
  The file declares `const nextConfig` (ESM) with `images.domains: ["res.cloudinary.com"]` AND then uses `module.exports = { async headers() {...} }` (CJS). In Next.js the `module.exports` takes over and `nextConfig` is silently discarded. Profile pictures served from Cloudinary will fail `next/image` optimization or throw "Invalid src" errors. Fix: merge both into a single `module.exports` or a single `export default`.

- [x] **FC2. `SessionManager` calls non-existent backend endpoints — every user action fires 404s** — `components/SessionManager.tsx:8-10`, `utils/redis.ts`
  `SessionManager` imports `validateTokenWithRedis`, `extendSession`, `getSessionStatus` from `utils/redis`. These functions call `/api/auth/extend-session` and `/api/auth/session-status` — endpoints that **do not exist** on the backend. Every 5 minutes + every mouse/keyboard/scroll event triggers a 404 network request. `validateTokenWithRedis` also always returns `true` on error, so invalid sessions are never caught. The entire `utils/redis.ts` file should be deleted and replaced with calls to real backend endpoints (or removed entirely — the JWT expiry already handles session invalidation).

- [x] **FC3. Socket.IO event channel names mismatch between frontend and backend** — `context/socketContext.tsx`
  Frontend listens for: `expense_update`, `transaction_update`, `group_update`, `notification`. Backend Socket.IO (once backend C1 is fixed) will emit to: `expense_events`, `transaction_events`, `group_events`, `notification_events`. Names don't match — real-time events will never reach the UI. Align names on one side.

- [x] **FC4. Production backend URL hardcoded twice in `socketContext.tsx`** — `context/socketContext.tsx:128,283`
  `"https://splitease-backend-34tz.onrender.com"` is hardcoded in two places. `NEXT_PUBLIC_API_URL` env var exists but is overridden. In local dev the socket connects to the production server instead of `localhost`. Should use `process.env.NEXT_PUBLIC_API_URL` exclusively, stripping `/api` suffix for the socket base URL.

- [x] **FC5. `utils/redis.ts` is browser code calling server-only endpoints that don't exist** — `utils/redis.ts`
  This file exposes `validateTokenWithRedis`, `extendSession`, `getSessionStatus` — all making HTTP calls to backend endpoints that were never implemented. It is imported from `SessionManager` (client component) and `socketContext`. The file should be deleted entirely. Session validation is already handled by JWT expiry; the backend's `authMiddleware` rejects expired tokens.

- [x] **FC6. `handleGoogleCallback` in login/signup is dead code** — `app/login/page.tsx:135`, `app/signup/page.tsx:161`
  Both pages define a `handleGoogleSuccess` handler that calls `await handleGoogleCallback()`. But the Google button uses `window.location.href` redirect (the correct OAuth2 flow), so `handleGoogleSuccess` is never called. The import of `handleGoogleCallback` and the entire `handleGoogleSuccess` function body are unreachable dead code. The real OAuth callback is handled by `app/auth/google/callback/page.tsx`.

- [x] **FC7. All financial amounts in `groups/page.tsx` display hardcoded ₹ symbol** — `app/groups/page.tsx:1360,1417,1485`
  Pending transactions, "who owes whom", and optimized settlements all render `₹{amount}`. When backend C4 (currency param bug) is fixed and multi-currency is properly enabled, these displays will always be wrong. Related to backend M4 (debtSimplifier hardcodes ₹). Needs a currency-aware formatter.

---

## 🟠 HIGH — Significant Bugs / Data Integrity

- [x] **FH1. Wrong cookie key `"userToken"` used as fallback in 7+ places** — `utils/api/group.ts:11,35,55,71,92,114,239`
  The auth cookie is set as `"token"` (confirmed in `app/auth/google/callback/page.tsx:44` and `authContext`). These fallbacks in `group.ts` use `Cookies.get("userToken")` which always returns `undefined`. Affects: `fetchUserGroups`, `fetchGroupDetails`, `createNewGroup`, `updateGroup`, `removeGroup`, `fetchGroupTransactions`, `fetchUserFriends`. All group API calls will fail when token isn't passed explicitly from the calling component. Replace all `"userToken"` with `"token"`.

- [x] **FH2. `getExpenseSummary` ignores the `currency` parameter** — `utils/api/expense.ts`
  Function signature accepts `currency` but the value is never appended to the API request. `expenses/page.tsx` calls `getExpenseSummary(token, selectedCurrency)` — the selected currency is silently dropped, and the backend always returns INR data. Fix: pass `currency` as a query param.

- [x] **FH3. `expenses/page.tsx` hardcodes `"INR"` for chart breakdown** — `app/expenses/page.tsx:223`
  `getExpenseBreakdown(token, "INR")` — the `selectedCurrency` state variable exists but is not passed here. The breakdown chart always shows INR data regardless of the currency selector. Fix: pass `selectedCurrency`.

- [x] **FH4. `transactionContext.tsx` is effectively empty — no shared transaction state** — `context/transactionContext.tsx`
  Context stores only a `refreshTrigger` counter with an `incrementRefreshExpenses` function. There is no actual transaction data (pending list, history, settled payments) in shared state. Every page (payments, dashboard, groups) re-fetches transactions independently with no cache invalidation when a settlement occurs. Needs real state: `pendingTransactions`, `transactionHistory`, `settleTransaction` action.

- [x] **FH5. `profileContext.tsx` has duplicate `useEffect` — profile fetched twice on every mount** — `context/profileContext.tsx:102-112` and `context/profileContext.tsx:278-288`
  Two separate `useEffect` blocks both call `fetchUserProfile` when `token` changes. Every profile page load triggers two API calls. Remove the duplicate effect.

- [x] **FH6. `dashboard/page.tsx` has two duplicate auth-check `useEffect`s** — `app/dashboard/page.tsx:99-114`
  Two consecutive `useEffect` blocks both check `!token && !authLoading` and both redirect to `/login`. The second one is redundant. Remove one.

- [x] **FH7. `dashboard/page.tsx` API fallback URL appends double `/api`** — `app/dashboard/page.tsx`
  `const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"`. Since `NEXT_PUBLIC_API_URL` already includes `/api`, this fallback creates `http://localhost:5000/api/api/...` paths when the env var is missing. Remove the `/api` from the fallback string.

- [x] **FH8. `login/page.tsx` — naming collision between context `loading` and local `Loading` state** — `app/login/page.tsx:44`
  Both `loading` (from `useContext(AuthContext)`) and `Loading` (local `useState(false)`) coexist. Used inconsistently: the forgot-password spinner uses `Loading`, the button `disabled` prop uses `loading`. The full-screen overlay shows when either is true but the intent is muddled. Rename local state to `isLoginLoading` and audit every usage.

- [x] **FH9. `login/page.tsx` — `useEffect` tries to inject React components as raw HTML strings** — `app/login/page.tsx:202-250`
  The effect calls `document.createElement("div")` and sets `element.innerHTML = '<FontAwesomeIcon icon="...">'` — this produces literal text, not rendered icons. The DOM manipulation is broken and adds junk to the page. Remove entirely; the floating icons are already rendered declaratively below in the JSX (lines 338-383).

- [x] **FH10. `signup/page.tsx` — `Math.random()` particle positions cause React hydration mismatch** — `app/signup/page.tsx:309-310`
  Particle elements inline-compute `top: ${Math.random() * 100}%` and `left: ${Math.random() * 100}%` during render. If Next.js ever SSRs this component, server and client produce different values → hydration error. Use deterministic positions (seeded values or `useEffect`-only rendering).

- [x] **FH11. `auth/google/callback/page.tsx` — 5 debug `console.log` calls dump auth tokens to browser console** — `app/auth/google/callback/page.tsx:22-32`
  Logs `window.location.href`, `document.cookie`, search params, JWT token, and decoded user data. These are sensitive auth credentials visible in any browser's developer console. Remove all.

- [x] **FH12. `profile/page.tsx` — "Add Contact" modal button always adds first search result** — `app/profile/page.tsx:1022-1024`
  The "Add Contact" button calls `handleAddFriend(suggestedFriends[0]._id)` regardless of which friend the user highlighted. Clicking a specific friend in the list does work, but the modal's submit button ignores selection. Should be disabled until a specific friend is explicitly clicked/selected, or should require a selected state.

---

## 🟡 MEDIUM — Logic Bugs / UX Issues

- [x] **FM1. `payments/page.tsx` — hardcoded PIN "1234" is fake security** — `app/payments/page.tsx:169`
  `setUserPin("1234")` initializes the same PIN for every user. The comparison is entirely client-side. Any user can bypass this by inspecting source. Either implement real PIN via backend, or remove the PIN gate entirely since it provides zero security.

- [x] **FM2. `payments/page.tsx` — shows truncated bcrypt hash as transaction ID** — `app/payments/page.tsx`
  `payment.transactionId.substring(0, 10)...` truncates a bcrypt hash like `$2a$10$xyz...` as the display ID, revealing the hash algorithm. After backend fix C6 (replace bcrypt hash with UUID), this display should show a clean `TXN-XXXXX` style ID.

- [x] **FM3. No shared `formatCurrency` utility — ₹ hardcoded in 5+ files** — `app/dashboard/page.tsx`, `app/groups/page.tsx`, `app/payments/page.tsx`, `utils/api/group.ts`
  `₹{amount}` and `formatCurrency` are independently defined in multiple places. Create `utils/formatCurrency.ts` that accepts `(amount, currency)` and returns the correctly-symboled string.

- [x] **FM4. `dashboard/page.tsx` — all amounts display ₹ regardless of actual currency** — `app/dashboard/page.tsx`
  Dashboard stats (total expenses, total owed, etc.) use `₹` hardcoded. After backend fix C4 (currency support), dashboard will receive amounts in various currencies but display them all as ₹. Wire up the `formatCurrency` utility.

- [x] **FM5. `groups/page.tsx` — `calculateOwes` called twice when viewing a group** — `app/groups/page.tsx:82` and `app/groups/page.tsx:295`
  A standalone `useEffect` (lines 78-91) calls `calculateOwes` whenever `selectedGroup` changes. `handleViewGroup` (line 295) also calls `calculateOwes`. Opening a group triggers both calls. Remove the standalone effect; the call in `handleViewGroup` is sufficient.

- [x] **FM6. Artificial delays add unnecessary latency across the app**
  - `app/groups/page.tsx:195` — 500ms wait before closing create group modal
  - `context/authContext.tsx` — 500ms delay after login
  - `app/login/page.tsx:113` — 1500ms delay before dashboard redirect after login
  - `app/expenses/page.tsx` — 800ms delay before clearing loading state
  None of these serve a functional purpose. Remove all artificial `setTimeout` delays that are not tied to real async work.

- [x] **FM7. `socketContext.tsx` — `reconnectSocket` doesn't re-register event handlers** — `context/socketContext.tsx`
  `reconnectSocket` creates a new socket instance, but all event handlers registered via `addEventListener` are attached to the OLD socket object. After reconnect, all real-time events stop arriving. Fix: after reconnecting, re-register all handlers from the `eventHandlers` ref map onto the new socket.

- [x] **FM8. `signup/page.tsx` — no visual password requirements indicator**
  Password must satisfy a complex regex (uppercase, lowercase, digit, special char, 8+ chars) but the form shows no hints. Users see a generic toast error without knowing what's missing. Add inline requirement indicators that check each rule live.

- [x] **FM9. `ExpenseModal.tsx` — payee excluded from participant picker but included in `selectedParticipants`** — `components/ExpenseModal.tsx:376-380`
  `availableMembers` filters out the payee from the dropdown (`member._id !== payee`). Yet the payee IS included in `selectedParticipants`. This is intentional (payee is pre-selected), but the filter on `availableMembers` is applied to members beyond those already selected, which means the payee appears in the "selected" chip list correctly but can never be re-added. The logic is confusing. Also: when `handlePayeeChange` fires, it adds the payee to `selectedParticipants` with a `100` split value — when more participants are added with Equal split, this stale `100` value persists until recalculated. Audit the Equal-split recalculation flow when payee is pre-selected.

- [x] **FM10. `profile/page.tsx` — "No friends found" toast fires on every empty search** — `app/profile/page.tsx:107`
  Every search that returns 0 results fires `toast.error("No friends found")`. An empty search result is not an error. Show inline "No results found" text instead.

- [x] **FM11. `login/page.tsx` — forgot password error shows "Email Not Registered!" to user** — `app/login/page.tsx:193`
  The catch block sets `resetMessage = "❌ Email Not Registered!"` — mirrors the backend user enumeration vulnerability (backend H4). Should say "If this email is registered, a reset link has been sent."

- [x] **FM12. `expenses/page.tsx` — `isFetching` guard silently drops re-fetches when filter changes mid-flight** — `app/expenses/page.tsx`
  If a fetch is in-progress and the user changes the currency filter, the second fetch is blocked by `isFetching` and never runs. The UI stays stale until the user triggers another action. Use cancellation (AbortController) instead of blocking.

- [x] **FM13. `profile/page.tsx` — `UpdateLoadingOverlay` component defined inside parent component body** — `app/profile/page.tsx:497`
  `const UpdateLoadingOverlay = ({ message }) => (...)` is defined inside the `Profile` function component. It gets recreated on every render and React treats it as a new component type, causing DOM remounts. Move it outside `Profile` or to its own file.

- [x] **FM14. `authContext.tsx` — `user` typed as `any`** — `context/authContext.tsx`
  The `user` state in auth context is `any`. This propagates through the entire app — pages read `user.fullName`, `user.email`, `user.googleId` etc. without any type safety. Define a proper `AuthUser` interface.

---

## 🔵 STRUCTURE — Architecture & Project Organization

- [x] **FS1. Three icon libraries loaded simultaneously — massive bundle bloat**
  `@fortawesome/react-fontawesome` (+`@fortawesome/free-solid-svg-icons` + `@fortawesome/free-brands-svg-icons`), `lucide-react`, AND `react-icons` are all installed and imported across components. Each adds 50–150 KB to the bundle. Standardize on one library (FontAwesome already has the broadest usage in the codebase).

- [x] **FS2. `utils/redis.ts` must be deleted — it is frontend code calling nonexistent backend routes**
  The entire file is a phantom layer: it imports nothing real, calls endpoints that don't exist, and always returns `true` on errors. Its consumers (`SessionManager`, `socketContext`) should be refactored to call real backend endpoints or removed.

- [x] **FS3. Auth tokens stored in client-accessible cookies — XSS vulnerability** — `app/auth/google/callback/page.tsx:44`
  `Cookies.set("token", urlToken, { ... })` stores the JWT in a cookie readable by JavaScript. Any XSS vulnerability exposes the token. The backend should set the token as an `httpOnly` cookie in the OAuth redirect response. Alternatively, if client cookies are kept, add `secure: true` in production — it's currently conditional on `NODE_ENV`.

- [x] **FS4. `transactionContext.tsx` needs to be a real context, not a stub**
  Expand to hold: `pendingTransactions: Transaction[]`, `transactionHistory: Transaction[]`, `settleTransaction(id)`, `refreshTransactions()`. The payments page currently manages all this state locally — it should come from shared context to enable dashboard and groups page to react to settlements without re-fetching.

- [x] **FS5. No error boundaries anywhere in the component tree**
  A runtime error in any context provider or page component throws to the React root and shows a blank white screen. Wrap `app/layout.tsx` and each page/provider group with an `ErrorBoundary` that shows a user-friendly fallback.

- [x] **FS6. No shared API response types — `any` used for all responses**
  `response.data` is accessed without types throughout `utils/api/*.ts`. Define TypeScript interfaces for all API responses: `GroupResponse`, `ExpenseResponse`, `TransactionResponse`, `DashboardStats`, etc. in a shared `types/api.ts` file.

- [x] **FS7. Context provider nesting is too deep and has no resilience** — `app/layout.tsx`
  6 nested providers: `AuthProvider → ProfileProvider → GroupProvider → TransactionProvider → SocketProvider → SessionManager`. If any provider throws, all child contexts are lost. Consider flattening with a combined `AppProviders` component and adding error boundaries between critical providers.

- [x] **FS8. No shared constants file — group types, currencies, payment methods duplicated in frontend and backend**
  `ExpenseModal.tsx` hardcodes `["INR", "USD", "EUR", "GBP", "JPY"]` and `["Food", "Transportation", ...]`. These mirror backend model enums. Any additions require changes in both places. Create `utils/constants.ts` for the frontend.

- [x] **FS9. `next.config.ts` must use a single export pattern**
  Currently mixes `export default nextConfig` (ESM) and `module.exports = {...}` (CJS). Pick one: either `module.exports = { images: {...}, async headers() {...} }` or `const nextConfig: NextConfig = { images: {...}, headers: async () => [...] }; export default nextConfig`.

---

## ⚪ LOW — Minor / Polish

- [x] **FL1. `signup/page.tsx` — `onSubmit={(e) => handleSubmit(e).catch(console.error)}` is unusual** — `app/signup/page.tsx:427`
  Mixing `async`/`await` inside `handleSubmit` with a `.catch` on the call site. The try/catch inside `handleSubmit` already handles errors. The outer `.catch(console.error)` is redundant and inconsistent with how login handles the same pattern.

- [x] **FL2. `login/page.tsx` — `const localLoading = true` is declared but never used** — `app/login/page.tsx:92`
  Dead variable. Remove it.

- [x] **FL3. Excessive `typeof window !== "undefined"` guards in `"use client"` components**
  `"use client"` components only run on the client — these guards are always `true` and add visual noise. Identified in: `groups/page.tsx` (lines 80, 131, 152, 159, 221, 231, 263, 277), `dashboard/page.tsx`, `login/page.tsx`, `payments/page.tsx`. Safe to remove in all `"use client"` files.

- [x] **FL4. `reset-password/page.tsx` — success detection via `message.includes("successful")` is fragile** — `app/reset-password/page.tsx:37`
  If backend changes its success message wording, the 5-second auto-redirect and green styling silently break. Use a separate `isSuccess: boolean` state flag set from a caught success response rather than parsing the message string.

- [x] **FL5. `auth/google/callback/page.tsx` — `_success` state is written but never read** — `app/auth/google/callback/page.tsx:14`
  `const [_success, setSuccess] = useState(false)` — `setSuccess(true)` is called on line 61 but the value is never used to render anything (the success UI is shown via the `!isLoading && !error` branch). Remove this state.

- [x] **FL6. `signup/page.tsx` — password validation regex not shown to user**
  Password requires uppercase + lowercase + digit + special char but the UI only shows "at least 8 characters." Show all requirements with live checkmarks.

- [x] **FL7. Commented-out `GoogleOAuthProvider`/`GoogleLoginComponent` blocks in login and signup**
  Dead commented code from a deprecated approach. Clean up before production.

- [x] **FL8. `groups/page.tsx` — completed group shows "Completed by [owner]" instead of "Created by"** — `app/groups/page.tsx:605`
  The label says "Completed by" but shows `group.createdBy.fullName` — the group creator, not whoever marked it complete. Either fix the label to "Created by" or track who marked it complete.

- [x] **FL9. Missing `searchFriend` function reference in `profileContext` — called but context type not fully exported**
  `profile/page.tsx:102` calls `profileContext?.searchFriend(name)` but the context's destructured type cast on lines 234-254 doesn't include `searchFriend`. This will fail TypeScript strict checks and could be `undefined` at runtime.

---

## 🔗 Backend-Change Impact on Frontend

These frontend tasks are **blocked on or must be coordinated with** specific backend fixes. Do not implement the frontend side in isolation — verify the backend fix is deployed and tested first, then apply the frontend change.

---

### 1. Backend C1 → Frontend FC3 + FM7

**Backend fix (C1):** All 4 Redis Pub/Sub channel handlers in `config/socket.js` are empty stubs. The events are published to Redis (`expense_events`, `transaction_events`, `group_events`, `notification_events`) but never forwarded to Socket.IO clients. Real-time is completely non-functional until this is filled in.

**Frontend impact (FC3):** `context/socketContext.tsx` currently listens for `expense_update`, `transaction_update`, `group_update`, `notification`. These names do not match what the backend will emit once C1 is fixed. The handler registration must be updated to match whatever channel names the backend actually emits on.

**Frontend impact (FM7):** `reconnectSocket()` in `socketContext.tsx` creates a new socket instance but does not re-attach the event handlers registered via `addEventListener`. After a reconnect, all live listeners are gone. This means even after C1 is fixed, a reconnect will make real-time go silent again.

**Before making frontend changes, verify:**
- Backend C1 is fully implemented and the 4 channel handlers actually forward messages to `io.to(room).emit(...)`.
- Confirm the exact event name strings the backend emits (check the socket.js handler code directly — do not assume).
- Test with a WebSocket inspector (e.g., browser DevTools → Network → WS) that events actually arrive on the socket after C1 is deployed.
- Only then update `socketContext.tsx` channel names to match, and fix the reconnect handler re-registration.

---

### 2. Backend C4 → Frontend FH2 + FH3 + FM3 + FM4

**Backend fix (C4):** `getExpenseBreakdown` reads `req.query.currency` but the route is `/breakdown/:currency` (a path param). The currency is silently discarded and the endpoint always defaults to `"INR"`.

**Frontend impact (FH2):** `utils/api/expense.ts` — `getExpenseSummary` accepts a `currency` argument but never sends it to the backend. Once the backend actually honours the currency param, the frontend must pass it.

**Frontend impact (FH3):** `app/expenses/page.tsx:223` — `getExpenseBreakdown(token, "INR")` is hardcoded. The `selectedCurrency` state exists but is never passed. The chart always shows INR data.

**Frontend impact (FM3 + FM4):** Once the backend correctly returns amounts in the requested currency, the frontend must display the right symbol. Currently ₹ is hardcoded in `dashboard/page.tsx`, `groups/page.tsx`, `payments/page.tsx`, and inside `utils/api/group.ts:calculateOwes`. A shared `formatCurrency(amount, currency)` utility must be built and wired up everywhere before multi-currency display can work.

**Before making frontend changes, verify:**
- Backend C4 is fixed — test `GET /api/expenses/breakdown/USD` manually (e.g., via Postman or curl) and confirm the response actually returns USD-denominated values, not INR.
- Confirm the response shape — does the backend return `{ currency: "USD", data: [...] }` or just the raw data? The frontend parsing must match.
- Check that backend exchange rates are seeded (fresh deployments may have no rates — backend C7 also applies here).
- Build `utils/formatCurrency.ts` first, then wire it into all pages, then pass the correct currency params.

---

### 3. Backend C6 → Frontend FM2

**Backend fix (C6):** `models/Transaction.js` generates a `transactionId` by bcrypt-hashing a random string. The resulting hash (`$2a$10$xyz.../abc`) contains `/` and `$` characters that break Express URL param parsing. The `PUT /api/transactions/:transactionId/settle` endpoint is effectively unreachable. The fix is to replace the bcrypt-hashed ID with a clean UUID or `TXN-{timestamp}-{random}` format.

**Frontend impact (FM2):** `app/payments/page.tsx` currently displays transaction IDs as `payment.transactionId.substring(0, 10)...` — truncating a bcrypt hash that starts with `$2a$10$`. After the backend fix, IDs will be clean strings (e.g., `TXN-1716700000-a3f2`). The substring display should be replaced with the full clean ID or a formatted display label.

**Frontend impact (settle flow):** `utils/api/transaction.ts` uses `encodeURIComponent(transactionId)` to work around the `/` in bcrypt hashes. Once backend C6 is fixed and IDs are clean, the `encodeURIComponent` call is no longer needed — but it is also not harmful. Leave it in until confirmed working, then clean up.

**Before making frontend changes, verify:**
- Backend C6 is fixed and new transactions created after the fix carry clean IDs.
- Old transactions in the database still have bcrypt-hashed IDs — the settle endpoint must handle both formats during the migration window, OR old transactions must be migrated.
- Test `PUT /api/transactions/:id/settle` end-to-end with a new clean ID before removing the `encodeURIComponent` wrapper.
- Only update the display format after confirming the ID format is stable.

---

### 4. Backend H4 → Frontend FM11

**Backend fix (H4):** `forgotPassword` in `authService.js` returns `404 { message: "Email Not Registered!" }` for unknown emails. This lets anyone enumerate which email addresses have accounts (user enumeration attack). The fix is to always return `200` with a generic message like "If this email is registered, a reset link has been sent."

**Frontend impact (FM11):** `app/login/page.tsx:193` — the `catch` block in `handlePasswordReset` sets `resetMessage = "❌ Email Not Registered!"`, explicitly surfacing the enumeration-revealing message to the user. After H4 is fixed, the backend will always return 200 for this endpoint, so the `catch` block will rarely fire. The frontend should be updated to show a neutral message ("If this email is registered, you'll receive a reset link") in both the success and error branches.

**Before making frontend changes, verify:**
- Backend H4 is deployed — test `POST /api/auth/forgot-password` with an unknown email and confirm it returns `200`, not `404`.
- Test with a known email as well — confirm the response body wording and use that exact wording in the frontend success message.
- The frontend `catch` block should only fire for genuine network errors (5xx), not for "email not found" — update accordingly.

---

### 5. Backend M4 → Frontend FC7

**Backend fix (M4):** `utils/debtSimplifier.js:101` hardcodes `₹${amount}` in `buildSettlementSummary`. The `settlementSummary` string array returned by `/groups/:groupId/debt-summary` always contains ₹ symbols regardless of the group's actual currency context.

**Frontend impact (FC7):** `app/groups/page.tsx` displays the debt simplification section using `debtSummary.optimizedSettlements` (which are plain numeric amounts — these are fine) and `debtSummary.settlementSummary` (the string array — these will contain wrong ₹ symbols). Lines 1360, 1417, and 1485 also independently hardcode `₹{amount}` for pending transactions and "who owes whom" rows.

**Before making frontend changes, verify:**
- Backend M4 is fixed and `buildSettlementSummary` either omits the currency symbol (returning plain numbers) or accepts a currency param.
- Check the full shape of the `/groups/:groupId/debt-summary` response after the fix — confirm whether `settlementSummary` strings still include a symbol or not.
- If the backend returns plain amounts, the frontend must apply `formatCurrency(amount, group.currency)` — which requires knowing the group's currency. Confirm whether the group document includes a `currency` field (it currently does not in the schema — this may need to be added as part of the multi-currency effort).
- Coordinate this fix with FM3 (shared `formatCurrency` utility) — build the utility first.

---

## Summary

| Severity | Count |
|---|---|
| 🔴 Critical | 7 |
| 🟠 High | 12 |
| 🟡 Medium | 14 |
| 🔵 Structural | 9 |
| ⚪ Low | 9 |
| **Total** | **51** |
