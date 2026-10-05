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

module.exports = { requireLogin, redirectIfLoggedIn };
