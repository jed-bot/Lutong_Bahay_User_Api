const User = require('../Models/userModel.js'); // Ensure the correct path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Get all users (for testing, remove in production)
const getUsers = async (req, res) => {
    try {
        const users = await User.find().select('-password'); // Exclude passwords
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
const getme = async (req, res) => {
    try {
        // Check if the Authorization header exists and is properly formatted
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return res.status(401).json({ message: 'No token provided or invalid format' });
        }

        // Extract the token
        const token = req.headers.authorization.split(' ')[1];

        // Verify and decode the token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(401).json({ message: 'Invalid or expired token' });
        }

        // Extract the email from the decoded token
        const userEmail = decoded.email;
        if (!userEmail) {
            return res.status(400).json({ message: 'Token does not contain email' });
        }

        // Find the user using the email (case-insensitive query)
        const user = await User.findOne({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } }).select('full_name email');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Return the user's details
        return res.status(200).json({ full_name: user.full_name, email: user.email });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};
// Register a new user
const registerUser = async (req, res) => {
    try {
        const { full_name, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'Email already in use' });

        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ full_name, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

// Login user
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) return res.status(404).json({ message: 'User not found' });

        // Check password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Generate JWT token with email
        const token = jwt.sign({ email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};// Forgot Password 
const forgotPassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
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
            return res.status(404).json({message:"User not founf"});
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
        res.status(500).json({message:error.message});
    }
};


// Delete user account
const deleteUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Check if the user exists
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        // Delete the user
        await User.deleteOne({ email });
        res.status(200).json({ message: "Account deleted successfully" });

    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};



module.exports = { getUsers, registerUser, loginUser,deleteUser, forgotPassword, editProfile,getme };
