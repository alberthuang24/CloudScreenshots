const kueConfig = require("./config/kue");
const kue = require("kue");
const mysql = new (require("./mysql/index"))();
const queue = kue.createQueue(kueConfig);


//从mysql的任务列表 create 到 队
async function initQueue() {
    const results = await mysql.query("select * from em_cloud_screenshots");
    results.forEach(item => {
        console.log(item);
        queue.create('screen', item).save();
    })
}


initQueue().then(r => {

});