// middleware/auth.js — Authentication route guards

// requireLogin: protects routes that require an authenticated user.
// If not logged in, sets a flash error and redirects to /auth/login.
const requireLogin = (req, res, next) => {
  if (!req.session.userId) {
    req.session.errors = ['Please log in first'];
    return res.redirect('/auth/login');
  }
  next();
};

// redirectIfLoggedIn: for guest-only pages (login, register).
// If user is already logged in, sends them to the home/dashboard page.
const redirectIfLoggedIn = (req, res, next) => {
  if (req.session.userId) {
    return res.redirect('/');
  }
  next();
};

// requireApiLogin: for API / Ajax routes.
// Returns 401 JSON instead of redirecting to HTML login page.
const requireApiLogin = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }
  next();
};

// requireAdmin: protects routes that require administrator privileges.
// If not logged in, redirects to /auth/login.
// If logged in but role is not 'admin', sets flash error and redirects to /.
const requireAdmin = (req, res, next) => {
  if (!req.session.userId) {
    req.session.errors = ['Please log in first'];
    return res.redirect('/auth/login');
  }
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    req.session.errors = ['Access denied. Administrator privileges are required for this action.'];
    return req.session.save(() => res.redirect('/'));
  }
  next();
};

// requireAdminApi: for administrative API / Ajax routes.
const requireAdminApi = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: 'Login required' });
  }
  if (!req.currentUser || req.currentUser.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Access denied: Administrator privileges required' });
  }
  next();
};

module.exports = {
  requireLogin,
  redirectIfLoggedIn,
  requireApiLogin,
  requireAdmin,
  requireAdminApi
};
