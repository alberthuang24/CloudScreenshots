const gm = require("gm"),
    fs = require("fs"),
    shash = require("sharp-blockhash"),
    hammingDistance = require('hamming-distance'),
    devNull = require('dev-null');
const phantom = require('phantom');
const pcScreen = require("./handler/pc");
const kueConfig = require("./config/kue");
const mysql = new (require("./mysql/index"))();
const mobileScreen = require("./handler/mobile");
const screenConfig = require("./config/screen");
const kue = require("kue");
const queue = kue.createQueue(kueConfig);
kue.app.listen(3000); //监听3000端口

initQueue();

/**
 * 运行截图任务
 * @param o Object {url : xxx , platform : xxx}
 * @param platform e
 * @returns {Promise.<void>}
 */
async function handler(o, platform) {
    platform = platform === 'mobile' ? (new mobileScreen(o.url)) : (new pcScreen(o.url));
    const fileName = await (platform).handler();
    console.log(fileName);

    //上传处理
    return await true;
}

//从mysql的任务列表 create 到 队列
async function initQueue() {
    const results = await mysql.query("select * from em_cloud_screenshots");
    results.forEach(item => {
        queue.create(item.platform, item).save();
    })
}

queue.process('mobile', function (job, ctx, done) {
    handler(job.data, 'mobile').then(b => {
        if (b === true) {
            done();
        }
    });
});

queue.process('pc', function (job, ctx, done) {
    handler(job.data, 'pc').then(b => {
        if (b === true) {
            done();
        }
    });
});