const AppError = require("../utils/appError");

const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}`;
    return new AppError(message, 400);
}

const sendErrorProd = (err, res) => {
    if(err.isOperational){
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        })
    } else {
        console.log(err);
        res.status(500).json({
            status: 'error',
            message: err
        })
    }
}

const handleDuplicateFieldsDB = err => {
    const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
    const message = `Duplicate field value: ${value}. Please use another value!`;
    return new AppError(message, 400);
}

const handleValidationErrorDB = err => {
    const errors = Object.values(err.errors).map(el => el.message);
    const message = `Invalid input data. ${errors.join('. ')}`;
    return new AppError(message, 400);
}


const handleJWTError = err => new AppError('Invalid token.', 401);

const handleJWTExpiredError = err => new AppError('Your token has expired! Please log in again!', 401);


module.exports = (err, req, res, next) => {
    
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    // Invalid IDs
    if(err.name === 'CastError'){
       err = handleCastErrorDB(err);
    }
    if(err.code === 11000){
        err = handleDuplicateFieldsDB(err);
    }
    if(err.name === 'ValidationError'){
        err = handleValidationErrorDB(err);
    }
    if(err.name === 'JsonWebTokenError'){
        err = handleJWTError(err);
    }
    if(err.name === 'TokenExpiredError'){
        err = handleJWTExpiredError(err);
    }

    sendErrorProd(err,res);
}