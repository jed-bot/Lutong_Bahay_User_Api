const mongoose = require ('mongoose');

const ingredientSchema = new mongoose.Schema({
    ingredient_name:{
        type: String,
        required: true
    },
    classification:{
        type: String,
        enum: ['vegetable', 'meat', 'seafood', 'spices', 'condiments',
      'root crop', 'leafy green', 'fruit', 'coconut-based', 'other'],
      required: true
    },
    
});
module.exports = mongoose.model('Ingredient', ingredientSchema);

