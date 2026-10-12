// index.js — StockPilot entry point
// Sets up Express, middleware, session, DB connection and routes.

const express = require('express');
const path = require('path');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// ─── View engine ────────────────────────────────────────────────
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ─── Body parsers ───────────────────────────────────────────────
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// ─── Static files ───────────────────────────────────────────────
app.use(express.static(path.join(__dirname, 'public')));

// ─── Session middleware ─────────────────────────────────────────
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
const flash = require('./middleware/flash');
app.use(flash);

// ─── Global auth state ─────────────────────────────────────────
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
  // Make the current path available to views for sidebar active state
  res.locals.currentPath = req.path;
  next();
});

// ─── Routes ─────────────────────────────────────────────────────
const { requireLogin } = require('./middleware/auth');
const dashboardController = require('./controllers/dashboardController');

// Auth routes
app.use('/auth', require('./routes/authRoutes'));

// Dashboard (protected)
app.get('/', requireLogin, dashboardController.index);

// Products CRUD
app.use('/products', require('./routes/productRoutes'));

// Categories CRUD
app.use('/categories', require('./routes/categoryRoutes'));

// Stock management & history
app.use('/stock', require('./routes/stockRoutes'));

// ─── 404 handler ────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('errors/404', { title: 'Page Not Found — StockPilot' });
});

// ─── 500 error handler ─────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Server error:', err.stack);
  res.status(500).render('errors/500', { title: 'Server Error — StockPilot' });
});

// ─── Database connection and server start ───────────────────────
const PORT = process.env.PORT || 3000;

mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('MongoDB connected');
    app.listen(PORT, () => {
      console.log(`StockPilot running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err.message);
    process.exit(1);
  });
