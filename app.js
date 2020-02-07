const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const MongoClient = require('mongodb').MongoClient;
const log4js = require('log4js');

const schema = require('./schema');

String.prototype.toCapitalize = function () {
    return this[0].toUpperCase() + this.substr(1, this.length).toLowerCase();
}

String.prototype.toCamelCase = function () {
    return this.split(' ').map((e, i) => i === 0 ? e.toLowerCase() : e.toCapitalize()).join('');
}

String.prototype.toKebabCase = function () {
    return this.split(' ').map((e, i) => e.toLowerCase()).join('-');
}

const PORT = process.env.PORT || 3000;
const LOG_LEVEL = process.env.LOG_LEVEL || 'info';
const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017';
const DATABASE = process.env.DATABASE || 'test';
const API_ENDPOINT = process.env.API_ENDPOINT || '/data';

const logger = log4js.getLogger('server');
const app = express();


log4js.configure({
    appenders: { 'out': { type: 'stdout' }, file: { type: 'multiFile', base: 'logs/', property: 'categoryName', extension: '.log', maxLogSize: 10485760, backups: 3, compress: true } },
    categories: { default: { appenders: ['out', 'file'], level: LOG_LEVEL } }
});

MongoClient.connect(MONGODB_URL, (err, client) => {
    if (err) {
        logger.error(err);
        process.exit(0);
    }
    logger.info('Connected to DB!');
    app.locals.counterDB = client.db(DATABASE).collection('counter');
    app.locals.db = client.db(DATABASE).collection(schema.title.toCamelCase());
});

app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

app.use((req, res, next) => {
    logger.info(req.method, req.headers['x-forwarded-for'] || req.connection.remoteAddress, req.path);
    next();
});

app.use((req, res, next) => {
    if (Array.isArray(req.body)) {
        return res.status(400).json({
            message: 'Multiple payload is not supported'
        });
    }
    next();
});

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get(`/${schema.title.toKebabCase()}.schema.json`, (req, res) => {
    res.json(schema);
});

app.use(API_ENDPOINT, require('./controller'));

app.listen(PORT, (err) => {
    if (!err) {
        logger.info('Server is listening on port', PORT);
    } else {
        logger.error(err);
    }
});