const express = require('express');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
//const {fileURLToPath} = require('url');
const path = require('path');

//importing routes
const userRoutes = require('./src/Routes/authRoute.js'); 
const useingredientRoute = require('./src/Routes/ingredientRouter.js');
const recipeRouters = require('./src/Routes/recipeRouter.js');

dotenv.config();
const app = express();



// Middleware
app.use(express.json()); // Allows JSON request bodies

// Function to detect ingredients
//const __filename = fileURLToPath(import.meta.url);
//const __dirname = path.dirname(__filename);
// Routes
app.use('/api/auth', userRoutes);
app.use('/api/ingredients', useingredientRoute);
app.use('/api/recipes',recipeRouters);

//static files for the avatars
app.use('/avatars', express.static(path.join(__dirname,'src/public/avatars')));



// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch(err => console.error("MongoDB connection error:", err));


// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(` Server running at: http://localhost:${PORT}`));