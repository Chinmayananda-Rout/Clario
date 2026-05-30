const express = require('express');
const router = express.Router();
const passport = require('passport');
const { registerUser , verifyOtp , loginUser , googleCallback , forgotPassword , resetPassword } = require('../controllers/authController');

router.post('/register' , registerUser);
router.post('/login' , loginUser);
router.post('/verify-otp', verifyOtp);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

router.get(
    '/google/callback', 
    passport.authenticate('google', { failureRedirect: '/api/auth/login-failed' }), 
    googleCallback
);

router.get('/login-failed', (req, res) => {
    res.status(401).json({ message: 'Google login failed' });
});

module.exports = router;