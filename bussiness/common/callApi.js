'use strict';
const
    request = require('request'),
    queryString = require('query-string'),
    redis = require('redis');
var redisClient = redis.createClient();

module.exports = {
    callSendAPI: function (messageData, pageAccesToken) {
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: pageAccesToken},
            method: 'POST',
            json: messageData

        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;

                if (messageId) {
                    console.log("Successfully sent message with id %s to recipient %s",
                            messageId, recipientId);
                } else {
                    console.log("Successfully called Send API for recipient %s",
                            recipientId);
                }
            } else {
                console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
            }
        });
    },
    callSendAPICallback: function (messageData, pageAccesToken, senderID,  fn) {
        console.log("PAGEACCESSTOKEN: " + pageAccesToken);
        request({
            uri: 'https://graph.facebook.com/v2.6/me/messages',
            qs: {access_token: pageAccesToken},
            method: 'POST',
            json: messageData

        }, function (error, response, body) {
            console.log("callSendAPICallback body" + JSON.stringify(body));
            if (!error && response.statusCode === 200) {
                var recipientId = body.recipient_id;
                var messageId = body.message_id;
                
                if (messageId) {
                    fn({error_code: 0, error_message: "Gửi thành công tin nhắn có id " + messageId + " cho " + recipientId});
                } else {
                    fn({error_code: 0, error_message: "Gọi API gửi tin nhắn thành công " + recipientId});
                }
            } else {                
                redisClient.keys(senderID + ":*", function(err, rows) {
                    console.log("KEY ROWS: " + rows);
                    var rowLen = rows.length;
                    console.log("ROW LENGTH: " + rowLen);
                    for(var i = 0; i < rowLen; ++i) {
                        if(rows[i].indexOf('pageAccessToken') > -1) {
                            console.log('Key get: ' + rows[i]);
                            var deleteKey = rows[i];
                            redisClient.del(deleteKey, function (error, reply){
                                console.log("KEY DELETED: " + deleteKey + " status :" + reply);
                            });
                        }
                    }
                });
                fn({error_code: 1, error_message: "Gửi tin nhắn không thành công tới " + recipientId});
            }
        });
    },
    callCurlApi: function (url, method, data, fn) {
        var queryData = queryString.stringify(data);
        url = url + "?" + queryData;
        
        console.log('api call data: ' +  queryData);
        console.log("api call method: " + method);
        console.log("api call url: " + url); 
        request({
            uri: url,
            method: method,
            chunked: false,
            headers: {
                'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
                'Accept-Encoding': 'gzip, deflate, sdch, br',
                'Connection': 'keep-alive'
            }
        }, function (error, response, body) {
            if (!error && response.statusCode === 200) {
                try {
                    var objBody = JSON.parse(body);                    
                    fn(objBody);
                    if(objBody.error_code != 0) {
                        console.log(objBody.error_message);
                    }
                }catch(err) {
                    console.log(err.message);
                }
            } else {
                console.error("Failed calling Send API", response.statusCode, response.statusMessage, body.error);
            }
        });
        
    },
    
    persistentMenu: function (pageAccessToken){
        request({
           url: 'https://graph.facebook.com/v2.6/me/thread_settings',
           qs: {access_token:pageAccessToken},
           method: 'POST',
           json:{
               setting_type : "call_to_actions",
               thread_state : "existing_thread",
               call_to_actions:[
                   {
                     type:"postback",
                     title:"Sử dụng dịch vụ",
                     payload:"continue_service"
                   },
                   {
                     type:"postback",
                     title:"Chat hỗ trợ",
                     payload:"chat_support"
                   }
                 ]
           }

       }, function(error, response, body) {
           console.log(response)
           if (error) {
               console.log('Error sending messages: ', error)
           } else if (response.body.error) {
               console.log('Error: ', response.body.error)
           }
       });

    },
    callGetInfoCallback: function (userID, pageAccesToken, fn) {
        request({
            uri: 'https://graph.facebook.com/v2.6/' + userID ,
            qs: {fields: "first_name,last_name", access_token: pageAccesToken},
            method: 'GET'
        }, function (error, response, body) {
            console.log("CALLGetInfoCallback response: " + JSON.stringify(response));
            if (!error && response.statusCode === 200) {
                var objBody = JSON.parse(body);   
                fn({error_code: 0, data: objBody });
            } else {
                fn({error_code: 1, error_message: "Không truy cập được tên người dùng ID: " + userID});
            }
        });
    }
};