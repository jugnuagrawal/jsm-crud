const log4js = require('log4js');
const renderId = require('render-id');

const logger = log4js.getLogger('pre-hook');

function idGenerator(req, res, next) {
    const db = req.app.locals.counterDB;
    if (req.body._id) {
        next();
    } else {
        db.findOneAndUpdate({ _id: 'Product' }, { $inc: { next: 1 } }, { upsert: true }).then(doc => {
            if (doc.value && doc.value.next) {
                req.body._id = renderId.render('PRO########', doc.value.next);
            } else {
                req.body._id = renderId.render('PRO########', 0);
            }
            next();
        }).catch(err => {
            logger.error(err);
            next();
        });
    }
}

module.exports.idGenerator = idGenerator;