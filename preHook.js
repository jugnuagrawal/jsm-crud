const request = require('request');
const log4js = require('log4js');
const deepmerge = require('deepmerge');

const logger = log4js.getLogger('pre-hook');


function trigger(req, res, next) {
    async function execute() {
        let data;
        // data = await postRequest('', req.headers, req.body);
        // if (data.statusCode !== 200) {
        //     return res.status(data.statusCode).json(data.body);
        // } else {
        //     req.headers = deepmerge(req.headers, data.headers);
        //     req.body = deepmerge(req.body, data.body.data);
        // }
        next();
    }

    execute().catch(err => {
        logger.error(err);
        let message;
        if (typeof err === 'string') {
            message = err;
        } else {
            message = err.message;
        }
        res.status(500).json({ message });
    });
}


function postRequest(url, headers, data) {
    return new Promise((resolve, reject) => {
        request(url, {
            headers,
            body: {
                data
            },
            json: true
        }, (err, res, resBody) => {
            if (err) {
                return reject(err);
            }
            resolve({
                statusCode: res.statusCode,
                body: res.body,
                headers: res.headers
            });
        });
    });
}

module.exports.trigger = trigger;