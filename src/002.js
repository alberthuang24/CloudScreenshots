const [log4js, Crawler, schedule] = [require("log4js"), require("crawler"), require("node-schedule")];
const LZString = require("lz-string");
var z_index = 0;
const fs = require("fs");

/**
 * [日志处理]
 */

const logger = {
    info: info => {
        console.log(info);
    },
    error: err => {
        console.error(err);
    }
};

// 日志
// const logger = (() => {
// 	log4js.configure({
// 		appenders: {
// 			"type": "file",
// 			"filename": `${__dirname}/logs/log`,
// 			"maxLogSize": 1024 * 1024,
// 			"backups": 10,
// 			"category": "oppein"
// 		}
// 	});

// 	const logger = log4js.getLogger('oppein');
// 	logger.setLevel('info');

// 	return logger;
// })();

/**
 * [抓取网站方法]
 */

// 抓取
const crawler = (() => {
    const options = {
        maxConnections: 1,
        rateLimit: 10,
        retries: 0,
        retryTimeout: 0,
        jQuery: {
            name: 'cheerio',
            options: {
                normalizeWhitespace: false,
                xmlMode: false,
                decodeEntities: true
            }
        },
        forceUTF8: true,
        incomingEncoding: null,
        skipDuplicates: false,
        method: 'get',
        headers: {
            Cookie: 'PHPSESSID=u7nlj0ah5nqapuhu6ff5lrpqa0',
        },
        callback: function (error, res, done) {
            const crawlerCallback = res.options.crawlerCallback;
            if (error || res.statusCode !== 200 || !res.$ || res.$('.login_wrap').length) {
                if (!res.$ || res.$('.login_wrap').length) {
                    console.log("cookie 错误没毛病");
                }
                logger.error(`任务出错 "${res.options.uri}"`);
                return done();
            }
            console.log(`任务完成 "${res.options.uri}"`);
            return crawlerCallback ? crawlerCallback.call(this, error, res, done) : done();
        }
    };
    // 队列  http://crm.pianor.co/client_index.html
    const crawlerQueue = new Crawler(options);
    // 队列
    const crawlerQueue2 = new Crawler(options);
    crawlerQueue.on('schedule', options => {
        console.log(`注册任务 "${options.uri}"`);
        // logger.info(`注册任务 "${options.uri}"`);
    });
    crawlerQueue.on('request', options => {
        // logger.info(`开始任务 "${options.uri}"`);
        console.log(`开始任务 "${options.uri}"`);
    });
    crawlerQueue.on('drain', () => {
        // logger.info(`任务结束`);
        console.log(`任务结束`);
    });

    // 列表
    const listCrawler = (() => {
        // 回调
        const crawlerCallback = (error, res, done) => {
            const $ = res.$;
            // 详情 链接
            const detailsUrl = $('.bjui-pageContent tr').map((i, el) => {
                console.log($(el).children('td:last-child').children('a').eq(0).attr('href'));
                return "http://crm.pianor.co/" + $(el).children('td:last-child').children('a').eq(0).attr('href');
            }).get();
            // 下一页链接
            const nextHref = $('.pager a:contains("下一页")').attr('href');
            if (detailsUrl.length) detailsCrawler(detailsUrl);
            if (nextHref) listCrawler(`http://crm.oppein.cn${nextHref}`);
            return done();
        };

        // 方法
        return uris => {
            uris.map(uri => {
                console.log(uri);
                crawlerQueue.queue({uri, crawlerCallback});
            })
        };

    })();

    // 详情
    const detailsCrawler = (() => {
        // 剔除空格
        console.log("开始");
        const escaped = (() => {
            var trimReg = /(^\s*)|(\s*$)/g;
            var filterSpaceReg = /(^\s*)|(\s*$)|(\s(?=\s))/g;
            return str => {
                str = str.replace(trimReg, "");
                const strArray = str.split('\n');
                let returnStrArray = [];
                for (var i = 0, len = strArray.length; i < len; i++) {
                    const item = strArray[i].replace(filterSpaceReg, "");
                    if (item) {
                        returnStrArray.push(item)
                    }
                }
                if (returnStrArray.length > 1) {
                    return returnStrArray;
                } else {
                    return returnStrArray[0];
                }
            }
        })();
        // 回调
        const crawlerCallback = (error, res, done) => {
            const $ = res.$;
            // dom对象
            const $customerInformation = $('body > div > div:nth-child(1) > fieldset > div > table');
            const $callRecords = $('body div.padding20  div.margin-top-10:nth-child(4) > table   tr  td  div');
            const $customerOrder = $('body > div.container.clear > div.content > div.padding20 > div:nth-child(6) > table ');
            const $customerOperationLog = $('body > div.container.clear > div.content > div.padding20 > div:nth-child(8) > table   tr  td  div');


            if (!$customerInformation.length && !$callRecords.length && !$customerOrder.length && !$customerOperationLog.length) {
                return done();
            }

            // 存储
            let resData = {};
            // 客户信息
            resData.customerInformation = {
                // 客户编号
                "id": escaped($customerInformation.find('tr:nth-child(1) > td:nth-child(2)').text()),
                // 客户来源
                "source": escaped($customerInformation.find('tr:nth-child(1) > td:nth-child(4)').text()),
                // 姓名
                "name": escaped($customerInformation.find('tr:nth-child(2) > td:nth-child(2)').text()),
                // 性别
                "sex": escaped($customerInformation.find('tr:nth-child(2) > td:nth-child(4)').text()),
                // 年龄
                "age": escaped($customerInformation.find('tr:nth-child(2) > td:nth-child(6)').text()),
                // 手机号码
                "phone": escaped($customerInformation.find('tr:nth-child(3) > td:nth-child(2) > input').val()),
                // 备注联系方式
                "remarksContact": escaped($customerInformation.find('tr:nth-child(3) > td:nth-child(4)').text()),
                // QQ
                "QQ": escaped($customerInformation.find('tr:nth-child(3) > td:nth-child(6)').text()),
                // 微信
                "weChat": escaped($customerInformation.find('tr:nth-child(3) > td:nth-child(8)').text()),
                // 地址
                "address": escaped($customerInformation.find('tr:nth-child(4) > td:nth-child(2)').text()),
                // 所属小区
                "district": escaped($customerInformation.find('tr:nth-child(4) > td:nth-child(4)').text()),
                // 测量备注
                "measurementNotes": escaped($customerInformation.find('tr:nth-child(4) > td:nth-child(6)').text()),
                // 装修类型
                "decorationType": escaped($customerInformation.find('tr:nth-child(5) > td:nth-child(2)').text()),
                // 是否在专卖店了解过
                "isUnderstand": escaped($customerInformation.find('tr:nth-child(5) > td:nth-child(4)').text()),
                // 产品意向风格
                "productIntentStyle": escaped($customerInformation.find('tr:nth-child(5) > td:nth-child(6)').text()),
                // 定制类型
                "customType": escaped($customerInformation.find('tr:nth-child(6) > td:nth-child(2)').text()),
                //交楼时间
                "changeFloor": escaped($customerInformation.find('tr:nth-child(6) > td:nth-child(4)').text()),
                // 跟进客服
                "followSuit": escaped($customerInformation.find('tr:nth-child(7) > td:nth-child(2)').text()),
                // 提交体验卡时间
                "submitExperienceCardTime": escaped($customerInformation.find('tr:nth-child(7) > td:nth-child(4)').text()),
                // 上一次联系时间
                "lastContactTime": escaped($customerInformation.find('tr:nth-child(7) > td:nth-child(6)').text()),
                // 客户状态
                "customerStatus": escaped($customerInformation.find('tr:nth-child(8) > td:nth-child(2)').text()),
                // 申请备注
                "applicationNote": escaped($customerInformation.find('tr:nth-child(8) > td:nth-child(4)').text()),
                // 回访时间
                "visitTime": escaped($customerInformation.find('tr:nth-child(9) > td:nth-child(2)').text()),
                // 客户备注
                "customerNotes": escaped($customerInformation.find('tr:nth-child(9) > td:nth-child(4)').text()),
            };

            if (escaped($customerInformation.find('tr:nth-child(9) > td:nth-child(2)').text())) {
                var bool = escaped($customerInformation.find('tr:nth-child(9) > td:nth-child(2)').text()).indexOf(":");
                var key = bool == -1 ? "customerNotes" : "visitTime";
                resData.customerInformation[key] = escaped($customerInformation.find('tr:nth-child(9) > td:nth-child(2)').text());
            }

            // 地址 id
            // districtCrawler(resData.customerInformation.id, resData);
            transfer(resData);
            return done();
        };
        // 方法
        return urlList => {
            crawlerQueue.queue(urlList.map(uri => {
                return {uri, crawlerCallback};
            }));
        };
    })();

    // 地址 id
    const districtCrawler = (() => {
        // 回调
        const crawlerCallback = (error, res, done) => {
            let resData = res.options.resData || {};
            const $ = res.$;
            resData.addressForm = {
                prov: $('.prov').data('val'),
                city: $('.city').data('val'),
                dist: $('.dist').data('val'),
                address: $('#district > input').val(),
            };
            // 传输
            transfer(resData);
            return done();
        };
        // 方法
        return (id, resData) => {
            crawlerQueue2.queue({
                uri: `http://crm.oppein.cn/index.php?r=client/update&id=${id}`,
                resData,
                crawlerCallback
            });
        };
    })();

    return {crawlerQueue, crawlerQueue2, listCrawler, detailsCrawler};
})();

// api传输队列
const transfer = (() => {
    const apiQueue = new Crawler({
        maxConnections: 1000,
        method: 'get',
        jQuery: false,
        callback: (error, res, done) => {
            const data = res.options.resData;
            if (error || res.statusCode !== 200) {
                console.log(res);
                console.log(`api传输 ${(data && data.id) || ''} 错误`);
            } else {
                console.log(`api传输成功${z_index}`);
            }
            z_index++;
            return done();
        }
    });

    const uri = 'http://sys.lif8.cn:8090/index.php/admin_api/AdminInterface/rootInterface';
    // const uri = 'http://192.168.9.222/lif8_b3/public/index.php/admin_api/AdminInterface/rootInterface';
    const interface = 'PublicAction/importOppeinData';
    return resData => {
        var params = JSON.stringify({data: resData});
        var buffer = new Buffer(params);
        params = new Buffer(LZString.compressToBase64(buffer.toString("base64")));
        params = params.toString("base64");
        apiQueue.queue({uri, qs: {interface, params}, resData});
    }
})();


/**
 * [开启任务方法]
 */

// 批量页数任务
const idArrayTask = (() => {
    return iaArray => {
        logger.info('开启批量页任务');
        crawler.listCrawler(
            iaArray.map(id => `http://crm.pianor.co/client_index.html?pageCurrent=${id}`)
        );
    }
})();


// /**
//  * [开启任务]
//  */
var arr = [];
var start = Number(process.argv[2] || 0);   //页数
var end = Number(process.argv[3] || 3);     //结束页数
for (var i = start; i < end; i++) {
    arr.push(i);
}
idArrayTask(arr);