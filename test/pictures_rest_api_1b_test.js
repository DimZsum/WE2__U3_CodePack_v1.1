/** This is a testfile to be run wit mocha.
 *  Remember to start your nodeJS server before and edit config_for_tests for a proper baseURL.
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

const should = require('should');
require('should-http'); // this patches global object
const request = require('supertest');
const cfg = require('./config_for_tests');

const baseURL = cfg.baseURL; // please change it in file config_for_tests.js
const pictureURL = cfg.pictureURL;


// some helper objects and function to be send to node ********************************************
const codes = cfg.codes;
const pictureCorrectMin = cfg.pictureCorrectMin;
const pictureCorrectMax = cfg.pictureCorrectMax;
const pictureIncorrectNumber = cfg.pictureIncorrectNumber;
const pictureIncorrectNumberWidth = cfg.pictureIncorrectNumberWidth;
const pictureIncorrectTitle = cfg.pictureIncorrectTitle;
const pictureIncorrectDescription = cfg.pictureInCorrectDescription;

// start of tests ********************************************************************************
describe.skip('Task 1.b JSON Error data', () => {
    let pictureCorrect1Result = null;
    let pictureCorrect2Result = null;
    const pictureIDsCleanup = [];
    describe('/pictures REST API POST', () => {
        // good POSTs
        it('should save a proper POST with required fields and add all missing ones with default-values', (done) => {
            let startDate = new Date();
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMin)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function(err, res) {
                    let stopDate = new Date();
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrectMin));
                    res.body.should.have.property('id').above(0);
                    res.body.should.have.property('timestamp').within(startDate.getTime(), stopDate.getTime());
                    res.body.should.have.property('views', 0);
                    res.body.should.have.property('title', '');
                    res.body.should.have.property('description', '');
                    pictureCorrect1Result = res.body;
                    pictureIDsCleanup.push(res.body.id);
                    done();
                })
        });
        it('should save a proper POST with all fields', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMax)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrectMax));
                    res.body.should.have.property('id');
                    res.body.id.should.be.above(0);
                    res.body.width.should.equal(pictureCorrectMax.width);
                    res.body.height.should.equal(pictureCorrectMax.height);
                    res.body.views.should.equal(pictureCorrectMax.views);
                    res.body.title.should.equal(pictureCorrectMax.title);
                    res.body.description.should.equal(pictureCorrectMax.description);
                    pictureCorrect2Result = res.body;
                    pictureIDsCleanup.push(res.body.id);
                    done();
                })
        });

        // bad POSTs
        it('should detect a post with wrong numeric values in views and answer with statuscode 400 and with a JSON error object', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureIncorrectNumber)
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    if (res.body.id) { // in case the test failed and POST was saved
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
        it('should detect a post with wrong numeric value in width and answer with statuscode 400 and with a JSON error object', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureIncorrectNumberWidth)
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    if (res.body.id) { // in case the test failed and POST was saved
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
        it('should detect a POST with wrong title value and answer with statuscode 400 and with a JSON error object', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureIncorrectTitle)
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    if (res.body.id) { // in case the test failed and POST was saved
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
        it('should detect a POST with wrong description value and answer with statuscode 400 and with a JSON error object', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureIncorrectDescription)
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    if (res.body.id) { // in case the test failed and POST was saved
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done();
                })
        });
    });
    // *******************************************************
    describe('/pictures/:id REST API PUT', () => {
        // good PUTs
        it('should save a proper PUT with required fields and change in .views', (done) => {
            pictureCorrect1Result.views = 4*60+2;
            request(pictureURL)
                .put('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect1Result)
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrect1Result));
                    res.body.should.have.property('id', pictureCorrect1Result.id);
                    res.body.should.have.property('views', pictureCorrect1Result.views);
                    done();
                })
        });
        it('should save a proper PUT with all fields and change in .views', (done) => {
            pictureCorrect2Result.views = 130;
            request(pictureURL)
                .put('/'+pictureCorrect2Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect2Result)
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrect2Result));
                    res.body.should.have.property('id', pictureCorrect2Result.id);
                    res.body.should.have.property('views', pictureCorrect2Result.views);
                    done();
                })
        });

        // bad PUTs
        it('should detect a PUT to wrong URL (/pictures/ without id) and answer with statuscode 405 and with a JSON error object', (done) => {
            request(pictureURL)
                .put('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect1Result)
                .expect('Content-Type', /json/)
                .expect(codes.wrongmethod)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    done();
                })
        });
        // bad PUT, body contains nonsense (not JSON)
        it('should detect a PUT with bad body and send statuscode 400 and with a JSON error object', (done) => {
            request(pictureURL)
                .put('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send('this is not proper JSON')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    done();
                })
        });
        // bad PUT, body contains nonsense (not JSON)
        it('should detect a PUT with missing id in body and send statuscode 400 and with a JSON error object', (done) => {
            let pictureCorr1CopyNoId = JSON.parse(JSON.stringify(pictureCorrect1Result));
            delete pictureCorr1CopyNoId.id;
            request(pictureURL)
                .put('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorr1CopyNoId)
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    done();
                })
        });
    });
    // *******************************************************
    describe('/pictures/:id REST API DELETE', () => {
        // good DELETEs
        it('should properly delete and answer with statuscode 204', (done) => {
            request(pictureURL)
                .delete('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(codes.nocontent)
                .end(function(err, res) {
                    should.not.exist(err);
                    done();
                })
        });
        // bad DELETEs
        it('should properly detect if a resource does not exist for delete and answer with statuscode 404 and with a JSON error object', (done) => {
            request(pictureURL)
                .delete('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.notfound)
                .expect('Content-Type', /json/)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('error');
                    res.body.error.should.have.properties('message', 'statuscode');
                    done();
                })
        });
    });
    // delete the  posted pictures at end if not already deleted...
    after((done) => {
        let numDone = pictureIDsCleanup.length;
        for (let i = 0; i < pictureIDsCleanup.length; i++) {
            request(pictureURL)
                .delete('/' + pictureIDsCleanup[i])
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(true)
                .end(function() {
                    if (--numDone === 0) {
                        done();
                    }
                });
        }
        if (numDone === 0) {
            done();
        }
    });
});
