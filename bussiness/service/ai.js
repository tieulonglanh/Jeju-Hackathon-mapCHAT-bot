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
    getAIKeywordResponse: function (data, test, fn) {
        var url = config.get('apiUrl') + '/message/getAIResponse';
        if (test === 1) {
            url = config.get('apiUrl') + "/sandbox/message/getAIResponse";
        }
        var method = 'GET';
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Thông báo thành công",
                data: [
                    {
                        id: 1021,
                        message: "Câu trả lời một"
                    },
                    {
                        id: 1022,
                        message: "Câu trả lời hai"
                    },
                    {
                        id: 1023,
                        message: "Câu trả lời ba"
                    }
                ]
            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                fn(response);
            });
        }
    },
    getAIKeywordResponseProccess: function (senderID, fanpageID, message, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + message + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, apiKey: apiKey, transID: transID, message: message, signature: signature};
        this.getAIKeywordResponse(data, test, function (response) {
            fn(response);
        });
    }
};