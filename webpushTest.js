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
var addr = system.args[1];

console.log("cookie="+phantom.cookiesEnabled);
page.onConsoleMessage = function(msg) {
  console.log(msg);
}

page.open(addr, function (status) {
    // Check for page load success
    if (status !== "success") {
        console.log("Unable to access network");
    } else {
        page.render('webpush_test_0.png');
        // Wait for push message to be visible
        waitFor(function() {
            // Check in the page if a specific element is now visible
            return page.evaluate(function() {
                return $("#cwp-WebpushFrame").is(":visible");
            });
        }, function() {
           console.log("The PUSH should be visible now.");
           page.render('webpush_test_1.png');

           // click on close button
	   clickOnClose();
           phantom.exit();
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
           console.log("Clicking @ " + x + ", " + y);
	   page.sendEvent('click', x, y);
           page.render('webpush_test_2.png');
};

function clickOnAd() {
   var rect = page.evaluate(function() {
               // click on Ad
               return document.getElementById("cwp-close").getBoundingClientRect();
});
           var x = rect.left + rect.width / 2;
           var y = rect.top + rect.height / 2;
           console.log("Clicking @ " + x + ", " + y);
	   page.sendEvent('click', x, y);
           page.render('webpush_test_2.png');
};
