
/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON) or, if nothing left, will send a 204.
 */


const router = require('express').Router();
const HttpError = require('./http-error');
const codes = require('./http-codes');

const queries = {offset: 'number', filter: 'string', limit: 'number'};


const pictureKey = {
    width: 'number',
    height: 'number',
    src: 'string',
    title: 'string',
    description: 'string',
    views: 'number',
    id: 'number',
    timestamp: 'number'
};
const userKey = {
    firstname:'string',
    lastname: 'string',
    password: 'string',
    favourites: []
};


router.use((req, res, next) => {

    let generalKey = req.originalUrl.includes('/pictures') ? pictureKey : userKey;

    // check if correct query key words are used

    if (req.method === 'GET') {

        for (let prop in req.query) {
            if (!(prop in queries) && !(prop in generalKey)) {
                let err = new HttpError('bad query!', 400);
                next(err);
                return;
            }
        }
    }

    // check if json body has correct parameters

    if (['PUT', 'POST', 'PATCH'].includes(req.method)) {
        Object.keys(req.body).forEach((elem) => {
            if (!(elem in generalKey)) {
                let err = new HttpError('Wrong Body!', 400);
                next(err);
                return;
            }
        })
    }

    if (res.locals.items) {
        // filter by attributes

        for (let query in req.query) {
            if (query in generalKey) {
                res.locals.items.forEach((elem, index) => {
                    if (req.query[query] != elem[query]) {
                        delete res.locals.items[index];
                    }
                });
                res.locals.items = res.locals.items.filter(elem => elem);
            }
        }

        // function only show certain attributes
        if (req.query.filter) {
            const filterParams = req.query.filter.split(',');
            if (res.locals.items.constructor === Array){
                res.locals.items.forEach((elem) => {
                    Object.keys(elem).forEach((key) => {
                        if (!filterParams.includes(key)) {
                            delete elem[key];
                        }
                    });
                });
            } else {
                const filterParams = req.query.filter.split(',');
                Object.keys(res.locals.items).forEach((key) => {
                    if (!filterParams.includes(key)) {
                        delete res.locals.items[key];
                    }
                });
            }
        }
        // offset function
        if (req.query.offset) {
            console.log(res.locals.items.length);
            if (req.query.offset >= res.locals.items.length) {
                let err = new HttpError('Bad Offset Parameter', codes.wrongrequest);
                next(err);
                return;
            }
            res.locals.items.splice(0, req.query.offset);
        }


        // limit function
        if (req.query.limit) {
            if (req.query.limit < res.locals.items.length) {
                res.locals.items.splice(req.query.limit);
            }
        }

        res.json(res.locals.items);
        delete res.locals.items;

    } else if (res.locals.processed) {
        res.set('Content-Type', 'application/json'); // not really necessary if "no content"
        if (res.get('Status-Code') == undefined) { // maybe other code has set a better status code before
            res.status(codes.nocontent); // no content;
        }
        res.end();
    } else {
        next(); // will result in a 404 from app.js
    }
});

module.exports = router;