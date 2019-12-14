var utils = require("./utilities");

const defaultMessageType = "MESSAGETYPE_ORDINARY";
const defaultResponseType = "RESPONSETYPE_REQUIRED";
const defaultMessageId = "NONE";
var clientId = "NONE";

function setClientId(givenClientId) {
    clientId = givenClientId;
}

function fillMessage(req, payload, messageId, messageType, responseType) {
    req.clientId = clientId;
    req.messageId = utils.isDefined(messageId) ? messageId : defaultMessageId;
    req.type = utils.isDefined(messageType) ? messageType : defaultMessageType;
    req.time = Date.now();
    req.response = utils.isDefined(responseType) ? responseType : defaultResponseType;
    req.payload = payload;
}

exports.setClientId = setClientId;
exports.fillMessage = fillMessage;