const express = require('express');
const { getUsers, registerUser, loginUser, forgotPassword, deleteUser,editProfile } = require('../Controllers/authController.js'); // Ensure the correct path

const router = express.Router();

// Routes for authentication
router.get('/', getUsers); // Get all users (for testing, remove in production)
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Login user
router.put('/forgot-password', forgotPassword); // Forgot password (dummy response for now)
router.delete('/delete-account', deleteUser); // Delete user account
router.put('/edit-profile',editProfile);//edit user profile


module.exports = router;
