// filepath: NodeJS/database.js
require('dotenv').config();
const mariadb = require('mariadb');

const pool = mariadb.createPool({
    host: process.env.DB_HOST, // Corresponde a DB_HOST del .env
    port: process.env.DB_PORT, // Corresponde a DB_PORT del .env
    user: process.env.DB_USER, // Corresponde a DB_USER del .env
    password: process.env.DB_PASSWORD, // Corresponde a DB_PASSWORD del .env
    database: process.env.DB_NAME, // Corresponde a DB_NAME del .env
    connectionLimit: 5
});

module.exports = pool;