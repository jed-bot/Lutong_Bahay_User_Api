const express = require('express');
const { getUsers, registerUser, loginUser, forgotPassword, deleteUser,editProfile,getme,getAvatar,requestPasswordOtp,updateEmail } = require('../Controllers/authController.js'); // Ensure the correct path

const router = express.Router();

// Routes for authentication
router.get('/', getUsers); // Get all users (for testing, remove in production)
router.get('/me',getme);//get user using bearer token
router.post('/register', registerUser); // Register a new user
router.post('/login', loginUser); // Login user
router.put('/forgot-password', forgotPassword); // Forgot password (dummy response for now)
router.delete('/delete-account', deleteUser); // Delete user account
router.put('/edit-profile',editProfile);//edit user profile
router.get('/avatar',getAvatar);//get specific avatars
router.post('/request-otp',requestPasswordOtp);// request otp for password reset
router.put('/update-email',updateEmail);//update the users email
//router.get('/avatars',getAvatars);// get all avatars


module.exports = router;
