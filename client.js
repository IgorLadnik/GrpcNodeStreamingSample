/*
 *
 * Copyright 2015 gRPC authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

var PROTO_PATH = __dirname + '/communication.proto';

var async = require('async');
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
var client = new communication.Messaging('localhost:50052', grpc.credentials.createInsecure());

fm.setClientId("680AA939-BC0C-4414-BE0C-B525FBE98DAA");

var messageId = 0;

function runCreateStreaming(callback) {
    var req = client.createStreaming();
    req.on('data', res => {
        console.log(res);

        fm.fillMessage(req, messageId++);
    });
    req.on('end', callback);

    fm.fillMessage(req, messageId++);
    
    req.write(req);
    req.end();
}

/**
 * Run all of the demos in order
 */
function main() {
    async.series([runCreateStreaming]);
}

if (require.main === module) 
    main();

exports.runCreateStreaming = runCreateStreaming;
