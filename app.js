/** Main app for server to start a small REST API for pictures ("for picture gallery web frontend")
 * The used simple-memory-store gives you access to a "database" which contains
 * nothing this time.
 * On each restart the db will be reset (it is only in memory).
 *
 * Note: set your environment variables
 * NODE_ENV=development
 * DEBUG=we2:*
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

process.env.NODE_ENV= 'development';
process.env.DEBUG= 'we2:*';


const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const bodyParser = require('body-parser');
const requestLogger = require('morgan');
const debug = require('debug')('we2:server');

// own modules
const HttpError = require('./restapi/http-error.js');
const restAPIchecks = require('./restapi/request-checks.js');
const pictures = require('./routes/pictures');
const users = require('./routes/users');
const filterError = require('./restapi/filter-error');
const filterMiddleware = require('./restapi/filter-middleware');


// app creation
const app = express();



// Middlewares *************************************************
app.use(favicon(path.join(__dirname, 'public', 'images/faviconbeuth.ico')));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.json());

// logging
app.use(requestLogger('dev'));

// API request checks for API-version and JSON etc.
app.use(restAPIchecks);


app.use(filterError);

// Routes ******************************************************
app.use('/users', users);
app.use('/pictures', pictures);




app.use(filterMiddleware);


// (from express-generator boilerplate)
// Errorhandling and requests without proper URLs ************************
// catch 404 and forward to error handler
app.use(function(req, res, next) {
    debug('Catching unmatched request to answer with 404');
    const err = new HttpError('Not Found', 404);
    next(err);
});


// error handlers (express recognizes it by 4 parameters!)
// development error handler
// will print stacktrace as JSON response
if (app.get('env') === 'development') {
    app.use((err, req, res, next) => {
        let errorInformation = {
            error: {
                statuscode: err.status,
                message: err.message,
                path: req.path,
                error: err.stack.toString()
            }
        };
        console.log(`Error to send: ${JSON.stringify(errorInformation, null, 2)}`);
        res.status(err.status || 500);
        res.json(errorInformation);
    });
}
else {
    // production error handler
    // no stacktraces leaked to client
    app.use(function (err, req, res, next) {
        let errType = "Error";
        try { errType = err.constructor.name; } catch (e) {}
        res.status(err.status || 500);
        res.json({
            error: {
                statuscode: err.status,
                message: err.message,
                path: req.path,
                error: errType
            }
        });
    });
}


// Start server ****************************
app.listen(3000, (err) => {
    if (err !== undefined) {
        console.log(`Error on startup: ${err}`);
    }
    else {
        console.log('Listening on port 3000');
    }
});