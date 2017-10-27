'use strict';
    const
        config = require('config'),
        crypto = require('crypto'),
        commonLib = require('./commonLib'),
        logService = require('../service/logService');

module.exports = {
    logMessage: function(senderID, recipientID, messageText, type) {
        var test = config.get('test');
        var encodeLogMessage = commonLib.base64UrlEndcode(messageText);
        var apiKey = config.get('apiKey');
        var signature = crypto.createHash('md5').update(senderID + recipientID + type + encodeLogMessage + apiKey).digest("hex");
        console.log("Chuoi truoc md5: " + senderID + recipientID + type + encodeLogMessage + apiKey);
        console.log(signature);
        var logData = {message: encodeLogMessage, senderID: senderID, fanpageID: recipientID, type: type, apiKey: apiKey, signature: signature};
        logService.logMessage(logData, test, function (response) {
            console.log("Log replay: " + JSON.stringify(response));
        });
    }
};