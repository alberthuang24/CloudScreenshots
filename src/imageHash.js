const shash = require("sharp-blockhash");
const hammingDistance = require('hamming-distance');
const devNull = require('dev-null');
const fs = require("fs");

// input: file, output: promise
Promise.all([
    shash("./mobile1.png").toBlockhash(),
    shash("./mobile.png").toBlockhash()
]).then(function (hashes) {
    console.log(hashes[0].toString('hex'));
    console.log(hashes[1].toString('hex'));
    console.log(hammingDistance(hashes[0].toString('hex'), hashes[1].toString('hex')));
});