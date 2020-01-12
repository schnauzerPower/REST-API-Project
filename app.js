/*const express = require('express');
const app = express();
const books = require('./routes/books');
const path = require('path');

const db = require('./models');
const { Book } = db.models;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json())
app.use(express.urlencoded({extended: true}))

app.use('/', books);*/


'use strict';

const { sequelize, models } = require('./db');

const {User, Course} = models;


// load modules
const express = require('express');
const users = require('./routes/users');
const courses = require('./routes/courses');
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
app.use(bodyParser.json());
app.use('/api', users);
app.use('/api', courses);

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

/*app.get('/api/users', authenticateUser, (req, res) => {
    const user = req.currentUser;
    console.log(req.currentUser)
    res.json({
        name: user.firstName + " " + user.lastName,
        id: user.id
    });

});


app.post('/api/users', authenticateUser, [
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
    res.location('/');
    res.status(201).end();
    
});*/

//course routes

/*app.get('/api/courses', async (req, res) => {
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

app.put('/api/courses/:id', authenticateUser, [
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

app.delete('/api/courses/:id', authenticateUser, async (req, res) => {
   const updatedInfo = req.body;
    
   await Course.destroy({
      where: {
        id: req.params.id
      }
    });
    
   res.status(204).end();
    
}) 
    

app.post('/api/courses', authenticateUser, [
    check('title').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for first name.'),
    check('description').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for last name.'),
    check('estimatedTime').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for email.'),
    check('materialsNeeded').exists({checkNull: true, checkFalsy: true}).withMessage('Please provide a value for password.'),
    
], async (req, res) => {
    try {
        const errors = validationResult(req);
    
        if(!errors.isEmpty()) {
            const errorMessages = errors.array().map(error => error.msg);
            return res.status(400).json({errors: errorMessages});
        }
        const newCourse = req.body;
    
        
        await Course.create({
            title: newCourse.title,
            description: newCourse.description,
            estimatedTime: newCourse.estimatedTime,
            materialsNeeded: newCourse.materialsNeeded,
            userId: 1
           
        })
        const course = await Course.findAll({
            attributes: [newCourse.title]
        })
        
        
        res.location('/api/courses/' + course.id)
        res.status(201); 
    }catch(error) {
        console.warn(error);
    }
         
})*/


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
