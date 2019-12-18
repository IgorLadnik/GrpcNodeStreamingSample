var PROTO_PATH = __dirname + '/communication.proto';

var fs = require('fs');
var parseArgs = require('minimist');
var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var fm = require('./messaging');

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
        fm.logMessage(inbound);

        fm.fillMessage(outbound, inbound.messageId);
        
        console.log('To Client:');
        fm.logMessage(outbound);

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

let credentials = grpc.ServerCredentials.createSsl(
    fs.readFileSync('./certs/ca.crt'), [{
        cert_chain: fs.readFileSync('./certs/server.crt'),
        private_key: fs.readFileSync('./certs/server.key')
    }], true);

if (require.main === module) {
    var routeServer = getServer();
    //routeServer.bind('0.0.0.0:50052', grpc.ServerCredentials.createInsecure());
    routeServer.bind('0.0.0.0:50052', credentials);

    fm.readData();

    routeServer.start();
}

exports.getServer = getServer;
