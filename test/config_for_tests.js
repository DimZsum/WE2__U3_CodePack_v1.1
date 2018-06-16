/** This module defines some parameters for all tests and is included as a config to tests
 *
 * @author Johannes Konert
 * @licence CC BY-SA 4.0
 *
 * @module test/config-for-tests
 * @type {Object}
 */

// Please change the test base URL if you have different server:port
module.exports.baseURL = 'http://localhost:3000/';

// some helper objects and function to be send to node ********************************************
module.exports.pictureURL = module.exports.baseURL + 'pictures';
module.exports.codes = require('../restapi/http-codes');

module.exports.pictureCorrectMin = {
    width: 340,
    height: 200,
    src: "https://picsum.photos/340/200",
};

module.exports.pictureCorrectMax = {
    width: 480,
    height: 720,
    src: "https://picsum.photos/480/720",
    title: "Some nice picture in portrait mode",
    description: "Taken from picsum.photos as it is easier due to copyright regulations. Still a nice picture. And as it is random you nalways see something different on reload, uh.",
    views: 3992659
};
module.exports.pictureIncorrectNumber = {
    width: 1280,
    height: 720,
    src: "https://picsum.photos/1280/720",
    title: "Some nice picture in landscape mode (middle res)",
    description: "Taken from picsum.photos as it is easier due to copyright regulations. Still a nice picture. And as it is random you nalways see something different on reload, uh.",
    views: -12
};
module.exports.pictureIncorrectNumberWidth = {
    width: -1,
    height: 720,
    src: "https://picsum.photos/1/720",
    title: "Should not be saved!",
    description: " ",
    views: 66
};
module.exports.pictureIncorrectTitle = {
    width: 1280,
    height: 720,
    src: "https://picsum.photos/1280/720",
    title: "This title is one char too long. This title is one char too long. This title is one char too long.This title is one char too long. Thistitle ",
    description: "Taken from picsum.photos as it is easier due to copyright regulations. Still a nice picture. And as it is random you nalways see something different on reload, uh.",
    views: 54321
};
module.exports.pictureInCorrectDescription = {
    width: 4800,
    height: 720,
    src: "https://picsum.photos/4800/720",
    title: "A giant long picture",
    description: "Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. Whats is this? a far too long description. ",
    views: 0
};

module.exports.pictureCorrect3 = {
    width: 128,
    height: 128,
    src: "https://picsum.photos/128/128",
    title: "A small thumb picture",
    description: "As well taken from picsum.photos as it is easier due to copyright regulations. Still a nice picture. And as it is random you nalways see something different on reload, uh.",
    views: 0
};

module.exports.pictureCorrect4 = {
    width: 4800,
    height: 720,
    src: "https://picsum.photos/4800/720",
    title: "A giant long picture",
    description: "This picture was added to see later (Ü4) how well your layout handles this. Sorry about that challenge. ",
    views: 0
};

module.exports.pictureCorrect5 = {
    views: '+1'
};

module.exports.pictureWrongPatch1 = {
    views: '+1',
    src:'asdasd'
};
module.exports.pictureWrongID2 = {
    id: 999,

};

module.exports.pictureWrongPatch3 = {
    width: 1280,
    height: 720,
    src: "https://picsum.photos/1280/720",
    title: "This title is one char too long. This title is one char too long. This title is one char too long.This title is one char too long. Thistitle ",
    description: "Taken from picsum.photos as it is easier due to copyright regulations. Still a nice picture. And as it is random you nalways see something different on reload, uh.",
    views: '+1'
};

module.exports.pictureWrongPatch4 = {
    views: '1'
};