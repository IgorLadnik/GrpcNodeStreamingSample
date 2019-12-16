var PROTO_PATH = __dirname + '/communication.proto';

var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var fm = require('./fill_message');

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

function createStreaming(outbound) {
    outbound.on('data', inbound => {
        console.log('From Client:');
        console.log(inbound);

        fm.fillMessage(outbound, inbound.messageId);
        
        console.log('To Client:');
        console.log(outbound);

        outbound.write(outbound);
        outbound.end();
    });
    //outbound.on('end', () => outbound.end());
 }

function getServer() {
    var server = new grpc.Server();
    server.addService(communication.Messaging.service,
        {
            createStreaming: createStreaming
        });
    return server;
}

if (require.main === module) {
    var routeServer = getServer();
    routeServer.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());

    fm.readData();

    routeServer.start();
}

exports.getServer = getServer;
