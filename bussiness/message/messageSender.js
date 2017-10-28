'use strict';
const
        badwordLib = require('../language/badwordLib'),
        config = require('config'),
        fanpageLib = require('../service/fanpage'),
        paymentLib = require('../service/payment'),
        callApi = require('../common/callApi'),
        commonLib = require('../common/commonLib'),
        productLib = require('../service/product'),
        messageHelper = require('../../helper/messageHelper'),
        redis = require('redis');

var redisClient = redis.createClient();
redisClient.on('connect', function () {
    console.log('Redis connected');
});
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');
module.exports = {
    sendTextMessage: function (senderID, fanpageID, messageText, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                recipient: {
                    id: senderID
                },
                message: {
                    text: messageText,
                    metadata: "DEVELOPER_DEFINED_METADATA"
                }
            };

            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (response) {
                if (response.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendTextMessageByToken: function (senderID, pageAccessToken, messageText, fn) {
        var messageData = {
            recipient: {
                id: senderID
            },
            message: {
                text: messageText,
                metadata: "DEVELOPER_DEFINED_METADATA"
            }
        };

        callApi.callSendAPICallback(messageData, pageAccessToken, senderID,  function (response) {
            if (response.error_code === 0) {
                fn(true);
            } else {
                fn(false);
            }
        });
    },
    sendGiftMessage: function (senderID, fanpageID, url, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                "recipient":{
                    "id": senderID
                },
                "message": {
                    "attachment": {
                        "type": "image",
                        "payload": {
                            "url": url
                        }
                    }
                }
            };

            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (response) {
                if (response.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    senderListTemplate: function (senderID, fanpageID, elements, link, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                "recipient": {
                    "id": senderID
                }, "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "list",
                            "top_element_style": "compact",
                            "elements": elements,
                            "buttons": [
                                {
                                    "title": "Chia sẻ",
                                    type: "web_url",
                                    url: "http://www.facebook.com/sharer/sharer.php?u=" + link,
                                }
                            ]
                        }
                    }
                }

            };
            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (response) {
                if (response.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendQuickReply: function (senderID, fanpageID, textConfig, quick_replies, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                recipient: {
                    id: senderID
                },
                message: {
                    text: textConfig,
                    quick_replies: quick_replies
                }
            };

            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (response) {
                if (response.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendGenericMessage: function (senderID, fanpageID, elements, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                "recipient": {
                    "id": senderID
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type": "generic",
                            "elements": elements
                        }
                    }
                }
            };
            console.log("sendGenericMessage pageAccessToken: " + response.pageAccessToken);
            console.log("sendeGenericMessage messageData: " + JSON.stringify(messageData));
            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (reply) {
                console.log("Error sendGenericMessage: " + JSON.stringify(reply));
                if (reply.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendButtonTemplate: function (senderID, fanpageID, text, buttons, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var messageData = {
                recipient: {
                    id: senderID
                },
                message: {
                    attachment: {
                        type: "template",
                        payload: {
                            template_type: "button",
                            text: text,
                            buttons: buttons
                        }
                    }
                }
            };

            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (reply) {
                console.log("Error sendButtonTemplate: " + JSON.stringify(reply));
                if (reply.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendButtonTemplate2: function (senderID, pageAccessToken, text, buttons, fn) {
        var messageData = {
            recipient: {
                id: senderID
            },
            message: {
                attachment: {
                    type: "template",
                    payload: {
                        template_type: "button",
                        text: text,
                        buttons: buttons
                    }
                }
            }
        };

        callApi.callSendAPICallback(messageData, pageAccessToken, senderID,  function (reply) {
            console.log("Error sendButtonTemplate: " + JSON.stringify(reply));
            if (reply.error_code === 0) {
                fn(true);
            } else {
                fn(false);
            }
        });
    },
    sendRecipientTemplate: function (senderID, fanpageID, orderData, elements, fn) {
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            var additionalString = orderData.additionalData;
            console.log("LOG additionalString:" + additionalString); 
            additionalString = commonLib.replaceAll(additionalString, "&", " - ");
            console.log('LOG additionalString after convert 1: ' + additionalString);
            additionalString = commonLib.replaceAll(additionalString, "=", ": ");
            console.log('LOG additionalString after convert 2: ' + additionalString);
            var recipientName = "Người mua: " + orderData.recipient_name + " - Địa chỉ: " + orderData.address + " - SĐT: " + orderData.phone + additionalString;
            
            var messageData = {
                "recipient": {
                    "id": senderID
                },
                "message": {
                    "attachment": {
                        "type": "template",
                        "payload": {
                            "template_type":"receipt",
                            "recipient_name":recipientName,
                            "order_number":orderData.order_number,
                            "currency":orderData.currency,
                            "payment_method":orderData.payment_method,        
                            "elements": elements,
                            "summary": {
                                "total_cost":  parseInt(orderData.price) * parseInt(orderData.totalProduct)
                            }
                        }
                    }
                }
            };
            console.log("sendRecipientTemplate messageData: " + JSON.stringify(messageData));
            callApi.callSendAPICallback(messageData, response.pageAccessToken, senderID,  function (reply) {
                console.log("Error sendRecipientTemplate: " + JSON.stringify(reply));
                if (reply.error_code === 0) {
                    fn(true);
                } else {
                    fn(false);
                }
            });
        });
    },
    sendTypingOn: function (recipientId, fanpageID) {
        console.log("Turning typing indicator on");

        var messageData = {
            recipient: {
                id: recipientId
            },
            sender_action: "typing_on"
        };

        callApi.callSendAPI(messageData, fanpageID);
    },
    sendBadWordResponse: function (senderID, fanpageID, messageText) {
        var messageTextArr = messageText.split(" ");
        console.log(messageTextArr);
        var check_bad_talk = messageTextArr.filter(badwordLib.badWordChecker);
        console.log("bad talk:" + check_bad_talk);
        if (check_bad_talk.length > 0) {
            var messageText = "Đề nghị bạn nói chuyện lịch sự";
            var url = config.get('badwordGiftUrl');
//            var messageSender = this;
//            this.sendGiftMessage(senderID, url, fanpageID, function (response) {
//                if (response) {
                    this.sendTextMessage(senderID, fanpageID, messageText, function () {

                    });
//                }
//            });
        }
    },
    sendRestartService: function (senderID, recipientID) {
        var serviceText = "To start again, please click button \"Start Again\"!";
        var buttons = [{
                "type": "postback",
                "title": "Start Again",
                "payload": commonLib.base64UrlEndcode("restart")
            }];
        this.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
            if (response) {
                console.log("SEND RESTART BUTTON: " + response);
            }
        });
    },
    sendWelcomeMessage: function (senderID, recipientID) {
        var messageSender = this;
        redisClient.get(senderID + ":" + recipientID + ":hasVisited", function (err, hasVisited) {
            var pageToken = PAGE_ACCESS_TOKEN[recipientID].token;


            callApi.callGetInfoCallback(senderID, pageToken, function (userInfo) {
                var sendMessage = "Hi, I'm gonna help you live eco-friendly while saving money.";
                if(hasVisited) {
                    sendMessage = "Hi, welcome back. I'm gonna help you live live eco-friendly while saving money.";
                }
                if (userInfo.error_code === 0) {
                    sendMessage = "Hi " + userInfo.data.first_name + ", I'm gonna help you live eco-friendly while saving money.";
                    if(hasVisited) {
                        sendMessage = "Hi " + userInfo.data.first_name + ", welcome back. I'm gonna help you live eco-friendly while saving money.";
                    }
                }
                messageSender.sendTypingOn(senderID, recipientID);
                var quick_replies = [
                    {
                        "content_type": 'text',
                        "title": "Ok!",
                        "payload": commonLib.base64UrlEndcode('ok')
                    }];
                messageSender.sendQuickReply(senderID, recipientID, sendMessage, quick_replies, function (response) {
                    if (response) {
                        console.log("sendWelcomeMessage: " + response);
                    }
                });
            });
        });
    },
    sendWelcomeVoiceMessage: function (senderID, recipientID) {
        var messageSender = this;
        var sendMessage = "Hi, I'm gonna help you live eco-friendly while saving money. Please enter your voice to register to our security system.";
        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function(response){
            if(response) {
                console.log("sendWelcomeVoiceMessage response: " + response);
            }
        });
    },
    sendWelcomeBackMessage: function (senderID, recipientID) {
        var messageSender = this;
        var pageToken = PAGE_ACCESS_TOKEN[recipientID].token;
        
        var date = new Date();
        var curTime = date.getTime();
        
        callApi.callGetInfoCallback(senderID, pageToken, function (userInfo) {
            redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
                console.log("Set curTime: " + reply);
            });

            var sendMessage = "Hi, good morning! Today the weather is quite good. You should have some out door activities.";
            if (userInfo.error_code === 0) {
                sendMessage = "Hi " + userInfo.data.first_name + ", good morning! Today the weather is quite good. You should have some out door activities.";
            }
            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                if (response) {
                    var url = config.get('sunnyWeatherImage');
                    messageSender.sendGiftMessage(senderID, recipientID, url, function (response){
                        if(response) {
                            setTimeout(function () {
                                var sendText = "I found that you've just took a shower, and you used more water than yesterday. Please be mindful to use less water tormorrow.";
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "Thank you!",
                                        "payload": commonLib.base64UrlEndcode('gotit')
                                    }, {
                                        "content_type": 'text',
                                        "title": "Remind me tormorrow!",
                                        "payload": commonLib.base64UrlEndcode('gotit')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                    if (response) {
                                        console.log("GOT IT Quick Reply Send: " + response);
                                    }
                                });
                            }, 10000);
                        }
                    });
                }
            });
        });
    },
    sendLocationRequest: function (senderID, recipientID, type) {
        var messageSender = this;
        
        var date = new Date();
        var curTime = date.getTime();
        redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
            console.log("Set curTime: " + reply);
        });
        var serviceText = "Please send me your location!";
        var quick_replies = [{
                "content_type":"location",
                "title": "Send Me Your Location"
            },
            {
                "content_type": 'text',
                "title": "Restart",
                "payload": commonLib.base64UrlEndcode('restart')
            }];
        messageSender.sendQuickReply(senderID, recipientID, serviceText, quick_replies, function (response) {
            if (response) {
                console.log("Send Request Location: " + response);
                redisClient.set(senderID + ":" + recipientID + ":lastUserAction", "location_of_" + type, function (err, reply) {
                    console.log("Set curTime: " + reply);
                });
            }
        });
        
    },    
    sendButtonServices: function (senderID, fanpageID, textMessage) {
        var messageSender = this;
        fanpageLib.getPageConfigProccess(senderID, fanpageID, 'all', function (response) {
            if (response.error_code === 0) {
                if(response.template === 'button') {
                    var serviceButton = [];
                    serviceButton.push({
                        "type": "postback",
                        "title": response.buttons.btn_buy_service.label,
                        "payload": commonLib.base64UrlEndcode("shop")
                    });
                    if(response.buttons.btn_faqs_service.enable == 1){
                        serviceButton.push({
                            "type": "postback",
                            "title": response.buttons.btn_faqs_service.label,
                            "payload": commonLib.base64UrlEndcode("faq")
                        });
                    }
                    if(response.buttons.btn_support_service.enable == 1){
                        serviceButton.push({
                            "type": "postback",
                            "title": response.buttons.btn_support_service.label,
                            "payload": commonLib.base64UrlEndcode("support")
                        });
                    }
                    messageSender.sendButtonTemplate(senderID, fanpageID, textMessage, serviceButton, function(sendButtonTemplateResponse){
                        console.log("sendButtonService sendButtonTemplateResponse status: " + sendButtonTemplateResponse);
                    });
                }
            }
        });
    },
    sendListCategories: function (senderID, fanpageID, postBackPayload, page) {
        console.log("SENDLISTCATE PAGE: " + page);
        var messageSender = this;
        productLib.getListProductCategoryProccess(senderID, fanpageID, function (response) {
            if (response.error_code === 0) {
                var listProductCategory = response.data;
                if (listProductCategory.length > 0) {
                    var limit = 9;
                    var offset = (page - 1) * limit;
                    var len = listProductCategory.length;
                    var totalPage = Math.ceil(len / limit);
                    var endLen = page * limit;
                    if (page == totalPage) {
                        endLen = len;
                    }
                    console.log("Total Category Page: " + totalPage);
                    console.log("current Page: " + page);
                    console.log("offset Page: " + offset);
                    
                    //var quick_replies = messageHelper.makeProductCategoryQuickReplies(page, totalPage, offset, endLen, listProductCategory, postBackPayload);
                    fanpageLib.getPageConfigProccess(senderID, fanpageID, 'all', function (response) {
                        var elements = messageHelper.makeProductCategoryGenericElements(page, totalPage, offset, endLen, listProductCategory, postBackPayload, response);
                        console.log("sendListCategories elements: " + JSON.stringify(elements));
                    
                        //messageSender.sendQuickReply(senderID, fanpageID, response.listCategoryMessage, quick_replies, function (response) {
                        messageSender.sendTextMessage(senderID, fanpageID, response.listCategoryMessage, function (sendTextMessageResponse) {
                            if (sendTextMessageResponse) {
                                messageSender.sendGenericMessage(senderID, fanpageID, elements, function() {
                                    console.log("sendListCategories getPageConfigProccess sendGenericMessage status: " + response);
                                });
                            }
                        });
                    });
                } else {
                    var errorMessage = "Shop chưa có danh mục sản phẩm nào. Vui lòng thử lại sau!";
                    messageSender.sendTextMessage(senderID, fanpageID, errorMessage, function (response) {
                        console.log("sendListCategories sendTextMessage status: " + response);
                        if (response) {

                        }
                    });
                }
            } else {
                var errorMessage = "Có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau!";
                messageSender.sendTextMessage(senderID, fanpageID, errorMessage, function (response) {
                    console.log("sendListCategories sendTextMessage status: " + response);
                });
            }
        });
    },
    sendListProducts: function (senderID, fanpageID, postBackPayload, cateID, page) {
        var messageSender = this;
        productLib.getListProductProccess(senderID, fanpageID, cateID, function (response) {
            if (response.error_code === 0) {
                var listProducts = response.data;
                console.log('LIST PRODUCTS: ' + JSON.stringify(listProducts));
                if (listProducts.length > 0) {
                    fanpageLib.getPageConfigProccess(senderID, fanpageID, 'all', function (response) {
                        console.log("LIST PRODUCT getPageConfigProccess: " + JSON.stringify(response));
                        if (response.error_code === 0) {                            
                            var elements = [];
                            var limit = 9;
                            var offset = (page - 1) * limit;
                            var len = listProducts.length;
                            var totalPage = Math.ceil(len / limit);
                            var endLen = page * limit;
                            if (page == totalPage) {
                                endLen = len;
                            }
                            console.log("Total listProducts Page: " + totalPage);
                            console.log("current Page: " + page);
                            console.log("offset Page: " + offset);

                            for (var i = offset; i < endLen; i++) {
                                var elements_button = [];
//                                if(response.buttons.btn_product_link.enable == 1) {
                                elements_button.push({
                                    type: "web_url",
                                    url: listProducts[i].url,
                                    title: response.buttons.btn_product_link.label,
                                });
//                                }
                                if(listProducts[i].type === 'product') {
                                    elements_button.push({
                                        type: "postback",
                                        title: response.buttons.btn_product_buy.label,
                                        payload: commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + listProducts[i].id + "&productName=" + listProducts[i].name + "&productPrice=" + listProducts[i].price + "&productImage=" + listProducts[i].receipt_image)
                                    });
                                    
                                    elements.push({
                                        title: listProducts[i].name,
                                        item_url: listProducts[i].url,
                                        image_url: listProducts[i].image,
                                        subtitle: commonLib.formatPrice(listProducts[i].price, 0, '.', '') + " VNĐ",
                                        buttons: elements_button
                                    });
                                }
                                if(listProducts[i].type == 'news') {                
                                    elements.push({
                                        title: listProducts[i].name,
                                        item_url: listProducts[i].url,
                                        image_url: listProducts[i].image,
                                        subtitle: listProducts[i].description,
                                        buttons: elements_button
                                    });
                                }
                            }
                            console.log("sendListProducts elements: " + JSON.stringify(elements));
                            var listItemMessage = response.listItemMessage;
                            messageSender.sendTextMessage(senderID, fanpageID, listItemMessage, function (sendTextMessageResponse) {
                                if (sendTextMessageResponse) {
                                    console.log("sendListProducts sendTextMessage status: " + JSON.stringify(sendTextMessageResponse));
                                    messageSender.sendGenericMessage(senderID, fanpageID, elements, function (sendGenericMessageResponse) {
                                        console.log("sendListProducts getPageConfigProccess sendGenericMessage status: " + sendGenericMessageResponse);
                                        if (sendGenericMessageResponse) {
                                            if (page < totalPage) {
                                                var paggingElements = [];
                                                var nextPage = parseInt(page) + 1;
                                                paggingElements.push({
                                                    "type": "postback",
                                                    "title": "Xem trang " + nextPage,
                                                    "payload": commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&page=" + nextPage)
                                                });
                                                console.log("sendListProducts paggingElements: " + JSON.stringify(paggingElements));
                                                var textPagging = "Danh  mục còn sản phẩm. Nhấp để xem thêm!";
                                                messageSender.sendButtonTemplate(senderID, fanpageID, textPagging, paggingElements, function (sendButtonTemplateResponse) {

                                                });
                                            }
                                        }
                                    });
                                }
                            });
                        }
                    });
                } else {
                    var errorMessage = "Danh mục không có sản phẩm nào. Vui lòng thử lại sau!";
                    messageSender.sendTextMessage(senderID, fanpageID, errorMessage, function (response) {
                        console.log("sendListProducts sendTextMessage status: " + response);
                        if (response) {
                            messageSender.sendListCategories(senderID, fanpageID, postBackPayload, 1);
                        }
                    });
                }
            } else {
                var errorMessage = "Có lỗi xảy ra trên hệ thống. Vui lòng thử lại sau!";
                messageSender.sendTextMessage(senderID, fanpageID, errorMessage, function (response) {
                    console.log("sendListProducts sendTextMessage status: " + response);
                });
            }
        });
    },
    sendChoosePayment: function (senderID, recipientID, postBackPayload, cateID, productID, productName, productPrice, productImage) {
        var messageSender = this;
        fanpageLib.getPageConfigProccess(senderID, recipientID, 'payments', function (response) {
            console.log("CHOOSE PAYMENT: " + JSON.stringify(response));
            var textConfig = "Xin hãy chọn phương thức thanh toán:";
            var quick_replies = [];
            quick_replies.push({
                "content_type": 'text',
                "title": "COD",
                "payload": commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + productID + "&productName=" + productName + "&productPrice=" + productPrice + "&productImage=" + productImage + "&paymentType=cod")
            });
            if(response.payments.chuyen_khoan == 1) {
                quick_replies.push({
                    "content_type": 'text',
                    "title": "Chuyển Khoản",
                    "payload": commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + productID + "&productName=" + productName + "&productPrice=" + productPrice + "&productImage=" + productImage + "&paymentType=chuyen_khoan")
                });
            }
            if(response.payments.atm == 1) {
                quick_replies.push({
                    "content_type": 'text',
                    "title": "ATM",
                    "payload": commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + productID + "&productName=" + productName + "&productPrice=" + productPrice + "&productImage=" + productImage + "&paymentType=atm")
                });
            } 
            if (response.payments.visa == 1) {
                quick_replies.push({
                    "content_type": 'text',
                    "title": "CREDIT",
                    "payload": commonLib.base64UrlEndcode(postBackPayload + "?cateID=" + cateID + "&productID=" + productID + "&productName=" + productName + "&productPrice=" + productPrice + "&productImage=" + productImage + "&paymentType=visa")
                });
            }
            console.log("sendChoosePayment quick reply: " + JSON.stringify(quick_replies));
            messageSender.sendQuickReply(senderID, recipientID, textConfig, quick_replies, function (response) {
                console.log("sendChoosePayment sendQuickReply response: " + response);
            });
        });
    },
    sendEnterPhone: function (senderID, fanpageID, postBackPayload, request) {
        var messageSender = this;
        fanpageLib.getPageConfigProccess(senderID, fanpageID, 'enterPhoneMessage', function (response) {
            if (response.error_code === 0) {
                messageSender.sendTextMessage(senderID, fanpageID, response.enterPhoneMessage, function (response) {
                    if (response) {
                        redisClient.set(senderID + ":" + fanpageID + ":lastUserAction", "input_customer_phone_number", function (err, reply) {
                            console.log("sendEnterPhone Redis set lastUserAction: " + reply);
                            redisClient.set(senderID + ":" + fanpageID + ":lastUserActionQuery", postBackPayload + "?" + request, function (err, reply) {
                                console.log("sendEnterPhone Redis set lastUserActionQuery: " + reply);
                            });
                        });
                    }
                });
            }
        });
    },
    sendEnterAddress: function (senderID, fanpageID, postBackPayload, request) {
        var messageSender = this;
        fanpageLib.getPageConfigProccess(senderID, fanpageID, 'askForAddressMessage', function (response) {
            if (response.error_code === 0) {
                messageSender.sendTextMessage(senderID, fanpageID, response.askForAddressMessage, function (reply) {
                    if (reply) {
                        redisClient.set(senderID + ":" + fanpageID + ":lastUserAction", "input_customer_address", function (err, reply) {
                            console.log("sendEnterAddress Redis set lastUserAction: " + reply);
                            redisClient.set(senderID + ":" + fanpageID + ":lastUserActionQuery", postBackPayload + "?" + request, function (err, reply) {
                                console.log("sendEnterAddress Redis set lastUserActionQuery: " + reply);
                            });
                        });
                    }
                });
            }
        });
    },
    sendAdditionOptions: function (senderID, fanpageID, orderSteps, postBackPayload, request, additionalRequest) {
        
        var currentStep = orderSteps[0];
        console.log("Current Step: " + JSON.stringify(currentStep));
        console.log("NewOrderSteps: " + JSON.stringify(orderSteps));
        orderSteps.shift();
        if(orderSteps.length > 0) {
            var lastUserAdditionalAction = {
                action: currentStep.code,
                query: additionalRequest,
                orderSteps: orderSteps
            };
        }else{
            var lastUserAdditionalAction = {
                action: currentStep.code,                
                query: additionalRequest,
                orderSteps: "finish"
            };
        }
        console.log("lastUserAdditionalAction: " + JSON.stringify(lastUserAdditionalAction));
        this.sendTextMessage(senderID, fanpageID, currentStep.label, function (reply) {
            if (reply) {
                redisClient.set(senderID + ":" + fanpageID + ":lastUserAction", "input_customer_addition", function (err, reply) {
                    console.log("sendEnterAddress Redis set lastUserAction: " + reply);                    
                });
                redisClient.set(senderID + ":" + fanpageID + ":lastUserActionQuery", postBackPayload + "?" + request, function (err, reply) {
                    console.log("sendEnterAddress Redis set lastUserActionQuery: " + reply);
                });
                redisClient.set(senderID + ":" + fanpageID + ":lastUserAdditionalAction", JSON.stringify(lastUserAdditionalAction), function (err, reply) {
                    console.log("sendEnterAddress Redis set lastUserAdditionalAction: " + reply);
                });
            }
        });
    },
    sendPaymentLink: function (senderID, fanpageID, request, additionalData) {
        var requestObj = commonLib.URLToArray(request);
        var messageSender = this;
        fanpageLib.getPageAccessTokenProccess(senderID, fanpageID, function (response) {
            callApi.callGetInfoCallback(senderID, response.pageAccessToken, function (userInfo) {
                var fullname = "";
                if (userInfo.error_code === 0) {
                    fullname = userInfo.data.last_name + " " + userInfo.data.first_name;
                } else {
                    fullname = senderID + ":Unkown name";
                }
                console.log("sendPaymentLink queryObj: " + JSON.stringify(requestObj));
                console.log("sendPaymentLink userInfo: " + JSON.stringify(userInfo.data.first_name));
                console.log("sendPaymentLink fullname: " + fullname);
                var totalProduct = 1;
                var productID = requestObj.productID;
                var phone = requestObj.phone;
                var address = requestObj.address;
                var paymentType = requestObj.paymentType;
                var productPrice = requestObj.productPrice;
                var productName = requestObj.productName;
                var productImage = requestObj.productImage;
                if(additionalData !== '') {
                    var additionalJsonString = commonLib.base64UrlEndcode(JSON.stringify(commonLib.AdditionToArray(additionalData)));
                }else{
                    var additionalJsonString = additionalData;
                }
                console.log("additionalJsonString: " + additionalJsonString);
                paymentLib.getPaymentLinkProccess(senderID, fanpageID, productID, phone, fullname, address, paymentType, totalProduct, productPrice, additionalJsonString, function (paymentLinkInfo) {
                    if (paymentLinkInfo.error_code === 0) {
                        console.log("sendPaymentLink receipt paymentLinkInfo: " + JSON.stringify(paymentLinkInfo));
                        var orderData = {
                            "recipient_name": fullname,
                            "order_number": paymentLinkInfo.order_id,
                            "currency": "VND",
                            "payment_method": paymentType.toUpperCase(),
                            "address": address,
                            "price": parseInt(productPrice),
                            "totalProduct": totalProduct,
                            "phone": phone,
                            "additionalData": additionalData
                        };
                        var elements = [{
                                "title": productName,
                                "quantity": 1,
                                "price": parseInt(productPrice),
                                "currency": "VND",
                                "image_url": productImage
                            }];
                        console.log("sendPaymentLink receipt elements: " + JSON.stringify(elements));
                        console.log("sendPaymentLink receipt orderData: " + JSON.stringify(orderData));
                        messageSender.sendRecipientTemplate(senderID, fanpageID, orderData, elements, function (receiptResponse) {
                            if (receiptResponse) {
                                if (requestObj.paymentType === 'cod' || requestObj.paymentType === 'chuyen_khoan') {
                                    fanpageLib.getPageConfigProccess(senderID, fanpageID, 'all', function (getPageConfigProccessResponse) {
                                        var successMessage;
                                        if(requestObj.paymentType === 'cod') {
                                            successMessage = getPageConfigProccessResponse.thankMessage;
                                        }else{
                                            successMessage = getPageConfigProccessResponse.transferThankMessage;
                                        }
                                        var btnRestartService = getPageConfigProccessResponse.buttons.btn_restart_service;
                                        messageSender.sendTextMessage(senderID, fanpageID, successMessage, function (response) {
                                            console.log("sendPaymentLink getPageConfigProccess sendTextMessage status: " + response);
                                            if(response) {
                                                var text = "Để bắt đầu lại từ đầu, xin hãy nhấp vào nút bên dưới.";
                                                var buttons = [{
                                                        "type": "postback",
                                                        "title": btnRestartService.label,
                                                        "payload": commonLib.base64UrlEndcode('restart')
                                                    }];
                                                messageSender.sendButtonTemplate(senderID, fanpageID, text, buttons, function (sendRestartButtonResponse) {
                                                    console.log("sendPaymentLink sendButtonTemplate restart status" + sendRestartButtonResponse)
                                                });
                                            }
                                        });
                                    });
                                } else {
                                    fanpageLib.getPageConfigProccess(senderID, fanpageID, 'buttons', function (getPageConfigProccessResponse) {
                                        console.log('SEND LINK PAYMENT PAGE CONFIG PROCCESS: ' + JSON.stringify(getPageConfigProccessResponse));
                                        var text = getPageConfigProccessResponse.buttons.btn_payment_now.description;
                                        var buttons = [{
                                                type: "web_url",
                                                url: paymentLinkInfo.link,
                                                title: getPageConfigProccessResponse.buttons.btn_payment_now.label
                                            }];
                                        messageSender.sendButtonTemplate(senderID, fanpageID, text, buttons, function (sendPayButtonResponse) {
                                            console.log("sendPaymentLink status" + sendPayButtonResponse);
                                            if(sendPayButtonResponse) {
                                            }
                                        });
                                    });
                                }

                            }
                        });
                    } else {
                        var errorMessage = "Có lỗi xảy ra trên hệ thống. Vui lòng gõ Hủy để làm lại từ đầu. Xin lỗi bạn vì sự bất tiện này.";
                        messageSender.sendTextMessage(senderID, fanpageID, errorMessage, function (response) {
                            console.log("sendPaymentLink sendTextMessage status: " + response);
                        });
                    }
                });
            });
        });
    },
    sendToAcountAfterPay: function (senderID, text_message, pageAccessToken, fn) {
        this.sendTextMessageByToken(senderID, pageAccessToken, text_message, function (response) {
            if (response) {
                fn({error_code: 0, error_message: "Gửi tin nhắn thành công!"});
            } else {
                fn({error_code: 1, error_message: "Không thể gửi được tin nhắn!"});
            }
        });
    },
    sendReplyForUnknownQuestions: function(senderID, fanpageID) {
        //var defaultTextMessage = "Xin lỗi hiện tại tôi ko hiểu câu hỏi của bạn. Để sử dụng dịch vụ lại từ đầu bạn có thể click vào bắt đầu lại";
        var defaultTextMessage = "Bạn đợi mình chút, mình đi gọi chủ shop.";
        var messageSender = this;
        this.sendTextMessage(senderID, fanpageID, defaultTextMessage, function (response) {
            if(response) {
                var text = "Để dùng lại dịch vụ bạn có thể nhấp chuột vào nút bên dưới.";
                var buttons = [{
                        "type": "postback",
                        "title": "Bắt đầu lại",
                        "payload": commonLib.base64UrlEndcode('restart')
                    }];
                messageSender.sendButtonTemplate(senderID, fanpageID, text, buttons, function (sendRestartButtonResponse) {
                    console.log("sendReplyForUnknownQuestions restart status" + sendRestartButtonResponse)
                });
            }
        });
    },
    sendListSupport: function(senderID, fanpageID, services, page) {
        var elements = [];
        var limit = 10;
        var offset = (page - 1) * limit;
        var len = services.length;
        var totalPage = Math.ceil(len / limit);
        var endLen = page * limit;
        if (page == totalPage) {
            endLen = len;
        }
        for (var i = offset; i < endLen; i++) {
            elements.push({
                "content_type":"text",
                "title": services[i].label,
                "payload": commonLib.base64UrlEndcode("support?type=" + services[i].code + "&label=" + services[i].label)
            });
        }
        if (page < totalPage) {
            var nextPage = parseInt(page) + 1;
            elements.push({
                    "content_type":"text",
                    "title": "Hỗ trợ khác",
                    "payload": commonLib.base64UrlEndcode("support?page=" + nextPage)
            });
        }
        var messageSender = this;
        fanpageLib.getPageConfigProccess(senderID, fanpageID, 'all', function (response) {
            messageSender.sendQuickReply(senderID, fanpageID, response.listSupportMessage, elements, function(sendQuickReplayResponse){
                console.log("sendListSupport response: " + sendQuickReplayResponse);
            });
        });
    }
};