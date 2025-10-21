const express = require('express');
const {
  register,
  verify,
  resend,
  login,
  getMe,
  getProfile,
  getAllUser,
  updateProfile,
  changePassword,
  logout
} = require('../controllers/authController');
const { protect } = require('../middleware/auth');
const { validate, registerValidation, loginValidation } = require('../middleware/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(registerValidation), register);
router.get('/verify', verify);
router.post('/resend', resend);
router.post('/login', validate(loginValidation), login);

// Protected routes
router.use(protect); // All routes below are protected

router.get('/profile', getProfile);
router.get('/users', getAllUser);
router.put('/profile', updateProfile);
router.put('/change-password', changePassword);
router.post('/logout', logout);

module.exports = router;
