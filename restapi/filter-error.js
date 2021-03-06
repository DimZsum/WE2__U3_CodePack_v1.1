const router = require('express').Router();
const HttpError = require('./http-error');
const codes = require('./http-codes');

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
router.use((req,res,next) => {
    let generalKey = {};
    generalKey = req.originalUrl.includes('/pictures') ? pictureKey : userKey;
    console.log(generalKey);
    if (req.query.filter) {
        let filterParams;


        // checks if filter keys are correct
        filterParams = req.query.filter.split(',');
        filterParams.forEach((elem) => {
            if (!(elem in generalKey)) {
                let err = new HttpError('filter key does not exist!', 400);
                next(err);
            }
        });
    }

    // checks if offset is correct
    if (req.query.offset) {
        if (isNaN(req.query.offset) || req.query.offset < 0) {
            let err = new HttpError('bad offset param!', 400);
            next(err);
        }
    }

    // checks if limit is correct
    if (req.query.limit) {
        if (isNaN(req.query.limit) || req.query.limit < 1) {
            let err = new HttpError('bad limit param!', 400);
            next(err);
        }
    }

    next();
});

module.exports = router;


