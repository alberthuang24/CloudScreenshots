const child_process = require("child_process");
const gm = require("gm"),
    fs = require("fs"),
    shash = require("sharp-blockhash"),
    hammingDistance = require('hamming-distance'),
    devNull = require('dev-null');
const platform = process.argv[2],
    url = process.argv[3],
    output = process.argv[4];
hash = process.argv[5];


(new Promise((resolve, reject) => {
    console.log(`phantomjs ${__dirname}/${platform}.js '${url}' ${output}`);
    child_process.exec(`phantomjs ${__dirname}/${platform}.js '${url}' ${output}`, (error, stdout, stderr) => {
        if (error) {
            reject(error);
            console.log(error,stdout,stderr);
        }
        resolve(stdout);
    });
})).then(stdout => {
    console.log("开始合并");
    if (platform == 'mobile') {
        return new Promise((resolve, reject) => {
            gm(output).append(`${output}z.png`).write(output, error => {
                if (error) {
                    console.log(error);
                    reject(error);
                }
                resolve(output);
            });
        })
    }
}).then(() => {
    console.log("成功");
    console.log(output);
    return shash(output).toBlockhash();
}).then(hex => {
    return new Promise((resolve, reject) => {
        try {
            if (hash && (hammingDistance(hash, hex.toString("hex")) < 10)) {
                return reject("the images already exist");
            }
        } catch (e) {

        }
        fs.writeFile(output + ".txt", hex.toString("hex"), {flag: 'a'});
        if(platform == "mobile"){
            fs.unlinkSync(output + "z.png");
        }
    });
}).catch(err => {
    console.log(err+"\n");
    fs.writeFile("log", err, {flag: 'a'});
    fs.unlinkSync(output);
    fs.unlinkSync(output + "z.png");
});