const qiniuConfig = require("../config/qiniu");
const qiniu = require("node-qiniu");
module.exports = class Qiniu {

    constructor() {
        //this.accessKey = qiniuConfig.ACCESSKEY;
        //this.secretKey = qiniuConfig.SECRETKEY;
        qiniu.config({
            access_key: qiniuConfig.ACCESSKEY,
            secret_key: qiniuConfig.SECRETKEY
        });
    }

    upload(key, filePath, bucket) {
        return new Promise((resolve, reject) => {
            bucket = qiniu.bucket(bucket);
            bucket.putFile(key, filePath, function (err, reply) {
                if (err) {
                    return console.error(err);
                }
                console.log(reply.key, filePath, 'upload success');
                resolve(reply.key);
            });
        });
    }
};