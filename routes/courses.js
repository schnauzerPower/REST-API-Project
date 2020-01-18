
const express = require('express');
const router = express.Router();
const { check, validationResult } = require('express-validator');
const bodyParser = require('body-parser');
const authenticateUser = require('./authenticate');

const db = require('../db');
const { Course, User } = db.models;

function asyncHandler(cb){
  return async (req, res, next)=>{
    try {
      await cb(req,res, next);
    } catch(err){
      next(err);
    }
  };
}

router.get('/courses', asyncHandler(async(req, res)=> {
    const courses = await Course.findAll({
        attributes: ['title', 'userId']
    });
    res.json({
        courses
    });
    res.status(200).end();
}))

router.get('/courses/:id', asyncHandler(async (req, res) => {
        
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
}))

router.put('/courses/:id', authenticateUser.data.authenticateUser, [
    check('title').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for title.'),
    check('description').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for description.'),
    check('estimatedTime').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for email.'),
    check('materialsNeeded').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    
    if(!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => error.msg);
        return res.status(400).json({errors: errorMessages});
    }
  
    const courseToUpdate = await Course.findByPk(req.params.id);
    
    if(courseToUpdate.userId == req.currentUser.id) {
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
    }else {
        res.status(403).json({message: "You are not authorized to update this course"}).end();
    }    
})) 

router.delete('/courses/:id', authenticateUser.data.authenticateUser, asyncHandler(async (req, res) => {
   
    const courseToUpdate = await Course.findByPk(req.params.id);
    
    if(courseToUpdate.userId == req.currentUser.id) {
        const updatedInfo = req.body;
    
        await Course.destroy({
          where: {
            id: req.params.id
          }
        });
    
        res.status(204).end();
    }else {
        res.status(403).json({message: "You are not authorized to delete this course"}).end();
    }     
    
    
    
})) 
    

router.post('/courses', authenticateUser.data.authenticateUser, [
    check('title').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for title.'),
    check('description').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for description.'),
    check('estimatedTime').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for estimatedTime.'),
    check('materialsNeeded').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for materialsNeeded.'),
    
], asyncHandler(async (req, res) => {
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
            userId: newCourse.userId
           
        })
        
        const courseParam = course.dataValues.id
        res.location(`/courses/${courseParam}`)
        res.status(201).end(); 
         
}))

module.exports = router;