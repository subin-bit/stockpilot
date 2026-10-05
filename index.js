// index.js — StockPilot entry point
// Sets up Express, middleware, session, DB connection and routes.

const express = require('express');
const path = require('path');
const session = require('express-session');
// connect-mongo v6 exports MongoStore as a named export
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config(); // Load .env variables into process.env

const app = express();

// ─── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Trust reverse proxy (for Render, Heroku, Nginx HTTPS load balancers)
app.set('trust proxy', 1);

// ─── Body parsers ───────────────────────────────────────────────
// Parse URL-encoded form data (extended: true allows nested objects)
app.use(express.urlencoded({ extended: true }));
// Parse JSON request bodies (used by Ajax endpoints in Phase 6)
app.use(express.json());

// ─── File upload middleware ─────────────────────────────────────
// Registers express-fileupload for multipart forms (image uploads)
const fileUpload = require('express-fileupload');
app.use(fileUpload({
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
  abortOnLimit: false
}));

// ─── Static files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Session middleware ─────────────────────────────────────────
// connect-mongo stores sessions in MongoDB so they persist across restarts
app.use(session({
  secret: process.env.SESSION_SECRET || 'fallback_secret',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    maxAge: 1000 * 60 * 60 * 24 // 24 hours
  }
}));

// ─── Flash messages middleware ──────────────────────────────────
// Copies one-time messages from the session into res.locals for views
const flash = require('./middleware/flash');
app.use(flash);

// ─── Global auth state ─────────────────────────────────────────
// Makes currentUser available in every EJS view (null when logged out)
const User = require('./models/User');
app.use(async (req, res, next) => {
  res.locals.currentUser = null;
  req.currentUser = null;
  if (req.session.userId) {
    try {
      const user = await User.findById(req.session.userId).select('-password');
      res.locals.currentUser = user;
      req.currentUser = user;
    } catch (err) {
      console.error('Error fetching user for session:', err.message);
    }
  }
  next();
});

// ─── Auth Middleware ────────────────────────────────────────────
const { requireLogin } = require('./middleware/auth');

// ─── Routes ─────────────────────────────────────────────────────
// Auth routes (register, login, logout)
app.use('/auth', require('./routes/authRoutes'));

// Dashboard controller
const dashboardController = require('./controllers/dashboardController');

// Home / dashboard route (protected by requireLogin)
app.get('/', requireLogin, dashboardController.index);

// Items routes (CRUD)
app.use('/items', require('./routes/itemRoutes'));

// Suppliers routes (CRUD)
app.use('/suppliers', require('./routes/supplierRoutes'));

// Stock transactions routes
app.use('/transactions', require('./routes/transactionRoutes'));

// ─── Phase 6: API & Ajax Partial Routes ─────────────────────────
const { requireApiLogin } = require('./middleware/auth');
const apiController = require('./controllers/apiController');
app.use('/api', require('./routes/apiRoutes'));
app.get('/partials/recent-transactions', requireApiLogin, apiController.recentTransactions);

// ─── 404 handler (must be the LAST route) ───────────────────────
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found — StockPilot' });
});

// ─── 500 error-handling middleware ──────────────────────────────
// Express calls this when next(err) is used; the 4 parameters tell Express it's an error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
});

// ─── Database connection and server start ───────────────────────
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000 // fail fast if MongoDB isn't running
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`StockPilot running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1); // Stop the app if DB is unreachable
  });
