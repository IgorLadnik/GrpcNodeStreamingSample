const PROTO_PATH = __dirname + '/communication.proto';
const port = 50052;
const isSecure = true;

var async = require('async');
var fs = require('fs');
//var parseArgs = require('minimist');
//var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var fm = require('./messaging');
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
var client = new communication.Messaging('localhost:' + port, isSecure ? credentials : grpc.credentials.createInsecure());

var clientId = utils.generateUuid();
fm.setClientId(clientId);
console.log("Client: " + clientId);

var messageId = 0;
var outbound;

function createAndSendMessage() {
    fm.fillMessage(outbound, messageId++);
    outbound.write(outbound);
    //?? outbound.end();
    console.log('To Server:');
    fm.logMessage(outbound);
}

function runCreateStreaming(callback) {
    outbound = client.createStreaming();
    outbound.on('data', inbound => {
        console.log('From Server:');
        fm.logMessage(inbound);
        runCreateStreaming(callback);
    });
}

//function main() {
async.series([runCreateStreaming]);
setInterval(() => createAndSendMessage(), 5000);

console.log('Press <Enter> to quit...');
stdin.on('data', _ => process.exit());
//}

//if (require.main === module) 
//    main();

//exports.runCreateStreaming = runCreateStreaming;
