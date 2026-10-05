# PROJECT_CONTEXT.md — StockPilot Shared Contract

> **Every phase must read this file first and follow its rules exactly.**

---

## Overview

StockPilot is a basic inventory management web app built as a college project. It is a **server-rendered Express app** using EJS views, MongoDB via Mongoose, and Express sessions for authentication. The browser side uses vanilla JavaScript, jQuery and Ajax.

---

## Allowed Tech (STRICT — use ONLY these)

| Layer | Allowed | NOT allowed |
|---|---|---|
| Server runtime | Node.js with CommonJS (`require` / `module.exports`) | ES modules, TypeScript |
| Framework | Express | — |
| Templating | EJS | — |
| Database | MongoDB, Mongoose | — |
| Auth | express-session, connect-mongo, bcrypt | jsonwebtoken, passport |
| Upload | express-fileupload | multer |
| Env | dotenv | — |
| Dev | nodemon (dev dependency) | — |
| Browser | Vanilla JS (ES6), jQuery (CDN) | React, Tailwind, Bootstrap |
| Forms | HTML GET/POST only | method-override |

**Code style:** `const`/`let` only (no `var`), arrow functions, template strings, destructuring, `async`/`await`. Short comments on non-obvious lines.

---

## Folder Structure

```
stockpilot/
  index.js                  ← entry: Express setup, middleware, routes, DB, listen
  package.json              ← scripts: start, dev
  Procfile                  ← web: node index.js
  .env.example / .env       ← PORT, MONGO_URI, SESSION_SECRET
  .gitignore                ← node_modules, .env, public/uploads/*
  models/                   ← User.js, Item.js, Supplier.js, StockTransaction.js
  controllers/              ← one file per module
  routes/                   ← one Router file per module
  middleware/
    auth.js                 ← requireLogin, redirectIfLoggedIn
    flash.js                ← session → res.locals flash middleware
  views/
    partials/               ← header.ejs, navbar.ejs, messages.ejs, footer.ejs
    errors/                 ← 404.ejs, 500.ejs
    auth/                   ← register.ejs, login.ejs (Phase 1)
    items/                  ← index, new, edit, show, _form (Phase 2)
    suppliers/              ← index, new, edit, show, _form (Phase 4)
    transactions/           ← index, new (Phase 4)
    home.ejs                ← dashboard / landing page
  public/
    css/style.css           ← design system
    js/main.js              ← vanilla JS (Phase 5)
    js/ajax.js              ← jQuery + Ajax (Phase 6)
    uploads/                ← uploaded images (.gitkeep)
```

---

## Contract (9 rules)

### 1. Environment
- Port: `process.env.PORT` (default `3000`).
- Database: `mongoose.connect(process.env.MONGO_URI)`.

### 2. Express setup (index.js)
- `app.set("view engine", "ejs")`
- `express.urlencoded({ extended: true })`
- `express.json()`
- `express.static("public")`
- Session: `express-session` with `connect-mongo` store (same `MONGO_URI`), `resave: false`, `saveUninitialized: false`.

### 3. Routing conventions
- Page routes → rendered EJS.
- Updates/deletes via POST: `POST /items/:id/update`, `POST /items/:id/delete`.
- API (Ajax) routes under `/api/...` return JSON: `{ success: true, data: ... }`.

### 4. URL map
See table below.

### 5. Flash messages and form persistence (no extra package)
- `middleware/flash.js` copies `req.session.errors` (array), `req.session.success` (string), `req.session.formData` (object) into `res.locals` as `errors`, `success`, `old`, then deletes them from session.
- Controllers on failure: set `req.session.errors`, `req.session.formData = req.body`, `res.redirect(back)`.
- `views/partials/messages.ejs` displays errors and success.
- Every form uses `old.fieldName` to refill inputs.

### 6. Auth state
- After login: `req.session.userId` is set.
- `middleware/auth.js` exports `requireLogin` and `redirectIfLoggedIn`.
- A global middleware sets `res.locals.currentUser` (or `null`) so every view can use it.

### 7. Naming
- HTML form `name` attributes MUST equal Mongoose schema field names exactly.

### 8. Views
- All views include the same partials: `header` (head + CSS + jQuery CDN + main.js defer), `navbar`, `messages`, `footer`.

### 9. Error handling
- 404 handler (last route) → `errors/404.ejs`.
- Error-handling middleware (4 params) → `errors/500.ejs`.

---

## URL Map

| Method | Path | Controller function | Login required | Status |
|---|---|---|---|---|
| GET | `/` | dashboardController.index | Yes | done (protected) |
| GET | `/auth/register` | authController.showRegister | No (redirectIfLoggedIn) | done |
| POST | `/auth/register` | authController.register | No | done |
| GET | `/auth/login` | authController.showLogin | No (redirectIfLoggedIn) | done |
| POST | `/auth/login` | authController.login | No | done |
| GET | `/auth/logout` | authController.logout | Yes | done |
| GET | `/items` | itemController.index | Yes | done |
| GET | `/items/new` | itemController.showCreate | Yes | done |
| POST | `/items` | itemController.store | Yes | done |
| GET | `/items/:id` | itemController.show | Yes | done |
| GET | `/items/:id/edit` | itemController.edit | Yes | done |
| POST | `/items/:id/update` | itemController.update | Yes | done |
| POST | `/items/:id/delete` | itemController.destroy | Yes | done |
| GET | `/suppliers` | supplierController.index | Yes | done |
| GET | `/suppliers/new` | supplierController.showCreate | Yes | done |
| POST | `/suppliers` | supplierController.store | Yes | done |
| GET | `/suppliers/:id` | supplierController.show | Yes | done |
| GET | `/suppliers/:id/edit` | supplierController.edit | Yes | done |
| POST | `/suppliers/:id/update` | supplierController.update | Yes | done |
| POST | `/suppliers/:id/delete` | supplierController.destroy | Yes | done |
| GET | `/transactions` | transactionController.index | Yes | done |
| GET | `/transactions/new` | transactionController.showCreate | Yes | done |
| POST | `/transactions` | transactionController.store | Yes | done |
| GET | `/api/items?search=` | apiController.searchItems | Yes (JSON 401) | done |
| GET | `/api/items/:id` | apiController.getItem | Yes (JSON 401) | done |
| GET | `/api/stats` | apiController.getStats | Yes (JSON 401) | done |
| GET | `/partials/recent-transactions` | apiController.recentTransactions | Yes (JSON 401) | done |

---

## Models

| Model | Phase | Fields | Details |
|---|---|---|---|
| User | 1 | name, email, password | Email unique/lowercase/trimmed; bcrypt pre-save hash; minlength 6 |
| Item | 2 | name, sku, category, unitPrice, quantity, reorderLevel, description, image, supplier, createdBy, timestamps | SKU unique/uppercase/trimmed; unitPrice min 0; quantity & reorderLevel defaults; virtual isLowStock |
| Supplier | 4 | name, email, phone, address, timestamps | Vendor registry; deletion restricted when linked items exist |
| StockTransaction | 4 | item, type (IN/OUT), quantity, note, user, timestamps | Immutable audit log; triggers atomic $inc quantity updates with rollback |

---

## Reusable CSS Classes

### Layout
- `.container` — max-width wrapper with horizontal padding
- `.main-content` — flex-grow content area below navbar

### Navbar
- `.navbar`, `.navbar-inner`, `.navbar-brand`, `.brand-highlight`
- `.nav-links`, `.nav-link`, `.nav-auth`, `.nav-user`
- `.navbar-toggle`, `.toggle-bar`, `.navbar-menu.open`

### Buttons
- `.btn` — base button
- `.btn-sm`, `.btn-lg` — size variants
- `.btn-primary`, `.btn-outline`, `.btn-success`, `.btn-danger`, `.btn-warning` — colour variants
- `.btn-icon` — icon-only button
- `.btn-group` — flex row of buttons

### Cards
- `.card`, `.card-header`, `.card-title`
- `.stat-card`, `.stat-icon`, `.stat-info`, `.stat-value`, `.stat-label`
- `.feature-card`, `.feature-icon`

### Forms
- `.form-group` — label + input wrapper
- `.form-label`, `.form-control`, `.form-hint`
- `.form-row` — two-column grid
- `.form-control-file` — file input
- `.field-error` — client-side validation error text
- `.auth-wrapper`, `.auth-card`, `.auth-subtitle`, `.auth-footer`

### Tables
- `.table-wrapper` — scrollable border container
- `.table` — the table itself
- `.sortable`, `.sorted-asc`, `.sorted-desc` — header states (Phase 5)
- `.low-stock` — row highlight

### Badges
- `.badge`, `.badge-warning`, `.badge-success`, `.badge-error`, `.badge-info`
- `.badge-in`, `.badge-out` — stock transaction type

### Messages
- `.msg`, `.msg-error`, `.msg-success`, `.msg-close`

### Images
- `.thumb`, `.thumb-lg`, `.thumb-placeholder`
- `.image-preview`

### Detail pages
- `.detail-grid`, `.detail-row`, `.detail-label`, `.detail-value`

### Page structure
- `.page-header`, `.page-title`
- `.filter-bar`, `.search-input`
- `.quick-view` — Ajax quick-view panel (Phase 6)
- `.loading` — spinner indicator
- `.empty-state`
- `.inline-form` — inline delete form
- `.error-page`, `.error-content`, `.error-code`

### Utilities
- `.text-center`, `.text-right`, `.text-muted`, `.text-success`, `.text-error`, `.text-warning`
- `.mt-sm`, `.mt-md`, `.mt-lg`, `.mb-sm`, `.mb-md`, `.mb-lg`

---

## Dashboard Element IDs (for JS hooks)

| ID | Element | Used in |
|---|---|---|
| `stat-total-items` | Total items stat card | Phase 4, 6 |
| `stat-low-stock` | Low stock stat card | Phase 4, 6 |
| `stat-suppliers` | Suppliers stat card | Phase 4, 6 |
| `stat-stock-value` | Stock value stat card | Phase 4, 6 |
| `low-stock-table` | Low stock items table | Phase 4, 5 |
| `recent-transactions` | Recent transactions table | Phase 4, 6 |

---

## File Uploads & WYSIWYG Specification (Phase 3)

- **Upload Middleware**: `express-fileupload` registered in `index.js` with a 2 MB size limit.
- **Storage Folder**: `public/uploads/` (ignored in `.gitignore`, except `.gitkeep`).
- **Filename Rule**: `${Date.now()}-${imageFile.name.replace(/\s+/g, '_')}`.
- **Database Field**: `item.image` stores the web-accessible path: `/uploads/<filename>`.
- **Validation**: Mimetype must start with `image/` (JPEG, PNG, GIF, WebP); file size `<= 2 MB`.
- **Cleanup**: When an item is deleted (`destroy`) or image replaced (`update`), the old image file is removed using `fs.unlink`.
- **WYSIWYG Editor**: Quill (Snow theme) loaded from CDN. On form submit, HTML content is synchronized into `<input type="hidden" name="description">`.
- **XSS Mitigation**: Controller strips `<script>` tags from the stored description using a regex replace before saving. Views output rich text using `<%- item.description %>`.

---

---

## Browser JavaScript Architecture (Phase 5)

### Files in `public/js/`
- **`public/js/validation.js`**:
  - ES6 arrow functions with default parameters (`isNotEmpty`, `isMinLength`, `isValidEmail`, `isNonNegativeNumber`, `isPositiveInteger`).
  - Object destructuring from `Object.fromEntries(new FormData(form))`.
  - Accessible error feedback: sets `aria-invalid="true"` and inserts `<div class="field-error">` via `document.createElement`.
  - Dedicated initializers: `initRegisterValidation`, `initLoginValidation`, `initItemValidation`, `initSupplierValidation`, `initTransactionValidation`.
  - Exported to `window.StockPilotValidation`.
- **`public/js/ui.js`**:
  - **Event Delegation**: Single submit listener on `document.body` for `.delete-form, form[action*="/delete"]` using `confirm()`.
  - **Low-Stock Highlighting**: `applyLowStockHighlight()` inspecting `data-quantity` and `data-reorder` to add `.low-stock`.
  - **Category Filter**: `initClientCategoryFilter()` utilizing ES6 `Set` for deduplication and `Map` for frequency counts, filtering rows without page reloads.
  - **Table Sorting**: `initSortableTables()` on `th.sortable`, uses spread operator `[...tbody.rows]` and numeric/string `sort()`.
  - **Flash Auto-Dismiss**: `initFlashMessages()` auto-hiding `.msg` alerts after 4s with smooth CSS opacity transition.
  - **ES6 Class**: `StockItem` class (`constructor`, `isLow()`, getter `status`, `toRow()`) used in `initDashboardStockItems()` with `Array.find` and `Array.findIndex` to generate an alert banner.
  - **Image Preview**: `initImagePreview()` generating instant local previews via `URL.createObjectURL` and cleanup via `URL.revokeObjectURL`.
  - Exported to `window.StockPilotUI`.
- **`public/js/main.js`**:
  - DOMContentLoaded master orchestrator initializing mobile navbar toggle, `StockPilotUI`, and `StockPilotValidation`.

### Script Loading & Execution
- In `views/partials/header.ejs`: `<script src="/js/validation.js" defer></script>`, `<script src="/js/ui.js" defer></script>`, `<script src="/js/main.js" defer></script>`.
- Defer ensures non-blocking downloads and execution in document order once HTML parsing is complete.

### `data-*` Attributes Used
- `data-quantity`: Holds raw quantity on `<tr>` for highlight and sorting.
- `data-reorder`: Holds reorder threshold on `<tr>` for stock warning evaluation.
- `data-category`: Holds category text on `<tr>` for client-side category filtering.
- `data-type`: Specifies data type (`text` | `number`) on `th.sortable`.

### Targeted Element IDs
- Forms: `#register-form`, `#login-form`, `#item-form`, `#supplier-form`, `#transaction-form`.
- UI & Tables: `#items-table`, `#client-category-filter`, `#low-stock-table`, `#stock-summary-banner`, `#recent-transactions`.
- Image Upload: `#image`, `#image-preview`, `#image-preview-container`.

---

## jQuery & Ajax Architecture (Phase 6)

### Server Endpoints & Auth Guard
- **Auth Guard**: `requireApiLogin` middleware applied to `/api/*` and `/partials/*`. Returns HTTP 401 with JSON `{ success: false, message: 'Login required' }` (no 302 redirects).
- `GET /api/items?search=...`: Case-insensitive regex search against `name`, `sku`, and `category`. Returns `{ success: true, count, data: [items] }`.
- `GET /api/items/:id`: Fetches single item with populated supplier. Returns `{ success: true, data: item }`.
- `GET /api/stats`: Computes dashboard aggregates (`totalItems`, `lowStockCount`, `totalSuppliers`, `totalStockValue`).
- `GET /partials/recent-transactions`: Renders server-side HTML partial `partials/recent_transactions_table.ejs` for `.load()`.
- `POST /items/:id/delete`: Dual-mode delete endpoint. If `X-Requested-With: XMLHttpRequest` or JSON requested, returns `{ success: true, message }` JSON.

### Client-Side Implementations (`public/js/ajax.js`)
1. **Feature A — Live Search on `/items`**:
   - 300ms debounce timer on `#live-search`.
   - Fetches `/api/items?search=...` via `$.getJSON`.
   - Shows `#search-loading` spinner in-flight.
   - Dynamically rebuilds table rows or toggles `#search-no-results`.
   - Re-applies low-stock row styling via `window.StockPilotUI.applyLowStockHighlight()`.
2. **Feature B — Auto-Refresh Dashboard Stats**:
   - Manual button `#refresh-stats` click and periodic `setInterval` every 30 seconds.
   - Smooth value transition using jQuery `.fadeOut(150)` and `.fadeIn(150)`.
   - Refreshes transactions table asynchronously via `$('#recent-transactions-container').load('/partials/recent-transactions')`.
3. **Feature C — Item Quick View Panel**:
   - Event delegation on `.btn-quick-view` inside `#items-table`.
   - Queries `/api/items/:id` via `$.getJSON`.
   - Populates `#quick-view-panel` (image, SKU, price, stock, supplier, description) and animates open via `.slideDown(300)`.
   - Smooth scrolls to panel; `#quick-view-close` collapses via `.slideUp(250)`.
4. **Feature D — Stock IN/OUT Form Helper on `/transactions/new`**:
   - On `#item` select change, fetches `/api/items/:id` stock level.
   - Listens to `#type` and `#quantity` changes, computing projected balance live.
   - Renders warning `#helper-stock-warning` in red if `OUT` movement exceeds current available stock.
5. **Feature E — Animated Ajax Delete**:
   - Intercepts table row `form.delete-form` submissions.
   - Prompts confirmation, then posts via `$.ajax` with `X-Requested-With: XMLHttpRequest`.
   - On response success, removes row with animated `row.fadeOut(400, () => row.remove())`.

---

## Phase Log

| Phase | Status | Summary |
|---|---|---|
| 0 — Setup & MVC skeleton | ✅ Done | Express + EJS + session + Mongo skeleton; middleware stubs; styled home page with navbar/footer/partials; design system CSS; PROJECT_CONTEXT.md created. |
| 1 — Authentication | ✅ Done | User model with bcrypt pre-save hook; authController (register, login, logout); requireLogin & redirectIfLoggedIn guards; views with flash messages & old input persistence. |
| 2 — Items CRUD | ✅ Done | Item model with uppercase SKU & isLowStock virtual; itemController full CRUD; requireLogin protected routes; category filtering; shared _form partial with validation flash and old value refilling. |
| 3 — Image upload + WYSIWYG | ✅ Done | express-fileupload integration; 2 MB limit; unique filename in public/uploads; image cleanup on delete; Quill WYSIWYG editor with server-side script tag sanitization; thumbnail and detail views. |
| 4 — Suppliers, transactions, dashboard | ✅ Done | Supplier CRUD with item deletion restraint; StockTransaction model & log; atomic $inc stock updates & OUT quantity guard; dashboard metrics (valuation, low stock, recent txs). |
| 5 — Browser JS (DOM, events, ES6) | ✅ Done | Pure vanilla JS & ES6 (no jQuery yet); validation with ARIA & error tooltips; event delegation delete confirmation; dynamic category filter with Set & Map; table sorting with spread syntax; ES6 StockItem class; live image preview. |
| 6 — jQuery + Ajax | ✅ Done | jQuery CDN; /api endpoints (search, item, stats, partial); 401 JSON guard; debounced live search; auto-refresh dashboard stats & HTML load; item quick-view slideDown panel; live stock calculator helper; animated row fadeOut delete. |
| 7 — Error handling + deployment | ⬜ Planned | |
