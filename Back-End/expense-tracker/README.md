# Finora backend

This Spring Boot REST API handles authentication, user-owned transactions and categories, dashboard summaries, and reports. Controllers delegate to services and repositories; request authentication uses JWT, and passwords are BCrypt-hashed.

## Run locally

Requirements: Java 21 and MySQL 8. Start MySQL and create the `expense_tracker` database, then configure the following environment variables in the same PowerShell terminal:

```powershell
$env:DB_URL = "jdbc:mysql://localhost:3306/expense_tracker?createDatabaseIfNotExist=true"
$env:DB_USERNAME = "root"
$env:DB_PASSWORD = "your-local-mysql-password"
$env:JWT_SECRET = "replace-with-a-private-random-secret-at-least-32-characters"
.\mvnw.cmd spring-boot:run
```

From the repository root, run the wrapper with `.\Back-End\expense-tracker\mvnw.cmd -f .\Back-End\expense-tracker\pom.xml spring-boot:run`. The API listens at `http://localhost:8080`; Swagger UI is at `http://localhost:8080/swagger-ui.html`.

Flyway is enabled and the current Hibernate setting is `ddl-auto=update`. Back up an existing database before running the app against it. Never use the example configuration or a local development secret for a public deployment.

## API areas

- `/api/auth`: registration, login, and the authenticated profile
- `/api/transactions`: transaction CRUD and list filters
- `/api/categories`: user-scoped category CRUD
- `/api/dashboard`: lifetime/monthly totals, recent transactions, and category expenses
- `/api/reports`: monthly and date-range summaries

Protected endpoints require a bearer JWT. Transaction and category operations are scoped to the authenticated user.

## Tests

From the backend directory:

```powershell
.\mvnw.cmd test
```

Tests use H2 and do not require local MySQL.
