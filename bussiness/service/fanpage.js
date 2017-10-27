'use strict';
    const
        config = require('config'),
        crypto = require('crypto'),
        fakeAPI = config.get('fakeAPI'),
        commonLib = require("../common/commonLib"),                 
        test = config.get('test'),
        apiKey = config.get('apiKey'), 
        callApi = require("../common/callApi"),
        redis = require('redis'),
        redisClient = redis.createClient();
    var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');
module.exports = {
    getPageConfig: function (data, test, fn) {
        var url = config.get('apiUrl') + '/fanpage/Config';
        if(test === 1) {
            url = config.get('apiUrl') + "/sandbox/fanpage/Config";
        }
        
        var method = 'GET';
        
        
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Lấy thông tin thành công",
                welcomeMessage: "Chào mừng bạn đến với baobinh.net",
                welcomeBackMessage: "Câu chào khi khách hàng quay trở lại",
                listCategoryMessage: "Câu thông báo kèm theo danh sách danh mục",
                listItemMessage: "Câu thông báo gửi trước danh sách sản phẩm",
                listSupportMessage: "Câu thông báo kèm theo danh sách các mục hỗ trợ",
                chatWithPersonMessage: "Câu thông báo lựa chọn chat với admin hoặc chọn làm lại từ đầu",
                enterPhoneMessage: "Câu thông báo nhập số điện thoại để thanh toán",
                successPaymentMessage: "Câu thông báo thanh toán thành công",
                askForAddressMessage: "Câu thông báo lấy địa chỉ ship hàng",
                thankMessage: "Câu thông báo cảm ơn đã mua hàng",
                shareLink: "http://baobinh.net",
                template: "button",
                enableFAQs: 1,
                buttons: {
                    btn_buy_service: {
                        label: 'Đặt mua hoa',
                        enable: 1,
                        description: 'Mô tả dịch vụ đặt hoa'
                    },
                    btn_faqs_service: {
                        label: 'FAQs',
                        enable: 0,
                        description: 'Mô tả FAQs'
                    },
                    btn_support_service: {
                        label: 'Hỗ trợ',
                        enable: 0,
                        description: 'Mô tả chăm sóc khách hàng'
                    },
                    btn_view_cate: {
                        label: 'Xem danh mục',
                        enable: 1,
                        description: ''
                    },
                    btn_product_link: {
                        label: 'Xem sản phẩm',
                        enable: 1,
                        description: ''
                    },
                    btn_product_buy: {
                        label: 'Mua sản phẩm này',
                        enable: 1,
                        description: ''
                    },
                    btn_payment_now: {
                        label: 'Thanh toán ngay', 
                        enable: 1, 
                        description: "Để thanh toán đơn hàng trên, chọn vào nút thanh toán bên dưới. CHÚ Ý: PHÍ THANH TOÁN CHƯA BAO GỒM PHÍ SHIP"
                    },
                    btn_restart_service: {
                        label: 'Bắt đầu lại',
                        enable: 1,
                        description: ''
                    }
                },
                payments: {
                    cod: 1,
                    atm: 0,
                    visa:1
                }
            });
        } else {
            callApi.callCurlApi(url, method, data, function (response) {
                try {
                    fn(response);
                }catch(err) {
                    console.log(err.message);
                }
            });
        }
    },
    getPageConfigProccess: function(senderID, fanpageID, configCode, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + configCode + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, transID: transID, configCode: configCode, apiKey: apiKey, signature: signature};
        this.getPageConfig(data, test, function (response) {
            fn(response);
        });
    },
    getPageAccessToken: function (data, test, fn) {
        var url = config.get('apiUrl') + '/fanpage/getInfo';
        if(test === 1) {
            url = config.get('apiUrl') + "/sandbox/fanpage/getInfo";
        }
        var method = 'GET';        
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Lấy thông tin fanpage thành công",
                name: "Nice Day",
                description: "Nice Day - Mỗi ngày một niềm vui",
                pageAccessToken: "EAARMwoYypB0BAGodgJ2ZCRxi29QbId7pySmkumBYUOp17CjBpHzqqSScMIDeZA1YlPMZAbgJe86zMVlC7UTAEBUoZBxdl3YKPZBeGCCv2xjZAlCCACjb54A1P8S3kQYV7gsRk0bDmPWAA5f2T7SQyZCy23XWZAVCLzviiUR9fxabcmJZCYKuPknzs"
            });
        } else {
            callApi.callCurlApi(url, method, data, function(response){
                fn(response);
            });
        }
    },
    getPageAccessTokenProccess: function (senderID, fanpageID, fn) {
        if (fakeAPI) {
            fn({pageAccessToken: 'EAARMwoYypB0BAGodgJ2ZCRxi29QbId7pySmkumBYUOp17CjBpHzqqSScMIDeZA1YlPMZAbgJe86zMVlC7UTAEBUoZBxdl3YKPZBeGCCv2xjZAlCCACjb54A1P8S3kQYV7gsRk0bDmPWAA5f2T7SQyZCy23XWZAVCLzviiUR9fxabcmJZCYKuPknzs'});
        } else {
            fn({pageAccessToken: PAGE_ACCESS_TOKEN[fanpageID].token});
        }
    }
};