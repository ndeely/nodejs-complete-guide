const mysql = require('mysql2');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'niall',
    database: 'node',
    password: 'BobsWorld'
});

module.exports = pool.promise();