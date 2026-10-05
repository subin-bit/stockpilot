// routes/authRoutes.js — Authentication routes

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { redirectIfLoggedIn, requireLogin } = require('../middleware/auth');

// Guest-only routes (redirect to '/' if already authenticated)
router.get('/register', redirectIfLoggedIn, authController.showRegister);
router.post('/register', redirectIfLoggedIn, authController.register);
router.get('/login', redirectIfLoggedIn, authController.showLogin);
router.post('/login', redirectIfLoggedIn, authController.login);

// Authenticated route
router.get('/logout', requireLogin, authController.logout);

module.exports = router;
