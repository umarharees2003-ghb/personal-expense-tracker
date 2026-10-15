# Finora — Personal Expense Tracker

Finora is a full-stack personal finance application for tracking income and expenses, organizing transactions into categories, and reviewing financial summaries and reports.

The React frontend communicates with a Spring Boot REST API, while MySQL stores user and financial data.

## Features

- User registration, login, and profile management
- Create, view, edit, search, filter, and delete transactions
- Create and manage personal spending categories
- View income, expenses, balances, and recent transactions
- Explore category breakdowns and financial summaries
- Generate monthly, category-based, and date-range reports
- JWT-based authentication and user-specific data access
- Light and dark themes

## Technology Stack

| Area | Technologies |
|---|---|
| Frontend | React 18, Vite, Axios |
| Backend | Java 21, Spring Boot 3.5, Spring Web, Spring Security, Spring Data JPA |
| Database | MySQL 8 |
| Authentication | JWT (JJWT), BCrypt |
| API Documentation | OpenAPI, Swagger UI |

## Project Structure

```text
.
├── Front-End/
│   ├── src/
│   ├── .env.example
│   ├── package.json
│   └── ...
├── Back-End/
│   └── expense-tracker/
│       ├── src/
│       ├── pom.xml
│       ├── mvnw
│       ├── mvnw.cmd
│       └── ...
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- JDK 21
- MySQL 8
- Git

## Run Locally

Run the backend and frontend in separate terminals.

### 1. Configure the Database

Start MySQL and create the database if it does not already exist:

```sql
CREATE DATABASE expense_tracker;
```

Ensure that the database name matches the JDBC URL configured in the backend.

### 2. Configure and Start the Backend

From the repository root, set the local environment variables in PowerShell:

```powershell
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
$env:JWT_SECRET = "your-private-random-secret"
```

Use your actual local MySQL credentials. The JWT secret must meet the application's requirements; for the current configuration, use at least 32 UTF-8 bytes.

Start the backend:

```powershell
Set-Location .\Back-End\expense-tracker
.\mvnw.cmd spring-boot:run
```

The REST API is available at:

`http://localhost:8080/api`

Keep the backend terminal running.

### 3. Configure and Start the Frontend

Open a second PowerShell terminal from the repository root:

```powershell
Set-Location .\Front-End
Copy-Item .env.example .env
npm install
npm run dev
```

Open the local URL printed by Vite, usually:

`http://localhost:5173`

The example environment file should configure `VITE_API_URL` to point to the backend API:

`http://localhost:8080/api`

If necessary, update `VITE_API_URL` in your local `Front-End/.env` file.

## API Overview

Authentication is required for protected endpoints.

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Register a user |
| POST | `/api/auth/login` | Authenticate and obtain a JWT |
| GET, PUT | `/api/auth/me` | View or update the current user's profile |
| GET, POST | `/api/transactions` | List or create transactions |
| GET, PUT, DELETE | `/api/transactions/{id}` | Retrieve, update, or delete a transaction |
| GET, POST | `/api/categories` | List or create categories |
| GET, PUT, DELETE | `/api/categories/{id}` | Retrieve, update, or delete a category |
| GET | `/api/dashboard/...` | Retrieve dashboard data |
| GET | `/api/reports/...` | Retrieve financial reports |

The dashboard and report paths above are summaries. Refer to the backend controllers or OpenAPI documentation for the exact endpoint paths and parameters.

### API Documentation

When the backend is running:

- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI specification: `http://localhost:8080/v3/api-docs`

## Tests and Production Build

### Run Backend Tests

From the repository root:

```powershell
.\Back-End\expense-tracker\mvnw.cmd -f .\Back-End\expense-tracker\pom.xml test
```

### Build the Frontend

```powershell
Set-Location .\Front-End
npm run build
```

The production frontend build is generated in the `Front-End/dist/` directory.

## Security Notes

- Never commit `.env` files, database passwords, JWT secrets, or other private credentials.
- Keep `.env.example` limited to placeholder values and non-sensitive configuration.
- Configure sensitive backend values through environment variables.
- Keep generated build output and dependency directories out of version control.

## License

A license can be added if you intend to distribute this project under specific reuse terms.
