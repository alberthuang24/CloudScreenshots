var page = require('webpage').create(),
    system = require('system'),
    address, output;

address = system.args[1];
output = system.args[2];
page.viewportSize = {width: 1920, height: 1080};
// page.settings.userAgent = 'Mozilla/5.0 (iPhone; CPU iPhone OS 9_1 like Mac OS X) AppleWebKit/601.1.46 (KHTML, like Gecko) Version/9.0 Mobile/13B143 Safari/601.1';
page.onConsoleMessage = function (msg, lineNum, sourceId) {
    console.log('CONSOLE: ' + msg + ' (from line #' + lineNum + ' in "' + sourceId + '")');
    if (msg == 'eme_render') {
        console.log('start_render');
        var bb = page.evaluate(function () {
            return document.getElementsByTagName('html')[0].getBoundingClientRect();
        });
        page.clipRect = {
            top: 0,
            left: 0,
            width: bb.width,
            height: (bb.height)
        };
        page.render(output, {format: 'png', quality: 80});
        page.close();
        phantom.exit();
    }
};
page.open(address, function (status) {
    // // 通过在页面上执行脚本获取页面的渲染高度
    console.log("start");
    var bb = page.evaluate(function () {
        console.log("开始执行客户端js代码");

        // window.onload = function () {
        function carateATagWithHerf(e) {
            var t = document.createElement("a");
            return t.href = e,t
        }

        function isMobile() {
            return true;
            var e = ["Android", "iPhone"], t = e.length, o = navigator.userAgent;
            if (t > 0)for (var n = 0; n
            < t; ++n)if (o.indexOf(e[n]) > 0)return !0;
            return !1
        }

        function hideUseless() {
            var e = ["J_GlobalNav", "J_Shop_Category", "footer", "J_BottomSmartBanner", "J_BottomSmartBannerLink"], t = e.length, o = ["J_btmMenuCtn", "btn-close", "sticky-bottom-menu-wrapper"], n = o.length;
            if (t > 0)for (var r = 0; r
            < t; ++r) {
                var i = document.getElementById(e[r]);
                i && i.remove()
            }
            if (n > 0)for (var l = 0; l
            < n; ++l) {
                var a = document.getElementsByClassName(o[l]);
                if (console.log("className: ", o[l]), console.log("classSet: ", a), console.log("classSet length: ", a.length), a.length > 0) {
                    for (var g = 0; g
                    < a.length; ++g)"function" == typeof a[g].click && a[g].click();
                    a.remove()
                }
            }
        }

        function takeShot() {
            window.setTimeout(function () {
                console.log("eme_render");
            }, 5000 * 2);
        }

        if (Element.prototype.remove = function () {
                this.parentElement.removeChild(this)
            }, NodeList.prototype.remove = HTMLCollection.prototype.remove = function () {
                for (var e = this.length - 1; e >= 0; e--)this[e] && this[e].parentElement && this[e].parentElement.removeChild(this[e])
            }, console.log("tamper monkey is coming ..."), isMobile())try {
            var screenHeight = (1080 || window.screen.availHeight), step = 500, currentToTop = 0, finalHeight = 0, timer = setInterval(function (e) {
                if (currentToTop += step, window.scrollTo(0, currentToTop), console.log("距离顶部：" + (document.body.scrollTop || document.documentElement.scrollTop), screenHeight), console.log("当前:", currentToTop, window.document.body.scrollHeight - (document.body.scrollTop || document.documentElement.scrollTop), screenHeight), currentToTop >= e || window.document.body.scrollHeight - (document.body.scrollTop || document.documentElement.scrollTop) <= screenHeight) {
                    clearInterval(timer),
                        console.log("已滚动到目标底部: " + window.document.body.scrollHeight + "（正文总高）; " + (document.body.scrollTop || document.documentElement.scrollTop) + "（到正文顶部距离）; "),
                        window.document.body.scrollHeight <= window.screen.availHeight ? finalHeight = window.screen.availHeight : window.document.body.scrollHeight <= e && (finalHeight = window.document.body.scrollHeight),
                        console.log("availHeight", window.screen.availHeight),
                        console.log("scrollHeight", window.document.body.scrollHeight), console.log("finalHeight", finalHeight), "rgba(0, 0, 0, 0)" === window.getComputedStyle(document.body).backgroundColor && (document.body.style.backgroundColor = "#ffffff"),
                        hideUseless();
                    for (var t = document.all, o = t.length, n = document.getElementsByTagName("img"), r = n.length, i = [], l = /^data:image\/.*$/, a = /^(https?:)?(\/\/\w+(\.\w+)+(\/[\w\.\-\!.]+)+)(\.jpg|png|jpeg|webp)(.*\.(jpg|png|jpeg|webp))$/, g = 0; g < o; g++) {
                        var c = t[g];
                        "fixed" === window.getComputedStyle(c).backgroundAttachment && (c.style.backgroundAttachment = "scroll", c.style.backgroundRepeat = "repeat")
                    }
                    for (var s = 0; s < r; ++s) {
                        var d = !1;
                        a.test(n[s].src) ? d = !0 : n[s].getAttribute("dataimg") && l.test(n[s].getAttribute("dataimg")) && (d = !0), d && i.push(s)
                    }
                    var m = 0, h = i.length;
                    if (console.log("img tag nums : ", r), console.log("shrinked img nums : ", h), h > 0)for (var u = 0; u < h; u++) {
                        var f = "";
                        a.test(n[i[u]].src) ? f = n[i[u]].src : n[i[u]].getAttribute("dataimg") && l.test(n[i[u]].getAttribute("dataimg")) && (f = n[i[u]].getAttribute("dataimg"));
                        var p = carateATagWithHerf(f), w = p.hostname, v = p.pathname, b = v.split("."), y = "", H = !1, k = "", T = "";
                        if (b) {
                            for (var S = 0; S < b.length; ++S) {
                                if (k = b[S].substr(0, 3), T = b[S].substr(0, 4), "jpg" == k || "png" == k || "jpeg" == T) {
                                    H = "jpg" == k || "png" == k ? k : "jpeg" == T && T;
                                    break
                                }
                                y += b[S] + "."
                            }
                            H !== !1 && (originSrc = "https://" + w + y + H, n[i[u]].src = originSrc, n[i[u]].onload = function () {
                                m++, console.log("Loaded shrink image ", m, " of ", h), m >= h && takeShot()
                            })
                        }
                    } else takeShot()
                }
            }, 1e3)
        } catch (e) {
            console.log(e)
        } else takeShot();
        // }
    });
});

