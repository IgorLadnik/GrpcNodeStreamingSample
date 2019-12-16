var PROTO_PATH = __dirname + '/communication.proto';

var async = require('async');
var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var fm = require('./fill_message');
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

var communication = grpc.loadPackageDefinition(packageDefinition).Communication;
var client = new communication.Messaging('localhost:50052', grpc.credentials.createInsecure());

fm.setClientId("680AA939-BC0C-4414-BE0C-B525FBE98DAA");

var messageId = 0;
var outbound;

function createAndSendMessage() {
    fm.fillMessage(outbound, messageId++);
    outbound.write(outbound);
    outbound.end();
}

function runCreateStreaming(callback) {
    outbound = client.createStreaming();
    outbound.on('data', inbound => {
        console.log("From Server:");
        console.log(inbound);

        //createAndSendMessage();

        runCreateStreaming(callback);
    });
}

//function main() {
async.series([runCreateStreaming]);

setInterval(() => {
    console.log("timer called");
    createAndSendMessage();
}, 5000);

console.log("Press <Enter> to quit...");
stdin.on('data', _ => process.exit());
//}

//if (require.main === module) 
//    main();

//exports.runCreateStreaming = runCreateStreaming;
