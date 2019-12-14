var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var utils = require("./utilities");

const defaultMessageType = "MESSAGETYPE_ORDINARY";
const defaultResponseType = "RESPONSETYPE_REQUIRED";
const defaultMessageId = "NONE";
var clientId = "NONE";

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
    var message = responses[messageId];
    if (utils.isDefined(message)) {
        var d = message.value.response;
        req.type = d.type;
        req.payload = d.payload;
    }
    else {
        req.type = defaultMessageType;
        req.payload = "default payload";
    }

    req.clientId = clientId;
    req.messageId = messageId;
    req.time = Date.now();
    req.response = utils.isDefined(responseType) ? responseType : defaultResponseType;
}

exports.setClientId = setClientId;
exports.fillMessage = fillMessage;
exports.readData = readData;