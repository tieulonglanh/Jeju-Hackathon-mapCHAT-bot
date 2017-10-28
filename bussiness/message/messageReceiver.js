'use strict';
    const
        messageSender = require('./messageSender'),
        loggerLib = require('../common/logger'),
        commonLib = require('../common/commonLib'),
        callApi = require('../common/callApi'),
        config = require('config'),
        redis = require('redis');
        
var redisClient = redis.createClient();
redisClient.on('connect', function () {
    console.log('Redis connected');
});
var PAGE_ACCESS_TOKEN = config.get('pageAccessToken');

module.exports = {
    /*
     * Authorization Event
     *
     * The value for 'optin.ref' is defined in the entry point. For the "Send to 
     * Messenger" plugin, it is the 'data-ref' field. Read more at 
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/authentication
     *
     */
    receivedAuthentication: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfAuth = event.timestamp;

        // The 'ref' field is set in the 'Send to Messenger' plugin, in the 'data-ref'
        // The developer can set this to an arbitrary value to associate the 
        // authentication callback with the 'Send to Messenger' click event. This is
        // a way to do account linking when the user clicks the 'Send to Messenger' 
        // plugin.
        var passThroughParam = event.optin.ref;

        console.log("Received authentication for user %d and page %d with pass " +
                "through param '%s' at %d", senderID, recipientID, passThroughParam,
                timeOfAuth);

        // When an authentication is received, we'll send a message back to the sender
        // to let them know it was successful.
        messageSender.sendTextMessage(senderID, "Authentication successful");
    },
    
    /*
     * Message Event
     *
     * This event is called when a message is sent to your page. The 'message' 
     * object format can vary depending on the kind of message that was received.
     * Read more at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-received
     *
     * For this example, we're going to echo any text that we get. If we get some 
     * special keywords ('button', 'generic', 'receipt'), then we'll send back
     * examples of those bubbles to illustrate the special message bubbles we've 
     * created. If we receive a message with an attachment (image, video, audio), 
     * then we'll simply confirm that we've received the attachment.
     * 
     */
    receivedMessage: function (event) {
        console.log('EVENT DATA: ' + JSON.stringify(event));
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfMessage = event.timestamp;
        var message = event.message;
        console.log("Received message for user %d and page %d at %d with message:", senderID, recipientID, timeOfMessage);
        console.log("Stringify: " + JSON.stringify(message));

        var isEcho = message.is_echo;
        var messageId = message.mid;
        var appId = message.app_id;
        var metadata = message.metadata;

        // You may get a text or attachment but not both
        var messageText = message.text;
        var messageAttachments = message.attachments;
        var quickReply = message.quick_reply;
        console.log("QUICK REPLY: " + JSON.stringify(quickReply));
        console.log("MESSAGE TEXT: " + JSON.stringify(messageText));
        if (isEcho) {
            // Just logging message echoes to console
            console.log("Received echo for message %s and app %d with metadata %s",
                    messageId, appId, metadata);
            return;
        } else if (quickReply && messageText) {
            var quickReplyPayload = commonLib.base64UrlDecode(quickReply.payload);
            console.log('RAW QUICKREPLY PAYLOAD: ' + quickReply.payload);
            console.log('DECODED QUICKREPLY PAYLOAD: ' + quickReplyPayload);
            redisClient.get(senderID + ":" + recipientID + ":lastChatTime", function (err, timeReply) {
                if(timeReply != null) {
                    switch(quickReplyPayload) {
                        case 'gotit':
                            setTimeout(function(){
                                var sendText = 'When do you plan to leave home today?'
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "Around 7:00am",
                                        "payload": commonLib.base64UrlEndcode('timetoleave')
                                    }, {
                                        "content_type": 'text',
                                        "title": "Around 7:30am",
                                        "payload": commonLib.base64UrlEndcode('timetoleave')
                                    }, {
                                        "content_type": 'text',
                                        "title": "Around 8:00am",
                                        "payload": commonLib.base64UrlEndcode('timetoleave')
                                    }, {
                                        "content_type": 'text',
                                        "title": "Other",
                                        "payload": commonLib.base64UrlEndcode('timetoleave')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                    if (response) {
                                        console.log("OK Quick Reply Send: " + response);
                                    }
                                });
                            }, 5000);
                            break;
                        case 'timetoleave':
                            setTimeout(function(){
                            var sendText = 'Please check these: lights, switch, TV'
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "All Done",
                                        "payload": commonLib.base64UrlEndcode('alldone')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                    if (response) {
                                        console.log("OK Quick Reply timetoleave: " + response);
                                    }
                                });
                            }, 10000);
                            break;
                        case 'alldone':
                            var sendText = "What's your mean of transportation to day?"
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "Bike",
                                        "payload": commonLib.base64UrlEndcode('saveenergy')
                                    },{
                                        "content_type": 'text',
                                        "title": "Car",
                                        "payload": commonLib.base64UrlEndcode('notsaveenergy')
                                    },{
                                        "content_type": 'text',
                                        "title": "Public",
                                        "payload": commonLib.base64UrlEndcode('saveenergy')
                                    },{
                                        "content_type": 'text',
                                        "title": "Carpool",
                                        "payload": commonLib.base64UrlEndcode('saveenergy')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                    if (response) {
                                        console.log("OK Quick Reply timetoleave: " + response);
                                    }
                                });
                            break;
                        case 'saveenergy':
                            var sendMessage = 'Good job!';
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    setTimeout(function(){
                                        var sendMessage = "It's time for lunch. What do you want to eat today?";
                                        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                            if (response) {

                                            }
                                        });
                                    }, 10000);
                                }
                            });
                            break;
                        case 'notsaveenergy':
                            var sendMessage = "That's ok but we should save energy!";
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    
                                }
                            });
                            break;
                        default:
                            break;
                    }
                } else {
                    switch(quickReplyPayload) {
                        case 'ok':
                            var sendText = 'First, please allow me connect to your Smart Home devices.'
                            var quick_replies = [
                                {
                                    "content_type": 'text',
                                    "title": "Let's do it!",
                                    "payload": commonLib.base64UrlEndcode('letdoit')
                                },
                                {
                                    "content_type": 'text',
                                    "title": "Not this time!",
                                    "payload": commonLib.base64UrlEndcode('notthistime')
                                }];
                            messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                if (response) {
                                    console.log("OK Quick Reply Send: " + response);
                                }
                            });
                            redisClient.set(senderID + ":" + recipientID + ":hasVisited", 1, function (err, reply) {
                                console.log("Set HAS VISITED: " + reply);
                            });
                            break;
                        case 'notthistime':
                            var sendText = 'What a pity! Please come back when you are ready.';
                            var quick_replies = [
                                {
                                    "content_type": 'text',
                                    "title": "Got it!",
                                    "payload": commonLib.base64UrlEndcode('gotit')
                                }];
                            messageSender.sendQuickReply(senderID, recipientID, sendText, quick_replies, function (response) {
                                if (response) {
                                    console.log("GOT IT Quick Reply Send: " + response);
                                }
                            });
                            break;
                        case 'letdoit':
                            var sendMessage = "I'm collecting data, please don't turn off or chat with me.";
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    var sendMessage = "Connecting...";
                                    messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                        if(response) {                                            
                                            var date = new Date();
                                            var curTime = date.getTime();
                                            redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
                                                console.log("Set curTime: " + reply);
                                            });
                                            setTimeout(function() {
                                                var sendMessage = 'Connected sucessfully! Now I can start to help you saving energy and money.';
                                                messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                                    if (response) {
                                                        console.log("CONNECTED SUCESSFULLY: " + response);
                                                        setTimeout(function() {
                                                            var pageToken = PAGE_ACCESS_TOKEN[recipientID].token;
                                                            callApi.callGetInfoCallback(senderID, pageToken, function (userInfo) {
                                                                var sendMessage = "Hi, good morning! Today the air is bad, so you'd better not open the window.";
                                                                if (userInfo.error_code === 0) {
                                                                    sendMessage = "Hi " + userInfo.data.first_name + ", good morning! Today the air is bad, so you'd better not open the window.";
                                                                }
                                                                messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                                                    if (response) {
                                                                        var url = config.get('rainnyWeatherImage');
                                                                        messageSender.sendGiftMessage(senderID, recipientID, url, function (response){
                                                                            if(response) {
                                                                                setTimeout(function(){
                                                                                    var sendText = "Also, I found that you've just took a shower, and you used more water than yesterday. Please be mindful to use less water tormorrow.";
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
                                                                                }, 5000);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }, 10000);
                                                    }
                                                });
                                            }, 5000);   
                                        }
                                    });                                                                     
                                }
                            });
                            break;
                        default:
                            var sendMessage = 'Thank you for using our service!';
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    console.log("THANK YOU MESSAGE: " + response);

                                }
                            });
                            break;
                    }
                }
            });
        }else if (quickReply === undefined && messageText) {
            redisClient.get(senderID + ":" + recipientID + ":lastChatTime", function (err, reply) {
                if (reply === null) {
                    messageSender.sendWelcomeMessage(senderID, recipientID);
                } else {
                    messageSender.sendWelcomeBackMessage(senderID, recipientID);
                }
            });
        } else if (messageAttachments) {
            redisClient.get(senderID + ":" + recipientID + ":lastUserAction", function (err, reply) { 
                console.log("ATTACKMENTS lastUserAction: " + reply);
                console.log("messageAttachments: " + JSON.stringify(messageAttachments[0].payload));
                // Xử lý khi nhận được file từ người dùng
                var lat = messageAttachments[0].payload.coordinates.lat;
                var long = messageAttachments[0].payload.coordinates.long;
                if(lat && long) {
                    var elements = [];
                    switch(reply) {
                        case "location_of_activity":
                            elements = [{
                                title: "Hallasan National Park",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-s/01/0b/8e/5a/a-rock.jpg",
                                subtitle: "Forests, Mountains, National Parks, Nature & Parks",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Attraction_Review-g297885-d550726-Reviews-Hallasan_National_Park-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            },{
                                title: "Udo",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-s/02/1f/c8/9e/farms-on-the-island.jpg",
                                subtitle: "Island",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Attraction_Review-g297885-d1776326-Reviews-Udo-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            },{
                                title: "Hamdeok Beach",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-o/0e/51/84/6d/photo0jpg.jpg",
                                subtitle: "Beaches, Nature & Parks, Outdoor Activities",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Attraction_Review-g297885-d550694-Reviews-Hamdeok_Beach-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            },{
                                title: "Trick Eye Museum Entrance Ticket",
                                image_url: "https://cache-graphicslib.viator.com/graphicslib/thumbs674x446/9525/SITours/trick-eye-museum-entrance-ticket-in-seoul-207352.jpg",
                                subtitle: "Trick Eye Museum entrance ticket including Ice Museum",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/AttractionProductDetail?product=9525TRICKEYE&d=2203080&aidSuffix=xsell&partner=Viator",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            }];
                            break;
                        case "location_of_food":
                            elements = [{
                                title: "Myeongjin Jeonbok ",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-s/09/68/ba/e2/caption.jpg",
                                subtitle: " 128, Haemajihaean-ro, Gujwa-eup, Jeju, Jeju Island 63357, South Korea",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Restaurant_Review-g297885-d8610476-Reviews-Myeongjin_Jeonbok-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            },{
                                title: "Ujin Haejangguk",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-s/0d/dd/79/b4/photo1jpg.jpg",
                                subtitle: " 11, Seosa-Ro, Jeju, Jeju Island 63168, South Korea ",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Restaurant_Review-g297885-d9230927-Reviews-Ujin_Haejangguk-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            },{
                                title: "Olrae Guksu",
                                image_url: "https://media-cdn.tripadvisor.com/media/photo-s/07/f1/d4/89/caption.jpg",
                                subtitle: "261-16, Yeon-dong, Jeju, Jeju Island, South Korea",
                                buttons: [
                                    {
                                        "type":"web_url",
                                        "url":"https://www.tripadvisor.com/Restaurant_Review-g297885-d4033774-Reviews-Olrae_Guksu-Jeju_Jeju_Island.html",
                                        "title":"Go Detail",
                                        "webview_height_ratio": "compact"
                                    }
                                ]
                            }];
                            break;
                    }
                    messageSender.sendGenericMessage(senderID, recipientID, elements, function(response){
                        if(response) {
                            messageSender.sendRestartService(senderID, recipientID);
                        }
                    });
                }
            console.log("GO HẺERERERE");
            });
        }
    },
    
    /*
     * Delivery Confirmation Event
     *
     * This event is sent to confirm the delivery of a message. Read more about 
     * these fields at https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-delivered
     *
     */
    receivedDeliveryConfirmation: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var delivery = event.delivery;
        var messageIDs = delivery.mids;
        var watermark = delivery.watermark;
        var sequenceNumber = delivery.seq;

        if (messageIDs) {
            messageIDs.forEach(function (messageID) {
                console.log("Received delivery confirmation for message ID: %s",
                        messageID);
            });
        }

        console.log("All message before %d were delivered.", watermark);
    },
    
    /*
     * Postback Event
     *
     * This event is called when a postback is tapped on a Structured Message. 
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/postback-received
     * 
     */
    
    receivedPostback: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;
        var timeOfPostback = event.timestamp;

        // The 'payload' param is a developer-defined field which is set in a postback 
        // button for Structured Messages. 
        var payload = event.postback.payload;
        if(payload !== 'welcome') {
            payload = commonLib.base64UrlDecode(event.postback.payload);
        }
        console.log("Received postback for user %d and page %d with payload '%s' " +
                "at %d", senderID, recipientID, payload, timeOfPostback);
        var date = new Date();
        var curTime = date.getTime();
            
        if (payload.indexOf('?') > -1) {
            console.log("Received Payload: " + payload);
            var requestUrl = payload.split('?');
            var postBackPayload = requestUrl[0];
            var query = requestUrl[1];
            var queryObj = commonLib.URLToArray(query);
            loggerLib.logMessage(senderID, recipientID, payload, postBackPayload);
            switch (postBackPayload) {
                case "welcome":
                    messageSender.sendWelcomeMessage(senderID, recipientID);
                    break;
                default:
                    messageSender.sendTextMessage(senderID, "Postback called");
                    break;
            }
        } else {
            loggerLib.logMessage(senderID, recipientID, payload, payload);
            switch (payload) {
                case "welcome":                    
                    redisClient.del(senderID + ":" + recipientID + ":lastChatTime", function (err, reply) {
                    });
                    redisClient.del(senderID + ":" + recipientID + ":hasVisited", function (err, reply) {
                    });
                    messageSender.sendWelcomeMessage(senderID, recipientID);
                    break;
                case "restart":
                    messageSender.sendWelcomeBackMessage(senderID, recipientID);

                    redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
                        console.log("Set curTime: " + reply);
                    });
                    break;
                default:
                    messageSender.sendTextMessage(senderID, recipientID, "Postback called");
                    break;                    
            }
        }
        // When a postback is called, we'll send a message back to the sender to 
        // let them know it was successful
    },
    /*
     * Message Read Event
     *
     * This event is called when a previously-sent message has been read.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/message-read
     * 
     */
    receivedMessageRead: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        // All messages before watermark (a timestamp) or sequence have been seen.
        var watermark = event.read.watermark;
        var sequenceNumber = event.read.seq;

        console.log("Received message read event for watermark %d and sequence " +
                "number %d", watermark, sequenceNumber);
    },
    
    /*
     * Account Link Event
     *
     * This event is called when the Link Account or UnLink Account action has been
     * tapped.
     * https://developers.facebook.com/docs/messenger-platform/webhook-reference/account-linking
     * 
     */
    receivedAccountLink: function (event) {
        var senderID = event.sender.id;
        var recipientID = event.recipient.id;

        var status = event.account_linking.status;
        var authCode = event.account_linking.authorization_code;

        console.log("Received account link event with for user %d with status %s " +
                "and auth code %s ", senderID, status, authCode);
    }
};