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
const requiredKeys = {width: 'number', height: 'number', src: 'string'};
const optionalKeys = {title: 'string', description: 'string', views: 'number'};
const internalKeys = {id: 'number', timestamp: 'number'};

//Middleware checks JSON Body

pictures.use((req, res, next) => {

    if (req.method === 'POST') {
        if (typeof req.body.width !== 'number' || req.body.width < 0 ||
            typeof req.body.height !== 'number' || req.body.height < 0||
            typeof req.body.src !== 'string') {
            let err = new HttpError('Missing or Wrong required Data!', 400);
            next(err);
            return;
        }
    }

    if (['PUT', 'POST'].includes(req.method)) {
        if (req.body.title && (typeof req.body.title !== 'string' || req.body.title.length > 140)){
            let err = new HttpError('Title too long!', 400);
            next(err);
            return;
        }
        if (req.body.description && (typeof req.body.description !== 'string' || req.body.description.length > 1000)){
            let err = new HttpError('Description too long!', 400);
            next(err);
            return;
        }
        if (req.body.views && (typeof req.body.views !== 'number' || req.body.views < 0)){
            let err = new HttpError('views is wrong', 400);
            next(err);
            return;
        }
        if (!(/application\/json/.test(req.get('Content-Type')))){
            let err = new HttpError('you sent wrong Content-Type', 415);
            next(err);
            return;
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
        // if (picture.height == '')s
        let result = store.insert(storeKey, picture);
        res.status(201).json(result);
        // let err = new HttpError('Unimplemented method!', codes.servererror);
        // next(err);
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
    .get((req,res,next) => {
        res.locals.items = store.select(storeKey,req.body.params);
        res.locals.processed = true;
        logger("GET fetched store items");
        next();
    })
    .put((req,res,next) => {
        let buffer = store.select(storeKey,req.params.id);
        if (!buffer){
            let err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
            next(err);
        }
        if (buffer.id !== req.body.id){
            let err = new HttpError('Bad ID ' + req.originalUrl, 400);
            next(err);
        }

        buffer = {
            timestamp: new Date().getTime(),
            width: req.body.width !== undefined ? req.body.width : buffer.width,
            height: req.body.height !== undefined ? req.body.height : buffer.height,
            src: req.body.src !== undefined ? req.body.src : buffer.src,
            title: req.body.title !== undefined ? req.body.title : buffer.title,
            description: req.body.description !== undefined ? req.body.description : buffer.description,
            views: req.body.views!== undefined ? req.body.views : buffer.views,
            id: buffer.id
        };
        store.replace(storeKey, req.params.id, buffer);
        const result = store.select(storeKey,req.params.id)
        res.status(200).json(result);
    })
    .all((req,res,next) => {
       if (res.locals.processed) {
           next()
       }  else {
           let err = new HttpError('this method is not allowed at ' + req.originalUrl, codes.wrongmethod);
           next(err);
       }
    });



/**
 * This middleware would finally send any data that is in res.locals to the client (as JSON) or, if nothing left, will send a 204.
 */
pictures.use((req, res, next) => {
    if (res.locals.items) {
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
