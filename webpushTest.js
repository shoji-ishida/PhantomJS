/**
 * Wait until the test condition is true or a timeout occurs. Useful for waiting
 * on a server response or for a ui change (fadeIn, etc.) to occur.
 *
 * @param testFx javascript condition that evaluates to a boolean,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param onReady what to do when testFx condition is fulfilled,
 * it can be passed in as a string (e.g.: "1 == 1" or "$('#bar').is(':visible')" or
 * as a callback function.
 * @param timeOutMillis the max amount of time to wait. If not specified, 3 sec is used.
 */

"use strict";
function waitFor(testFx, onReady, timeOutMillis) {
    var maxtimeOutMillis = timeOutMillis ? timeOutMillis : 3000, //< Default Max Timout is 3s
        start = new Date().getTime(),
        condition = false,
        interval = setInterval(function() {
            if ( (new Date().getTime() - start < maxtimeOutMillis) && !condition ) {
                // If not time-out yet and condition not yet fulfilled
                condition = (typeof(testFx) === "string" ? eval(testFx) : testFx()); //< defensive code
            } else {
                if(!condition) {
                    // If condition still not fulfilled (timeout but condition is 'false')
                    console.log("'waitFor()' timeout");
                    phantom.exit(1);
                } else {
                    // Condition fulfilled (timeout and/or condition is 'true')
                    console.log("'waitFor()' finished in " + (new Date().getTime() - start) + "ms.");
                    typeof(onReady) === "string" ? eval(onReady) : onReady(); //< Do what it's supposed to do once the condition is fulfilled
                    clearInterval(interval); //< Stop this interval
                }
            }
        }, 250); //< repeat check every 250ms
};

var page = require('webpage').create();
var system = require('system');

if (system.args.length === 1) {
    console.log('Usage: webpushTest.js <some URL>');
    phantom.exit();
}

var addr = system.args[1];
var jumpToAd = false;

phantom.injectJs("./push.js");

//console.log("cookie="+phantom.cookiesEnabled);
page.onConsoleMessage = function(msg) {
    console.log(msg);
}

page.onLoadFinished = function(status) {
    console.log("page.onLoadFinished: " + status);
    if (jumpToAd) {
        //page.render('webpush_test_4.png');
        phantom.exit();
    }
};
page.onUrlChanged = function(targetUrl) {
    console.log("page.onUrlChanged: " + targetUrl);
    if (targetUrl != addr) {
        jumpToAd = true;
    }
};

page.open(addr, function (status) {
    // Check for page load success
    if (status !== "success") {
        console.log("Unable to access network");
    } else {
        //page.render('webpush_test_0.png');
        // Wait for push message to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            //return page.evaluate(function() {
            //    return $("#cwp-WebpushFrame").is(":visible");
            //});
            return page.evaluate(function() {
                var el = document.getElementById("cwp-WebpushFrame");
                if (el != null) {
                    var rect = el.getBoundingClientRect();

                    return (
                        rect.top >= 0 &&
                        rect.left >= 0 &&
                        rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) && /*or $(window).height() */
                        rect.right <= (window.innerWidth || document.documentElement.clientWidth) /*or $(window).width() */
                    );
                } else {
                    return false;
                }
            });
        }, function() {
            console.log("The PUSH should be visible now.");
            //page.render('webpush_test_1.png');

            // click on close button
            clickOnClose();
            sendPushNotification("b18b2800-7ecb-4f3f-9108-6dd49d5592d2", "01902e82-c39f-4088-8f23-6e733b2ee32a");
            waitForPush();
        });
    }
});

function clickOnClose() {
   var rect = page.evaluate(function() {
       // click on close button
       return document.getElementById("cwp-close").getBoundingClientRect();
});
    var x = rect.left + rect.width / 2;
    var y = rect.top + rect.height / 2;
    console.log("Clicking close @ " + x + ", " + y);
    page.sendEvent('click', x, y);
    //page.render('webpush_test_2.png');
};

function clickOnAd() {
    console.log("Clicking Ad");
    var rect = page.evaluate(function () {
        // click on Ad
        return document.getElementsByClassName("cwp-ImagePhoto")[0].click();
    });
}

function waitForPush() {
    waitFor(function() {
        return page.evaluate(function() {
            var obj = document.querySelector('span.cwp-Headline');
            if (obj == null) {
                return false;
            } else {
                console.log(obj.innerText);
                if (obj.innerText == "PhantomJS push") {
                    return true;
                } else {
                    return false;
                }
            }
        });
    }, function() {
        console.log("Imediate push is now visible");
        //page.render('webpush_test_3.png');
        clickOnAd();
    });
}