# StockPilot ✈️📦

> **Modern, Streamlined Full-Stack Inventory Management System (MVP)**  
> Built with **Node.js, Express 5, EJS Views, MongoDB / Mongoose, and Express Sessions** on the backend, styled with **Custom Vanilla CSS (Glassmorphic Dark Theme)** and visual analytics powered by **Chart.js**.

---

## 📋 Table of Contents
1. [Overview & Tech Stack](#-overview--tech-stack)
2. [Key System Features](#-key-system-features)
3. [Architecture & Project Structure](#-architecture--project-structure)
4. [Prerequisites & Installation](#-prerequisites--installation)
5. [Database Seeder & Demo Credentials](#-database-seeder--demo-credentials)
6. [Complete Route Reference](#-complete-route-reference)
7. [Viva & Project Presentation Guide](#-viva--project-presentation-guide)
8. [License](#-license)

---

## 🚀 Overview & Tech Stack

**StockPilot** is a focused, high-finish inventory management system designed for academic demonstrations and robust college web development projects. It implements an idiomatic **Model-View-Controller (MVC)** pattern with clean role-based authentication, real-time stock adjustments, and analytical reporting.

### Tech Stack
- **Backend Runtime**: Node.js (>= 18), Express 5.x
- **Database & ODM**: MongoDB with Mongoose 9.x
- **Session & Security**: `express-session`, `connect-mongo` persistent session store, `bcrypt` password encryption
- **View Engine**: EJS with modular layout partials (`header`, `sidebar`, `messages`, `footer`)
- **Visual Analytics**: Chart.js (v4.4 via CDN)
- **Styling**: Handcrafted modern Vanilla CSS design system with responsive dark mode, glassmorphic card elevations, custom CSS variables, and fluid transitions
- **Client Logic**: Lightweight Vanilla JavaScript (`public/js/app.js`) for interactive stock impact calculation, drawer menus, alert dismissals, and real-time ledger filtering

---

## ✨ Key System Features

| Module | Features & Implementation Details |
|---|---|
| 🔐 **Authentication & Roles** | Register and Login with bcrypt password encryption; session-based authorization guards (`requireLogin`, `requireAdmin`); role distinction between **Admin** (full catalog mutations) and **Staff User** (viewing & logging stock). |
| 📊 **Analytics Dashboard** | 5 live KPI metric cards (Total Products, Total Stock Units, Low Stock Alerts, Out of Stock, Inventory Value); interactive Bar Chart (stock volume by category) and Doughnut Chart (category distribution); Low Stock attention list with quick restock action; Recent activity ledger. |
| 📦 **Products Catalog** | Comprehensive catalog with SKU, product title, category relationship, unit price, stock count, and minimum alert thresholds; auto-calculated `stockStatus` virtual (`in-stock`, `low-stock`, `out-of-stock`); live text search and category dropdown filters. |
| 🏷️ **Category Management** | Full CRUD for product departments and classifications; real-time aggregated product count badges; relational integrity check preventing deletion of categories with assigned items. |
| ⚡ **Stock In / Stock Out** | Two-step warehouse operations for stock replenishment (`IN`) and shipment fulfillment (`OUT`); atomic inventory updates using MongoDB `$inc`; insufficient stock safeguards preventing negative stock; automated transaction log creation with rollback fail-safes. |
| 📜 **Audit History Log** | Immutable chronological transaction ledger recording every movement, quantity delta, operator user, timestamp, and optional reference note; instant real-time client-side search filter. |

---

## 🏗 Architecture & Project Structure

```
stockpilot/
├── controllers/                  # Business logic (MVC Controllers)
│   ├── authController.js         # Register, Login, Logout
│   ├── dashboardController.js    # Aggregations, metrics, and chart datasets
│   ├── productController.js      # Product listing, search, view, create, edit, delete
│   ├── categoryController.js     # Category CRUD and relational constraints
│   └── stockController.js        # Stock In / Out processing and history
│
├── models/                       # Mongoose data schemas
│   ├── User.js                   # Name, email, hashed password, role (admin/user)
│   ├── Product.js                # Name, SKU, category ref, price, quantity, minStock, stockStatus
│   ├── Category.js               # Name, description
│   └── StockTransaction.js       # Product ref, type (IN/OUT), quantity, user ref, note
│
├── routes/                       # Express router endpoints
│   ├── authRoutes.js             # /auth/*
│   ├── productRoutes.js          # /products/*
│   ├── categoryRoutes.js         # /categories/*
│   └── stockRoutes.js            # /stock/*
│
├── middleware/                   # Express custom middleware
│   ├── auth.js                   # requireLogin, requireAdmin, redirectIfLoggedIn
│   └── flash.js                  # One-time session flash alerts (errors, success)
│
├── views/                        # EJS dynamic templates
│   ├── partials/                 # Reusable components
│   │   ├── header.ejs            # Head meta, typography, Chart.js CDN, CSS links
│   │   ├── sidebar.ejs           # Responsive navigation drawer with active pills
│   │   ├── messages.ejs          # Toast and alert banners with dismissal
│   │   └── footer.ejs            # Global footer and status indicators
│   ├── auth/                     # login.ejs, register.ejs
│   ├── products/                 # index.ejs, new.ejs, show.ejs, edit.ejs
│   ├── categories/               # index.ejs, new.ejs, edit.ejs
│   ├── stock/                    # manage.ejs, history.ejs
│   ├── errors/                   # 404.ejs, 500.ejs
│   └── dashboard.ejs             # Primary analytics and operational home
│
├── public/                       # Static web assets
│   ├── css/
│   │   └── style.css             # Unified dark mode design system
│   └── js/
│       └── app.js                # Charts, live calculation helper, drawer toggles
│
├── index.js                      # Application server entry point
├── seed.js                       # Comprehensive database seeder
├── package.json                  # Dependencies and scripts
└── .env                          # Configuration (port, MongoDB URI, session secret)
```

---

## 📦 Prerequisites & Installation

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or higher recommended)
- [MongoDB](https://www.mongodb.com/) (local instance or MongoDB Atlas connection string)

### 1. Clone & Install Dependencies
```bash
git clone <repository-url>
cd stockpilot
npm install
```

### 2. Configure Environment Variables
Create a `.env` file in the root directory (or use `.env.example` as a template):
```env
PORT=3000
MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/stockpilot?retryWrites=true&w=majority
SESSION_SECRET=your_super_secret_session_key_here
```

### 3. Seed Database with Realistic Demo Data
```bash
npm run seed
```

### 4. Run the Application
```bash
# Production start
npm start

# Development mode with auto-reload (nodemon)
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🔑 Database Seeder & Demo Credentials

The database seeder (`npm run seed`) populates 5 categories, 12 products across all stock states (in-stock, low-stock, and out-of-stock), 6 transaction logs, and two default accounts:

| Role | Email | Password | Permissions |
|---|---|---|---|
| 👑 **Administrator** | `admin@stockpilot.io` | `password123` | Full CRUD access to Products, Categories, Stock In/Out, and History |
| 👤 **Staff User** | `user@stockpilot.io` | `password123` | View Catalog & Dashboard, Log Stock In/Out, View History |

---

## 🌐 Complete Route Reference

### Authentication
- `GET /auth/login` — Display login screen
- `POST /auth/login` — Authenticate credentials and establish session
- `GET /auth/register` — Display registration form
- `POST /auth/register` — Create new user account with hashed password
- `GET /auth/logout` — Terminate session and redirect to login

### Dashboard
- `GET /` — Aggregated KPI metrics, charts, low stock alerts, and recent transactions (Protected)

### Products Catalog
- `GET /products` — Browse products with search query & category filters
- `GET /products/new` — Product creation form (Admin only)
- `POST /products` — Persist new product to MongoDB (Admin only)
- `GET /products/:id` — Detailed product view with inventory metrics and item-specific transactions
- `GET /products/:id/edit` — Edit product form (Admin only)
- `POST /products/:id/update` — Save product updates (Admin only)
- `POST /products/:id/delete` — Remove product and cascade-delete its transaction history (Admin only)

### Categories
- `GET /categories` — Browse categories with inline product count metrics
- `GET /categories/new` — Category creation form (Admin only)
- `POST /categories` — Save category (Admin only)
- `GET /categories/:id/edit` — Edit category form (Admin only)
- `POST /categories/:id/update` — Update category details (Admin only)
- `POST /categories/:id/delete` — Delete category (prevented if products are assigned) (Admin only)

### Stock Operations & History
- `GET /stock/manage` — Stock In / Out form with live impact math calculation
- `POST /stock/manage` — Process stock adjustment with atomic `$inc` and audit record
- `GET /stock/history` — Full transaction audit ledger with real-time filtering

---

## 🎓 Viva & Project Presentation Guide

If demonstrating this project for an evaluation or oral exam:

1. **Architecture Explanation**:
   - Highlight the **MVC architecture**: clean separation between Models (Mongoose schemas), Views (EJS templates), and Controllers (Express handlers).
   - Point out that authentication uses **HTTP-only session cookies** via `express-session` with MongoDB session persistence via `connect-mongo`.
2. **Concurrency & Safe Stock Updates**:
   - Explain that quantity changes use MongoDB's atomic operator **`$inc`** rather than read-modify-write patterns, preventing race conditions.
   - Mention the two-phase validation: if an outbound transaction exceeds available stock, it is rejected before database mutation. If logging fails, the increment is automatically reversed.
3. **Data Integrity & Relationships**:
   - Show that Category deletion is protected: if products are linked to a category, the system informs the user and halts deletion.
   - Show how the Mongoose virtual property `stockStatus` dynamically computes stock health without redundant database columns.
4. **Interactive Dashboard**:
   - Demonstrate the Chart.js visual analytics: how data is aggregated using MongoDB aggregation pipelines (`$group`, `$lookup`, `$unwind`) and passed directly into client-rendered charts.

---

## 📄 License
ISC License &bull; StockPilot Open Source educational project.
