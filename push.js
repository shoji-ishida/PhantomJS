/**
 * Created by ishida on 2016/10/18.
 */
phantom.injectJs("./date.js");

function sendPushNotification() {
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
            data: JSON.stringify({"application_id": "b18b2800-7ecb-4f3f-9108-6dd49d5592d2",
                "subscribers": ["a380ecf9-f32c-41f0-946c-169855d01f85", "27b79625-ca94-4a61-99ad-3e10085522af", "01902e82-c39f-4088-8f23-6e733b2ee32a"],
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
        console.log('Push Status: ' + status);
        //console.log(page.plainText);
    });
}