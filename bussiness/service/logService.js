'use strict';
const
    config = require('config'),
    callApi = require("../common/callApi");
    
module.exports = {    
    logMessage: function (data, test, fn) {
        var url = config.get('apiUrl') + '/log/logMessage';
        if(test === 1) {
            url = config.get('apiUrl') + "/sandbox/log/logMessage";
        }
        
        var method = 'GET';
        var fakeAPI = config.get('fakeAPI');
        if (fakeAPI) {
            fn({
                error_code: 0,
                error_message: "Lưu log thành công"
            });
        } else {
            callApi.callCurlApi(url, method, data, function(response){
                console.log('logMessage response: ' + JSON.stringify(response));
                fn(response);
            });
        }
    }
};