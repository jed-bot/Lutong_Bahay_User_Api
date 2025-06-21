const ingredientModel = require('../Models/ingredientModel.js');
const bycrpt = require('bcryptjs');
const { errorHandler, notFoundError, Validate, Unauthorized, Existing, Incorrect} = require('../Middleware/errorHandling.js');

// get all ingredients
const getIngredients = async (req, res,next) => {
    try {
        const ingredients = await ingredientModel.find();
        res.status(200).json(ingredients);
    } catch (error) {
        next(error);
    }
};

const getIngredientById = async (req, res, next) => {
    try {
        const { id } = req.params;
        const ingredient = await ingredientModel.findById(id);

        if (!ingredient) {
            return(req,res,next);
        }

        res.status(200).json(ingredient);
    } catch (error) {
        next(error);
    }
};


const createIngredient = async (req, res, next) => {
    try {
        const { ingredient_name, classification } = req.body;

        // Validate input fields
        if (!ingredient_name || !classification ) {
            return Validate(req, res, next);
        }

        // Normalize name for consistency and duplicate checking
        const normalizedIngredientName = ingredient_name.toLowerCase().trim();

        // Check for existing ingredient
        const existingIngredient = await ingredientModel.findOne({ ingredient_name: normalizedIngredientName });
        if (existingIngredient) {
            return Existing(req, res, next);
        }

        // Save ingredient using normalized name
        const newIngredient = new ingredientModel({
            ingredient_name: normalizedIngredientName,
            classification
        });

        await newIngredient.save();

        res.status(200).json({ message: 'Ingredient created successfully' });
    } catch (error) {
        next(error);
    }
};

const updateIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { ingredient_name, classification } = req.body;

        // Validation
        if (!ingredient_name || !classification) {
            return Validate(req, res, next);
        }

        // Normalize name (optional)
        const normalizedIngredientName = ingredient_name.trim().toLowerCase();

        // Update ingredient
        const updatedIngredient = await ingredientModel.findByIdAndUpdate(
            id,
            {
                ingredient_name: normalizedIngredientName,
                classification
            },
            { new: true } // Return the updated document
        );

        if (!updatedIngredient) {
            return notFoundError(req, res, next);
        }

        res.status(200).json({ message: 'Ingredient updated successfully', updatedIngredient });
    } catch (error) {
        next(error);
    }
};

const detleteIngredient = async (req, res, next) => {
    try {
        const { id } = req.params;

        const deletedIngredient = await ingredientModel.findByIdAndDelete(id);

        if (!deletedIngredient) {
            return notFoundError(req, res, next);
        }

        res.status(200).json({ message: 'Ingredient deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    detleteIngredient
};
