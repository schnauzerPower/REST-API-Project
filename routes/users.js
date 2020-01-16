
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');
const authenticateUser = require('./authenticate');

const db = require('../db');
const { User, Course } = db.models;


router.get('/users', authenticateUser.data.authenticateUser, (req, res) => {
    console.log("Start here");
    console.log(authenticateUser);
    const user = req.currentUser;
    console.log(req.currentUser)
    res.json({
        name: user.firstName + " " + user.lastName,
        id: user.id
    });
});


router.post('/users', [
    check('firstName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for first name.'),
    check('lastName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for last name.'),
    check('email').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for email.'),
    check('password').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], (req, res) => {
    
    try {
        const errors = validationResult(req);
    
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({errors: errorMessages});
        }
        const user = req.body;
        user.password = bcryptjs.hashSync(user.password);

        User.create({
            firstName: user.firstName,
            lastName: user.lastName,
            emailAddress: user.email,
            password: user.password
        }),
        res.location('/');
        res.status(201).end();
    }catch(error) {
        console.log("Fuck this")
        console.warn(error);
        
    }
    
    
});


module.exports = router;