const config = require("../config/screen");
module.exports = class Handler {

    constructor(url) {
        this.url = url;
        this.fileName = Math.ceil(Math.random() * 10000000000) + '.' + config.format;

        this.phantom = require('phantom');
    }

    handler() {
        //开始截图
    }

}