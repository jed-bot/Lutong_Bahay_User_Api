const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const userRoutes = require('./src/Routes/authRoute.js'); // ✅ Make sure this matches your folder structure

dotenv.config();
const app = express();

// Middleware
app.use(express.json()); // Allows JSON request bodies

// Function to detect ingredients

// Routes
app.use('/api/auth', userRoutes);

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));