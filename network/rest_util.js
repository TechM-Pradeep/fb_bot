var https = require('https');
var http = require('http');
var request = require('request');
var NETWORK_CONSTANT = require('./network_constant.js');

module.exports = {
    fetchResponse : function (urlData, listener) {
        getResponse(urlData, listener);
    }
}

var getResponse = function (responseObject, listener){
if(NETWORK_CONSTANT.IS_PROXY_ENABLED){
  responseObject.proxy = NETWORK_CONSTANT.PROXY_URL;
 }
 console.log(responseObject);
 request(responseObject, function (error, response, body) {
    if (!error && response.statusCode == 200) {
        listener.emit(NETWORK_CONSTANT.ON_SUCCESS, body.trim());
    }else{
    listener.emit(NETWORK_CONSTANT.ON_FAILURE, error);
    }
})
}
