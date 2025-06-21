const express = require('express');
const {
    getRecipes,
    getRecipebyId,
    createRecipe,
    updateRecipe,
    deleteRecipe
} = require('../Controllers/recipeController.js');

const router = express.Router();

router.get('/',getRecipes);
router.get('/:id', getRecipebyId);
router.post('/create',createRecipe);
router.put('/update/:id',updateRecipe);
router.delete('/delete/:id',deleteRecipe);

module.exports = router;

