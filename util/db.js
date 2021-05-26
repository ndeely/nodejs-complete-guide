const Sequelize = require('sequelize');

const sequelize = new Sequelize('node', 'niall', 'BobsWorld', {
   dialect: 'mysql',
   host: 'localhost'
});

module.exports = sequelize;