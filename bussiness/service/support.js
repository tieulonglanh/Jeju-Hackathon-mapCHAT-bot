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
    getSupportService: function (data, test, fn) {
        var url = config.get('apiUrl') + '/support/getSupportService';
        if (test === 1) {
            url = config.get('apiUrl') + "/sandbox/support/getSupportService";
        }
        var method = 'GET';
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Thông báo thành công",
                services: [{
                    code: 'slow_delivery',
                    label: 'Báo giao hàng chậm'
                }, {
                    code: 'report_quantity',
                    label: 'Phản hồi chất lượng hoa'
                }, {
                    code: 'cancel_order',
                    label: 'Hủy đơn hàng'
                }]

            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                fn(response);
            });
        }
    },
    getSupportServiceProccess: function (senderID, fanpageID, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, apiKey: apiKey, transID: transID, signature: signature};
        this.getSupportService(data, test, function (response) {
            fn(response);
        });
    }
};