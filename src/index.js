const myGm = require("./gm/index"),
    fs = require("fs"),
    shash = require("sharp-blockhash"),
    hammingDistance = require('hamming-distance'),
    devNull = require('dev-null');
const phantom = require('phantom');
const pcScreen = require("./handler/pc");
const kueConfig = require("./config/kue");
const path = require('path');
const mysql = new (require("./mysql/index"))();
const mobileScreen = require("./handler/mobile");
const screenConfig = require("./config/screen");
const kue = require("kue");
const mac = require("getmac");
const md5 = require("md5");
const qiniuUpload = new (require("./qiniu/index"));

const queue = kue.createQueue(kueConfig);

const uploadQueue = kue.createQueue();

// kue.app.listen(3000); //监听3000端口

mac.getMac((err, macaddress) => {
    if (err) {
        return console.error(err);
    }
    queue.process('screen', function (job, ctx, done) {
        handler(job.data, job.data.platform).then(async path => {
            const g = new myGm(path);
            let hash = await g.hash();
            hash = hash.toString('hex');

            if (job.data.md5) {
                try {
                    if (hammingDistance(job.data.md5, hash) === 0) {
                        //重复
                        await new Promise((resolve, reject) => {
                            fs.unlink(path, (error) => {
                                resolve();
                            });
                        });
                        console.log("重复");
                        return;
                    }
                } catch (e) {
                    console.log(e, 'xxxxxxxxx');
                }
            }

            let uploadJob = job.data;
            uploadJob['path'] = path;
            uploadQueue.create(`${macaddress}upload`, uploadJob).attempts(3).ttl(600000).save();
            mysql.update(`em_cloud_screenshots:${job.data.id}`, {
                md5: `"${hash}"`,
                last_time: new Date().getTime().toString().substring(0, 10)
            });
            done();
        });
    });
    uploadQueue.process(`${macaddress}upload`, function (job, ctx, done) {
        upload(job.data).then(r => {

            console.log(r, '上传完成任务结束');
            done();
        });
    });
});

/**
 * 运行截图任务
 * @param o Object {url : xxx , platform : xxx}
 * @param platform e
 * @returns {Promise.<void>}
 */
async function handler(o, platform) {
    platform = platform === 'mobile' ? (new mobileScreen(o.url)) : (new pcScreen(o.url));
    const fileName = await (platform).handler();

    let mPath = path.resolve(__dirname, '..');

    mPath = `${mPath}/${fileName}`;

    await mysql.update(`em_cloud_screenshots:${o.id}`, {count: o.count + 1});

    //上传处理
    return await mPath;
}


//上传任务
async function upload(object) {
    const g = new myGm(object.path);
    const shrinkPath = path.resolve(__dirname, '..') + "/shrink_" + Math.ceil(Math.random() * 10000000000000000) + '.' + screenConfig.format;
    // const thumbPath = path.resolve(__dirname, '..') + "/thumb_" + Math.ceil(Math.random() * 10000000000000000) + '.' + screenConfig.format;
    await g.resize(screenConfig.shrink_ratio, shrinkPath);
    // await g.resize(screenConfig.display_ratio, thumbPath);
    console.log("开始上传");

    let [shrinkName, originName] = await Promise.all([
        qiniuUpload.upload(md5(shrinkPath) + "." + screenConfig.format, shrinkPath, "yimai"),
        qiniuUpload.upload(md5(object.path) + "." + screenConfig.format, object.path, "private")
    ]);

    console.log("上传结束");
    let date = new Date();
    let size = await g.getSize();

    console.log(size);
    //删除完毕后保存数据库
    let cases_details = {
        cd_platform: `"${object.platform}"`,
        cd_year: date.getFullYear(),
        cd_month: date.getMonth(),
        cd_day: date.getDate(),
        cd_title: `"${object.title}"`,
        cd_origin_key: `"${originName}"`,
        cd_shrink_key: `"${shrinkName}"`,
        cd_thumb_key: `"${shrinkName}"`,
        cd_ext: `"${screenConfig.format}"`,
        cd_size: await g.fileSize(),
        cd_height: size.height,
        cd_width: size.width
    };

    console.log(cases_details);

    await mysql.insert("em_case_details", cases_details);

    return await new Promise((resolve, reject) => {
        //上传成功删除本地图片
        fs.unlink(shrinkPath, (error) => {
            console.log(error);
            // fs.unlink(thumbPath, (error) => {
            fs.unlink(object.path, (error) => {
                console.log(error);
                console.log(object.path);
                resolve();
            })
            // })
        });
    });
}