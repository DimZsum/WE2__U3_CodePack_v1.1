/** This is a testfile to be run wit mocha.
 *  Remember to start your nodeJS server before and edit config_for_tests for a proper baseURL.
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

const should = require('should');
require('should-http');  // this patches global object
const request = require('supertest');
const cfg = require('./config_for_tests');

const baseURL = cfg.baseURL; // please change it in file config_for_tests.js
const pictureURL = cfg.pictureURL;


// some helper objects and function to be send to node ********************************************
const codes = cfg.codes;
const pictureCorrectMin = cfg.pictureCorrectMin;
const pictureCorrectMax = cfg.pictureCorrectMax;

// start of tests ********************************************************************************
describe('Task 1.a CRUD', () => {
    let pictureCorrect1Result = null;
    let pictureCorrect2Result = null;
    const pictureIDsCleanup = [];
    let myTime = new Date().getTime() - 61*1000*60; // remember time - 61min (to allow 1h shifts)
    describe('/pictures REST API POST', () => {
        // good POSTs
        it('should save a proper POST (and add all missing fields) and sends back the complete object with id, timestamp etc.', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMin)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function(err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrectMin));
                    res.body.should.have.property('id').above(0);
                    res.body.should.have.properties(['timestamp','views', 'description', 'title']);
                    res.body.should.have.property('description', '');
                    pictureCorrect1Result = res.body; // (not part of test) remember result for cleanup later
                    pictureIDsCleanup.push(res.body.id); // (not part of test) remember result for cleanup later
                    done(err);
                })
        });
        it('should save a proper POST (with all fields) and send back the object with id and timestamp', (done) => {
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
                    res.body.should.have.properties(['id', 'timestamp']);
                    res.body.id.should.be.above(0);
                    res.body.timestamp.should.be.above(myTime);
                    res.body.should.have.property('views', pictureCorrectMax.views);
                    res.body.should.have.property('title', pictureCorrectMax.title);
                    res.body.should.have.property('description', pictureCorrectMax.description);
                    pictureCorrect2Result = res.body;
                    pictureIDsCleanup.push(res.body.id);
                    done(err);
                })
        });

        // bad POSTs
        it('should detect a post to wrong URL (/pictures/:id) and answer with code 405', (done) => {
            request(pictureURL)
                .post('/123')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMax)
                .expect(codes.wrongmethod)
                .end(function(err, res) {
                    should.not.exist(err);
                    if (res.body && res.body.id) {  // usually your body should be empty if correct implemented
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done(err);
                })
        });
        // bad POST, body contains nonsense (not JSON)
        it('should detect a post with bad body and send status 400', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send('this is not proper JSON')
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    if (res.body && res.body.id) { // usually your body should be empty if correct implemented
                        pictureIDsCleanup.push(res.body.id);
                    }
                    done(err);
                })
        });
    });
    // *******************************************************
    describe('/pictures/:id REST API PUT', function() {
        // good PUTs
        it('should save a proper PUT with required fields and change in .description set to ""', (done) => {
            pictureCorrect1Result.description = "";
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
                    res.body.should.have.property('description', pictureCorrect1Result.description);
                    done(err);
                })
        });
        it('should save a proper PUT with all fields and change in .views', (done) => {
            pictureCorrect2Result.views = 13;
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
                    done(err);
                })
        });

        // bad PUTs
        it('should detect a PUT to wrong URL (/pictures/ without id) and answer with code 405', (done) => {
            request(pictureURL)
                .put('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect1Result)
                .expect(codes.wrongmethod)
                .end(function(err, res) {
                    should.not.exist(err);
                    done(err);
                })
        });
        // bad PUT, body contains nonsense (not JSON)
        it('should detect a PUT with bad body and send status 400', (done) => {
            request(pictureURL)
                .put('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send('this is not proper JSON')
                .expect(codes.wrongrequest)
                .end(function(err, res) {
                    should.not.exist(err);
                    done(err);
                })
        });
    });
    // *******************************************************
    describe('/pictures/:id REST API DELETE', () => {
        // good DELETEs
        it('should properly delete and answer with code 204', (done) => {
            request(pictureURL)
                .delete('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(codes.nocontent)
                .end(function(err, res) {
                    should.not.exist(err);
                    done(err);
                })
        });
        // bad DELETEs
        it('should properly detect if a resource does not exist for delete and answer with code 404', (done) => {
            request(pictureURL)
                .delete('/'+pictureCorrect1Result.id)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(codes.notfound)
                .end(function(err, res) {
                    should.not.exist(err);
                    done(err);
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
