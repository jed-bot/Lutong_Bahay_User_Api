const recipeModel = require('../Models/recipeModel.js');
const { errorHandler, notFoundError, Validate, Unauthorized, Existing, Incorrect } = require('../Middleware/errorHandling.js');
const bycrpt = require('bcryptjs');

const getRecipes =  async (req, res, next) =>{
    try {
        const recipes = await recipeModel.find().populate('ingredients.ingredient');
        res.status(200).json(recipes);
    }catch(error){
        next(error);
    }
}

const getRecipebyId = async (req, res, next) =>{
    try{
        const {id} = req.params;
        const recipe = await recipeModel.findById(id).populate('ingredients.ingredient');
        if(!recipe){
            return notFoundError(req,res,next);
        }
        res.status(200).json(recipe);

    }catch(error){
        next(error);
    }
}

const createRecipe = async(req,res,next) =>{
    try{
        const { recipe_name,
            ingredients,
            instructions
        } = req.body;
            if (!recipe_name || !ingredients||!instructions){
                return Validate(req,res,next);
            }

        const newRecipe = new recipeModel({ recipe_name, ingredients, instructions });
        await newRecipe.save();
        res.status(200).json({message:'Recipe created successfully'});
    }catch(error){
        next(error);
    }
}

const updateRecipe =async(req,res,next)=>{
    try{
        const {id} = req.params;
        const {
            recipe_name,
            ingredients,
            instructions
        }=req.body;
        if (!recipe_name ||!ingredients||!instructions){
            return Validate(req,res,next);
        }
        const updateRecipe = await recipeModel.findByIdAndUpdate(id,{
            recipe_name,
            ingredients,
            instructions
        },
        {new:true}
    );
        if(!updateRecipe){
            return notFoundError(req,res,next);
        }
        res.status(200).json({message:'Recipe updated successfully', updateRecipe});
    }catch(error){
        next(error);
    }
}

const deleteRecipe = async (req,res,next)=>{
    try{
        const {id} = req.params;
        const deleteRecipe = await recipeModel.findByIdAndDelete(id);
        if(!deleteRecipe){
            return notFoundError(req,res,next);
        }
        res.status(200).json({message:'Recipe deleted successfully'});
    }catch(error){
        next(error);
    }
}
module.exports = {
    getRecipes,
    getRecipebyId,
    createRecipe,
    updateRecipe,
    deleteRecipe
}