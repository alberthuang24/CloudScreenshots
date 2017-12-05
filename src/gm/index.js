const gm = require("gm");
const shash = require("sharp-blockhash");
const fs = require("fs");
module.exports = class myGm {

    constructor(image) {
        this.path = image;
        this.gm = gm(image);
    }

    resize(proportion, fileName) {
        return new Promise(async (resolve, reject) => {
            const size = await this.getSize();
            this.gm.resize(size.width * proportion, size.height * proportion).write(fileName, (err) => {
                if (err) {
                    reject(err);
                }
                resolve(fileName);
            });
        });
    }

    fileSize() {
        return new Promise((resolve, reject) => {
            fs.stat(this.path, (error, stats) => {
                resolve(stats.size);
            });
        });
    }

    getSize() {
        return new Promise((resolve, reject) => {
            this.gm.size((err, value) => {
                if (err) {
                    console.log(err);
                    return reject(err);
                }
                this.width = value.width;
                this.height = value.height;
                resolve(value);
            });
        });
    }

    hash() {
        return Promise.resolve(shash(this.path).toBlockhash());
    }
};