const express = require('express');
const logger = require('debug')('we2:pictures');
const store = new (require('simple-memory-store'))();
const codes = require('../restapi/http-codes'); // if you like, you can use this for status codes, e.g. res.status(codes.success);
const HttpError = require('../restapi/http-error.js');
const bcrypt = require('bcrypt');


const saltRounds = 10;

const users = express.Router();

const storeKey = 'users';

const requiredKeys = {
  firstname: 'string',
  lastname: 'string,',
  password: 'string',
};

users.use((req,res,next) => {
    if (req.method === 'POST') {
        Object.keys(requiredKeys).forEach((key)=> {
            if(!(key in req.body)){
                let err = new HttpError('Missing or Wrong required Data!', 400);
                next(err);
                return;
            }
        });
    }
    next();
});


users.route('/')
    .get((req, res, next) => {

        res.locals.items = store.select(storeKey);
        res.locals.processed = true;
        logger("GET fetched store items");

        next();
    })
    .post((req, res, next) => {

        let bufferPassword = '';
        bcrypt.hash(req.body.password, saltRounds, (err, hash) => {
            bufferPassword = hash;
            let user = {
                timestamp: new Date().getTime(),
                firstname: req.body.firstname,
                lastname: req.body.lastname,
                password: bufferPassword,
                favourites: []
            };

            res.locals.items = store.insert(storeKey, user);;
            res.locals.processed = true;
            res.status(201);
            next();
        });
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


users.route('/:id')
    .get((req, res, next) => {
        res.locals.items = store.select(storeKey, req.params.id);
        res.locals.processed = true


        logger("GET fetched store items");
        next();
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

module.exports = users;

