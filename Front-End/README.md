# Finora — Frontend Application

This directory contains the single-page application (SPA) for Finora, a personal finance and expense tracking tool. It provides authenticated personal dashboards, cash-flow charts, responsive category and transaction management, period-based financial reports, CSV export, light/dark themes, and fixed-rate multi-currency conversion.

---

## Table of Contents

1. [Technology Stack](#technology-stack)
2. [Prerequisites](#prerequisites)
3. [Installation & Setup](#installation--setup)
4. [Environment Configuration](#environment-configuration)
5. [Available Scripts](#available-scripts)
6. [API Connection & Communication](#api-connection--communication)
7. [Testing & Quality Verification](#testing--quality-verification)
8. [Troubleshooting](#troubleshooting)
9. [Related Documentation](#related-documentation)

---

## Technology Stack

| Layer / Tool | Version / Library | Purpose |
|---|---|---|
| **Core Framework** | React 18.3.1 | Component-based user interface architecture |
| **Build Tool & Dev Server** | Vite 6.0.5 | Fast Hot Module Replacement (HMR) and optimized bundling |
| **HTTP Client** | Axios 1.20.0 | REST API communication with JWT interceptors |
| **Icons** | Lucide React 0.468.0 | Lightweight SVG icons |
| **Styling** | Modern CSS3 | Custom design system with CSS variables and responsive breakpoints |
| **Unit & Component Testing** | Vitest 5.0.5 + Testing Library | Automated unit and component tests with JSDOM |
| **Static Analysis** | ESLint 10.13.0 | JavaScript code quality and syntax linting |

---

## Prerequisites

- **Node.js:** Node.js 20 LTS or later (verified with Node.js 20+)
- **npm:** npm 10 or later
- **Backend Service:** Running Finora Spring Boot API (default: `http://localhost:8080/api`)

---

## Installation & Setup

1. Open a PowerShell terminal and navigate to the `Front-End` directory:

   ```powershell
   Set-Location "Front-End"
   ```

2. Install dependencies using the verified package lockfile:

   ```powershell
   npm ci
   ```

3. Configure your local environment file (see [Environment Configuration](#environment-configuration)).

4. Start the Vite local development server:

   ```powershell
   npm run dev
   ```

5. Access the web application in your browser:

   - **Development URL:** `http://localhost:5173`

---

## Environment Configuration

The frontend connects to the backend REST API using an environment variable defined in `.env`.

An example template is provided in [`.env.example`](.env.example):

```properties
VITE_API_URL=http://localhost:8080/api
```

### Setting Up `.env`

Copy `.env.example` to create your local `.env` file:

```powershell
Copy-Item .env.example .env
```

| Variable Name | Default Value | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:8080/api` | Base URL of the Finora Spring Boot backend REST API |

> [!IMPORTANT]
> In Vite, all environment variables prefixed with `VITE_` are statically embedded into client-side JavaScript bundles during compilation. Anyone inspecting browser network traffic or source maps can view them. **Never store passwords, private keys, or signing secrets in frontend environment files.**

---

## Available Scripts

All scripts are defined in [`package.json`](package.json) and run using `npm run <script>`:

| Script Command | Purpose |
|---|---|
| `npm run dev` | Starts the Vite local development server at `http://localhost:5173` with HMR |
| `npm run build` | Compiles and minifies source code into production-ready assets in the `dist/` directory |
| `npm run preview` | Locally serves the production build from `dist/` for pre-deployment verification |
| `npm run test` | Executes the Vitest test suite once across all unit and component tests |
| `npm run lint` | Runs ESLint across all source files in `src/` to verify code quality and style |

---

## API Connection & Communication

- **Service Module:** Handled by [`src/services/api.js`](src/services/api.js).
- **Authentication:** Axios request interceptors automatically read the active JWT token from `localStorage` under the key `finora.token` and append the HTTP header:
  ```text
  Authorization: Bearer <JWT>
  ```
- **Error Interception:** Axios response interceptors catch `401 Unauthorized` responses and dispatch an event to clear expired credentials, gracefully redirecting the user to the login screen.
- **Fixed-Rate Currency Handling:** Database transactions are stored and retrieved in base currency (`LKR`). The frontend utility [`src/utils/formatCurrency.js`](src/utils/formatCurrency.js) converts amounts dynamically for display and converts user foreign-currency input back to `LKR` before dispatching POST/PUT requests to the API.

---

## Testing & Quality Verification

Run these commands from the `Front-End` directory:

```powershell
# 1. Run all unit and component tests (Vitest)
npm run test

# 2. Run static analysis (ESLint)
npm run lint

# 3. Verify production compilation (Vite)
npm run build
```

### Verified Test Suites

The frontend test suite includes **39 tests across 6 test files**:

- `src/__tests__/formatCurrency.test.js`: Validates fixed-rate conversion between LKR, USD, EUR, and GBP, symbol resolution, and boundary values.
- `src/__tests__/formatDate.test.js`: Tests date formatting and relative date labels.
- `src/__tests__/validation.test.js`: Verifies email formats, password complexity constraints, and required fields.
- `src/__tests__/csvExport.test.js`: Tests transaction and recap CSV string generation.
- `src/__tests__/Dashboard.test.jsx`: Tests KPI cards, monthly cash-flow chart scaling, and category donut breakdown.
- `src/__tests__/TransactionsPage.test.jsx`: Tests transaction table rendering, search/filter controls, and statistics calculation.

---

## Troubleshooting

### 1. Network Error / API Connection Refused

- **Symptom:** Forms display "Unable to connect to server" or browser console shows `ERR_CONNECTION_REFUSED`.
- **Cause:** The Spring Boot backend service is not running or is listening on a different port.
- **Solution:** Verify that the backend is started at `http://localhost:8080/api` and check Swagger UI at `http://localhost:8080/swagger-ui.html`. Ensure `VITE_API_URL` in `.env` matches the backend host and port.

### 2. CORS (Cross-Origin Resource Sharing) Errors

- **Symptom:** Browser console reports `Access to XMLHttpRequest ... has been blocked by CORS policy`.
- **Cause:** The backend's `CORS_ALLOWED_ORIGIN` variable does not include the frontend origin (`http://localhost:5173`).
- **Solution:** In the backend `.env` or PowerShell terminal, ensure `CORS_ALLOWED_ORIGIN` is configured to `http://localhost:5173,http://localhost:4173`.

### 3. Port 5173 Already in Use

- **Symptom:** Vite starts on port 5174 instead of 5173.
- **Cause:** Another development process is holding port 5173.
- **Solution:** Stop the other process or run `Get-Process node | Stop-Process` in PowerShell before launching `npm run dev`.

---

## Related Documentation

- [Root Project Documentation](../README.md) — Complete full-stack overview, architecture, ERD, and API endpoint specifications.
- [Backend Documentation](../Back-End/expense-tracker/README.md) — Spring Boot configuration, MySQL database migrations, and backend tests.

