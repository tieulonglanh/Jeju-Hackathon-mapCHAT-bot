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
    getPaymentLink: function (data, test, fn) {
        var url = config.get('apiUrl') + '/payment/getLink';
        if (test === 1) {
            url = config.get('apiUrl') + "/sandbox/payment/getLink";
        }

        var method = "GET";

        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Thông báo thành công",
                link: "http://appotapay.com/link-thanh-toan",
                order_id: "order_12313223"
            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                console.log('getPaymentLink response: ' + JSON.stringify(response));
                fn(response);
            });
        }
    },
    getPaymentLinkProccess: function (senderID, fanpageID, productID, phone, fullname, address, paymentType, totalProduct, price, additionalData, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + productID + phone + fullname + address + paymentType + totalProduct + price + additionalData + transID + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, transID: transID, productID: productID, phone: phone, fullname: fullname, address: address, paymentType: paymentType, totalProduct: totalProduct, price: price, additionalData: additionalData, apiKey: apiKey, signature: signature};
        this.getPaymentLink(data, test, function (response) {
            fn(response);
        });
    },
    getOrderSteps: function (data, test, fn) {
        var url = config.get('apiUrl') + '/payment/getOrderSteps';
        if (test === 1) {
            url = config.get('apiUrl') + "/sandbox/payment/getOrderSteps";
        }

        var method = "GET";
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Thông báo thành công",
                order_steps: [{
                        code: 'get_full_name',
                        label: 'Họ và tên'
                    }, {
                        code: 'time_delivery',
                        label: 'Thời gian giao hàng'
                    }, {
                        code: 'wish_message',
                        label: 'Lời chúc trên thiệp'
                    }, {
                        code: 'note',
                        label: 'Ghi chú khác'
                    }]
            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                console.log('getPaymentLink response: ' + JSON.stringify(response));
                fn(response);
            });
        }
    },
    getOrderStepsProccess: function (senderID, fanpageID, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, transID: transID, apiKey: apiKey, signature: signature};
        this.getOrderSteps(data, test, function (response) {
            fn(response);
        });
    }
};