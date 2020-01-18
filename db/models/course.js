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
        title: {
            type: Sequelize.TEXT,
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
    
     Course.associate = (models) => {
        Course.belongsTo(models.User, {
          as: 'instructor',
          foreignKey: {
            fieldName: 'userId',
            allowNull: true,
          },
        });
      };
    
    return Course;
}

