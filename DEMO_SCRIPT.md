# Finora — Academic Demonstration Script (Viva & Video Walkthrough)

**Target Duration:** 4 Minutes 40 Seconds (Strictly below the 5-minute rubric cutoff)  
**Evaluation Standard:** EC4307 Web Application Development Mini Project  
**Prerequisites for Recording:**
- Web camera on (showing student presenter face in corner or full screen).
- Browser open to `http://localhost:5173`.
- Backend running at `http://localhost:8080/api`.
- Terminal ready with passing test outputs.

---

## Timing Overview

| Segment | Timestamp | Target Topic | Rubric Alignment |
|---|---|---|---|
| **1. Introduction** | 0:00 – 0:30 (30s) | Project Scope, Architecture & Stack | Documentation & Architecture |
| **2. Auth & Security** | 0:30 – 1:15 (45s) | Registration, JWT Auth & User Isolation | Security, Validation & Error Handling |
| **3. Categories CRUD** | 1:15 – 2:00 (45s) | Create, Duplicate Name Prevention & Safe Delete | Create, Update, Delete & Database Design |
| **4. Transactions CRUD** | 2:00 – 2:55 (55s) | Income & Expense, Edit, Validation & Delete | Create, Read, Update, Delete & Validation |
| **5. Search, Filter & Sort**| 2:55 – 3:40 (45s) | Search, Date/Type Filter, 4-Way Sort, Pagination | Read, Search, Filter & Sort |
| **6. Reports & CSV Export**| 3:40 – 4:20 (40s) | Dashboard KPIs, Print/PDF, Real CSV Export | UI/UX & Real-World Reliability |
| **7. Tests & Conclusion** | 4:20 – 4:40 (20s) | 60 Automated Tests (29 backend + 31 frontend) | Code Quality & Structure |

---

## Detailed Step-by-Step Script

### [0:00 – 0:30] Segment 1: Introduction & Architecture
**Speaker (Camera on face):**
> "Good day, Evaluators. My name is [Your Name], and I am presenting **Finora**, an enterprise-grade full-stack personal finance tracker developed for the EC4307 module.  
> Finora is architected with a decoupled frontend using React 18, Vite, and responsive CSS, communicating via RESTful APIs with a Java 21 and Spring Boot 3.5 backend.  
> Financial persistence is backed by MySQL 8 with Flyway database migrations, JJWT stateless security, and BigDecimal decimal precision to eliminate floating-point calculation errors."

**Screen Action:**
- Show Finora login screen (`http://localhost:5173`).
- Briefly show Swagger UI documentation at `http://localhost:8080/swagger-ui.html`.

---

### [0:30 – 1:15] Segment 2: Registration, Login & Multi-Tenant Data Isolation
**Speaker:**
> "Let's begin with user authentication. All passwords are encrypted with BCrypt hashing. Each user is strictly isolated in their own tenant workspace."

**Screen Action:**
1. Click **"Need an account? Sign up"**.
2. Enter Name: `Alex Rivera`, Email: `alex@demo.com`, Password: `Password123!`.
3. Click **"Create account"** -> Highlight the toast: *"Welcome to Finora!"*.
4. Sign in with `alex@demo.com`.
5. Point out the personalized welcome and empty state.
6. **Viva Point to highlight:** *"Notice that even if User B registers and attempts to query Alex's data or access Alex's IDs via Postman, the backend enforces tenant isolation via Spring Security and returns HTTP 404 Not Found."*

---

### [1:15 – 2:00] Segment 3: Category Management & Historical Data Protection
**Speaker:**
> "Now let's examine Category CRUD and business integrity rules."

**Screen Action:**
1. Navigate to **"Categories"** in the sidebar.
2. Click **"Add category"** -> Enter `Groceries` -> Click **"Create category"**.
3. Create a second category: `Entertainment`.
4. Demonstrate Duplicate Prevention: Click **"Add category"** -> Enter `groceries` (lowercase) -> Show immediate validation blocking the duplicate: *"A category with this name already exists"*.
5. Edit `Groceries` to `Daily Groceries` using the pencil icon -> Show instant update.
6. Highlight Deletion Integrity Rule:
   - *"If a category has linked financial history, Finora enforces relational integrity: the category cannot be deleted until its transactions are reassigned, preventing corrupt orphan records."*

---

### [2:00 – 2:55] Segment 4: Transaction CRUD & Robust Validation
**Speaker:**
> "Next, let's explore Transaction workflows and multi-level validation."

**Screen Action:**
1. Click **"Add transaction"** (or use the Topbar quick action).
2. Demonstrate Frontend & Backend Validation:
   - Switch to **Expense**. Try submitting an expense without selecting a category -> Highlight error: *"Choose a category for an expense"*.
   - Enter amount `0` or negative -> Show amount validation: *"Amount must be greater than 0"*.
3. Add valid expense:
   - Amount: `45.50`, Category: `Daily Groceries`, Date: Today, Description: `Supermarket run` -> Click **"Add transaction"**.
4. Add an income transaction:
   - Type: **Income**, Amount: `2500.00`, Category: (Optional), Date: Today, Description: `Monthly Salary`.
5. Edit a transaction: Click pencil on `Supermarket run`, update amount to `52.00` -> Save changes.
6. Delete confirmation: Click trash icon on an entry -> Show browser safety prompt: *"Delete this transaction? This action cannot be undone."* -> Cancel or confirm.

---

### [2:55 – 3:40] Segment 5: Search, Filtering, 4-Way Sorting & Pagination
**Speaker:**
> "To handle high volumes of financial data, Finora provides responsive searching, multi-criteria filtering, backend-aligned 4-way sorting, and clean pagination."

**Screen Action:**
1. Navigate to **"Transactions"** page.
2. Show **Type Filter**: Click **"Income"** (shows salary), click **"Expenses"** (shows groceries), click **"All transactions"**.
3. Show **Search**: Type `Supermarket` in the search bar -> Result filters instantly with debounced API queries.
4. Show **Sorting**:
   - Select **"Highest amount"** -> Largest transaction moves to top.
   - Select **"Newest date"** / **"Oldest date"** -> Order reverses smoothly.
5. Show **Pagination**:
   - Point out the pagination footer: *"Showing 1 to 10 of X records"* and records-per-page selector (10, 25, 50, All).
   - Point out the responsive page navigation buttons.

---

### [3:40 – 4:20] Segment 6: Dashboard, Currency Reactivity, Print/PDF & Real CSV Export
**Speaker:**
> "On the Dashboard and Reports views, Finora aggregates financial metrics using optimized SQL grouping queries."

**Screen Action:**
1. Navigate to **"Overview"** (Dashboard):
   - Highlight KPI cards: Lifetime Income, Lifetime Expenses, Total Balance, and Current Month Net.
   - Point out the Spending by Category breakdown bar chart.
2. Navigate to **"Settings"**:
   - Toggle **Display currency** from LKR to USD or EUR -> Show that amounts update across the entire app immediately.
   - Toggle **Dark mode** -> Show theme shift with local storage persistence.
3. Navigate to **"Reports"**:
   - Show the Income vs. Expenses visual plot.
   - Click **"Print / Save PDF"** -> Show browser print dialog configured for clean PDF generation.
   - Click **"Export CSV"** -> Show the browser downloading a real, formatted `.csv` file containing metrics and category records.

---

### [4:20 – 4:40] Segment 7: Automated Test Verification & Conclusion
**Speaker (Camera on face):**
> "Software quality and test automation are supported by **60 passing automated tests**:
> - 29 backend tests in JUnit 5 covering multi-tenant security isolation, JWT expiration, service calculations, sorting, and pagination.
> - 31 frontend tests in Vitest covering dashboard calculations, transaction rendering, validation, currency and date formatting, and CSV exports.
> Every criterion of the EC4307 rubric has been rigorously satisfied. Thank you for your time and evaluation."

**Screen Action:**
- Show terminal with:
  `[INFO] Tests run: 29, Failures: 0, Errors: 0, Skipped: 0 [BUILD SUCCESS]`
  and Vitest:
  `Test Files 6 passed (6), Tests 31 passed (31)`
- End recording at ~4:35.

---

## Viva Q&A Cheat Sheet (Prepared Answers)

1. **Q: How is data isolated between different users?**
   *A:* In Spring Security, every authenticated request extracts the user's email from the validated JWT claims. Services never rely on client-supplied user IDs; they query the database using the authenticated email (`findByEmailIgnoreCase`). All repository lookups require both `id` and `user.id`. If User A requests User B's transaction, a `404 Not Found` is thrown, completely preventing cross-tenant leakage.

2. **Q: Why use `BigDecimal` instead of `double` or `float` for money?**
   *A:* Binary floating-point numbers (`IEEE 754`) cannot represent fractions like `0.1` precisely, leading to accumulation errors in financial balances. Java's `BigDecimal` and MySQL's `DECIMAL(12,2)` use base-10 arithmetic, guaranteeing exact rounding and decimal fidelity.

3. **Q: How does category deletion maintain relational integrity?**
   *A:* At the database level, `fk_transactions_category` specifies `ON DELETE RESTRICT`. In the service layer, `categoryService.delete` checks `transactionRepository.countByCategory_IdAndUser_Id(id, userId)`. If any transactions are linked, it throws a `409 ConflictException` with a clear user message, preventing corrupted historical reports.

4. **Q: What is the database migration strategy?**
   *A:* We use Flyway with `baseline-on-migrate=true` and `baseline-version=0`. Existing production databases are baselined without data loss, while fresh environments execute `V1__init_schema.sql` to recreate tables, foreign keys, and composite indexes reliably.
