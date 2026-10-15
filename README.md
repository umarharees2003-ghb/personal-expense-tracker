# Finora — Personal Expense Tracker

Finora is a full-stack personal finance app for recording income and expenses, organizing transactions into categories, and viewing spending summaries and reports. The React frontend communicates with a Spring Boot REST API; MySQL stores user and finance data.

## Features

- Sign up, sign in, and manage your profile
- Create, view, edit, search, filter, and delete transactions
- Manage personal spending categories
- View income, expenses, balances, recent activity, and category breakdowns
- Generate monthly, category, and date-range reports
- Secure API access with JWT authentication and user-owned data
- Switch between light and dark themes

## Technology

| Area | Stack |
|---|---|
| Frontend | React 18, Vite, Axios |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA |
| Database | MySQL |
| Authentication | JWT (JJWT), BCrypt |
| API documentation | OpenAPI / Swagger UI |

## Project layout

```text
.
├── Front-End/                 # React + Vite application
└── Back-End/
    └── expense-tracker/        # Spring Boot REST API and Maven wrapper
```

## Prerequisites

- Node.js and npm
- Java 21
- MySQL 8 (running locally or reachable through a JDBC URL)

## Run locally

Start the backend and frontend in separate terminals.

### 1. Configure and start the backend

Create a MySQL database, or let the configured JDBC URL create it:

```sql
CREATE DATABASE expense_tracker;
```

In PowerShell, set the database credentials and a private JWT signing secret. Keep real credentials out of source control.

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-mysql-password"
$env:JWT_SECRET = "replace-with-a-private-random-secret-at-least-32-characters"
```

Start the API:

```powershell
Set-Location .\Back-End\expense-tracker
.\mvnw.cmd spring-boot:run
```

The API runs at `http://localhost:8080`. The JWT secret must be at least 32 UTF-8 bytes. By default, the application connects to `jdbc:mysql://localhost:3306/expense_tracker` as `root`; `DB_PASSWORD` and `JWT_SECRET` must be set.

### 2. Configure and start the frontend

In another PowerShell terminal:

```powershell
Set-Location .\Front-End
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite (by default, `http://localhost:5173`). The example environment file points the client to `http://localhost:8080/api`. To use a different API address, set `VITE_API_URL` in `Front-End/.env`.

## API overview

All endpoints below, except registration and login, require a JWT bearer token.

| Method | Endpoint | Purpose |
|---|---|---|
| `POST` | `/api/auth/register` | Register an account |
| `POST` | `/api/auth/login` | Sign in and obtain a JWT |
| `GET`, `PUT` | `/api/auth/me` | Read or update the signed-in user's profile |
| `GET`, `POST` | `/api/transactions` | List/filter or create transactions |
| `GET`, `PUT`, `DELETE` | `/api/transactions/{id}` | Read, update, or delete a transaction |
| `GET`, `POST` | `/api/categories` | List or create categories |
| `GET`, `PUT`, `DELETE` | `/api/categories/{id}` | Read, update, or delete a category |
| `GET` | `/api/dashboard/...` | Retrieve dashboard summaries and activity |
| `GET` | `/api/reports/...` | Retrieve monthly, category, and date-range reports |

Swagger UI is available at `http://localhost:8080/swagger-ui.html`; the OpenAPI document is at `http://localhost:8080/v3/api-docs`.

## Tests and production build

Run backend tests from the repository root:

```powershell
.\Back-End\expense-tracker\mvnw.cmd -f .\Back-End\expense-tracker\pom.xml test
```

Build the frontend for production:

```powershell
Set-Location .\Front-End
npm run build
```

See [Back-End/expense-tracker/README.md](./Back-End/expense-tracker/README.md) for backend configuration, endpoint filters, authentication details, and API testing guidance.
