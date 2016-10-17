function loadPage(n) {
    var time = Date.now();
    var page = require('webpage').create();

    page.open(addr, function (status) {
    // Check for page load success
    if (status !== "success") {
        console.log("Unable to access network: " + n);
    } else {
       time = Date.now() - time;
       console.log("A page succesfully opened: " + n + " took " + time + "msec");
       //page.render("test"+n+".png");
       setTimeout(function(page, n) {
       page.close();
       loadPage(n);
       }, 10000, page, n);
    }
    });
};

system = require('system');
addr = system.args[1];
count = system.args[2];
for (var i = 0; i < count; i++) { 
    loadPage(i);
}
