// middleware/auth.js — Authentication route guards

// requireLogin: protects routes that require an authenticated user
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.session.errors = ['Please log in first'];
    return res.redirect('/auth/login');
  }
  next();
};

// redirectIfLoggedIn: for guest-only pages (login, register)
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// requireAdmin: protects routes that require administrator privileges
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.session.errors = ['Please log in first'];
    return res.redirect('/auth/login');
  }
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    req.session.errors = ['Access denied. Administrator privileges required.'];
    return req.session.save(() => res.redirect('/'));
  }
  next();
};

module.exports = {
  requireLogin,
  redirectIfLoggedIn,
  requireAdmin
};
