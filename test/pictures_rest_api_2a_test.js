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

// start of tests ********************************************************************************
describe('Task 2.a Filter', () => {
    let pictureCorrect1Result = null;
    let pictureCorrect2Result = null;
    const pictureIDsCleanup = [];
    describe('/pictures REST API Filtering', () => {
        // ask for correct filters
        it('should again create a picture on POST', (done) => {
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
                    res.body.should.have.property('id').above(0);
                    pictureCorrect1Result = res.body;
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should correctly filter pictures by given keys title,src', (done) => {
                request(pictureURL)
                .get('/'+pictureCorrect1Result.id+'?filter=src,title')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect('Content-Type', /json/)
                .expect(codes.success)
                .end(function(err, res){
                    should.not.exist(err);
                    res.should.be.json();
                    res.body.should.have.keys('src', 'title');
                    res.body.should.not.have.keys('description', 'width', 'height');
                    res.body.should.have.property('title', pictureCorrect1Result.title);
                    done();
                });
        });
        it('should again create a picture on POST', (done) => {
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
                    res.body.should.have.properties(Object.getOwnPropertyNames(pictureCorrect3));
                    res.body.should.have.property('id').above(0);
                    pictureCorrect2Result = res.body;
                    pictureIDsCleanup.push(res.body.id);
                    done();
                });
        });
        it('should detect bad filter parameters (not existing) and return status 400', (done) => {
            request(pictureURL)
                .get('/'+pictureCorrect2Result.id+'?filter=sCR,title')
                .set('Accept-Version', '1.0')
                .set('Accept', 'application/json')
                .expect(codes.wrongrequest)
                .end(function(err, res){
                    should.not.exist(err);
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
        };
        if (numDone === 0) {
            done();
        }
    });
});
