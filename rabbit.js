var page = require('webpage').create(),
  system = require('system'),
  t, address;

page.onConsoleMessage = function(msg) {
//  console.log(msg);
};

page.onResourceRequested = function (req) {
//    console.log('> ' + req.id + ' - ' + req.url);
};

page.onResourceReceived = function (res) {
    if (!res.stage || res.stage === 'end') {
//        console.log('< ' +res.id + ' ' + res.status + ' - ' + res.url);
        // if overview page request ends then render a page to png
        if (res.url.match('\/api\/overview')) {
            setTimeout(function() {
            page.render('rabbit.png');
            phantom.exit();
        }, 1000);
        }
    }
};

if (system.args.length === 1) {
  console.log('Usage: rabbit.js <some URL>');
  phantom.exit();
}

t = Date.now();
address = system.args[1];
phantom.clearCookies();

page.viewportSize = {width: 1080, height: 1024};

page.open(address, function(status) {
  var mainLoaded = false;
  if (status !== 'success') {
    console.log('FAIL to load the address');
  } else {
    // if main page is loaded then capture screen
    console.log("url="+page.url);
    if (page.url.match('\/#\/$')) {
        console.log("Main page loaded");
        mainLoaded = true;
    } else {

    //t = Date.now() - t;
    //console.log('Loading ' + system.args[1]);
    //console.log('Loading time ' + t + ' msec');
    console.log("Login page");

    // set username and password
    page.evaluate(function(account, password) {
        document.querySelectorAll('[name="username"]')[0].value = account;
        document.querySelectorAll('[name="password"]')[0].value = password;
            }, "quasar", "quasar");

    console.log("Clicking Login button");
    // compute Login button position
    page.evaluate(function() {
        var objs =  document.getElementsByTagName("input");
        console.log("objs.length="+objs.length);
        for (var i = 0; i < objs.length; i++) {
            console.log("i="+i+": "+objs[i].type);
            if (objs[i].type === 'submit') {
                console.log(objs[i].value);
                objs[i].click();
            }
        }
    });
  }  
  }
/*
  if (mainLoaded) {
      page.render('rabbit.png');
  }
  phantom.exit();
*/
});
