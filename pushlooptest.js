"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 100000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log(new Date().toLocaleString() + " 'waitFor()' timeout");
                    console.log("session count = "+sessionCounts);
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    //console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

phantom.injectJs("./push.js");

function loadPage(n) {
    var time = Date.now();
    var page = require('webpage').create();

    page.onConsoleMessage = function(msg) {
        //console.log(msg);
        if (/onopen/.test(msg)) {
            //console.log("ws opened");
            sessionCounts++;
            if (sessionCounts == count) {
                setTimeout(function() {
                    console.log(new Date().toLocaleString() + " Ready to push");
                    sendPushNotification("5490a760-1c7a-42b6-ad32-6f13760ce81d", "01902e82-c39f-4088-8f23-6e733b2ee32a");
                },250);
            }
        }
    }

    // page.onResourceReceived = function (res) {
    //     if (!res.stage || res.stage === 'end') {
    //         if (res.url.match('\/api\/accesspoint')) {
    //             console.log('< ' +res.id + ' ' + res.status + ' - ' + res.url);
    //
    //             sessionCounts++;
    //             if (sessionCounts == count) {
    //                 console.log(new Date().toLocaleString() + " Ready to push");
    //                 setTimeout(function() {
    //                     sendPushNotification("5490a760-1c7a-42b6-ad32-6f13760ce81d", "01902e82-c39f-4088-8f23-6e733b2ee32a");
    //
    //                 }, 3000);
    //             }
    //         }
    //     }
    // };

    // page.onInitialized = function(){
    //     console.log("onInitialized");
    //     page.evaluate(function(){
    //         (function(w){
    //             var oldWS = w.WebSocket;
    //             var onopen = null;
    //             w.WebSocket = function(uri){
    //                 w.callPhantom("new ws: "+uri);
    //
    //                 this.ws = new oldWS(uri);
    //                 this.ws.onopen = function () {
    //                     w.callPhantom("ws.onopen");
    //                 }
    //
    //             };
    //
    //             w.WebSocket.prototype.send = function(msg){
    //                 w.callPhantom("ws.send");
    //                 this.ws.send(msg);
    //             };
    //         })(window);
    //     });
    // };

    // page.onCallback = function(data){
    //     console.log(data);
    // };

    page.open(addr, function (status) {
    // Check for page load success
    if (status !== "success") {
        console.log(new Date().toLocaleString() + " Unable to access network: " + n);
    } else {
       //time = Date.now() - time;
       //console.log("A page succesfully opened: " + n + " took " + time + "msec");

        waitForPush(page, n);
    }
    });
};

function clickOnClose(page, n) {
    var rect = page.evaluate(function() {
        // click on close button
        return document.getElementById("cwp-close").getBoundingClientRect();
    });
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    console.log("Clicking close @ " + x + ", " + y + " " + n);
    page.sendEvent('click', x, y);
};

function waitForPush(page, n) {
    //console.log("waiting for immediate push " + n);
    waitFor(function() {
        return page.evaluate(function(n) {
            var obj = document.querySelector('span.cwp-Headline');
            if (obj == null) {
                console.log("no cwp-Headline: " + n);
                return false;
            } else {
                console.log(obj.innerText);
                if (obj.innerText == "PhantomJS push") {
                    return true;
                } else {
                    return false;
                }
            }
        }, n);
    }, function() {
        //console.log("Imediate push is now visible " + n);
        clickOnAd(page, n);
        page.close();
        sessionCounts--;
        if (sessionCounts == 0) {
            console.log(new Date().toLocaleString() + " DONE");
            loop();
        }
    });
}

function clickOnAd(page, n) {
    //console.log("Clicking Ad "+n);
    var rect = page.evaluate(function () {
        // click on Ad
        return document.getElementsByClassName("cwp-ImagePhoto")[0].click();
    });
}

function loop() {
    console.log(new Date().toLocaleString() + " " + ++runCounts + " runs");
    for (var i = 0; i < count; i++) {
        loadPage(i);
    }
    console.log(new Date().toLocaleString() + " " + count + " sessions established");
}

var system = require('system');
if (system.args.length !== 3) {
    console.log('Usage: pushlooptest.js <some URL> <thread count>');
    phantom.exit();
}

var sessionCounts = 0;
var runCounts = 0;
var addr = system.args[1];
var count = system.args[2];
loop();

