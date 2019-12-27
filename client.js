const PROTO_PATH = __dirname + '/communication.proto';
const PORT = 19019;
const isSecure = true;

const MsgIntervalInMs = 5000;
const PayloadLength = 5;
const NumOfResponses = 10;
const NotToBeResponded = 7;
const Important = 5;

var async = require('async');
var fs = require('fs');
//var parseArgs = require('minimist');
//var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var fm = require('./logging');
var utils = require('./utilities');
var stdin = process.stdin;

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    });

const credentials = grpc.credentials.createSsl(
    fs.readFileSync('./certs/ca.crt'),
    fs.readFileSync('./certs/client.key'),
    fs.readFileSync('./certs/client.crt')
);

var communication = grpc.loadPackageDefinition(packageDefinition).Communication;
var client = new communication.Messaging('localhost:' + PORT, isSecure ? credentials : grpc.credentials.createInsecure());

var clientId = utils.generateUuid();
console.log('Client: ' + clientId);

var messageId = 0;
var request;

function createAndSendMessage() {
    fillMessage();
    request.write(request);
    //?? request.end();
    console.log('To Server:');
    fm.logMessage(request);
}

function runCreateStreaming(callback) {
    request = client.createStreaming();
    request.on('data', response => {
        console.log('From Server:');
        fm.logMessage(response);
        //runCreateStreaming(callback);
    });
}

function fillMessage() {
    request.clientId = clientId;
    request.messageId = messageId.toString();;
    request.time = Date.now();
    request.response = 'RESPONSETYPE_NOT_REQUIRED';
    request.type = 'MESSAGETYPE_ORDINARY';
    msgIndex = parseInt(messageId) % NumOfResponses;
    ch1 = ch2 = '';
    var str = communication.Messaging.MESSAGETYPE_ORDINARY;
    if (msgIndex !== NotToBeResponded) {
        ch1 = '?';
        request.response = 'RESPONSETYPE_REQUIRED';
    }

    if (msgIndex === Important) {
        ch2 = '!';
        request.type = 'MESSAGETYPE_IMPORTANT';
    }

    defaultPayload = 'abcde';
    request.payload = defaultPayload + ch1 + ch2;

    messageId++;
}

//function main() {
async.series([runCreateStreaming]);
setInterval(() => createAndSendMessage(), MsgIntervalInMs);

console.log('Press <Enter> to quit...');
stdin.on('data', _ => process.exit());
//}

//if (require.main === module) 
//    main();

//exports.runCreateStreaming = runCreateStreaming;
