# Personal Expense Tracker Backend

A monolithic Spring Boot REST API for personal income and expense tracking. The API uses JWT authentication and scopes every transaction and category operation to the authenticated user.

## Features

- User registration and login with BCrypt password hashing and JWT bearer authentication
- User-owned category and transaction CRUD
- Transaction filtering by type, category, month/year, date range, and description
- Dashboard totals, monthly summaries, recent transactions, and category expense totals
- Monthly, category, and date-range reports with server-side financial calculations
- Bean Validation, consistent JSON errors, CORS for a local React development server, and OpenAPI/Swagger UI

## Technology Stack

- Java 21
- Spring Boot 3.5
- Spring Web, Spring Data JPA, Hibernate, Spring Security, Jakarta Bean Validation
- MySQL 8
- Maven, Lombok, JJWT, springdoc-openapi
- JUnit 5, Mockito, Spring Boot Test, Spring Security Test

## Architecture

```text
React client
    │ REST / JSON + Authorization: Bearer <JWT>
    ▼
Controllers → Services → Spring Data repositories → MySQL
```

Controllers handle HTTP and DTO conversion; services own business rules and user isolation; repositories perform persistence. Entities are never returned directly by the API.

## Project Structure

```text
src/main/java/com/example/expensetracker/
├── config/       # Security and OpenAPI configuration
├── controller/   # Auth, category, transaction, dashboard, and report APIs
├── dto/          # Validated request and response records
├── entity/       # User, Category, Transaction, and TransactionType
├── exception/    # Domain exceptions and global REST error handling
├── repository/   # Spring Data JPA repositories
├── security/     # BCrypt user details, JWT service, and request filter
└── service/
    └── impl/     # Business logic implementations
```

## Database Design

The `expense_tracker` MySQL database contains `users`, `categories`, and `transactions`. Each category belongs to one user, and each transaction belongs to one user and may reference a category. Expense transactions require a category; income transactions may omit it. Amounts are stored as `DECIMAL(12,2)`. A category cannot be deleted while one of the user's transactions references it. User email and per-user category names are unique.

Hibernate creates and updates the tables with `spring.jpa.hibernate.ddl-auto=update`. This is convenient for local coursework; use reviewed schema migrations instead for a production deployment.

## API Endpoints

All successful responses are JSON except deletes, which return `204 No Content`. Protected endpoints require `Authorization: Bearer <JWT>`.

| Method | Endpoint | Authentication | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Register and return safe user data |
| POST | `/api/auth/login` | Public | Authenticate and return JWT plus user |
| GET | `/api/auth/me` | JWT | Current authenticated user |
| PUT | `/api/auth/me` | JWT | Update name/email and return updated user with a fresh JWT |
| POST | `/api/transactions` | JWT | Create a transaction |
| GET | `/api/transactions` | JWT | List/search/filter transactions |
| GET | `/api/transactions/{id}` | JWT | Read an owned transaction |
| PUT | `/api/transactions/{id}` | JWT | Update an owned transaction |
| DELETE | `/api/transactions/{id}` | JWT | Delete an owned transaction |
| POST | `/api/categories` | JWT | Create a category |
| GET | `/api/categories` | JWT | List categories |
| GET | `/api/categories/{id}` | JWT | Read an owned category |
| PUT | `/api/categories/{id}` | JWT | Update an owned category |
| DELETE | `/api/categories/{id}` | JWT | Delete an unused category |
| GET | `/api/dashboard/summary` | JWT | Lifetime and current-month totals |
| GET | `/api/dashboard/recent-transactions` | JWT | Five most recent transactions |
| GET | `/api/dashboard/category-expenses` | JWT | Current-month expenses grouped by category |
| GET | `/api/dashboard/monthly-summary?month=10&year=2026` | JWT | Monthly income, expense, and balance |
| GET | `/api/reports/monthly?month=10&year=2026` | JWT | Monthly report; defaults to current month |
| GET | `/api/reports/category?startDate=2026-10-01&endDate=2026-10-31` | JWT | Category report; date range is optional |
| GET | `/api/reports/date-range?startDate=2026-10-01&endDate=2026-10-31` | JWT | Inclusive date-range report |

Transaction list filters can be combined where applicable:

```text
GET /api/transactions?type=EXPENSE&categoryId=1
GET /api/transactions?month=10&year=2026
GET /api/transactions?startDate=2026-10-01&endDate=2026-10-31
GET /api/transactions?search=food
```

Month/year filters and date-range filters are mutually exclusive. Both dates and both month/year values must be supplied together.

## Authentication

Register:

```http
POST /api/auth/register
Content-Type: application/json

{"name":"John Doe","email":"john@example.com","password":"password123"}
```

Log in:

```http
POST /api/auth/login
Content-Type: application/json

{"email":"john@example.com","password":"password123"}
```

Use the returned token on protected requests:

```http
Authorization: Bearer eyJ...
```

Passwords are BCrypt-encoded before persistence and are never included in responses. JWT subjects use the user's immutable database ID, so changing an email does not change the token's identity. After upgrading from email-subject tokens, users must log in again; old tokens receive a `401` response. Invalid or expired tokens also receive a `401` response.

## How to Run Backend

1. Install Java 21 and ensure the MySQL 8 server is running.
2. Create the database (or keep `createDatabaseIfNotExist=true` enabled):

   ```sql
   CREATE DATABASE expense_tracker;
   ```

3. Set the environment variables for your local MySQL account and a private JWT signing key:

   ```powershell
   $env:DB_USERNAME = "root"
   $env:DB_PASSWORD = "your-mysql-password"
   $env:JWT_SECRET = "replace-with-a-private-random-secret-at-least-32-characters"
   ```

   Optional variables are `DB_URL` (defaults to the local `expense_tracker` database and creates it if needed), `DB_USERNAME` (default `root`), `JWT_EXPIRATION_MS` (default `86400000`), `CORS_ALLOWED_ORIGIN` (default `http://localhost:5173`), and `SHOW_SQL` (default `false`). `DB_PASSWORD` and `JWT_SECRET` are required; the API will not start without database credentials and a private JWT key of at least 32 UTF-8 bytes.

4. Start the API from the project root:

   ```powershell
   .\mvnw.cmd spring-boot:run
   ```

The backend listens at `http://localhost:8080`. Swagger UI is available at `http://localhost:8080/swagger-ui.html`; the OpenAPI document is at `/v3/api-docs`.

### Run from IntelliJ IDEA

Open **Run > Edit Configurations**, select the `ExpenseTrackerApplication` Spring Boot configuration, and add these entries under **Environment variables**:

```text
DB_USERNAME=root
DB_PASSWORD=<your-mysql-password>
JWT_SECRET=<private-random-secret-at-least-32-characters>
```

Keep these values in your local, unshared IntelliJ configuration; do not put real credentials in source files or commit run-configuration files containing secrets. Add optional variables such as `DB_URL` or `CORS_ALLOWED_ORIGIN` there if you need to override their defaults.

## Environment Variables

| Variable | Default | Description |
|---|---|---|
| `DB_URL` | MySQL on localhost, database `expense_tracker` | JDBC connection URL; creates the database if needed |
| `DB_USERNAME` | `root` | MySQL account |
| `DB_PASSWORD` | Required | MySQL password |
| `JWT_SECRET` | Required | Private signing key, at least 32 UTF-8 bytes |
| `JWT_EXPIRATION_MS` | `86400000` | JWT validity duration in milliseconds |
| `CORS_ALLOWED_ORIGIN` | `http://localhost:5173` | Allowed React origin |
| `SHOW_SQL` | `false` | Enable Hibernate SQL output for local debugging |

## How to Test APIs

Run the automated test suite:

```powershell
.\mvnw.cmd test
```

Use the Swagger UI or an HTTP client such as `curl`/Postman. First register and log in, then copy the token into the Bearer authentication field. Validation errors return `400` with field-level `errors`; missing resources return `404`; attempts to use another user's resources return `404` rather than exposing their existence.

## Future Improvements

- Add database migration management for deployments
- Add pagination for larger transaction histories
- Add refresh-token and account recovery workflows if required by the client
