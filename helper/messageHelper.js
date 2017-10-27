'use strict';
const
        config = require('config'),
        commonLib = require('../bussiness/common/commonLib');

module.exports = {
    makeProductCategoryQuickReplies: function (page, totalPage, offset, endLen, listProductCategory, postBackPayload) {
        var quick_replies = [];
        for (var i = offset; i < endLen; i++) {
            quick_replies.push({
                content_type: 'text',
                title: listProductCategory[i].name,
                payload: commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + listProductCategory[i].id)
            });
        }
        if (page < totalPage) {
            var nextPage = parseInt(page) + 1;
            quick_replies.push({
                content_type: 'text',
                title: "Xem thêm danh mục",
                payload: commonLib.base64UrlEndcode(postBackPayload + "?page=" + nextPage)
            });
        }
        return quick_replies;
    },
    makeProductCategoryGenericElements: function (page, totalPage, offset, endLen, listProductCategory, postBackPayload, pageConfig) {
        var elements = [];
        for (var i = offset; i < endLen; i++) {
            elements.push({
                title: listProductCategory[i].name,
                image_url: listProductCategory[i].image,
                subtitle: listProductCategory[i].description,
                buttons: [
                    {
                        type: "postback",
                        title: (listProductCategory[i].buttonTitle)?listProductCategory[i].buttonTitle: pageConfig.buttons.btn_view_cate.label,
                        payload: commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + listProductCategory[i].id)
                    }
                ]
            });
        }
        if (page < totalPage) {
            var nextPage = parseInt(page) + 1;
            elements.push({
                title: "Danh mục khác",
                image_url: config.get('nextIcon'),
                subtitle: "Nhấp chuột để xem thêm danh mục",
                buttons: [
                    {
                        type: "postback",
                        title: "Xem thêm danh mục",
                        payload: commonLib.base64UrlEndcode(postBackPayload + "?page=" + nextPage)
                    }
                ]
            });
        }
        return elements;
    },
    makeProductGenericElements: function (offset, endLen, listProducts, postBackPayload, cateID) {
        var elements = [];
        for (var i = offset; i < endLen; i++) {
            elements.push({
                title: listProducts[i].name,
                item_url: listProducts[i].url,
                image_url: listProducts[i].image,
                subtitle: commonLib.formatPrice(listProducts[i].price, 0, '.', '') + " VNĐ",
                buttons: [
                    {
                        type: "web_url",
                        url: listProducts[i].url,
                        title: "Xem link",
                    },
                    {
                        type: "postback",
                        title: "Mua hàng",
                        payload: commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + listProducts[i].id + "&productName=" + listProducts[i].name + "&productPrice=" + listProducts[i].price + "&productImage=" + listProducts[i].receipt_image)
                    }
                ]
            });
        }
        return elements;
    }
};