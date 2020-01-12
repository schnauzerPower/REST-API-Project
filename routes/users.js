
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');

const db = require('../db');
const { User, Course } = db.models;


const authenticateUser = async (req, res, next) => {
    const credentials = auth(req);
    let message = null;
   
    if(credentials) {
        const name = await User.findOne({
            where: {
                'firstName': credentials.name
            }
        })
        if(name) {
            const authenticated = bcryptjs.compareSync(credentials.pass, name.password);
            if(authenticated) {
                req.currentUser = name;
            }else {
                message = "Authentication failure for username: " + credentials.name;
            }
        }else {
            message = `User not found for username: ${credentials.name}`;
        }
    }else {
        message = "Authorization header not found. Unable to search database." 
    }
    if(message) {
        console.warn(message);
        res.status(401).json({ message: 'Access Denied' });
    }
    next();
}





router.get('/users', authenticateUser, (req, res) => {
    const user = req.currentUser;
    console.log(req.currentUser)
    res.json({
        name: user.firstName + " " + user.lastName,
        id: user.id
    });

});


router.post('/users', authenticateUser, [
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