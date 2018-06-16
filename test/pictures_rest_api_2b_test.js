/** This is a testfile to be run wit mocha.
 *  Remember to start your nodeJS server before and edit config_for_tests for a proper baseURL.
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 */
"use strict";

const should = require('should');
require('should-http'); // this patches global object
const request = require('supertest');
const cfg = require('./config_for_tests');

const baseURL = cfg.baseURL; // please change it in file config_for_tests.js
const pictureURL = cfg.pictureURL;


// some helper objects and function to be send to node ********************************************
const codes = cfg.codes;
const pictureCorrectMin = cfg.pictureCorrectMin;
const pictureCorrectMax = cfg.pictureCorrectMax;
const pictureCorrect3 = cfg.pictureCorrect3;
const pictureCorrect4 = cfg.pictureCorrect4;

// start of tests ********************************************************************************
describe.skip('Task 2.b Limits and Offset', () => {
    const pictureResults = [];
    let totalResults = [];
    let total = 0;
    const pictureIDsCleanup = [];
    describe('/pictures REST API Filling by POSTS (Preparation...)', () => {
        // ask for correct filters
        it('should again create a picture on POST', (done) => {
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
                    res.body.should.have.property('id').above(0);
                    pictureResults.push(res.body);
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should again create a 2. picture on POST', (done) => {
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
                    res.body.should.have.property('id').above(0);
                    pictureResults.push(res.body);
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should again create a 3. picture on POST', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect3)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('id').above(0);
                    pictureResults.push(res.body);
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should again create a 4. picture on POST', (done) => {
            request(pictureURL)
                .post('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .set('Content-Type', 'application/json')
                .send(pictureCorrect4)
                .expect('Content-Type', /json/)
                .expect(codes.created)
                .end(function (err, res) {
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.property('id').above(0);
                    pictureResults.push(res.body);
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should deliver all pictures without any limits or offsets', (done) => {
            request(pictureURL)
                .get('/')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.above(3);
                    total = res.body.length;
                    totalResults = res.body;
                    done();
                });
        });
    });
    // here start the real limit/offset tests with the data inserted above **************
    describe("now testing limit and offset", () => {
        it('should deliver 2 pictures less on offset=2', (done) => {
            request(pictureURL)
                .get('/?offset=2')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.equal(total - 2);
                    res.body[0].should.containEql(totalResults[2]);
                    done();
                });
        });
        it('should deliver all pictures on offset=0', (done) => {
            request(pictureURL)
                .get('/?offset=0')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.equal(total);
                    res.body[0].should.containEql(totalResults[0]);
                    res.body[total-1].should.containEql(totalResults[total-1]);
                    done();
                });
        });
        it('should deliver only the first picture on limit=1', (done) => {
            request(pictureURL)
                .get('/?limit=1')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.equal(1);
                    res.body[0].should.containEql(totalResults[0]);
                    done();
                });
        });
        it('should deliver the last 2 items on offset=[number of pictures - 2]&limit=100', (done) => {
            request(pictureURL)
                .get('/?limit=100&offset='+(total-2))
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.equal(2);
                    res.body[0].should.containEql(totalResults[total-2]);
                    res.body[1].should.containEql(totalResults[total-1]);
                    done();
                });
        });
        it('should deliver the 2. and 3. element on offset=1&limit=2', (done) => {
            request(pictureURL)
                .get('/?limit=2&offset=1')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.length.should.be.equal(2);
                    res.body[0].should.containEql(totalResults[1]);
                    res.body[1].should.containEql(totalResults[2]);
                    done();
                });
        });
        // bad offset/limit values
        it('should detect a negative number in offset and send status 400', (done) => {
            request(pictureURL)
                .get('/?offset=-1')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    done();
                });
        });
        it('should detect a negative number in limit and send status 400', (done) => {
            request(pictureURL)
                .get('/?limit=-1')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    done();
                });
        });
        it('should detect a nonsense value in offset and limit and send status 400', (done) => {
            request(pictureURL)
                .get('/?limit=no&offset=print')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    done();
                });
        });
        it('should not allow a limit of 0 and send status 400', (done) => {
            request(pictureURL)
                .get('/?limit=0&offset=1')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    done();
                });
        });
        it('should not allow an offset equal or beyond the length of list and send status 400', (done) => {
            request(pictureURL)
                .get('/?limit=2&offset='+total)
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    done();
                });
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
                .end(() => {
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
