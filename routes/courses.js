
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');
const authenticateUser = require('./authenticate');

const db = require('../db');
const { Course, User } = db.models;




/*const authenticateUser = async (req, res, next) => {
    const credentials = auth(req);
    let message = null;
    console.log(Course)
   
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
}*/

router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.findAll({
            attributes: ['title', 'userId']
        });
        res.json({
            courses
        });
        res.status(200).end();
    }catch(error) {
        console.error(error);
    }
})

router.get('/courses/:id', async (req, res) => {
    try {
        const courseRequest = req.params.id;
        
        const course = await Course.findAll({
            where: {
                id: courseRequest
            },
            attributes: ['title', 'userId']
        })
        
         res.json({
            course
        }); 
    }catch(error) {
        console.error(error);
    }
    
})

router.put('/courses/:id', authenticateUser.data.authenticateUser, [
    check('title').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for title.'),
    check('description').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for description.'),
    check('estimatedTime').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for email.'),
    check('materialsNeeded').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], async (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages});
    }
    const updatedInfo = req.body;
    
    await Course.update(
       {title: updatedInfo.title,
        description: updatedInfo.description,
        estimatedTime: updatedInfo.estimatedTime,
        materialsNeeded: updatedInfo.materialsNeeded
       },
       {where: {id: req.params.id}}
    )
    
   res.status(204).end();
    
}) 

router.delete('/courses/:id', authenticateUser.data.authenticateUser, async (req, res) => {
   const updatedInfo = req.body;
    
   await Course.destroy({
      where: {
        id: req.params.id
      }
    });
    
   res.status(204).end();
    
}) 
    

router.post('/courses', authenticateUser.data.authenticateUser, [
    check('title').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for title.'),
    check('description').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for description.'),
    check('estimatedTime').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for estimatedTime.'),
    check('materialsNeeded').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for materialsNeeded.'),
    
], async (req, res) => {
    try {
        const errors = validationResult(req);
    
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({errors: errorMessages});
        }
        const newCourse = req.body;
    
        
        let course = await Course.create({
            title: newCourse.title,
            description: newCourse.description,
            estimatedTime: newCourse.estimatedTime,
            materialsNeeded: newCourse.materialsNeeded,
            userId: 1
           
        })
        
        const courseParam = course.dataValues.id
        res.location(`/courses/${courseParam}`)
        res.status(201).end(); 
    }catch(error) {
        console.warn(error);
    }
         
})

module.exports = router;