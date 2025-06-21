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
        required: true }
}, 
{ 
    timestamps: true 
});

module.exports = mongoose.model('User', userSchema);
