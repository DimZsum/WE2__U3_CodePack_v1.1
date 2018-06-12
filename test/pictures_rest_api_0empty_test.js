/** This is a testfile to be run wit mocha.
 *  Remember to start your node server before and edit config_for_tests for a proper baseURL.
 *
 *
 *
 *
 *     This test only works for an EMPTY app data store. Restart nodeJS then.
 *
 *
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

// start of tests ********************************************************************************
describe('Clean /pictures REST API with empty store', () => {
    const pictureIDsCleanup = []; // will be used as temp-store in test...to cleanup pictures at the end
    
    it('should send status 204 and empty body on first request (empty database store)',  (done) =>{
        request(pictureURL)
            .get('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'application/json')
            .expect(codes.nocontent)
            .end((err, res) => {
                should.not.exists(err);  // this leads to immediate throw
                res.body.should.be.empty('ERR: make sure to run tests on fresh node server restart!');
                done(err);  // standard mocha wants done(err) to be called to detect errors, but we use should.not.exist(err) above that directly thows
            })
    });
    // check header fields
    it('should detect wrong Accept header and give status 406', (done) => {
        request(pictureURL)
            .post('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'text/plain')
            .set('Content-Type', 'application/json')
            .send(pictureCorrectMin)
            .expect('Content-Type', /json/)
            .expect(codes.wrongdatatyperequest)
            .end(function (err, res) {
                should.not.exists(err); // this leads to immediate throw
                if (!err && res.body && res.body.id) {
                  pictureIDsCleanup.push(res.body.id); // remember for delete at end...
                }
                done(err);
            })
    });
    it('should detect wrong Content-Type header and give status 415', (done) => {
        request(pictureURL)
            .post('/')
            .set('Accept-Version', '1.0')
            .set('Accept', 'application/json')
            .set('Content-Type', 'text/plain')
            .send(JSON.stringify(pictureCorrectMin))
            .expect('Content-Type', /json/)
            .expect(codes.wrongmediasend)
            .end(function (err, res) {
                should.not.exists(err); // this leads to immediate throw
                if (!err && res.body && res.body.id) {
                    pictureIDsCleanup.push(res.body.id); // remember for delete at end...
                }
                done(err);
            })
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
