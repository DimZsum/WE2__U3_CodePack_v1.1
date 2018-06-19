
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
    favourites: [],
    id: 'number'
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
        // filter by attributes 3.a
        //iterates through our database and checks if the attributes are included -> if not delete
        for (let query in req.query) {
            if (query in generalKey) {
                res.locals.items.forEach((elem, index) => {
                    if (req.query[query] != elem[query]) {
                        delete res.locals.items[index];
                    }
                });
                //delete every null object
                res.locals.items = res.locals.items.filter(elem => elem);
            }
        }

        // function to only show certain attributes 2.a
        if (req.query.filter) {
            const filterParams = req.query.filter.split(',');
            //if the res obj is an array iterate through it and delte the params we dont want
            if (res.locals.items.constructor === Array){
                res.locals.items.forEach((elem) => {
                    Object.keys(elem).forEach((key) => {
                        if (!filterParams.includes(key)) {
                            delete elem[key];
                        }
                    });
                });
                //if its not an array do the same for this object
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
        //deletes every object to offset
        if (req.query.offset) {
            //check if offset longer item length
            if (req.query.offset >= res.locals.items.length) {
                let err = new HttpError('Bad Offset Parameter', codes.wrongrequest);
                next(err);
                return;
            }
            res.locals.items.splice(0, req.query.offset);
        }


        // limit function
        //deletes from pos x everything
        if (req.query.limit) {
            //checks if limit is smaller than item length
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