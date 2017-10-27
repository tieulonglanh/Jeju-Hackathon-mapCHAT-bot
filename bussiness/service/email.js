'use strict';
const
        config = require('config'),
        crypto = require('crypto'),
        fakeAPI = config.get('fakeAPI'),
        commonLib = require("../common/commonLib"),
        test = config.get('test'),
        apiKey = config.get('apiKey'),
        callApi = require("../common/callApi");

module.exports = {
    sendEmail: function (data, test, fn) {
        var url = config.get('apiUrl') + '/email/sendEmail';
        if (test === 1) {
            url = config.get('apiUrl') + "/sandbox/email/sendEmail";
        }
        var method = 'GET';
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Thông báo gửi email thành công",
            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                fn(response);
            });
        }
    },
    sendEmailProccess: function (senderID, fanpageID, message, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + message + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, apiKey: apiKey, transID: transID, message: message, signature: signature};
        this.sendEmail(data, test, function (response) {
            fn(response);
        });
    }
};