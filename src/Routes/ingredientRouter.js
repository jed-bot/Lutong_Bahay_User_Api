const express = require('express');
const {  getIngredients,
    getIngredientById,
    createIngredient,
    updateIngredient,
    detleteIngredient} = require('../Controllers/IngredientController');

const router = express.Router();

router.get('/',getIngredients);
router.get('/:id',getIngredientById);
router.post('/create', createIngredient);
router.put('/update/:id',updateIngredient);
router.delete('/delete/:id', detleteIngredient); 

module.exports = router;