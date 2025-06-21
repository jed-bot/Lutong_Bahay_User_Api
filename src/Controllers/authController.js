const User = require('../Models/userModel.js'); // Ensure the correct path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { errorHandler, notFoundError, Validate, Unauthorized, Existing, Incorrect} = require('../Middleware/errorHandling.js');
// Get all users (for testing, remove in production)
const getUsers = async (req, res,next) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        next(error);//passing the error to the error handler
    }
};
const getme = async (req, res,next) => {
    try {
        // Check if the Authorization header exists and is properly formatted
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return Unauthorized(req,res,next);
        }

        // Extract the token
        const token = req.headers.authorization.split(' ')[1];

        // Verify and decode the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            next(error);
        }

        // Extract the email from the decoded token
        const userEmail = decoded.email;
        if (!userEmail) {
            return Unauthorized(req, res,next);
        }

         // Find the user using the email (case-insensitive query)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } }).select('full_name email');
        if (!user) {
            return notFoundError(req, res,next);
        }

        // Return the user's details
        return res.status(200).json({ full_name: user.full_name, email: user.email });
    } catch (error) {
      next(error);
    }
};
// Register a new user
const registerUser = async (req, res,next) => {
    try {
        const { full_name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser){
             return Existing(req,res,next);
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ full_name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        next(error);
    }
};

// Login user
const loginUser = async (req, res,next) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return notFoundError(req,res,next);
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return Incorrect(req,res,next);
        }

        // Generate JWT token with email
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};// Forgot Password 
const forgotPassword = async (req, res,next) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
           return notFoundError(req,res,next);
        }

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        await user.save();
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Edit Profile for user
const editProfile = async(req,res) =>{
    try{
        const {email, newFullname, newPassword} = req.body;//required fields to edit profile
        // Check if the user exists
        const user = await User.findOne({email});
        if(!user){
           return notFoundError(req,res);
        }

        if (newFullname){
            user.full_name = newFullname;
        }
        if (newPassword){
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(newPassword,salt);

        }

        await user.save();
        
        res.status(200).json({message:"Profile updated successfully"});
    }catch(error){
        next(error);
    }
};


// Delete user account
const deleteUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return notFoundError(req, res);
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
           return Incorrect(req,res);
        }

        // Delete the user
        await User.deleteOne({ email });
        res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        next(error);
    }
};



module.exports = { getUsers, registerUser, loginUser,deleteUser, forgotPassword, editProfile,getme };
