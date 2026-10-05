# StockPilot ✈️📦

> **Modern, Syllabus-Aligned Full-Stack Inventory Management System**  
> Built with **Node.js, Express 5, EJS Views, MongoDB / Mongoose, and Express Sessions** on the backend, with **Vanilla JS, ES6, and jQuery Ajax** on the browser.

---

## 📋 Table of Contents
1. [Overview & Tech Stack](#-overview--tech-stack)
2. [Key System Features](#-key-system-features)
3. [Architecture & Design System](#-architecture--design-system)
4. [Prerequisites & Installation](#-prerequisites--installation)
5. [Database Seeder & Demo Credentials](#-database-seeder--demo-credentials)
6. [Complete URL & API Endpoint Reference](#-complete-url--api-endpoint-reference)
7. [Syllabus Curriculum Mapping](#-syllabus-curriculum-mapping)
8. [5-Minute Viva / Oral Exam Demo Script](#-5-minute-viva--oral-exam-demo-script)
9. [License & Author](#-license)

---

## 🚀 Overview & Tech Stack

StockPilot is an inventory and warehouse management web application designed to demonstrate the full curriculum of modern web development using foundational, industry-standard technologies without heavy frontend frameworks or JWTs.

### Tech Stack
- **Runtime & Language**: Node.js (>= 18), CommonJS (`require` / `module.exports`).
- **Server Framework**: Express.js (v5.x).
- **Database & ODM**: MongoDB with Mongoose (v9.x).
- **Session & Auth**: `express-session`, `connect-mongo` (v6.x) persistent store, `bcrypt` password hashing (12 salt rounds).
- **Templating**: EJS with reusable component partials (`header`, `navbar`, `messages`, `footer`, `_form`).
- **File Uploads & Rich Text**: `express-fileupload` (2 MB limit, mimetype validation) and Quill WYSIWYG CDN (Snow theme) with server-side script tag sanitization.
- **Client-Side Technologies**:
  - **Phase 5**: Pure Vanilla JavaScript & ES6 (arrow functions, default parameters, destructuring, `Set` & `Map`, spread operator `[...rows]`, custom ES6 classes, `URL.createObjectURL`, ARIA validation).
  - **Phase 6**: jQuery (v3.7.1 CDN) and Ajax (`$.getJSON`, `$.ajax`, `.load()`, `.slideDown()`, `.slideUp()`, `.fadeOut()`).
- **CSS Design System**: Hand-crafted, custom Vanilla CSS (`public/css/style.css`) with responsive CSS variables, sleek dark theme, glassmorphism, and smooth micro-interactions (no Tailwind, Bootstrap, or component libraries).

---

## ✨ Key System Features

| Module | Features & Implementation Details |
|---|---|
| **Authentication** | Registration and login with bcrypt hashing; session-based login tracking (`req.session.userId`); flash message middleware; route guards (`requireLogin`, `redirectIfLoggedIn`, `requireApiLogin`). |
| **Inventory CRUD** | Add, browse, edit, and delete items; unique uppercase SKU auto-transformation; dynamic `isLowStock` Mongoose virtual; category filtering. |
| **File Uploads & WYSIWYG** | Product images saved to `public/uploads/` with unique timestamps; automatic image cleanup via `fs.unlink()` on deletion/replacement; rich Quill descriptions with XSS sanitization. |
| **Supplier Directory** | Vendor contact directory (name, email, phone, address); relationship constraint preventing supplier deletion if items remain linked. |
| **Stock Movements** | Inbound (`IN`) and Outbound (`OUT`) transaction logging; atomic quantity adjustments using MongoDB `$inc`; insufficient stock safeguards with automatic rollback. |
| **Real-Time Dashboard** | Aggregated inventory metrics (Total Items, Low Stock count, Total Suppliers, Total Stock Valuation); low-stock alert table; recent transaction log. |
| **Browser ES6 Enhancements** | Accessible client-side validation (`aria-invalid="true"`, `.field-error`); event-delegated delete confirmation; client category filter via `Set` & `Map`; multi-column table sorting using spread operator; ES6 `StockItem` class banner; instant image upload preview (`URL.createObjectURL`). |
| **jQuery & Ajax Layer** | 300ms debounced live item search (`GET /api/items?search=`); auto-refreshing dashboard stats every 30s (`GET /api/stats`); asynchronous recent transactions table partial load (`GET /partials/recent-transactions`); item quick-view slide-down modal (`GET /api/items/:id`); transaction stock calculation preview helper; animated row deletion (`.fadeOut()`). |

---

## 🏗 Architecture & Design System

### Directory Structure
```
stockpilot/
├── controllers/              # MVC Controllers (business logic)
│   ├── apiController.js      # JSON API and partial endpoints for Ajax
│   ├── authController.js     # User registration, login, and logout
│   ├── dashboardController.js# Dashboard statistics and metrics
│   ├── itemController.js     # Inventory items CRUD & image cleanup
│   ├── supplierController.js # Supplier directory management
│   └── transactionController.js # Stock IN/OUT audit logging & $inc
├── middleware/               # Express Middlewares
│   ├── auth.js               # requireLogin, redirectIfLoggedIn, requireApiLogin
│   └── flash.js              # Session-to-locals flash & form persistence
├── models/                   # Mongoose Schemas & Models
│   ├── Item.js               # Items schema with uppercase SKU & isLowStock
│   ├── StockTransaction.js   # Audit log schema (item, type, quantity, user)
│   ├── Supplier.js           # Vendor directory schema
│   └── User.js               # User authentication schema with bcrypt hook
├── public/                   # Static Browser Assets
│   ├── css/
│   │   └── style.css         # Master CSS Design System (variables, responsive)
│   ├── js/
│   │   ├── ajax.js           # Phase 6: jQuery Ajax features (search, quick-view)
│   │   ├── main.js           # Master orchestrator on DOMContentLoaded
│   │   ├── ui.js             # Phase 5: DOM manipulation, ES6 features, sorting
│   │   └── validation.js     # Phase 5: Accessible client-side form validation
│   └── uploads/              # Uploaded product image files (.gitkeep)
├── routes/                   # Express HTTP Routers
│   ├── apiRoutes.js          # /api/* endpoints
│   ├── authRoutes.js         # /auth/* routes
│   ├── itemRoutes.js         # /items/* routes
│   ├── supplierRoutes.js     # /suppliers/* routes
│   └── transactionRoutes.js  # /transactions/* routes
├── views/                    # EJS Views & Templates
│   ├── auth/                 # login.ejs, register.ejs
│   ├── errors/               # 404.ejs, 500.ejs
│   ├── items/                # _form.ejs, index.ejs, new.ejs, edit.ejs, show.ejs
│   ├── partials/             # header.ejs, navbar.ejs, messages.ejs, footer.ejs, recent_transactions_table.ejs
│   ├── suppliers/            # index.ejs, new.ejs, edit.ejs, show.ejs
│   ├── transactions/         # index.ejs, new.ejs
│   └── home.ejs              # Main Dashboard view
├── .env                      # Environment variables (PORT, MONGO_URI, SESSION_SECRET)
├── .env.example              # Sample environment template
├── index.js                  # Application entry point & Express server
├── package.json              # Dependencies, engines, and run scripts
├── Procfile                  # Production deployment process declaration
├── PROJECT_CONTEXT.md        # Comprehensive technical progress ledger
├── README.md                 # Project documentation & viva guide
└── seed.js                   # Database seeder script
```

---

## ⚙️ Prerequisites & Installation

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher.
- **MongoDB**: A running local MongoDB instance or a remote MongoDB Atlas connection string.

### 2. Installation Steps
```bash
# 1. Clone the repository
git clone https://github.com/your-username/stockpilot.git
cd stockpilot

# 2. Install all dependencies
npm install

# 3. Configure environment variables
# Create a .env file in the root directory (refer to .env.example):
PORT=3000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.mongodb.net/stockpilot?retryWrites=true&w=majority&authSource=admin
SESSION_SECRET=stockpilot_production_session_secret_key_2026

# 4. Seed the database with demo inventory and user accounts
npm run seed

# 5. Start the development server (with nodemon auto-restart)
npm run dev

# Or start for production
npm start
```

Open your browser and navigate to: **`http://localhost:3000`**

---

## 🔑 Role-Based Access Control & Demo Credentials

StockPilot implements two distinct access tiers:
1. **👑 Administrator (`admin`)**: Full authority to create, edit, and delete catalog items and suppliers, and **apply for/receive incoming inventory (`Stock IN`)**.
2. **👤 Standard User (`user`)**: Can view inventory and suppliers, utilize live search and quick view, and **update inventory levels by dispatching stock (`Stock OUT`)**.

| Role | Email | Password | Allowed Capabilities |
|---|---|---|---|
| **Administrator** | `admin@stockpilot.io` | `password123` | Add/Edit/Delete Items & Suppliers, Apply for / Receive Stock (`Stock IN`), Dispatch Stock (`Stock OUT`). |
| **Standard User** | `user@stockpilot.io` | `password123` | View Items & Suppliers, Live Search, Item Quick View, Record Stock Movements (`Stock OUT` to update levels). |

---

## 🗺 Complete URL & API Endpoint Reference

| HTTP Verb | Path | Controller Handler | Authentication Guard | Description / Response |
|---|---|---|---|---|
| **GET** | `/` | `dashboardController.index` | `requireLogin` | Dashboard with stats, alerts, and recent movements |
| **GET** | `/auth/register` | `authController.showRegister` | `redirectIfLoggedIn` | User registration view (creates standard user) |
| **POST** | `/auth/register` | `authController.register` | `redirectIfLoggedIn` | Handle account creation with bcrypt hashing |
| **GET** | `/auth/login` | `authController.showLogin` | `redirectIfLoggedIn` | User login view |
| **POST** | `/auth/login` | `authController.login` | `redirectIfLoggedIn` | Handle session creation |
| **GET** | `/auth/logout` | `authController.logout` | `requireLogin` | Destroy session and redirect to login |
| **GET** | `/items` | `itemController.index` | `requireLogin` | Inventory catalog table with live search & filters |
| **GET** | `/items/new` | `itemController.showCreate` | `requireAdmin` (Admin only) | Item creation form (with image upload & Quill) |
| **POST** | `/items` | `itemController.store` | `requireAdmin` (Admin only) | Save new item to database |
| **GET** | `/items/:id` | `itemController.show` | `requireLogin` | Item detail view with audit transactions |
| **GET** | `/items/:id/edit` | `itemController.edit` | `requireAdmin` (Admin only) | Form to edit item specifications |
| **POST** | `/items/:id/update`| `itemController.update` | `requireAdmin` (Admin only) | Update item & replace image file |
| **POST** | `/items/:id/delete`| `itemController.destroy` | `requireAdmin` (Admin only) | Delete item (HTML redirect or JSON if Ajax) |
| **GET** | `/suppliers` | `supplierController.index` | `requireLogin` | List all registered vendor suppliers |
| **GET** | `/suppliers/new` | `supplierController.showCreate`| `requireAdmin` (Admin only) | Form to register new supplier |
| **POST** | `/suppliers` | `supplierController.store` | `requireAdmin` (Admin only) | Save new supplier |
| **GET** | `/suppliers/:id` | `supplierController.show` | `requireLogin` | Supplier details & linked product catalog |
| **GET** | `/suppliers/:id/edit`| `supplierController.edit` | `requireAdmin` (Admin only) | Form to edit supplier details |
| **POST** | `/suppliers/:id/update`| `supplierController.update`| `requireAdmin` (Admin only) | Update supplier details |
| **POST** | `/suppliers/:id/delete`| `supplierController.destroy`| `requireAdmin` (Admin only) | Delete supplier (blocked if items linked) |
| **GET** | `/transactions` | `transactionController.index`| `requireLogin` | Full chronological audit trail of stock movements |
| **GET** | `/transactions/new` | `transactionController.showCreate`| `requireLogin` | Form to record Stock IN (Admin) or Stock OUT (User & Admin) |
| **POST** | `/transactions` | `transactionController.store`| `requireLogin` | Atomic stock update (`IN`: Admin only; `OUT`: All users) |
| **GET** | `/api/items` | `apiController.searchItems` | `requireApiLogin` | JSON search (`?search=query`) by name/SKU/cat |
| **GET** | `/api/items/:id` | `apiController.getItem` | `requireApiLogin` | JSON single item details for quick-view panel |
| **GET** | `/api/stats` | `apiController.getStats` | `requireApiLogin` | JSON dashboard valuation & count statistics |
| **GET** | `/partials/recent-transactions` | `apiController.recentTransactions` | `requireApiLogin` | HTML partial of recent movements for `.load()` |

---

## 📚 Syllabus Curriculum Mapping

This project was built to align directly with core web development syllabus objectives:

### 1. Node.js & Express.js
- CommonJS modules (`require` / `module.exports`).
- Application structure using MVC architecture.
- Custom middleware pipelines: authentication guards, flash message persistence, error handling (404 and 500).
- Pure HTTP GET/POST handling with clean URL semantics (no `method-override`).

### 2. MongoDB & Mongoose
- Relational cross-referencing (`ref`, `.populate()`).
- Atomic operators: `$inc` for inventory quantity updates.
- Schema hooks: `pre('save')` for bcrypt password encryption.
- Schema virtuals: `isLowStock` computed dynamically from `quantity` and `reorderLevel`.

### 3. Sessions & Security
- `express-session` with `connect-mongo` for persistent, restart-safe sessions.
- Flash messages and form state persistence in `res.locals` without third-party flash packages.
- Password hashing with bcrypt (12 salt rounds).
- XSS prevention: server-side script tag sanitization for rich text descriptions.

### 4. Browser JavaScript & ES6
- Arrow functions with default parameter values.
- Object destructuring from form entries (`Object.fromEntries(new FormData(form))`).
- Data structures: ES6 `Set` for category deduplication and `Map` for frequency counters.
- Spread syntax: `[...tbody.rows]` for multi-column table sorting.
- ES6 Classes: `StockItem` class with custom getters and methods.
- Browser APIs: `URL.createObjectURL` for instant image preview with memory cleanup via `URL.revokeObjectURL`.
- Event bubbling & delegation: Single document submit handler for delete confirmations.

### 5. jQuery & Ajax
- Asynchronous API communication using `$.getJSON` and `$.ajax`.
- Debouncing input events (300ms) for high-performance live search.
- DOM manipulation and animations: `.slideDown()`, `.slideUp()`, `.fadeOut()`.
- Server-rendered HTML partial loading using `.load()`.

---

## 🎤 5-Minute Viva / Oral Exam Demo Script

Use this structured guide when presenting StockPilot in a viva or technical interview:

### Minute 1: Architecture & Technology Stack
> "Good morning/afternoon. Today I am presenting **StockPilot**, a full-stack inventory management web application.
> 
> The application is built using the standard syllabus stack: **Node.js, Express, EJS templating, and MongoDB via Mongoose**, layered with **Vanilla JavaScript, modern ES6, and jQuery Ajax** on the browser.
> 
> Rather than relying on frontend frameworks like React or token protocols like JWT, StockPilot strictly follows a classic, robust **server-rendered MVC architecture** with persistent **session-based authentication** using `express-session` backed by MongoDB via `connect-mongo`."

### Minute 2: Authentication & Custom Middleware
> "Let's examine user authentication and request flow.
> 
> In `models/User.js`, passwords are never stored in plaintext; a Mongoose `pre('save')` hook hashes them with `bcrypt` using 12 salt rounds.
> 
> For session feedback and form re-population, I developed a custom middleware in `middleware/flash.js`. It intercepts session errors, success messages, and old input, passes them directly into Express's `res.locals`, and clears them from the session. This ensures that if validation fails, the user never loses their typed form data.
> 
> Route security is enforced with two guards: `requireLogin` for protected views, and `requireApiLogin`, which returns a clean **HTTP 401 JSON** response rather than an HTML redirect when Ajax requests are unauthorized."

### Minute 3: Mongoose Schemas, Virtuals, and Transactions
> "Looking at the data layer, we have four interconnected models: `User`, `Item`, `Supplier`, and `StockTransaction`.
> 
> In `Item.js`, the SKU is automatically converted to uppercase and trimmed before saving. We also define an `isLowStock` virtual property that compares `quantity <= reorderLevel` without duplicating data in the database.
> 
> When recording inventory movements in `transactionController.js`, we ensure data integrity by using MongoDB's atomic `$inc` operator. If an operator attempts a Stock OUT exceeding available inventory, the server rejects the transaction before writing to disk, preventing negative inventory."

### Minute 4: Browser JavaScript & Modern ES6 Features
> "On the client side, Phase 5 introduces pure ES6 without external libraries:
> 
> 1. **Client-side Form Validation** (`validation.js`): Uses ES6 arrow functions with default parameters, destructures fields from `FormData`, and sets `aria-invalid="true"` while inserting friendly error tooltips.
> 2. **Category Filtering** (`ui.js`): Demonstrates ES6 `Set` to deduplicate categories and `Map` to count product distribution.
> 3. **Table Sorting** (`ui.js`): Converts table rows into a native array using the spread operator `[...tbody.rows]` and performs numeric and string sorting.
> 4. **ES6 Classes** (`ui.js`): A `StockItem` class powers the dynamic dashboard banner using `Array.find` and `Array.findIndex`.
> 5. **Image Preview**: Uses `URL.createObjectURL` to render instant file previews with automatic memory revocation."

### Minute 5: jQuery and Ajax Features
> "Finally, Phase 6 incorporates jQuery and Ajax:
> 
> 1. **Debounced Live Search**: When typing in the catalog search bar, a 300ms debounce timer triggers `$.getJSON('/api/items?search=...')` to rebuild the table dynamically without page reload.
> 2. **Item Quick View**: Clicking 'Quick' on any product triggers an Ajax call to `/api/items/:id` and animates a detail panel into view using `.slideDown()`.
> 3. **Real-Time Dashboard Updates**: Every 30 seconds or on button click, the dashboard fetches `/api/stats` to update count and stock valuation cards with fade animations, while asynchronously refreshing the transaction log via `$('#recent-transactions-container').load('/partials/recent-transactions')`.
> 4. **Live Stock Helper**: In `/transactions/new`, as the user selects items or adjusts quantities, Ajax calculates the projected balance in real-time and warns if dispatch exceeds current stock.
> 
> Thank you, and I welcome any questions regarding the code or implementation."

---

## 📄 License
This project is open-source and developed for academic demonstration under the ISC License.
