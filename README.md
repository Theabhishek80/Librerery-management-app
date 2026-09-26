# 📚 Library Management System — Full Stack

A complete, ready-to-run Library Management System.

- **Backend:** Java 17, Spring Boot 3, Spring Security 6 (JWT auth), Spring Data JPA, MySQL
- **Frontend:** React 18 (Vite), React Router, Axios
- **Auth:** JWT-based login/register with role-based access control (`USER`, `ADMIN`)
- **Core feature:** Any logged-in user can add a book, and it instantly becomes part of one
  **global shared catalog** — every user sees every book added by everyone (like one shared folder),
  and can borrow/return copies.

---

## 1. Features

**Authentication & Authorization**
- Register / Login with JWT
- Passwords hashed with BCrypt
- Roles: `ROLE_USER`, `ROLE_ADMIN`
- Protected routes on both backend (Spring Security) and frontend (React Router guards)
- A default admin account is auto-created on first backend startup

**Book Management (Global Catalog)**
- Any authenticated user can add a book (title, author, ISBN, category, description, cover image, copies)
- Every book is visible to **all** users immediately (public `GET /api/books`, even to guests)
- Search by title / author / category, with pagination and sorting
- Edit/Delete: allowed for the user who added the book, or any admin

**Borrowing System**
- Borrow a book (decrements available copies; blocked if none left, or if you already have it borrowed)
- Return a book (increments available copies)
- "My Borrowed Books" page with status: BORROWED / RETURNED, due dates
- Admin can view **all** borrow records across all users

**Admin Panel**
- View all registered users
- Enable / disable user accounts
- View every borrow record system-wide

---

## 2. Project Structure

```
library-management/
├── backend/                 # Spring Boot app
│   ├── pom.xml
│   └── src/main/java/com/library/
│       ├── config/          # Security config, admin data seeder
│       ├── security/        # JWT filter, JWT util, UserDetails
│       ├── entity/          # User, Book, BorrowRecord, enums
│       ├── repository/      # Spring Data JPA repositories
│       ├── dto/              # Request/response objects
│       ├── service/          # Business logic
│       ├── controller/       # REST endpoints
│       └── exception/        # Global error handling
└── frontend/                # React (Vite) app
    └── src/
        ├── api/               # Axios instance with JWT interceptor
        ├── context/           # AuthContext (login/register/logout)
        ├── components/        # Navbar, BookCard, PrivateRoute
        └── pages/             # Login, Register, Dashboard, AddBook, MyBorrowedBooks, AdminPanel
```

---

## 3. Prerequisites

- Java 17+ and Maven (or use the included `mvnw` if you add one — any standard Maven install works)
- MySQL 8+ running locally (or remotely)
- Node.js 18+ and npm

---

## 4. Backend Setup

1. **Create the database** (or let Spring auto-create it — see step 2):
   ```sql
   CREATE DATABASE library_db;
   ```

2. **Configure database credentials** in
   `backend/src/main/resources/application.properties`:
   ```properties
   spring.datasource.url=jdbc:mysql://localhost:3306/library_db?createDatabaseIfNotExist=true&useSSL=false&serverTimezone=UTC
   spring.datasource.username=root
   spring.datasource.password=your_mysql_password
   ```
   Also change `app.jwt.secret` to a long random string before deploying anywhere real.

3. **Run the backend:**
   ```bash
   cd backend
   mvn spring-boot:run
   ```
   The API starts on **http://localhost:8080**. Tables are auto-created (`ddl-auto=update`),
   and a default admin user is seeded:
   - username: `abhishek80`
   - password: `Abhishek@123`
   (change these via `app.admin.*` properties before first run, or via the DB afterward)

---

## 5. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The app runs on **http://localhost:5173** and proxies `/api/**` requests to the backend at
`http://localhost:8080` (see `vite.config.js`). No extra configuration needed for local dev.

For a production build:
```bash
npm run build
```
This outputs static files to `frontend/dist`, which you can serve via any static host or
have Spring Boot serve directly (copy `dist/*` into `backend/src/main/resources/static`).

---

## 6. API Overview

| Method | Endpoint                       | Access          | Description                          |
|--------|---------------------------------|-----------------|--------------------------------------|
| POST   | `/api/auth/register`            | Public          | Register a new user                  |
| POST   | `/api/auth/login`                | Public          | Login, returns JWT                   |
| GET    | `/api/books`                     | Public          | List all books (search/paginate)     |
| GET    | `/api/books/{id}`                 | Public          | Get one book                         |
| POST   | `/api/books`                     | Authenticated   | Add a book (goes into global catalog)|
| PUT    | `/api/books/{id}`                  | Owner or Admin  | Update a book                        |
| DELETE | `/api/books/{id}`                  | Owner or Admin  | Delete a book                        |
| POST   | `/api/borrow/{bookId}`             | Authenticated   | Borrow a copy of a book               |
| PUT    | `/api/borrow/return/{recordId}`     | Owner or Admin  | Return a borrowed book                |
| GET    | `/api/borrow/my`                  | Authenticated   | Your own borrow history               |
| GET    | `/api/borrow/all`                  | Admin           | Every borrow record, system-wide      |
| GET    | `/api/users`                      | Admin           | List all users                        |
| PATCH  | `/api/users/{id}/enabled`           | Admin           | Enable/disable a user account          |

All authenticated requests require header: `Authorization: Bearer <jwt-token>`.

---

## 7. Notes & Possible Extensions

- Loan period is fixed at 14 days (`BorrowService.LOAN_PERIOD_DAYS`) — easy to make configurable.
- No email/OTP verification is included; add one if you need stronger identity checks.
- No refresh-token rotation — the JWT simply expires after `app.jwt.expiration-ms` (default 24h).
- To restrict who can add books to admins only, change `SecurityConfig` to require `ROLE_ADMIN`
  on `POST /api/books` — currently any registered user can contribute a book, by design.
