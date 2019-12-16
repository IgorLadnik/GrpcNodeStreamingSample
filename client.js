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

function runCreateStreaming(callback) {
    var outbound = client.createStreaming();
    outbound.on('data', inbound => {
        console.log(inbound);

        //fm.fillMessage(outbound, messageId++);

        //outbound.write(outbound);
        //outbound.end();
    });
    outbound.on('end', callback);

    fm.fillMessage(outbound, messageId++);

    outbound.write(outbound);
    outbound.end();
}

//function main() {
setInterval(() => {
    console.log("timer called");
    async.series([runCreateStreaming]);
}, 5000);

console.log("Press <Enter> to quit...");
stdin.on('data', _ => process.exit());
//}

//if (require.main === module) 
//    main();

//exports.runCreateStreaming = runCreateStreaming;
