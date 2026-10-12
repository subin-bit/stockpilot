// routes/authRoutes.js — Authentication routes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn } = require('../middleware/auth');

// Login
router.get('/login', redirectIfLoggedIn, authController.showLogin);
router.post('/login', redirectIfLoggedIn, authController.login);

// Register
router.get('/register', redirectIfLoggedIn, authController.showRegister);
router.post('/register', redirectIfLoggedIn, authController.register);

// Logout
router.get('/logout', authController.logout);

module.exports = router;
