/**
 * Created by ishida on 2016/10/18.
 */
phantom.injectJs("./date.js");

function sendPushNotification(app_id, user_ids) {
    var url = "https://stg-platform.webpush.jp/api/b1/messages";
    var date = new Date();
    var format = 'yyyy-MM-dd HH:mm:ss';
    var notifyAt = comDateFormat(date, format);

    var page = require('webpage').create(),
        server = url,
        settings = {
            operation: "POST",
            headers: {
                "Content-Type": "application/json",
                "X-Provider-Key": "quasar_access_key",
                "X-Provider-Token": "quasar_access_token"
            },
            data: JSON.stringify({"application_id": app_id,
                "subscribers": [user_ids],
                "title": "PhantomJS push",
                "content": "Immediate push test from PhantomJS",
                "image": "",
                "notify_at": notifyAt,
                "period_start": null,
                "period_end": null,
                "repeat": false,
                "delivery_type": "now",
                "notification_type": "image",
                "destination_url": "http://www.catalyna.jp/",
                "destination_mobile_url": "https://webpush.jp/",
                "gcm_icon": "",
                "template": "base_template1"})
        };

    page.open(server, settings, function(status) {
        console.log(new Date().toLocaleString() + ' Push Status: ' + status);
        //console.log(page.plainText);
    });
}