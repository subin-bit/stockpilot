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

module.exports = { requireLogin, redirectIfLoggedIn, requireApiLogin };
