const Sequelize = require('sequelize');

require('dotenv').config();

const DB_NAME = process.env.DB_NAME;
const USER_NAME = process.env.DB_USER;
const PASS = process.env.DB_PAS;
const sequelize = new Sequelize(DB_NAME, USER_NAME, PASS, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    define: {
        timestamps: false
    }
});

module.exports = sequelize;