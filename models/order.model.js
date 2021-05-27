const Sequelize = require('sequelize');

const sequelize = require('../util/db');

const Order = sequelize.define('order', {
    id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        allowNull: true,
        primaryKey: true
    }
});

module.exports = Order;