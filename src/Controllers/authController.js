const User = require('../Models/userModel.js'); // Ensure the correct path
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const multer = require('multer');
const { errorHandler, notFoundError, Validate, Unauthorized, Existing, Incorrect} = require('../Middleware/errorHandling.js');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
require('dotenv').config();
const { EMAIL_USER, EMAIL_PASS } = process.env;
/*
// get all avatar
const getAvatars = async(req,res,next)=>{
    try{
        const avatarsDir = path.join(__dirname,'../public/avatars');
        const files = fs.readdirSync(avatarsDir);

        const avatarUrls = files.map(file => `/avatars/${file}`);
        res.status(200).json({
            success:true,
            data:avatarUrls,
            message:"Avatars loaded successfully"   
        });
    }catch(error){
        next(error);
    }
};
*/
//get avatars
const getAvatar = async(req,res,next) =>{
    try{
        if(!req.headers.authorization|| !req.headers.authorization.startsWith('Bearer ')){
            return Unauthorized(req,res,next);
        }
        const allowedpfp = ['avatar1.jpg','avatar2.jpg',
            'avatar3.jpg','avatar4.jpg','avatar5.jpg']

        const avatars  = allowedpfp.map(avatar=>'/avatars/'+avatar);
        res.status(200).json({
            success:true,
            data:avatars
        });
        }catch(error){
            next(error);
        }

}

// Get all users (for testing, remove in production)
const getUsers = async (req, res,next) => {
    try {
        if (!req.headers.authorization|| !req.headers.authorization.startsWith('Bearer ')){
            return Unauthorized(req,res,next);
        }
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
        const user = await User.findOne({ email: { $regex: new RegExp(`^${userEmail}$`, 'i') } }).select('full_name email avatar');
        if (!user) {
            return notFoundError(req, res,next);
        }

        // Return the user's details
        return res.status(200).json({ full_name: user.full_name, email: user.email,avatar:`/avatars/${user.avatar}` });
    } catch (error) {
      next(error);
    }
};
// Register a new user
const registerUser = async (req, res,next) => {
    try {
        const { full_name, email, password,avatar } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser){
             return Existing(req,res,next);
        }
        // Hash the password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({ full_name, email, password: hashedPassword,avatar });
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
        const token = jwt.sign({ email: user.email }, 
        process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ message: 'Login successful', token });
    } catch (error) {
        next(error);
    }
};
//OTP logic 
const requestPasswordOtp = async (req,res,next) =>{
    try{
        const {email} = req.body;

        const user = await User.findOne({ email });
        if(!user){
            return notFoundError(req,res,next);
        }

        // generate the otp
        const otp = crypto.randomInt(100000,999999).toString();
        user.resetOtp = otp;
        user.otpExpiry = Date.now() + 10*60*1000;//adding a 10 minute expiry time
        await user.save();

        //sending the otp to the email
        const transporter = nodemailer.createTransport({
            service:'Gmail',
            auth:{
                user:process.env.EMAIL_USER,
                pass:process.env.EMAIL_PASS
            }
        });
        await transporter.sendMail({
            from:`"Lutong Bahay"<${process.env.EMAIL_USER }`,
            to:user.email,
            subject:"Password Reset Request ",
            text:`Your one-time password (OTP) is: ${otp}.\nThis code is valid for 10 minutes. \nFor security, do not share this code with anyone. .`
        });
        res.status(200).json({message:"OTP was sent to your email"});
    }catch(error){
        next(error);
    }
}
// Forgot Password 
const forgotPassword = async (req, res,next) => {
    try {
        const { email, newPassword,otp } = req.body;

        // Check if user exists
        const user = await User.findOne({ email });
         if (!user) {
           return notFoundError(req,res,next);
        }
        // check if the otp is valid
        if (user.otpExpiry < Date.now()) {
        return Incorrect(req, res);
        }
       

        // Hash the new password
        const salt = await bcrypt.genSalt(10);
        user.password = await bcrypt.hash(newPassword, salt);

        user.otp = null;
        user.otpExpiry = null;
        await user.save();
        res.status(200).json({ message: "Password reset successfully" });

    } catch (error) {
        next(error);
    }
};

// Edit Profile for user
const editProfile = async(req,res,next) =>{
    try{
        /*authetication process*/ 
         if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return Unauthorized(req,res,next);
        }


        const {email, newFullname, avatar} = req.body;
        // Check if the user exists
        const user = await User.findOne({email});
        if(!user){
           return notFoundError(req,res);
        }

        if (newFullname){
            user.full_name = newFullname;
        }
        if(avatar){
            user.avatar =  avatar;
        }

        await user.save();
        
        res.status(200).json({message:"Profile updated successfully"});
    }catch(error){
    next(error);
    }
};
//change email
const updateEmail = async(req,res,next) =>{
    try{    
        if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
            return Unauthorized(req,res,next);
        }
        const {email,newEmail} = req.body;
        //finding the user emails
        const user = await User.findOne({ email});
        if(!user){
            return notFoundError(req,res);
        }
        user.email = newEmail;
        await user.save();

        res.status(200).json({message:"Email updated successfully"});
    }catch(error){
        next(error);
    }
}


// Delete user account
const deleteUser = async (req, res) => {
    try {
        if (!req.headers.authorization|| !req.headers.authorization.startsWith('Bearer ')){
            return Unauthorized(req,res,next);
        }
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



module.exports = { getUsers, registerUser, loginUser,deleteUser, forgotPassword, editProfile,getme,getAvatar,requestPasswordOtp,updateEmail };
