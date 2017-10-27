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
                        name: "Tên sản phẩm 01",
                        description: "Mô tả sản phẩm 01",
                        image: "http://news.weddingplanner.vn/wp-content/uploads/600x600xNews-Chon-ao-vest-hop-thoi-chuan-dang-cho-chu-re-10.jpg.pagespeed.ic.t8Qrm5qfPd.jpg",
                        receipt_image: "http://news.weddingplanner.vn/wp-content/uploads/600x600xNews-Chon-ao-vest-hop-thoi-chuan-dang-cho-chu-re-10.jpg.pagespeed.ic.t8Qrm5qfPd.jpg",
                        price: 250000,
                        url: "http://baobinh.net/san-pham-100"
                    },
                    {
                        id: 101,
                        name: "Tên sản phẩm 02",
                        description: "Mô tả sản phẩm 02",
                        image: "https://h2tshop.com/media/product/549_2_3.jpg",
                        receipt_image: "https://h2tshop.com/media/product/549_2_3.jpg",
                        price: 150000,
                        url: "http://baobinh.net/san-pham-101"
                    },
                    {
                        id: 102,
                        name: "Tên sản phẩm 03",
                        description: "Mô tả sản phẩm 03",
                        image: "http://thoitrangduynguyet.com/wp-content/uploads/2016/10/ao-vest-tay-dai-mau-xam-2.jpg",
                        receipt_image: "http://thoitrangduynguyet.com/wp-content/uploads/2016/10/ao-vest-tay-dai-mau-xam-2.jpg",
                        price: 350000,
                        url: "http://baobinh.net/san-pham-102"
                    },
                    {
                        id: 103,
                        name: "Tên sản phẩm 103",
                        description: "Mô tả sản phẩm 103",
                        image: "http://suit.vn/upload/info/20847710-103.jpg",
                        receipt_image: "http://suit.vn/upload/info/20847710-103.jpg",
                        price: 250000,
                        url: "http://baobinh.net/san-pham-103"
                    },
                    {
                        id: 104,
                        name: "Tên sản phẩm 05",
                        description: "Mô tả sản phẩm 05",
                        image: "http://dongphuclekha.com/uploads/shopping_products_gallerys/may-dong-vest-cong-so-vest-cong-so-dep-3280-2016-09-08.jpg",
                        receipt_image: "http://dongphuclekha.com/uploads/shopping_products_gallerys/may-dong-vest-cong-so-vest-cong-so-dep-3280-2016-09-08.jpg",
                        price: 250000,
                        url: "http://baobinh.net/san-pham-104"
                    },
                    {
                        id: 105,
                        name: "Tên sản phẩm 06",
                        description: "Mô tả sản phẩm 06",
                        image: "https://h2tshop.com/media/product/549_2_3.jpg",
                        receipt_image: "https://h2tshop.com/media/product/549_2_3.jpg",
                        price: 150000,
                        url: "http://baobinh.net/san-pham-105"
                    },
                    {
                        id: 106,
                        name: "Tên sản phẩm 07",
                        description: "Mô tả sản phẩm 05",
                        image: "http://suit.vn/upload/info/20847710-103.jpg",
                        receipt_image: "http://suit.vn/upload/info/20847710-103.jpg",
                        price: 350000,
                        url: "http://baobinh.net/san-pham-106"
                    },
                    {
                        id: 107,
                        name: "Tên sản phẩm 08",
                        description: "Mô tả sản phẩm 06",
                        image: "https://h2tshop.com/media/product/855_1_1.jpg",
                        receipt_image: "https://h2tshop.com/media/product/855_1_1.jpg",
                        price: 250000,
                        url: "http://baobinh.net/san-pham-107"
                    },
                    {
                        id: 108,
                        name: "Tên sản phẩm 09",
                        description: "Mô tả sản phẩm 09",
                        image: "http://images.songson.vn/larges/2016/2/19/vest-nam-02-1456941876.jpg",
                        receipt_image: "http://images.songson.vn/larges/2016/2/19/vest-nam-02-1456941876.jpg",
                        price: 150000,
                        url: "http://baobinh.net/san-pham-108"
                    },
                    {
                        id: 109,
                        name: "Tên sản phẩm 10",
                        description: "Mô tả sản phẩm 10",
                        image: "http://suit.vn/upload/info/20847710-103.jpg",
                        receipt_image: "http://suit.vn/upload/info/20847710-103.jpg",
                        price: 350000,
                        url: "http://baobinh.net/san-pham-109"
                    },
                    {
                        id: 110,
                        name: "Tên sản phẩm 110",
                        description: "Mô tả sản phẩm 110",
                        image: "http://thoitrangduynguyet.com/wp-content/uploads/2016/11/ao-vest-nu-khong-co-mau-trang-kem-1.jpg",
                        receipt_image: "http://thoitrangduynguyet.com/wp-content/uploads/2016/11/ao-vest-nu-khong-co-mau-trang-kem-1.jpg",
                        price: 450000,
                        url: "http://baobinh.net/product-110"
                    },
                    {
                        id: 111,
                        name: "Tên category 111",
                        description: "Mô tả category 111",
                        image: "http://suit.vn/upload/info/20847710-103.jpg",
                        receipt_image: "http://suit.vn/upload/info/20847710-103.jpg",
                        price: 150000,
                        url: "http://baobinh.net/product-111"
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