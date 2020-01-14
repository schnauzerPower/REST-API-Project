const express = require('express');
const db = require('../db');
const { User, Course } = db.models;
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');



const method = {
    authenticateUser: async (req, res, next) => {
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
}

exports.data = method;


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