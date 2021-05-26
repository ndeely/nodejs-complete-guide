const Sequelize = require('sequelize');

const sequelize = require('../util/db');

const Product = sequelize.define('product',
    {
       id: {
           type: Sequelize.INTEGER,
           primaryKey: true,
           autoIncrement: true
       },
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        price: {
           type: Sequelize.DOUBLE,
            allowNull: false
        },
        description: {
           type: Sequelize.STRING,
            allowNull: false
        },
        imageUrl: {
           type: Sequelize.STRING,
            allowNull: false
        }
    }
);

module.exports = Product;