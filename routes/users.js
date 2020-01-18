
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');
const authenticateUser = require('./authenticate');

const db = require('../db');
const { User, Course } = db.models;


function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      next(err);
    }
  };
}


router.get('/users', authenticateUser.data.authenticateUser, asyncHandler((req, res) => {
    const user = req.currentUser;
    res.json({
        name: user.firstName + " " + user.lastName,
        id: user.id
    });
}));


router.post('/users', [
    check('firstName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for first name.'),
    check('lastName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for last name.'),
    check('email').isEmail().withMessage('Please enter a valid email address'),
    check('password').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], asyncHandler(async(req, res) => {
        const errors = validationResult(req);
    
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({errors: errorMessages});
        }
        const user = req.body;
        const emailAlreadyExists = await User.findOne({where: {emailAddress: user.email}});
        
        if(!emailAlreadyExists) {
            user.password = bcryptjs.hashSync(user.password);

            User.create({
                firstName: user.firstName,
                lastName: user.lastName,
                emailAddress: user.email,
                password: user.password
            }),
            res.location('/');
            res.status(201).end();
            
        }else {
            res.status(409).json({message: "email address already in use."})
        }  
}));


module.exports = router;