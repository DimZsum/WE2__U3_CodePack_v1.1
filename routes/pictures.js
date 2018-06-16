/** This module defines the routes for pictures using the simple-memory-store as db memory
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module routes/pictures
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module  (to set module.exports)
// 3.) exports (which is module.exports)

// modules
const express = require('express');
const logger = require('debug')('we2:pictures');
const store = new (require('simple-memory-store'))();
const codes = require('../restapi/http-codes'); // if you like, you can use this for status codes, e.g. res.status(codes.success);
const HttpError = require('../restapi/http-error.js');

const pictures = express.Router();

const storeKey = 'pictures';


// TODO if you like, you can use these objects for easy checking of required/optional and internalKeys....or remove it.
// const requiredKeys = {width: 'number', height: 'number', src: 'string'};
// const optionalKeys = {title: 'string', description: 'string', views: 'number'};
// const internalKeys = {id: 'number', timestamp: 'number'};
const generalKey = {
    width: 'number',
    height: 'number',
    src: 'string',
    title: 'string',
    description: 'string',
    views: 'number',
    id: 'number',
    timestamp: 'number'
};
const queries = {offset: 'number', filter: 'string', limit: 'number'};

//Middleware checks JSON Body

pictures.use((req, res, next) => {

    if (['PUT', 'POST', 'PATCH'].includes(req.method)) {
        Object.keys(req.body).forEach((elem) => {
            if (!(elem in generalKey)) {
                let err = new HttpError('Wrong Body!', 400);
                next(err);
                return;
            }
        })
    }


    if (req.method === 'POST') {
        if (typeof req.body.width !== 'number' || req.body.width < 0 ||
            typeof req.body.height !== 'number' || req.body.height < 0 ||
            typeof req.body.src !== 'string') {
            let err = new HttpError('Missing or Wrong required Data!', 400);
            next(err);
            return;
        }
    }

    if (['PATCH'].includes(req.method)) {
        Object.keys(req.body).forEach((elem) => {
            if (elem !== 'views') {
                let err = new HttpError('Bad Patch Body', 400);
                next(err);
                return;
            }
        });

        if (req.body.views[0] !== '+') {
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
        const views = req.body.views.slice(1, req.body.views.length);
        if (isNaN(views) || views < 0) {
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
    }


    if (['PUT', 'POST'].includes(req.method)) {
        if (req.body.title && (typeof req.body.title !== 'string' || req.body.title.length > 140)) {
            let err = new HttpError('Title too long!', 400);
            next(err);
            return;
        }
        if (req.body.description && (typeof req.body.description !== 'string' || req.body.description.length > 1000)) {
            let err = new HttpError('Description too long!', 400);
            next(err);
            return;
        }
        if (req.body.views && (typeof req.body.views !== 'number' || req.body.views < 0)) {
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
    }

    if (req.method === 'GET') {

        for (let prop in req.query) {
            if (!(prop in queries) && !(prop in generalKey)) {
                let err = new HttpError('bad query!', 400);
                next(err);
                return;
            }
        }

        let filterParams;
        if (req.query.filter) {
            filterParams = req.query.filter.split(',');
            console.log(filterParams);
            filterParams.forEach((elem) => {
                if (!(elem in generalKey)) {
                    let err = new HttpError('filter key does not exist!', 400);
                    next(err);
                }
            });
        }
        if (req.query.offset) {
            if (isNaN(req.query.offset) || req.query.offset < 0) {
                let err = new HttpError('bad offset param!', 400);
                next(err);
            }
        }

        if (req.query.limit) {
            if (isNaN(req.query.limit) || req.query.limit < 1) {
                let err = new HttpError('bad limit param!', 400);
                next(err);
            }
        }
    }


    next();
});

/* GET all pictures */
pictures.route('/')
    .get((req, res, next) => {

        res.locals.items = store.select(storeKey);
        res.locals.processed = true;
        logger("GET fetched store items");

        next();
    })
    .post((req, res, next) => {

        let picture = {
            timestamp: new Date().getTime(),
            width: req.body.width,
            height: req.body.height,
            src: req.body.src,
            title: req.body.title ? req.body.title : '',
            description: req.body.description ? req.body.description : '',
            views: req.body.views ? req.body.views : 0
        };
        let result = store.insert(storeKey, picture);
        res.status(201).json(result);
        delete result;
    })
    .all((req, res, next) => {
        if (res.locals.processed) {
            next();
        } else {
            // reply with status code "wrong method"  405
            let err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    });

// TODO implement
// pictures.route('/:id').....

pictures.route('/:id')
    .get((req, res, next) => {
        res.locals.items = store.select(storeKey, req.params.id);
        res.locals.processed = true;

        if (req.query.filter) {
            const filterParams = req.query.filter.split(',');
            Object.keys(res.locals.items).forEach((key) => {
                if (!filterParams.includes(key)) {
                    delete res.locals.items[key];
                }
            });
        }

        logger("GET fetched store items");
        next();
    })
    .put((req, res, next) => {
        res.locals.items = store.select(storeKey, req.params.id);
        res.locals.processed = true;
        let buffer = res.locals.items;
        buffer = {
            timestamp: new Date().getTime(),
            width: req.body.width !== undefined ? req.body.width : buffer.width,
            height: req.body.height !== undefined ? req.body.height : buffer.height,
            src: req.body.src !== undefined ? req.body.src : buffer.src,
            title: req.body.title !== undefined ? req.body.title : buffer.title,
            description: req.body.description !== undefined ? req.body.description : buffer.description,
            views: req.body.views !== undefined ? req.body.views : buffer.views,
            id: buffer.id
        };
        store.replace(storeKey, req.params.id, buffer);
        const result = store.select(storeKey, req.params.id);
        res.status(200).json(result);
    })
    .patch((req, res, next) => {
        let buffer = store.select(storeKey, req.params.id);
        if (!buffer) {
            let err1 = new HttpError('Not Found ', 404);
            next(err1);
        }
        buffer.views = buffer.views + parseInt(req.body.views.slice(1, req.body.views.length));
        store.replace(storeKey, req.params.id, buffer);
        res.locals.items = store.select(storeKey,req.params.id);
        res.locals.processed = true;
        res.status(200).json(res.locals.items);
    })
    .delete((req, res, next) => {
        res.locals.processed = true;
        try {
            store.remove(storeKey, req.params.id);

        } catch (err) {
            let err1 = new HttpError('Not Found ', 404);
            next(err1);
        }

        next();
    })
    .all((req, res, next) => {
        if (res.locals.processed) {
            next()
        } else {
            let err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    });


/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON) or, if nothing left, will send a 204.
 */
pictures.use((req, res, next) => {
    if (res.locals.items) {

        // Search by Prop

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

        // filter function
        if (req.query.filter) {
            const filterParams = req.query.filter.split(',');
            res.locals.items.forEach((elem) => {
                Object.keys(elem).forEach((key) => {
                    if (!filterParams.includes(key)) {
                        delete elem[key];
                    }
                });
            });
        }
        // offset function
        if (req.query.offset) {
            if (req.query.offset >= res.locals.items.length) {
                let err = new HttpError('Bad Offset Parameter', 400);
                next(err);
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
            res.status(204); // no content;
        }
        res.end();
    } else {
        next(); // will result in a 404 from app.js
    }
});

module.exports = pictures;
