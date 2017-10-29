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
        messageSender.sendTextMessage(senderID, recipientID, "Authentication successful", function(response){
            
        });
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
                            }, 5000);
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
                                                var elements = [{
                                                    title: "Kimchi",
                                                    image_url: "https://migrationology.com/wp-content/uploads/2012/05/kim-chi.jpg",
                                                    subtitle: "Chili Pickled Cabbage",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.maangchi.com/recipes/kimchi",
                                                            "title":"Price: $4",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Samgyeopsal",
                                                    image_url: "https://farm6.staticflickr.com/5452/7098094895_7f0fa2d4a2_z.jpg",
                                                    subtitle: "Fatty slices of pork belly grilled before your nose",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.travelgluttons.com/eat-samgyeopsal-%EC%82%BC%EA%B2%B9%EC%82%B4/",
                                                            "title":"Price: $4",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Pork Bulgogi",
                                                    image_url: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                                                    subtitle: "Another famous Korean specialty barbecued meat is known as Bulgogi",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"http://crazykoreancooking.com/recipe/spicy-pork-bulgogi-spicy-marinated-pork",
                                                            "title":"Price: $6",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Korean Barbecue",
                                                    image_url: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                                                    subtitle: "A traditional Korean barbecue feast",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.maangchi.com/recipes/BBQ",
                                                            "title":"Price: $5",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                }];
                                                messageSender.sendGenericMessage(senderID, recipientID, elements, function(response){
                                                    if(response) {
                                                        
                                                    }
                                                });
                                            }
                                        });
                                    }, 5000);
                                }
                            });
                            break;
                        case 'notsaveenergy':
                            var sendMessage = "That's ok but we should save energy!";
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    setTimeout(function(){
                                        var sendMessage = "It's time for lunch. What do you want to eat today?";
                                        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                            if (response) {
                                                var elements = [{
                                                    title: "Kimchi",
                                                    image_url: "https://migrationology.com/wp-content/uploads/2012/05/kim-chi.jpg",
                                                    subtitle: "Chili Pickled Cabbage",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.maangchi.com/recipes/kimchi",
                                                            "title":"Price: $4",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Samgyeopsal",
                                                    image_url: "https://farm6.staticflickr.com/5452/7098094895_7f0fa2d4a2_z.jpg",
                                                    subtitle: "Fatty slices of pork belly grilled before your nose",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.travelgluttons.com/eat-samgyeopsal-%EC%82%BC%EA%B2%B9%EC%82%B4/",
                                                            "title":"Price: $4",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Pork Bulgogi",
                                                    image_url: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                                                    subtitle: "Another famous Korean specialty barbecued meat is known as Bulgogi",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"http://crazykoreancooking.com/recipe/spicy-pork-bulgogi-spicy-marinated-pork",
                                                            "title":"Price: $6",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                },
                                                {
                                                    title: "Korean Barbecue",
                                                    image_url: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                                                    subtitle: "A traditional Korean barbecue feast",
                                                    buttons: [
                                                        {
                                                            "type":"web_url",
                                                            "url":"https://www.maangchi.com/recipes/BBQ",
                                                            "title":"Price: $5",
                                                            "webview_height_ratio": "compact"
                                                        },
                                                        {
                                                            "type": "postback",
                                                            "title": "Order Now",
                                                            "payload": commonLib.base64UrlEndcode('makeorder')
                                                        }
                                                    ]
                                                }];
                                                messageSender.sendGenericMessage(senderID, recipientID, elements, function(response){
                                                    if(response) {
                                                        var sendMessage = "Yummy!!";
                                                        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                                            if(response) {
                                                            }
                                                        });
                                                    }
                                                });
                                            }
                                        });
                                    }, 5000);
                                }
                            });
                            break;
                        case "yesineed":
                            var elements = [{
                                    title: "Bananas",
                                    image_url: "https://www.bbcgoodfood.com/sites/default/files/guide/guide-image/2017/01/banana.jpg",
                                    subtitle: "Fresh Bananas",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "https://www.bbcgoodfood.com/howto/guide/health-benefits-bananas",
                                            "title": "Price: $8",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeordertwice')
                                        }
                                    ]
                                },
                                {
                                    title: "Bacon",
                                    image_url: "http://thebsblog.com/wp-content/uploads/2017/07/20150727220756-bacon.jpeg",
                                    subtitle: "Fry bacon",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "http://thebsblog.com/2017/07/18/511-hootie-concert-cop-shooting-overrating-bacon-trump-rating-negative-dave/",
                                            "title": "Price: $8",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeordertwice')
                                        }
                                    ]
                                },
                                {
                                    title: "Pork Bulgogi",
                                    image_url: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                                    subtitle: "Another famous Korean specialty barbecued meat is known as Bulgogi",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "http://crazykoreancooking.com/recipe/spicy-pork-bulgogi-spicy-marinated-pork",
                                            "title": "Price: $6",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeordertwice')
                                        }
                                    ]
                                },
                                {
                                    title: "Korean Barbecue",
                                    image_url: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                                    subtitle: "A traditional Korean barbecue feast",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "https://www.maangchi.com/recipes/BBQ",
                                            "title": "Price: $5",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeordertwice')
                                        }
                                    ]
                                }];
                            messageSender.sendGenericMessage(senderID, recipientID, elements, function (response) {
                                if (response) {
                                    
                                }
                            });
                            break;
                        case "noidont":
                            var sendMessage = "Ok, Thanks!";
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                }
                            });
                            break;
                        case "tryotherfood":
                            var elements = [{
                                    title: "Kimchi",
                                    image_url: "https://migrationology.com/wp-content/uploads/2012/05/kim-chi.jpg",
                                    subtitle: "Chili Pickled Cabbage",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "https://www.maangchi.com/recipes/kimchi",
                                            "title": "Price: $4",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeorder2')
                                        }
                                    ]
                                },
                                {
                                    title: "Samgyeopsal",
                                    image_url: "https://farm6.staticflickr.com/5452/7098094895_7f0fa2d4a2_z.jpg",
                                    subtitle: "Fatty slices of pork belly grilled before your nose",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "https://www.travelgluttons.com/eat-samgyeopsal-%EC%82%BC%EA%B2%B9%EC%82%B4/",
                                            "title": "Price: $4",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeorder2')
                                        }
                                    ]
                                },
                                {
                                    title: "Pork Bulgogi",
                                    image_url: "https://farm8.staticflickr.com/7054/7098179791_1f31d80080_b.jpg",
                                    subtitle: "Another famous Korean specialty barbecued meat is known as Bulgogi",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "http://crazykoreancooking.com/recipe/spicy-pork-bulgogi-spicy-marinated-pork",
                                            "title": "Price: $6",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeorder2')
                                        }
                                    ]
                                },
                                {
                                    title: "Korean Barbecue",
                                    image_url: "https://farm8.staticflickr.com/7107/6952029056_4ebc4a39b0_z.jpg",
                                    subtitle: "A traditional Korean barbecue feast",
                                    buttons: [
                                        {
                                            "type": "web_url",
                                            "url": "https://www.maangchi.com/recipes/BBQ",
                                            "title": "Price: $5",
                                            "webview_height_ratio": "compact"
                                        },
                                        {
                                            "type": "postback",
                                            "title": "Order Now",
                                            "payload": commonLib.base64UrlEndcode('makeorder2')
                                        }
                                    ]
                                }];
                            messageSender.sendGenericMessage(senderID, recipientID, elements, function (response) {
                                if (response) {

                                }
                            });
                            break;
                        case "makeorder":
                            var serviceText = 'Do you want to pick up the order or want us to deliver it?'
                            var buttons = [{
                                    "type": "postback",
                                    "title": "Pick up",
                                    "payload": commonLib.base64UrlEndcode("pickuporder")
                                },{
                                    "type": "postback",
                                    "title": "Deliver",
                                    "payload": commonLib.base64UrlEndcode("deliverorder")
                                }];
                            messageSender.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
                                if (response) {
                                    console.log("Send ship buttons: " + response);
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
                                                                var sendMessage = "Hi, good morning! Today is a sunny day, so you'd better open the windows and feel the air.";
                                                                if (userInfo.error_code === 0) {
                                                                    sendMessage = "Hi " + userInfo.data.first_name + ", good morning! Today is a sunny day, so you'd better open the windows and feel the air.";
                                                                }
                                                                messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                                                    if (response) {
                                                                        var url = config.get('rainnyWeatherImage');
                                                                        messageSender.sendGiftMessage(senderID, recipientID, url, function (response){
                                                                            if(response) {
                                                                                setTimeout(function(){
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
                                                                                }, 5000);
                                                                            }
                                                                        });
                                                                    }
                                                                });
                                                            });
                                                        }, 5000);
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
                    messageSender.sendWelcomeVoiceMessage(senderID, recipientID);
                } else {
                    messageSender.sendWelcomeBackMessage(senderID, recipientID);
                }
            });
        } else if (messageAttachments) {
            redisClient.get(senderID + ":" + recipientID + ":lastSendVoiceTime", function (err, reply) {
                if(reply == null) {
                    var sendMessage = 'Thank you for using our service! Please say "Start" to let us connect to your Smart Home devices.';
                    messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                        if (response) {
                            redisClient.set(senderID + ":" + recipientID + ":lastSendVoiceTime", 1, function (err, reply) {
                                
                            });
                        }
                    });
                } else if(reply == 1) {
                    var sendMessage = "I'm collecting data, please don't turn off or chat with me.";
                    messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                        if (response) {
                            var sendMessage = "Connecting...";
                            messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                if (response) {
                                    var date = new Date();
                                    var curTime = date.getTime();
                                    redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
                                        console.log("Set curTime: " + reply);
                                    });
                                    setTimeout(function () {
                                        var sendMessage = 'Connected sucessfully! Now I can start to help you saving energy and money.';
                                        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                            if (response) {
                                                console.log("CONNECTED SUCESSFULLY: " + response);
                                                setTimeout(function () {
                                                    var pageToken = PAGE_ACCESS_TOKEN[recipientID].token;
                                                    callApi.callGetInfoCallback(senderID, pageToken, function (userInfo) {
                                                        var sendMessage = "Hi, good morning! Today is a sunny day, so you'd better open the windows and feel the air.";
                                                        if (userInfo.error_code === 0) {
                                                            sendMessage = "Hi " + userInfo.data.first_name + ", good morning! Today is a sunny day, so you'd better open the windows and feel the air.";
                                                        }
                                                        messageSender.sendTextMessage(senderID, recipientID, sendMessage, function (response) {
                                                            if (response) {
                                                                var url = config.get('rainnyWeatherImage');
                                                                messageSender.sendGiftMessage(senderID, recipientID, url, function (response) {
                                                                    if (response) {
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
                                                                        }, 5000);
                                                                    }
                                                                });
                                                            }
                                                        });
                                                    });
                                                }, 5000);
                                            }
                                        });
                                    }, 5000);
                                }
                            });
                        }
                    });
                } else {
                    
                }
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
//                    messageSender.sendWelcomeMessage(senderID, recipientID);
                    messageSender.sendWelcomeVoiceMessage(senderID, recipientID);
                    break;
                default:
                    messageSender.sendTextMessage(senderID, recipientID, "Postback called", function(response){
                        
                    });
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
                    redisClient.del(senderID + ":" + recipientID + ":lastSendVoiceTime", function (err, reply) {
                    });
                    messageSender.sendWelcomeVoiceMessage(senderID, recipientID);
                    break;
                case "restart":
                    messageSender.sendWelcomeBackMessage(senderID, recipientID);

                    redisClient.set(senderID + ":" + recipientID + ":lastChatTime", curTime, function (err, reply) {
                        console.log("Set curTime: " + reply);
                    });
                    break;
                case "makeorder":
                    var serviceText = 'Do you want to pick up the order or want us to deliver it?'
                    var buttons = [{
                            "type": "postback",
                            "title": "Pick up",
                            "payload": commonLib.base64UrlEndcode("pickuporder")
                        },{
                            "type": "postback",
                            "title": "Deliver",
                            "payload": commonLib.base64UrlEndcode("deliverorder")
                        }];
                    messageSender.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
                        if (response) {
                            console.log("Send ship buttons: " + response);
                        }
                    });
                    break;
                case "makeorder2":
                    var serviceText = 'Do you want to pick up the order or want us to deliver it?'
                    var buttons = [{
                            "type": "postback",
                            "title": "Pick up",
                            "payload": commonLib.base64UrlEndcode("pickuporder2")
                        },{
                            "type": "postback",
                            "title": "Deliver",
                            "payload": commonLib.base64UrlEndcode("deliverorder2")
                        }];
                    messageSender.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
                        if (response) {
                            console.log("Send ship buttons: " + response);
                        }
                    });
                    break;
                case "pickuporder":
                    messageSender.sendTextMessage(senderID, recipientID, "Got it!", function(response) {
                        if(response) {
                            setTimeout(function(){
                                var sendMessage = "Good evening! Today there are some healthy food in the market. Do you want more information about them?"
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "Yes, I need",
                                        "payload": commonLib.base64UrlEndcode('yesineed')
                                    },
                                    {
                                        "content_type": 'text',
                                        "title": "No, I don't",
                                        "payload": commonLib.base64UrlEndcode('noidont')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendMessage, quick_replies, function (response) {
                                    if (response) {
                                        console.log("sendWelcomeMessage: " + response);
                                    }
                                });
                            }, 5000);
                        }
                    });                    
                    break;
                case "deliverorder":
                    messageSender.sendTextMessage(senderID, recipientID, "Got it!", function(response){
                        if(response) {
                            setTimeout(function(){
                                var sendMessage = "Good evening! Today there are some healthy food in the market. Do you want more information about them?"
                                var quick_replies = [
                                    {
                                        "content_type": 'text',
                                        "title": "Yes, I need",
                                        "payload": commonLib.base64UrlEndcode('yesineed')
                                    },
                                    {
                                        "content_type": 'text',
                                        "title": "No, I don't",
                                        "payload": commonLib.base64UrlEndcode('noidont')
                                    }];
                                messageSender.sendQuickReply(senderID, recipientID, sendMessage, quick_replies, function (response) {
                                    if (response) {
                                        console.log("sendWelcomeMessage: " + response);
                                        
                                    }
                                });
                            }, 5000);
                        }
                    });
                    break;
                case "pickuporder2":
                    messageSender.sendTextMessage(senderID, recipientID, "Got it!", function(response) {
                        if(response) {
                            setTimeout(function(){
                                messageSender.sendTextMessage(senderID, recipientID, "Hi, This is your energy report today. Please check it!", function(response) {
                                    if(response) {                                        
                                        var url = config.get('statisticImage');
                                        messageSender.sendGiftMessage(senderID, recipientID, url, function (response) {
                                            if (response) {
                                                var serviceText = "Share your statistic to your friend";
                                                var buttons = [{
                                                    "type": "web_url",
                                                    "url": 'https://www.facebook.com/sharer/sharer.php?u=' + url,
                                                    "title": "Share Now!",
                                                }];
                                                messageSender.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
                                                    if (response) {
                                                        console.log("SEND SHARE BUTTON: " + response);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }, 5000);
                        }
                    });                    
                    break;
                case "deliverorder2":
                    messageSender.sendTextMessage(senderID, recipientID, "Got it!", function(response){
                        if(response) {
                            setTimeout(function(){
                                messageSender.sendTextMessage(senderID, recipientID, "Hi, This is your energy report today. Please check it!", function(response) {
                                    if(response) {                                        
                                        var url = config.get('statisticImage');
                                        messageSender.sendGiftMessage(senderID, recipientID, url, function (response) {
                                            if (response) {
                                                var serviceText = "Share your statistic to your friend";
                                                var buttons = [{
                                                    "type": "web_url",
                                                    "url": 'https://www.facebook.com/sharer/sharer.php?u=' + url,
                                                    "title": "Share Now!",
                                                }];
                                                messageSender.sendButtonTemplate(senderID, recipientID, serviceText, buttons, function (response) {
                                                    if (response) {
                                                        console.log("SEND SHARE BUTTON: " + response);
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }, 5000);
                        }
                    });
                    break;
                case "makeordertwice":
                    var sendMessage = "You have eated this 3 times this week. Do you sure to buy it again?"
                        var quick_replies = [
                            {
                                "content_type": 'text',
                                "title": "Yes, buy it!",
                                "payload": commonLib.base64UrlEndcode('makeorder')
                            },
                            {
                                "content_type": 'text',
                                "title": "No, try other...",
                                "payload": commonLib.base64UrlEndcode('tryotherfood')
                            }];
                        messageSender.sendQuickReply(senderID, recipientID, sendMessage, quick_replies, function (response) {
                            if (response) {
                                console.log("sendWelcomeMessage: " + response);
                            }
                        });
                    break;                
                default:
                    messageSender.sendTextMessage(senderID, recipientID, "Postback called", function(response) {
                        
                    });
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