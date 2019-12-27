var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var utils = require('./utilities');

var clientId = '_';
var responses = [];

function logMessage(message) {
    console.log('clientId = ' + message.clientId);
    console.log('messageId = ' + message.messageId);
    console.log('type = ' + message.type);
    console.log('time = ' + message.time);
    
    if (utils.isDefined(message.response))
        console.log('response = ' + message.response);
    else
        console.log('status = ' + message.status);

    console.log('payload = ' + message.payload + '\n');
}

exports.logMessage = logMessage;