var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var utils = require('./utilities');

const defaultMessageType = 'MESSAGETYPE_ORDINARY';
const defaultResponseType = 'RESPONSETYPE_REQUIRED';
const defaultMessageStatus = 'MESSAGESTATUS_CREATED';
const defaultPayload = '?';

var clientId = '_';
var responses = [];

function setClientId(givenClientId) {
    clientId = givenClientId;
}

function readData() {
    var argv = parseArgs(process.argv, { string: 'data_path' });
    fs.readFile(path.resolve(argv.data_path), (err, data) => {
        if (err)
            throw err;

        JSON.parse(data).forEach(el => responses.push({ key: el.response.messageId, value: el }));
    });
}

function fillMessage(req, messageId, responseType) {
    var message = responses[messageId % responses.length];
    if (utils.isDefined(message)) {
        var d = message.value.response;
        req.type = d.type;
        req.payload = d.payload;
    }
    else {
        req.type = defaultMessageType;
        req.status = defaultMessageStatus;
        req.payload = defaultPayload;
    }

    req.clientId = clientId;
    req.messageId = messageId;
    req.time = Date.now();
    req.response = utils.isDefined(responseType) ? responseType : defaultResponseType;
}

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

exports.setClientId = setClientId;
exports.fillMessage = fillMessage;
exports.readData = readData;
exports.logMessage = logMessage;