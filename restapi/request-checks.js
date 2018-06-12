/** This module defines a express.Router() instance
 * - checking Accept-Version header to be 1.0
 * - body-data to be JSON on POST/PUT/PATCH
 * - body to be not empty on POST/PUT/PATCH
 * - Request accepts JSON as reply content-type
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module restapi/request-checks
 * @type {Router}
 */

// remember: in modules you have 3 variables given by CommonJS
// 1.) require() function
// 2.) module  (to set module.exports)
// 3.) exports (which is module.exports)

const router = require('express').Router();
const HttpError = require('./http-error');
const codes = require('./http-codes');

// API-Version control. We use HTTP Header field Accept-Version instead of URL-part /v1/
router.use(function(req, res, next){
    // expect the Accept-Version header to be NOT set or being 1.0
    let versionWanted = req.get('Accept-Version');
    if (versionWanted !== undefined && versionWanted !== '1.0') {
        // 406 Accept-* header cannot be fulfilled.
        res.status(406).send('Accept-Version cannot be fulfilled').end();
        return;
    }
    next(); // all OK, call next handler
});

// request type application/json check
router.use(function(req, res, next) {
    if (['POST', 'PUT', 'PATCH'].indexOf(req.method) > -1 &&
        !( /application\/json/.test(req.get('Content-Type')) )) {
        // send error code 415: unsupported media type
        let err = new HttpError('you sent wrong Content-Type', codes.wrongmediasend); // user has SEND the wrong type
        next(err);
        return; // important to avoid code to continue after next(err) returns.
    }
    if (!req.accepts('json')) {
        // send 406 that response will be application/json and request does not support it by now as answer
        let err = new HttpError('only response of application/json supported, please accept this', codes.wrongdatatyperequest); // user has REQUESTED the wrong type
        next(err);
        return;
    }
    next(); // let this request pass through as it is OK
});


// request POST, PUT check that any content was send
router.use(function(req, res, next) {
    let err = undefined;
    if (['POST', 'PUT', 'PATCH'].indexOf(req.method) > -1 && parseInt(req.get('Content-Length')) === 0) {
        err = new HttpError("content in body is missing", 400);
        next(err);
    } else if ('PUT' === req.method && !(req.body.id || req.body._id)) {
        err = new HttpError("content in body is missing field id or _id", 400);
        next(err);
    } else {
        next();
    }
});

module.exports = router;