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

const correctPut = cfg.pictureCorrect5;
const wrongPut = cfg.pictureWrongPatch1;
const wrongID = cfg.pictureWrongID2;
const wrongPatch2 = cfg.pictureWrongPatch4;

// start of tests ********************************************************************************
describe.skip('Task 3.b patch', () => {
    let pictureCorrect1Result = null;
    let pictureCorrect2Result = null;
    const pictureIDsCleanup = [];
    let myTime = new Date().getTime() - 61 * 1000 * 60; // remember time - 61min (to allow 1h shifts)

    describe('/pictures REST API POST', () => {
        // good POSTs
        it('save proper Post for patching 1', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMin)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrectMin));
                    res.body.should.have.property('id').above(0);
                    res.body.should.have.properties(['timestamp', 'views', 'description', 'title']);
                    res.body.should.have.property('description', '');
                    pictureCorrect1Result = res.body; // (not part of test) remember result for cleanup later
                    pictureIDsCleanup.push(res.body.id); // (not part of test) remember result for cleanup later
                    done(err);
                })
        });
        it('save proper Post for patching 2', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrectMax)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
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
        // *******************************************************
        describe('/pictures/:id REST API patch', function () {
            // good PUTs
            it('should save a proper patch with required fields and change in views set to 1', (done) => {
                request(pictureURL)
                    .patch('/' + pictureCorrect1Result.id)
                    .set('Accept-Version', '1.0')
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send(correctPut)
                    .expect('Content-Type', /json/)
                    .expect(codes.success)
                    .end(function (err, res) {
                        should.not.exist(err);
                        res.should.be.json();
                        res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrect1Result));
                        res.body.should.have.property('id', pictureCorrect1Result.id);
                        res.body.should.have.property('views', pictureCorrect1Result.views + 1);
                        done(err);
                    })
            });

            it('should detect wrong views and send 400', (done) => {
                pictureCorrect2Result.views = 13;
                request(pictureURL)
                    .patch('/' + pictureCorrect2Result.id)
                    .set('Accept-Version', '1.0')
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send(wrongPatch2)
                    .expect('Content-Type', /json/)
                    .expect(codes.wrongrequest)
                    .end(function (err, res) {
                        should.not.exist(err);
                        done(err);
                    })
            });


            it('should detect bad body and send 400', (done) => {
                pictureCorrect2Result.views = 13;
                request(pictureURL)
                    .patch('/' + pictureCorrect2Result.id)
                    .set('Accept-Version', '1.0')
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send(wrongPut)
                    .expect('Content-Type', /json/)
                    .expect(codes.wrongrequest)
                    .end(function (err, res) {
                        should.not.exist(err);
                        done(err);
                    })
            });

            it('should detect a PUT to wrong URL (/pictures/999) this id does not exist and answer with code 404', (done) => {
                request(pictureURL)
                    .patch('/' + wrongID.id)
                    .set('Accept-Version', '1.0')
                    .set('Accept', 'application/json')
                    .set('Content-Type', 'application/json')
                    .send(correctPut)
                    .expect(codes.notfound)
                    .end(function(err, res) {
                        should.not.exist(err);
                        done(err);
                    })
            });

        });
    });

}
);