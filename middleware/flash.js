// middleware/flash.js — One-time flash messages and form data persistence
// This middleware runs on EVERY request. It copies session-stored messages
// into res.locals (which EJS templates can access), then deletes them from
// the session so they only show once ("flash" behaviour without an extra package).

const flash = (req, res, next) => {
  // errors: an array of error strings to display in a red box
  res.locals.errors = req.session.errors || [];
  delete req.session.errors;

  // success: a single success string to display in a green box
  res.locals.success = req.session.success || '';
  delete req.session.success;

  // old: the previous form submission's data, so inputs can be refilled after a validation error
  res.locals.old = req.session.formData || {};
  delete req.session.formData;

  next();
};

module.exports = flash;
