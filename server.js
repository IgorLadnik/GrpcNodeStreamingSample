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

function createStreaming(req) {
    req.on('data', res => {
        console.log('res');
        console.log(res);

        fm.fillMessage(req, res.messageId);
        
        console.log('req');
        console.log(req);

        req.write(req);
        req.end();
    });
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
