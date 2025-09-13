const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    full_name: { 
        type: String,
        required: true }, // ✅ Ensure it's `full_name`
    email: { 
        type: String, 
        required: true, 
        unique: true },
    password: { 
        type: String, 
        required: true },
    avatar:{
        type: String,
        enum:["avatar1.jpg","avatar2.jpg","avatar3.jpg","avatar4.jpg","avatar5.jpg"],
        default: "avatar1.jpg"
    }
}, 
{ 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
