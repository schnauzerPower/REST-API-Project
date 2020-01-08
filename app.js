'use strict';

const { sequelize, models } = require('./models');

const {User, Course} = models;


// load modules
const express = require('express');
const morgan = require('morgan');
const auth = require('basic-auth');
const bcryptjs = require('bcryptjs');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

// variable to enable global error logging
const enableGlobalErrorLogging = process.env.ENABLE_GLOBAL_ERROR_LOGGING === 'true';

// create the Express app
const app = express();

// setup morgan which gives us http request logging
app.use(morgan('dev'));
app.use(bodyParser.json())

// TODO setup your api routes here

// setup a friendly greeting for the root route
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to the REST API project!',
  });
});

console.log('Testing the connection to the database...');

(async () => {
  try {
    // Test the connection to the database
    await sequelize.authenticate();
    console.log('Connection to the database successful!');
      } catch(error) {
        if (error.name === 'SequelizeValidationError') {
          const errors = error.errors.map(err => err.message);
          console.error('Validation errors: ', errors);
        } else {
          throw error;
        }
  }
})();

//User routes

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

app.get('/api/users', authenticateUser, (req, res) => {
    const user = req.currentUser;
    res.json({
        name: user.firstName + " " + user.lastName,
        id: user.id
    });

});

app.post('/api/users', [
    check('firstName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for first name.'),
    check('lastName').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for last name.'),
    check('email').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for email.'),
    check('password').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], (req, res) => {
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
    
    res.status(201).location('/').end();
    
});

//course routes

app.get('/api/courses', async (req, res) => {
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

app.get('/api/courses/:id', async (req, res) => {
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

app.post('/api/courses', async (req, res) => {
    try {
        const newCourse = req.body;
        await Course.create({
            title: newCourse.title,
            description: newCourse.description,
            estimatedTime: newCourse.estimatedTime,
            materialsNeeded: newCourse.materialsNeeded,
            userId: newCourse.userId
        })
        
        res.status(201).end();

    }catch(error) {
        console.error(error);
    }
    
    
})


 /*title: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Title" is required'
                }
            }
        },
        description: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"Description" is required'
                }
            }
        },
        estimatedTime: {
            type: Sequelize.STRING,
        },
        materialsNeeded: {
            type: Sequelize.STRING,
        }*/

// send 404 if no other route matched
app.use((req, res) => {
  res.status(404).json({
    message: 'Route Not Found',
  });
});

// setup a global error handler
app.use((err, req, res, next) => {
  if (enableGlobalErrorLogging) {
    console.error(`Global error handler: ${JSON.stringify(err.stack)}`);
  }

  res.status(err.status || 500).json({
    message: err.message,
    error: {},
  });
});

// set our port
app.set('port', process.env.PORT || 5000);

// start listening on our port
const server = app.listen(app.get('port'), () => {
  console.log(`Express server is listening on port ${server.address().port}`);
});
