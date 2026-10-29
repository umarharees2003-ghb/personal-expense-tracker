# Finora — Backend REST API

This directory contains the Spring Boot REST API for Finora, a personal finance and expense tracking tool. The backend enforces user authentication, multi-tenant data isolation, relational category and transaction management with base-currency persistence (`amount_in_LKR`), dashboard aggregations, and financial reporting.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Prerequisites](#prerequisites)
3. [Database Setup (MySQL)](#database-setup-mysql)
4. [Environment Configuration & Security](#environment-configuration--security)
5. [Running the Application](#running-the-application)
6. [API Architecture & Endpoints](#api-architecture--endpoints)
7. [Database Migrations & Hibernate](#database-migrations--hibernate)
8. [Automated Tests](#automated-tests)
9. [Troubleshooting](#troubleshooting)
10. [Related Documentation](#related-documentation)

---

## Technology Stack

| Layer / Component | Technology | Purpose |
|---|---|---|
| **Language & Runtime** | Java 21 (LTS) | Modern language features and pattern matching |
| **Framework** | Spring Boot 3.5.6 | Dependency injection, auto-configuration, and REST APIs |
| **Security** | Spring Security 6 + JJWT 0.12.6 | Stateless JWT bearer authentication and BCrypt password hashing |
| **Persistence** | Spring Data JPA / Hibernate 6.6 | Object-relational mapping, custom JPQL queries, and Criteria specifications |
| **Migrations** | Flyway 11.7 | Versioned, reproducible database schema migrations |
| **Validation** | Jakarta Bean Validation (Hibernate Validator) | Strict DTO validation and input constraints |
| **API Documentation** | SpringDoc OpenAPI 2.8.5 | Automated Swagger UI interactive documentation |
| **Testing** | JUnit 5, Mockito, Spring Boot Test, H2 Database | Unit, service, and integration tests with isolated in-memory DB |
| **Build Tool** | Apache Maven with Maven Wrapper (`mvnw.cmd`) | Reproducible compilation and dependency management |

---

## Prerequisites

- **Java Development Kit (JDK):** JDK 21 or later
- **Database Server:** MySQL Server 8.0 or later
- **Maven:** Bundled via `mvnw.cmd` (no separate Maven installation required)

---

## Database Setup (MySQL)

Start your local MySQL service and create the application database using PowerShell or MySQL CLI:

```powershell
mysql -u root -p -e "CREATE DATABASE IF NOT EXISTS expense_tracker CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"
```

---

## Environment Configuration & Security

The backend reads configuration settings from environment variables with sensible defaults configured in [`src/main/resources/application.properties`](src/main/resources/application.properties).

### Environment Variables Reference

| Variable Name | Required | Default Value | Description |
|---|---|---|---|
| `DB_URL` | No | `jdbc:mysql://localhost:3306/expense_tracker?createDatabaseIfNotExist=true` | JDBC connection string for MySQL database |
| `DB_USERNAME` | No | `root` | MySQL user account |
| `DB_PASSWORD` | No | *(empty string)* | MySQL user password |
| `JWT_SECRET` | **Yes** | *(none)* | Secret signing key for HMAC-SHA256 tokens (**minimum 32 bytes**) |
| `JWT_EXPIRATION_MS` | No | `86400000` *(24 hours)* | Token expiration time in milliseconds |
| `CORS_ALLOWED_ORIGIN` | No | `http://localhost:5173,http://localhost:4173` | Comma-separated list of allowed frontend origins |
| `FLYWAY_ENABLED` | No | `true` | Enables automatic Flyway schema migrations on startup |
| `HIBERNATE_DDL_AUTO` | No | `update` | Hibernate schema tool behavior (`update` in dev, `validate` in prod) |
| `SHOW_SQL` | No | `false` | Set to `true` to print SQL queries to console during debugging |

### Generating a Cryptographically Secure JWT Secret

`JWT_SECRET` must contain at least 256 bits (32 UTF-8 bytes) to satisfy the HMAC-SHA256 signature algorithm. You can generate a random 32-byte secret in PowerShell:

```powershell
$bytes = New-Object byte[] 32; [System.Security.Cryptography.RandomNumberGenerator]::Create().GetBytes($bytes); [Convert]::ToBase64String($bytes)
```

### Loading Environment Variables

Spring Boot is configured via `spring.config.import=optional:file:.env[.properties]` to automatically import a `.env` file formatted as Java properties (`KEY=VALUE`) when running with the working directory set to `Back-End/expense-tracker`.

1. Copy the provided template to create your local `.env`:

   ```powershell
   Copy-Item .env.example .env
   ```

2. Edit `.env` with your actual MySQL password and the generated `JWT_SECRET`.

> [!CAUTION]
> The `.env` file is strictly ignored by Git. Never commit real credentials, passwords, or signing keys to version control.

Alternatively, you can provide environment variables directly in your PowerShell terminal session:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/expense_tracker?createDatabaseIfNotExist=true"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
$env:JWT_SECRET = "your-generated-32-byte-secret"
```

---

## Running the Application

### Option A: From the Backend Directory

```powershell
Set-Location "Back-End\expense-tracker"
.\mvnw.cmd spring-boot:run
```

### Option B: From the Repository Root

```powershell
.\Back-End\expense-tracker\mvnw.cmd -f .\Back-End\expense-tracker\pom.xml spring-boot:run
```

### Accessing the API

- **API Base URL:** `http://localhost:8080/api`
- **Interactive Swagger UI:** `http://localhost:8080/swagger-ui.html`
- **OpenAPI 3 JSON Specification:** `http://localhost:8080/v3/api-docs`

---

## API Architecture & Endpoints

All protected endpoints require an HTTP `Authorization` header containing the user's JWT bearer token:

```text
Authorization: Bearer <token>
```

### Main Controller Modules

- **Authentication (`/api/auth`):**
  - `POST /api/auth/register` — Register a new user account (BCrypt password hashing).
  - `POST /api/auth/login` — Authenticate credentials and receive a JWT bearer token.
  - `GET /api/auth/me` — Retrieve current authenticated profile.
  - `PUT /api/auth/me` — Update name and email.
- **Categories (`/api/categories`):**
  - Full CRUD operations scoped strictly to the authenticated user.
  - Enforces duplicate category name prevention (case-insensitive per user).
  - Protects against deletion of categories with linked transactions (`ON DELETE RESTRICT`).
- **Transactions (`/api/transactions`):**
  - Full CRUD operations with monetary precision (`amount_in_LKR DECIMAL(12, 2)`).
  - Multi-attribute filtering (date range, month/year, type `INCOME`/`EXPENSE`, category, search keyword).
  - 4-way sorting by date or amount (`sortBy=amount`, `sortBy=date`) in ascending or descending order.
  - Paginated transactions via `GET /api/transactions/paged`.
- **Dashboard (`/api/dashboard`):**
  - Summary metrics: lifetime totals, monthly income, monthly expenses, monthly balance.
  - Recent transactions (latest 5 records).
  - Spending breakdown grouped by category for the current month.
- **Reports (`/api/reports`):**
  - Monthly financial recaps and custom date-range summaries.
  - Category breakdown totals for selected periods.

*(For the complete endpoint and HTTP method specification table, refer to the [Root Project Documentation](../../README.md#rest-api-endpoints).)*

---

## Database Migrations & Hibernate

Finora combines **Flyway** for deterministic database versioning with **Spring Data JPA / Hibernate** for entity mapping:

### Flyway Migrations

Migrations are stored in [`src/main/resources/db/migration/`](src/main/resources/db/migration/):

1. **`V1__init_schema.sql`:**
   - Creates `users`, `categories`, and `transactions` tables with primary keys, unique constraints, and foreign keys.
   - Creates performance indexes:
     - `idx_transaction_user_date` on `transactions(user_id, date)`
     - `idx_transaction_user_type_date` on `transactions(user_id, type, date)`
     - `idx_transaction_category` on `transactions(category_id)`
2. **`V2__rename_amount_to_amount_in_lkr.sql`:**
   - Idempotently updates the `transactions` table column to `amount_in_LKR DECIMAL(12, 2) NOT NULL` to document base currency storage in Sri Lankan Rupees (LKR).

### Hibernate `ddl-auto` Behavior

- **Development (`update`):** Default setting (`spring.jpa.hibernate.ddl-auto=update`) allows Hibernate to validate entity mappings and apply incremental development additions alongside Flyway.
- **Production (`validate`):** In production deployments, set `HIBERNATE_DDL_AUTO=validate` (or `none`) so Flyway exclusively executes all schema changes, and Hibernate only verifies that entity annotations match the database schema.

---

## Automated Tests

Backend tests execute in an isolated in-memory **H2 database** running in MySQL compatibility mode (`MODE=MySQL`). They do not modify your local MySQL database.

### Running Backend Tests

From the `Back-End/expense-tracker` directory:

```powershell
.\mvnw.cmd test
```

From the repository root:

```powershell
.\Back-End\expense-tracker\mvnw.cmd -f .\Back-End\expense-tracker\pom.xml test
```

### Verified Test Results

The backend test suite consists of **29 tests across 8 test classes**:

| Test Class | Category | Verification Scope |
|---|---|---|
| `TransactionPaginationSortingIntegrationTest` | Integration | Validates pagination boundaries, page sizes, and sorting by date and amount |
| `TransactionSecurityTest` | Security | Verifies JWT authentication filter and validation constraints on transactions |
| `UserIsolationIntegrationTest` | Security / Multi-Tenancy | Verifies that User A cannot read, edit, or delete User B's transactions or categories |
| `JwtServiceTest` | Unit | Tests JWT token generation, claims extraction, signature verification, and expiration |
| `AuthServiceImplTest` | Unit | Tests registration, duplicate email handling, login validation, and profile updates |
| `CategoryServiceImplTest` | Unit | Tests category CRUD, case-insensitive uniqueness per user, and delete restrictions |
| `DashboardServiceImplTest` | Unit | Tests lifetime balance calculations, monthly totals, and category expense grouping |
| `ReportServiceImplTest` | Unit | Tests monthly and custom date range financial summaries and category aggregation |
| `TransactionServiceImplTest` | Unit | Tests transaction CRUD, category ownership checks, and filter specifications |

---

## Troubleshooting

### 1. Database Connection Refused (`CommunicationsException`)

- **Symptom:** `com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure`
- **Cause:** Local MySQL service is stopped or port 3306 is not accessible.
- **Solution:** Verify that your local MySQL service is running (e.g. `Start-Service MySQL80` or via Windows Services). Ensure credentials in `.env` or terminal variables match your MySQL server.

### 2. Invalid or Short JWT Secret (`WeakKeyException`)

- **Symptom:** Application startup fails with `io.jsonwebtoken.security.WeakKeyException: The specified key byte array is 128 bits which is not secure enough for HMAC-SHA-256...`
- **Cause:** `JWT_SECRET` is shorter than 32 bytes (256 bits).
- **Solution:** Generate a random 32-byte secret using the PowerShell command documented in [Generating a Cryptographically Secure JWT Secret](#generating-a-cryptographically-secure-jwt-secret).

### 3. Port 8080 Already in Use (`PortInUseException`)

- **Symptom:** `Web server failed to start. Port 8080 was already in use.`
- **Cause:** Another process or previous Spring Boot instance is holding port 8080.
- **Solution:** Find and terminate the process holding port 8080:
  ```powershell
  Get-NetTCPConnection -LocalPort 8080 | Select-Object OwningProcess
  Stop-Process -Id <OwningProcessId> -Force
  ```

---

## Related Documentation

- [Root Project Documentation](../../README.md) — Comprehensive system architecture, ERD, and full API endpoint specifications.
- [Frontend Documentation](../../Front-End/README.md) — React 18 single-page application setup, scripts, and component testing.
