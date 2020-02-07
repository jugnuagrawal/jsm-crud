const router = require('express').Router();
const log4js = require('log4js');
const Ajv = require('ajv');
const deepmerge = require('deepmerge');

const schema = require('./schema');
const preHook = require('./preHook');
const utils = require('./utils');

const logger = log4js.getLogger('product.controller');
const ajv = new Ajv();
const validate = ajv.compile(schema);

router.get('/', (req, res) => {
    try {
        const db = req.app.locals.db;
        let filter = req.query.filter;
        if (filter && typeof filter === 'string') {
            try {
                filter = JSON.parse(filter);
            } catch (e) {
                filter = {};
                logger.error(e);
            }
        }
        if (req.query.countOnly) {
            db.countDocuments(filter).then(count => {
                res.status(200).json(count);
            }).catch(err => {
                logger.error(err);
                res.status(500).json({
                    message: err.message
                });
            });
        } else {
            let skip = 0;
            let count = 30;
            let project = {};
            let sort = {};
            if (req.query.count && (+req.query.count) > 0) {
                count = +req.query.count;
            }
            if (req.query.page && (+req.query.page) > 0) {
                skip = count * ((+req.query.page) - 1);
            }
            if (req.query.select && req.query.select.trim()) {
                project = makeObject(req.query.select);
            }
            if (req.query.sort && req.query.sort.trim()) {
                sort = makeObject(req.query.sort);
            }
            db.find(filter).skip(skip).limit(count).project(project).sort(sort).toArray().then(docs => {
                res.status(200).json(docs);
            }).catch(err => {
                logger.error(err);
                res.status(500).json({
                    message: err.message
                });
            });
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

router.get('/:id', (req, res) => {
    try {
        const db = req.app.locals.db;
        const projection = makeObject(req.query.select);
        if (req.params.id && req.params.id.trim()) {
            db.findOne({ _id: req.params.id }, { projection }).then(doc => {
                if (!doc) {
                    return res.status(404).json({
                        message: 'Document not found'
                    });
                }
                res.status(200).json(doc);
            }).catch(err => {
                logger.error(err);
                res.status(500).json({
                    message: err.message
                });
            });
        } else {
            res.status(400).json({
                message: 'Invalid Id'
            });
        }
    } catch (e) {
        logger.error(e);
        res.status(500).json({
            message: e.message
        });
    }
});

router.post('/', preHook.trigger, utils.idGenerator, (req, res) => {
    async function execute() {
        try {
            const db = req.app.locals.db;
            const payload = req.body;
            if (validate(payload)) {
                const status = await db.insert(payload);
                res.status(200).json(status.ops[0]);
            } else {
                res.status(400).json(validate.errors);
            }
        } catch (e) {
            if (typeof e === 'string') {
                throw new Error(e);
            } else {
                throw e;
            }
        }
    }
    execute().catch(err => {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    });
});

router.put('/:id', preHook.trigger, (req, res) => {
    async function execute() {
        try {
            const db = req.app.locals.db;
            let payload = req.body;
            if (req.params.id && req.params.id.trim()) {
                const doc = await db.findOne({ _id: req.params.id });
                if (!doc) {
                    return res.status(404).json({
                        message: 'Document not found'
                    });
                }
                payload = deepmerge(doc, payload);
                if (validate(payload)) {
                    const status = await db.updateOne({ _id: req.params.id }, { $set: payload });
                    res.status(200).json(payload);
                } else {
                    res.status(400).json(validate.errors);
                }
            } else {
                res.status(400).json({
                    message: 'Invalid Id'
                });
            }
        } catch (e) {
            if (typeof e === 'string') {
                throw new Error(e);
            } else {
                throw e;
            }
        }
    }
    execute().catch(err => {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    });
});

router.delete('/:id', (req, res) => {
    async function execute() {
        try {
            const db = req.app.locals.db;
            if (req.params.id && req.params.id.trim()) {
                const doc = await db.findOne({ _id: req.params.id });
                if (!doc) {
                    return res.status(404).json({
                        message: 'Document not found'
                    });
                }
                const status = await db.deleteOne({ _id: req.params.id });
                res.status(200).json({
                    message: 'Document Deleted'
                });
            } else {
                res.status(400).json({
                    message: 'Invalid Id'
                });
            }
        } catch (e) {
            if (typeof e === 'string') {
                throw new Error(e);
            } else {
                throw e;
            }
        }
    }
    execute().catch(err => {
        logger.error(err);
        res.status(500).json({
            message: err.message
        });
    });
});

function makeObject(value) {
    if (value) {
        const objs = value.split(',').map(e => {
            const t = {};
            if (e.startsWith('-')) {
                console.log(e.substr(1, e.length));
                t[e.substr(1, e.length)] = 0;
            } else {
                t[e] = 1;
            }
            return t;
        });
        return Object.assign.apply({}, objs);
    }
    return null;
}

module.exports = router;