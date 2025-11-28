# System Architecture

## Overview

This project is a small full‑stack web application for an agriculture‑focused platform. It consists of:

- **Backend**: Node.js + Express server, optional MongoDB, currently using an **in‑memory user store** for auth.
- **Frontend**: Static HTML/CSS/JS app in the `mini` folder, served directly by the backend.
- **Authentication**: Email/password login with JWT stored in an HTTP‑only cookie.

---

## High‑Level Component Diagram (Conceptual)

- **Client (Browser)**
  - Pages: `index.html`, `signup.html`, `home.html`, `community*.html`, etc.
  - Scripts: `mini/app.js`, `mini/home.js`, `mini/script.js`, `mini/auth.js`.
  - Uses `fetch` to call backend REST APIs.

- **API Server (Express)**
  - Entry: `backend/index.js`.
  - Routers: `backend/routes/auth.js`, `backend/routes/user.js`.
  - Middleware: `backend/middleware/auth.js`.
  - Data Layer: `backend/models/UserStore.js` (in‑memory), `backend/models/User.js` (MongoDB schema, optional).

- **Data Storage**
  - **Primary in current setup**: `UserStore` (in‑memory, resets when server restarts).
  - **Optional**: MongoDB via `MONGODB_URI` and `User` Mongoose model.

---

## Backend Architecture

### Entry Point: `backend/index.js`

Responsibilities:

- Create and configure the Express app.
- Apply security and utility middleware:
  - `helmet()` – security headers.
  - `cors()` – CORS, with allowed origin from `CLIENT_ORIGIN` or `http://localhost:3000`.
  - `express.json()` – JSON body parsing.
  - `cookie-parser` – parse cookies.
  - `express-rate-limit` – rate limiting for `/api/auth` routes.
- Health check route: `GET /api/health`.
- Mount routers:
  - `/api/auth` → `routes/auth.js`.
  - `/api/user` → `routes/user.js`.
- Serve frontend:
  - `express.static(path.join(__dirname, '..', 'mini'))` serves all static assets from `mini`.
  - Fallback `GET /^\/(?!api).*/` sends `mini/index.html` for non‑API paths (simple SPA‑style routing fallback).
- Global error handling and 404.
- Database handling:
  - If `MONGODB_URI` is set: connect via Mongoose, then start the server.
  - If not set: log that in‑memory store is used and start server without Mongo.

Environment variables used (via `.env`):

- `PORT` – server port (default 5000).
- `HOST` – host (default `0.0.0.0`).
- `CLIENT_ORIGIN` – allowed CORS origin.
- `MONGODB_URI` – MongoDB connection string (optional).
- `JWT_SECRET` – secret key for signing JWTs.
- `NODE_ENV` – affects cookie security flags.

### Auth Routes: `backend/routes/auth.js`

Base path: `/api/auth` (mounted in `index.js`).

Endpoints:

- **POST `/api/auth/register`**
  - Validates presence of `name`, `email`, `password`.
  - Uses `UserStore.findOne({ email })` to check for existing user.
  - Hashes password with `bcrypt.hash`.
  - Creates user via `UserStore.create(...)`.
  - Returns: `{ id, name, email }` with status `201`.

- **POST `/api/auth/login`**
  - Validates presence of `email`, `password`.
  - Looks up user with `UserStore.findOne({ email })`.
  - Compares password with `bcrypt.compare`.
  - If valid, signs JWT with `jwt.sign({ sub: user._id }, JWT_SECRET, { expiresIn: '7d' })`.
  - Sets **HTTP‑only cookie** `token` with security flags depending on `NODE_ENV`.
  - Response: `{ id, name, email }` with status `200`.

- **POST `/api/auth/logout`**
  - Clears `token` cookie using same security options.
  - Returns `{ ok: true }`.

### User Routes: `backend/routes/user.js`

Base path: `/api/user`.

- **GET `/api/user/me`**
  - Protected by `auth` middleware.
  - Reads `req.userId` set by middleware.
  - Loads user via `UserStore.findById(req.userId)`.
  - Returns `{ _id, name, email }` or `404` if missing.

### Auth Middleware: `backend/middleware/auth.js`

- Extracts token from:
  - Cookie: `req.cookies.token`, or
  - Header: `Authorization: Bearer <token>`.
- If no token → responds `401 { error: 'Unauthorized' }`.
- Verifies token using `jwt.verify(token, JWT_SECRET)`.
- On success, sets `req.userId = payload.sub` and calls `next()`.
- On failure, responds with `401`.

### Data Layer

#### `backend/models/UserStore.js` (In‑Memory Store)

- Holds users in:
  - `usersById: Map<id, user>`.
  - `emailIndex: Map<emailLowercased, id>`.
- **Methods** (async but in‑memory):
  - `findOne({ email })` – returns user by email or `null`.
  - `create(user)` – generates UUID, normalizes email, stores user, returns user doc.
  - `findById(id)` – returns user by id or `null`.
- **Note**: Data disappears when server restarts – this is suitable for demos/dev but not production.

#### `backend/models/User.js` (Mongoose Model)

- Mongoose schema with fields:
  - `name`: required string.
  - `email`: required, unique, lowercased string.
  - `password`: required hashed string.
- Used only when MongoDB is enabled (currently the routes are wired to `UserStore`, not `User`).

---

## Frontend Architecture (`mini` folder)

The frontend is a multi‑page static site served from `mini`. Main responsibilities:

- Handle user sign‑up, login, logout.
- Guard protected pages (e.g., `home.html`) so only logged‑in users can access them.
- Provide domain pages like soil info, fertilizer guide, community, weather, etc.

### Key Pages

- `index.html` – login page.
- `signup.html` – registration page.
- `home.html` – main logged‑in dashboard.
- `community.html`, `community-page.html` – community‑related UI.
- `fertilizer-guide.html`, `soil-analysis.html`, `Info_soil.html`, `weather.html` – informational/tools pages.

### Key Scripts

#### `mini/app.js`

- Runs on DOMContentLoaded.
- **Sign‑up (secondary, API‑based flow)**
  - Listens to `#signupBtn` on signup page.
  - Validates:
    - Name (letters and spaces).
    - Email (basic regex).
    - Phone (Indian format, optional).
  - Sends `POST /api/auth/register` with `{ name, email, password }`.
  - On success: shows success alert, redirects to `index.html` (login).

- **Login (API‑based)**
  - Listens to `#loginBtn` on login page.
  - Validates non‑empty email and password.
  - Sends `POST /api/auth/login` with JSON body.
  - Expects `{ id, name, email }` response.
  - Saves the returned object to `localStorage` as `loggedInUser`.
  - Redirects to `home.html`.

- **Logout (API‑based)**
  - Listens to `#logoutBtn`.
  - Calls `POST /api/auth/logout`.
  - On success: removes `loggedInUser` from `localStorage` and redirects to `index.html`.

- Helper `isLoggedIn()` checks presence of `loggedInUser` in `localStorage`.

#### `mini/home.js`

- On DOMContentLoaded:
  - Calls `GET /api/user/me` with credentials.
  - If unauthorized: alerts user and redirects to `index.html`.
  - If success: updates text content of `#welcomeText` and optional `#userNameDisplay` based on returned `user.name`/`user.email`.
- This effectively **guards the home page** so only authenticated users (with a valid JWT cookie) can access it.

#### `mini/script.js` (Legacy LocalStorage Auth)

- Implements a **pure front‑end** sign‑up & login system using `localStorage` only.
- Sign‑up:
  - Validates fields (name, email, phone, address, area, password).
  - Stores users in `localStorage["users"]`.
- Login:
  - Reads from `localStorage["users"]` and compares credentials.
  - Sets `localStorage["isLoggedIn"]` and `localStorage["loggedInUser"]`.

> **Important:** This logic is **separate** from the backend API auth. The newer flow uses `/api/auth/*` endpoints and JWT cookies (via `app.js` and `home.js`). `script.js` represents an older, purely client‑side auth and can cause confusion if both are used simultaneously.

#### `mini/auth.js`

- Provides a small **API client wrapper** (ES module style):
  - `register(name, email, password)` → `POST /api/auth/register`.
  - `login(email, password)` → `POST /api/auth/login`.
  - `logout()` → `POST /api/auth/logout`.
  - `me()` → `GET /api/user/me`.
  - LocalStorage helpers: `getToken`, `setToken`, `removeToken`, `getLoggedInUser`, `setLoggedInUser`, `removeLoggedInUser`.
  - `fetchStats()` hitting `/api/users/stats` (not implemented in backend).

Currently, much of this is **not wired** into the HTML pages; the pages mainly use direct `fetch` calls in `app.js`/`home.js`.

---

## Request Flow Examples

### 1. User Registration (API‑based)

1. User opens `signup.html`.
2. `mini/app.js` attaches submit handler to `#signupBtn`.
3. On submit, frontend validates input.
4. Frontend sends `POST /api/auth/register` with JSON body.
5. Backend `routes/auth.js`:
   - Validates body.
   - Uses `UserStore` to check and create user.
   - Responds `{ id, name, email }`.
6. Frontend alerts success and redirects to login page.

### 2. User Login

1. User opens `index.html` and clicks login.
2. `mini/app.js` sends `POST /api/auth/login`.
3. Backend verifies credentials, creates JWT, sets `token` cookie, responds with user info.
4. Frontend stores user info in `localStorage` and redirects to `home.html`.

### 3. Loading Protected Home Page

1. User opens `home.html`.
2. `mini/home.js` runs and calls `GET /api/user/me` with cookies.
3. Backend `auth` middleware verifies JWT from cookie.
4. If valid: user is fetched from `UserStore` and minimal profile is returned.
5. Frontend updates UI with user name; otherwise redirects to login.

### 4. Logout

1. User clicks logout button (where present).
2. `mini/app.js` sends `POST /api/auth/logout`.
3. Backend clears `token` cookie.
4. Frontend clears `loggedInUser` in `localStorage` and redirects to `index.html`.

---

## Suggested Cleanups / Improvements

These are optional but will make the architecture clearer:

- **Unify auth logic**
  - Prefer the backend‑driven JWT auth (`/api/auth/*` + `home.js`).
  - Remove or stop using `mini/script.js` to avoid duplicate localStorage‑only auth.

- **Use MongoDB in production**
  - Replace `UserStore` with `User` (Mongoose) in routes when `MONGODB_URI` is configured.
  - Add proper password reset, email verification, etc., if needed.

- **Frontend API client**
  - Consistently use `mini/auth.js` as a central API client instead of duplicating `fetch` logic.

- **Stats endpoint**
  - Either implement `/api/users/stats` in the backend or remove the `fetchStats` helper in `auth.js`.

This document should give you a clear mental model of how the backend and `mini` frontend interact, where auth happens, and how data flows through the system.
