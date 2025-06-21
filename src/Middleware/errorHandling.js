const errorHandler = (err, req, res, next) =>{
    console.error(err.stack);

    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal Server Error';

    res.status(statusCode).json({message});

}

const notFoundError = (req,res,next) =>{
    res.status(404).json({message:'Not Found'});
}

const Validate = (req,res,next) =>{
    res.status(400).json({message: 'All fields required'});
}

const Existing = (req,res,next) => {
    res.status(409).json({message:'Already exists'});
}

const Unauthorized = (req,res,next) =>{ 
    res.status(401).json({message:'Unauthorized'});
}

const Incorrect  = (req,res,next) =>{
    res.status(402).json({messae: 'Incorrect credentials'});
}



module.exports = {
    errorHandler,
    notFoundError,
    Validate,
    Unauthorized,
    Existing,
    Incorrect
}