# Deployment Guide

This matches the workflow you're already using: **one GitHub repo**, with Vercel connected to
it for the frontend, and a separate provider connected to it for the backend. You do **not**
need two repos — every major host (Vercel, Render, Railway) lets you point at a **subfolder**
of one repo, so `frontend/` and `backend/` living side-by-side in a single repo works perfectly.

---

## 1. Upload this folder to GitHub (one repo, both folders)

1. Extract the zip. You'll get a `library-management/` folder containing `backend/`, `frontend/`,
   `docker-compose.yml`, etc.
2. Create a **new, empty** repo on GitHub (don't add a README/gitignore there — you already have one).
3. From inside the extracted folder:
   ```bash
   cd library-management
   git init
   git add .
   git commit -m "Initial commit: library management system"
   git branch -M main
   git remote add origin https://github.com/<your-username>/<repo-name>.git
   git push -u origin main
   ```
4. Confirm on GitHub that the repo root shows both `backend/` and `frontend/` folders side by side.

That's the whole "same repo, different root directory per platform" setup — Vercel will read
from `frontend/`, your backend host will read from `backend/`, both watching the same repo.

---

## 2. Connect Vercel (frontend) — root directory = `frontend`

1. Vercel → **Add New Project** → import this GitHub repo.
2. When it asks for the **Root Directory**, click Edit and select **`frontend`**. Framework
   preset auto-detects as Vite.
3. Add one environment variable (Project Settings → Environment Variables):
   | Key | Value |
   |---|---|
   | `VITE_API_BASE_URL` | your backend URL + `/api` (you'll get this in step 3 — you can add it now with a placeholder and update it after) |
4. Deploy. You'll get something like `https://your-app.vercel.app`.

---

## 3. Connect your backend provider — root directory = `backend`

Same idea on Render / Railway / whichever backend-centric host you pick:

1. **New Web Service** → import the **same** GitHub repo.
2. Set **Root Directory** to **`backend`**. The platform will detect `backend/Dockerfile`
   (already included) and build from it automatically — no build command needed.
3. Set these environment variables (this is where the database gets connected — see step 4
   for exactly what values go here):
   | Key | Value |
   |---|---|
   | `SPRING_DATASOURCE_URL` | from your DB provider — see step 4 |
   | `SPRING_DATASOURCE_USERNAME` | from your DB provider |
   | `SPRING_DATASOURCE_PASSWORD` | from your DB provider |
   | `APP_JWT_SECRET` | any long random string, e.g. output of `openssl rand -hex 64` |
   | `APP_CORS_ALLOWED_ORIGINS` | your Vercel URL from step 2, e.g. `https://your-app.vercel.app` |
   | `APP_ADMIN_USERNAME` | `abhishek80` *(already the default — only needed if you want to change it)* |
   | `APP_ADMIN_PASSWORD` | `Abhishek@123` *(already the default — only needed if you want to change it)* |
4. Deploy. You'll get a backend URL like `https://your-backend.onrender.com`.
5. Go back to Vercel and update `VITE_API_BASE_URL` to `https://your-backend.onrender.com/api`,
   then redeploy the frontend so it actually points at the real backend.

---

## 4. Connect the database — no manual schema/SQL needed at all

**This is the important part you asked about.** The backend already has
`spring.jpa.hibernate.ddl-auto=update` turned on (see `application.properties`), which means:

> **Spring Boot creates every table it needs by itself, the first time it starts up.**
> You never write or run a single `CREATE TABLE` statement. You only give it a database to
> connect to — an empty one is exactly what it wants.

So the *only* thing you need from a database provider is **one empty database and 4 values**:
host, port, database name, username, password. Here's how to get those from the most common
free providers, and exactly what to paste into `SPRING_DATASOURCE_URL`:

### Using Aiven for MySQL (free tier)
1. aiven.io → **Create service** → **MySQL** → free plan → wait for it to go green/running.
2. Open the service overview page. Copy the **Host**, **Port**, **User**, **Password**, and
   **Database name** (usually `defaultdb`) shown there directly.
3. Build the JDBC URL yourself using those pieces:
   ```
   jdbc:mysql://<HOST>:<PORT>/<DATABASE_NAME>?useSSL=true&requireSSL=true&serverTimezone=UTC
   ```
4. Paste that whole string as `SPRING_DATASOURCE_URL`. Paste **User** as
   `SPRING_DATASOURCE_USERNAME` and **Password** as `SPRING_DATASOURCE_PASSWORD`.
5. Deploy the backend. On first boot it connects to that empty database and creates every
   table (`users`, `books`, `borrow_records`, etc.) automatically. Nothing else to do.

### Using Railway's MySQL template
1. Railway → **New Project → Database → Add MySQL**.
2. Click the MySQL service → **Variables** tab → it already shows `MYSQLHOST`, `MYSQLPORT`,
   `MYSQLDATABASE`, `MYSQLUSER`, `MYSQLPASSWORD`.
3. Same idea: `SPRING_DATASOURCE_URL = jdbc:mysql://<MYSQLHOST>:<MYSQLPORT>/<MYSQLDATABASE>?useSSL=false&serverTimezone=UTC`,
   username = `MYSQLUSER`, password = `MYSQLPASSWORD`.

### Using Clever Cloud (free MySQL add-on)
1. Create a MySQL add-on on Clever Cloud → open it → **Overview** tab shows Host, Port,
   Database, User, Password directly (no assembly needed for the non-JDBC parts).
2. Same pattern: build the JDBC URL as above with those values.

Whichever provider you use, the pattern is always identical: **get 5 raw values (host, port,
database, user, password) → assemble one JDBC URL → paste it and the credentials into the
backend's environment variables → deploy.** Spring Boot does the rest.

---

## 5. Verify it all works

1. Open your Vercel frontend URL.
2. Log in with `abhishek80` / `Abhishek@123` (the seeded admin — see `DataSeeder.java`).
3. Try adding a book — if it appears in the catalog, the backend, database, and frontend are
   all correctly wired together.
4. If login fails or you see CORS errors in the browser console, double check
   `APP_CORS_ALLOWED_ORIGINS` on the backend exactly matches your Vercel URL (including `https://`,
   no trailing slash).

---

## Alternative: everything on one small machine

If you'd rather not juggle three dashboards at all, `docker-compose.yml` at the repo root runs
MySQL + backend + frontend together on a single VPS or a free Oracle Cloud "Always Free"
instance — no manual DB/CORS setup required there either. See the commented instructions inside
`docker-compose.yml` and `.env.example` for that path; it's a fine alternative to steps 2-4 above
if you end up preferring one server over three separate providers.
