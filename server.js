const PROTO_PATH = __dirname + '/communication.proto';
const PORT = 19019;
const isSecure = true;

var fs = require('fs');
//var parseArgs = require('minimist');
//var path = require('path');
var _ = require('lodash');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var parseArgs = require('minimist');
var fm = require('./logging');
var path = require('path');
var utils = require('./utilities');

var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {
         keepCase: true,
         longs: String,
         enums: String,
         defaults: true,
         oneofs: true
    });

var responses = [];
var communication = grpc.loadPackageDefinition(packageDefinition).Communication;

function createStreaming(response) {
    response.on('data', request => {
        setTimeout(() => {
            console.log('From Client:');
            fm.logMessage(request);

            if (request.response === 'RESPONSETYPE_REQUIRED') {                 
                fillMessage(request, response);

                console.log('To Client:');
                fm.logMessage(response);

                response.write(response);
            }
        }, 0);       
    });
    response.on('end', () => { try { response.end() } catch { } });
 }

function getServer() {
    var server = new grpc.Server();
    server.addService(communication.Messaging.service, { createStreaming: createStreaming });
    return server;
}

let credentials = grpc.ServerCredentials.createSsl(
    fs.readFileSync('./certs/ca.crt'), [{
        cert_chain: fs.readFileSync('./certs/server.crt'),
        private_key: fs.readFileSync('./certs/server.key')
}], true);

function fillMessage(request, response) {
    response.clientId = request.clientId;
    response.messageId = request.messageId;
    response.time = Date.now();

    id = parseInt(request.messageId);
    if (utils.isNumber(id))
        d = responses[id % responses.length].value.response;
    if (utils.isDefined(d)) {
        response.type = d.type;
        response.payload = d.payload;
        response.status = 'MESSAGESTATUS_PROCESSED';
    }
    else {
        response.type = defaultMessageType;
        response.payload = defaultPayload;
        response.status = 'MESSAGESTATUS_ERROR';
    }
}

function readData() {
    var argv = parseArgs(process.argv, { string: 'data_path' });
    fs.readFile(path.resolve(argv.data_path), (err, data) => {
        if (err)
            throw err;

        JSON.parse(data).forEach(el => responses.push({ key: el.response.messageId, value: el }));
    });
}

//if (require.main === module) {
var routeServer = getServer();
routeServer.bind('0.0.0.0:' + PORT, isSecure ? credentials : grpc.ServerCredentials.createInsecure());

var s = isSecure ? ' secure messages' : '';
console.log('GRPC Server listens' + s + ' on port ' + PORT);

readData();

routeServer.start();
//}

exports.getServer = getServer;
