/*
 * Copyright 2016-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

/* jshint node: true, devel: true */
'use strict';
        const
        bodyParser = require('body-parser'),
        config = require('config'),
        crypto = require('crypto'),
        express = require('express'),
        requireDir = require('require-dir'),
        messageDir = requireDir("bussiness/message/"),
        commonDir = requireDir("bussiness/common/"),
        messageReceiver = messageDir.messageReceiver,
        messageSender = messageDir.messageSender,
        commonLib = commonDir.commonLib,
        APP_SECRET = (process.env.MESSENGER_APP_SECRET)?process.env.MESSENGER_APP_SECRET:config.get('appSecret'),
        VALIDATION_TOKEN = (process.env.MESSENGER_VALIDATION_TOKEN)?(process.env.MESSENGER_VALIDATION_TOKEN):config.get('validationToken'),
        SERVER_URL = (process.env.SERVER_URL)?(process.env.SERVER_URL):config.get('serverURL');


var app = express();
app.set('port', process.env.PORT || 5000);
app.set('view engine', 'ejs');
app.use(bodyParser.json({verify: verifyRequestSignature}));
app.use(express.static('public'));
/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */

if (!(APP_SECRET && VALIDATION_TOKEN && SERVER_URL)) {
    console.error("Missing config values");
    process.exit(1);
}

/*
 * Use your own validation token. Check that the token used in the Webhook 
 * setup is the same token used here.
 *
 */
app.get('/webhook', function (req, res) {
    console.log(VALIDATION_TOKEN);
    if (req.query['hub.mode'] === 'subscribe' &&
            req.query['hub.verify_token'] === VALIDATION_TOKEN) {
        console.log("Validating webhook");
        res.status(200).send(req.query['hub.challenge']);
    } else {
        console.error("Failed validation. Make sure the validation tokens match.");
        res.sendStatus(403);
    }
});


/*
 * All callbacks for Messenger are POST-ed. They will be sent to the same
 * webhook. Be sure to subscribe your app to your page to receive callbacks
 * for your page. 
 * https://developers.facebook.com/docs/messenger-platform/product-overview/setup#subscribe_app
 *
 */
app.post('/webhook', function (req, res) {
    var data = req.body;
    console.log("POST REQ: " + data);
    // Make sure this is a page subscription
    if (data.object == 'page') {
        // Iterate over each entry
        // There may be multiple if batched
        data.entry.forEach(function (pageEntry) {
            var pageID = pageEntry.id;
            var timeOfEvent = pageEntry.time;
            var dateOfEvent = new Date(timeOfEvent);
            console.log("Time event: " + dateOfEvent.toString());
            console.log(pageEntry.messaging);
            // Iterate over each messaging event
            pageEntry.messaging.forEach(function (messagingEvent) {
                if (messagingEvent.optin) {
                    messageReceiver.receivedAuthentication(messagingEvent);
                } else if (messagingEvent.message) {
                    messageReceiver.receivedMessage(messagingEvent);
                } else if (messagingEvent.delivery) {
                    messageReceiver.receivedDeliveryConfirmation(messagingEvent);
                } else if (messagingEvent.postback) {
                    messageReceiver.receivedPostback(messagingEvent);
                } else if (messagingEvent.read) {
                    messageReceiver.receivedMessageRead(messagingEvent);
                } else if (messagingEvent.account_linking) {
                    messageReceiver.receivedAccountLink(messagingEvent);
                } else {
                    console.log("Webhook received unknown messagingEvent: ", messagingEvent);
                }
            });
        });

        // Assume all went well.
        //
        // You must send back a 200, within 20 seconds, to let us know you've 
        // successfully received the callback. Otherwise, the request will time out.
        res.sendStatus(200);
    }
});

/*
 * This path is used for account linking. The account linking call-to-action
 * (sendAccountLinking) is pointed to this URL. 
 * 
 */
app.get('/authorize', function (req, res) {
    var accountLinkingToken = req.query.account_linking_token;
    var redirectURI = req.query.redirect_uri;

    // Authorization Code should be generated per user by the developer. This will 
    // be passed to the Account Linking callback.
    var authCode = "1234567890";

    // Redirect users to this URI on successful login
    var redirectURISuccess = redirectURI + "&authorization_code=" + authCode;

    res.render('authorize', {
        accountLinkingToken: accountLinkingToken,
        redirectURI: redirectURI,
        redirectURISuccess: redirectURISuccess
    });
});

/*
 * Verify that the callback came from Facebook. Using the App Secret from 
 * the App Dashboard, we can verify the signature that is sent with each 
 * callback in the x-hub-signature field, located in the header.
 *
 * https://developers.facebook.com/docs/graph-api/webhooks#setup
 *
 */
function verifyRequestSignature(req, res, buf) {
    var signature = req.headers["x-hub-signature"];
    
    if (!signature) {
        // For testing, let's log an error. In production, you should throw an 
        // error.
        console.error("Couldn't validate the signature.");
    } else {
        try {
            var elements = signature.split('=');
            var method = elements[0];
            var signatureHash = elements[1];

            var expectedHash = crypto.createHmac('sha1', APP_SECRET)
                    .update(buf)
                    .digest('hex');

            if (signatureHash != expectedHash) {
                throw new Error("Couldn't validate the request signature.");
            }
        } catch (err) {
            console.log(err.message);
        }
    }
}


// Start server
// Webhooks must be available via SSL with a certificate signed by a valid 
// certificate authority.
app.listen(app.get('port'), function () {
    console.log('Node app is running on port', app.get('port'));
});

module.exports = app;

