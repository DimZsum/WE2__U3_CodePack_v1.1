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

//constant for pictures like a libary
const storeKey = 'pictures';
const userKey = 'users';


// TODO if you like, you can use these objects for easy checking of required/optional and internalKeys....or remove it.
const requiredKeys = {width: 'number', height: 'number', src: 'string'};


pictures.use((req, res, next) => {
//Tests for failure
    //asks if json body is in requiredKeys
    if (req.method === 'POST') {
        Object.keys(requiredKeys).forEach((key)=> {
            if(!(key in req.body)){
                let err = new HttpError('Missing or Wrong required Data!', 400);
                next(err);
                return;
            }
        });
    }

    //only allows to patch views
    if (['PATCH'].includes(req.method)) {
        Object.keys(req.body).forEach((elem) => {
            if (elem !== 'views') {
                let err = new HttpError('Bad Patch Body', 400);
                next(err);
                return;
            }
        });
        //view have to be posivite
        if (req.body.views[0] !== '+') {
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
        //get the number
        const views = req.body.views.slice(1, req.body.views.length);
        if (isNaN(views) || views < 0) {
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
    }


    //testing if put and post is correct
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
        if (req.body.width && (typeof req.body.width !== 'number' || req.body.width < 0)) {
            let err = new HttpError('width is wrong', 400);
            next(err);
            return;
        }
        if (req.body.height && (typeof req.body.height !== 'number' || req.body.height < 0)) {
            let err = new HttpError('height is wrong', 400);
            next(err);
            return;
        }
        if (req.body.src && (typeof req.body.src !== 'string')) {
            let err = new HttpError('src is wrong', 400);
            next(err);
            return;
        }
    }
    next();
});

/* GET all pictures */
pictures.route('/')
    .get((req, res, next) => {
        //saves res json in locals.items
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

        res.locals.items = store.insert(storeKey, picture);;
        res.locals.processed = true;
        res.status(201);
        next();
    })
    //if not get or post we get a failure
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

        logger("GET fetched store items");
        next();
    })
    .put((req, res, next) => {
        //getting the object from the store
        let buffer = store.select(storeKey, req.params.id);
        //we change and save in buffer
        buffer = {
            timestamp: new Date().getTime(),
            //if its there then check if its undefined and get it or take the old value
            width: req.body.width !== undefined ? req.body.width : buffer.width,
            height: req.body.height !== undefined ? req.body.height : buffer.height,
            src: req.body.src !== undefined ? req.body.src : buffer.src,
            title: req.body.title !== undefined ? req.body.title : buffer.title,
            description: req.body.description !== undefined ? req.body.description : buffer.description,
            views: req.body.views !== undefined ? req.body.views : buffer.views,
            id: buffer.id
        };
        store.replace(storeKey, req.params.id, buffer);
        res.locals.items = store.select(storeKey, req.params.id);
        res.locals.processed = true;
        res.status(200);
        next();
    })
    .patch((req, res, next) => {
        let buffer = store.select(storeKey, req.params.id);
        if (!buffer) {
            let err1 = new HttpError('Not Found ', 404);
            next(err1);
        }
        //get old value of object and add it with new value for example 20 + 20 = 40
        buffer.views = buffer.views + parseInt(req.body.views.slice(1, req.body.views.length));
        store.replace(storeKey, req.params.id, buffer);
        res.locals.items = store.select(storeKey,req.params.id);
        res.locals.processed = true;
        res.status(200);
        next();
    })
    .delete((req, res, next) => {
        res.locals.processed = true;
        try {
            store.remove(storeKey, req.params.id);

            // delete pictures in User.favourites

            const users = store.select(userKey);
            if(users){
                users.forEach((elem)=> {
                    console.log(elem);
                    elem.favourites.forEach((picId,index)=>{
                        if (picId === parseInt(req.params.id,10)) {
                            delete elem.favourites[index];
                        }
                    });
                    // delete all null Objects
                    elem.favourites = elem.favourites.filter(elem=>elem);
                    store.replace(userKey,elem.id,elem);
                })

            }

        } catch (err) {
            let err1 = new HttpError('Not Found ', 404);
            next(err1);
        }

        next();
    })
    //if no method is usable we get a failure
    .all((req, res, next) => {
        if (res.locals.processed) {
            next()
        } else {
            let err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
    });

module.exports = pictures;
