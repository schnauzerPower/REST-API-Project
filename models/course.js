'use strict'
const Sequelize = require('sequelize');


module.exports = (sequelize) => {
    class Course extends Sequelize.Model {}
    Course.init({
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
        },
        firstName: {
            type: Sequelize.STRING,
            validate: {
                notEmpty: {
                    msg: '"First Name" is required'
                }
            }
        },
        title: {
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
        }
    }, {sequelize});
    
    return Course;
}