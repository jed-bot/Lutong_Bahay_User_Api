const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
    recipe_name:{
        type: String,
        required: true
    },
    ingredients:[{
       ingredient:{
         type:mongoose.Schema.Types.ObjectId,
         ref: 'Ingredient',
         required: true
       },
       quantity:{
        type:Number,
        required: true
       },
       unit:{
        type: String,
        required: true
       }
    }],
    instructions:{
       type: String,
       required: true
    }

});

module.exports = mongoose.model('Recipe', recipeSchema);