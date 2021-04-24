const express = require('express');

const session = require('express-session');
const MySQLStore = require('express-mysql-session')(session);

const cookieParser = require('cookie-parser');

require('dotenv').config();


const app = express();
const PORT = process.env.PORT || +process.env.PORT_NOW;
const sequelize = require('./utils/database');
const routes = require('./routes/auth.routes');
const routesTasks = require('./routes/tasks.routes');


const options = {
	host: process.env.DB_HOST,
	port: +process.env.DB_PORT,
	user: process.env.DB_USER,
	password: process.env.DB_PAS,
	database: process.env.DB_NAME,
	clearExpired: true,
	checkExpirationInterval: 900000,
	expiration: 86400000,
	createDatabaseTable: true,
	connectionLimit: 100,
	endConnectionOnClose: true,
	charset: 'utf8',
	schema: {
		tableName: 'sessions',
		columnNames: {
			session_id: 'session_id',
			expires: 'expires',
			data: 'data'
		}
	}
};

var sessionStore = new MySQLStore(options);

app.use(express.json({ extended: true }));

app.use(cookieParser());
app.use(
    session({
        key: process.env.SESSION_KEY,
        secret: process.env.SESSION_SECRET,
        store: sessionStore,
        resave: false,
	    saveUninitialized: false,
        cookie: {
			httpOnly: true,
            maxAge: 3600000, 
            expires: 3600000
        }
    })
);

app.use('/api/auth', routes);
app.use('/api/tasks', routesTasks);

async function start () {
    try {
        await sequelize.sync();
        app.listen(PORT);
    } catch (e) {
        console.log(e.message);
        process.exit();
    }
}

start();