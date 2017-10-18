const fs = require("fs");
const gm = require("gm");

gm("mobile1.png").append("mobile1.pngz.png").write("mobile1.png",function(err){
    console.log(err);
});