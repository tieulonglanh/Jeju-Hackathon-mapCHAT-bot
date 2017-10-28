'use strict';
    const
        config = require('config'),
        commonLib = require("../common/commonLib"), 
        crypto = require('crypto'),
        apiKey = config.get('apiKey'), 
        test = config.get('test'),
        callApi = require("../common/callApi");
    
module.exports = {    
    getListProductCategory: function (data, test, fn) {
        var url = config.get('apiUrl') + '/product/listProductCategory';
        if(test === 1) {
            url = config.get('apiUrl') + "/sandbox/product/listProductCategory";
        }
        
        var method = 'GET';
        var fakeAPI = config.get('fakeAPI');
        if (fakeAPI) {
            var response = {
                error_code: 0,
                error_message: "Thông báo thành công",
                data:[
                    {
                        id: 100,
                        name: "Tên category 01",
                        description: "Mô tả category 01",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 1'
                    },
                    {
                        id: 101,
                        name: "Tên category 02",
                        description: "Mô tả category 02",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 02'
                    },
                    {
                        id: 102,
                        name: "Tên category 03",
                        description: "Mô tả category 03",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 03'
                    },
                    {
                        id: 103,
                        name: "Tên category 04",
                        description: "Mô tả category 04",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 04'
                    },
                    {
                        id: 104,
                        name: "Tên category 05",
                        description: "Mô tả category 05",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 05'
                    },
                    {
                        id: 105,
                        name: "Tên category 06",
                        description: "Mô tả category 06",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 06'
                    },
                    {
                        id: 106,
                        name: "Tên category 07",
                        description: "Mô tả category 07",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 7'
                    },
                    {
                        id: 107,
                        name: "Tên category 08",
                        description: "Mô tả category 08",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 08'
                    },
                    {
                        id: 108,
                        name: "Tên category 09",
                        description: "Mô tả category 09",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 09'
                    },
                    {
                        id: 109,
                        name: "Tên category 10",
                        description: "Mô tả category 10",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 10'
                    },
                    {
                        id: 110,
                        name: "Tên category 11",
                        description: "Mô tả category 11",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 11'
                    },
                    {
                        id: 110,
                        name: "Tên category 12",
                        description: "Mô tả category 12",
                        image: "https://shophub.vn/images/boticon/shop.jpg",
                        buttonTitle: 'button title 12'
                    }
                ]
            };
            fn(response);
        } else {
            callApi.callCurlApi(url, method, data, function(response){
                console.log('logMessage response: ' + JSON.stringify(response));
                fn(response);
            });
        }
    },
    getListProductCategoryProccess: function (senderID, fanpageID, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + transID + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, transID: transID, apiKey: apiKey, signature: signature};
        this.getListProductCategory(data, test, function (response) {
            fn(response);
        });
    },
    getListProducts: function (data, test, fn) {
        var url = config.get('apiUrl') + '/product/listProduct';
        if(test === 1) {
            url = config.get('apiUrl') + "/sandbox/product/listProduct";
        }
        
        var method = 'GET';
        var fakeAPI = config.get('fakeAPI');
        if (fakeAPI) {
            var response = {
                error_code: 0,
                error_message: "Thông báo thành công",
                data:[
                    {
                        id: 100,
                        name: "Kimchi",
                        description: "Chili Pickled Cabbage",
                        image: "https://migrationology.com/wp-content/uploads/2012/05/kim-chi.jpg",
                        receipt_image: "https://migrationology.com/wp-content/uploads/2012/05/kim-chi.jpg",
                        price: 3,
                        url: "https://www.maangchi.com/recipes/kimchi"
                    },
                    {
                        id: 101,
                        name: "Samgyeopsal",
                        description: "Fatty slices of pork belly grilled before your nose",
                        image: "https://farm6.staticflickr.com/5452/7098094895_7f0fa2d4a2_z.jpg",
                        receipt_image: "https://farm6.staticflickr.com/5452/7098094895_7f0fa2d4a2_z.jpg",
                        price: 5,
                        url: "https://www.travelgluttons.com/eat-samgyeopsal-%EC%82%BC%EA%B2%B9%EC%82%B4/"
                    },
                    {
                        id: 102,
                        name: "Pork Bulgogi",
                        description: "Another famous Korean specialty barbecued meat is known as Bulgogi",
                        image: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                        receipt_image: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                        price: 6,
                        url: "http://crazykoreancooking.com/recipe/spicy-pork-bulgogi-spicy-marinated-pork"
                    },
                    {
                        id: 103,
                        name: "Korean Barbecue",
                        description: "A traditional Korean barbecue feast",
                        image: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                        receipt_image: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                        price: 5,
                        url: "https://www.maangchi.com/recipes/BBQ"
                    }                    
                ]
            };
            fn(response);
        } else {
            callApi.callCurlApi(url, method, data, function(response){
                console.log('getListProducts response: ' + JSON.stringify(response));
                fn(response);
            });
        }
    },
    getListProductProccess: function (senderID, fanpageID, cateID, fn) {
        var date = new Date();
        var timeOfMessage = date.getTime();
        var transID = senderID + timeOfMessage + commonLib.getRandomInt(0, 9999);
        var signature = crypto.createHash('md5').update(senderID + fanpageID + cateID + transID + apiKey).digest("hex");
        var data = {senderID: senderID, fanpageID: fanpageID, transID: transID, cateID: cateID, apiKey: apiKey, signature: signature};
        this.getListProducts(data, test, function (response) {
            fn(response);
        });
    }
};