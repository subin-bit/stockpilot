// controllers/authController.js — User authentication controller
// Handles user registration, login with bcrypt password verification, and logout.

const User = require('../models/User');
const bcrypt = require('bcrypt');

// GET /auth/login — Display login form
const showLogin = (req, res) => {
  res.render('auth/login', { title: 'Login — StockPilot', layout: false });
};

// POST /auth/login — Process login credentials
const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email: email ? email.toLowerCase().trim() : '' });

    if (!user) {
      req.session.errors = ['Invalid email or password'];
      req.session.formData = { email };
      return req.session.save(() => res.redirect('/auth/login'));
    }

    const isMatch = await bcrypt.compare(password || '', user.password);
    if (!isMatch) {
      req.session.errors = ['Invalid email or password'];
      req.session.formData = { email };
      return req.session.save(() => res.redirect('/auth/login'));
    }

    // Establish session
    req.session.userId = user._id;
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      return res.redirect('/');
    });
  } catch (error) {
    req.session.errors = ['An error occurred during login. Please try again.'];
    req.session.formData = { email };
    return req.session.save(() => res.redirect('/auth/login'));
  }
};

// GET /auth/register — Display registration form
const showRegister = (req, res) => {
  res.render('auth/register', { title: 'Register — StockPilot', layout: false });
};

// POST /auth/register — Process registration
const register = async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const user = new User({ name, email, password });
    await user.save();

    req.session.success = 'Registration successful! Please log in.';
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      return res.redirect('/auth/login');
    });
  } catch (error) {
    const errors = [];

    if (error.code === 11000) {
      errors.push('This email is already registered');
    } else if (error.errors) {
      Object.keys(error.errors).forEach((key) => {
        errors.push(error.errors[key].message);
      });
    } else {
      errors.push(error.message || 'An error occurred during registration.');
    }

    req.session.errors = errors;
    req.session.formData = { name, email };
    req.session.save((err) => {
      if (err) console.error('Session save error:', err);
      return res.redirect('/auth/register');
    });
  }
};

// GET /auth/logout — End session and redirect
const logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) console.error('Session destruction error:', err);
    res.redirect('/auth/login');
  });
};

module.exports = {
  showLogin,
  login,
  showRegister,
  register,
  logout
};
