/*!
 * @file
 * OS.js - JavaScript Operating System - Main (root) process
 *
 * Copyright (c) 2011-2012, Anders Evenrud <andersevenrud@gmail.com>
 * All rights reserved.
 * 
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met: 
 * 
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer. 
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution. 
 * 
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR
 * ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
 * (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
 * LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
 * ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
 * SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2013-01-27
 */
"use strict";

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config = require('./config.js');

// External
var express = require('express'),
    sprintf = require('sprintf').sprintf,
    syslog  = require('node-syslog'),
    spawn   = require("child_process").spawn,
    path    = require('path');

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

var __port = _config.CLIENT_PORT_START;
var __clients = [];

var killClients = function() {
  __clients.forEach(function(worker) {
    process.kill(worker);
  });

  return 0;
};

var createClient = function() {
  __port++;

  var a1 = path.join(_config.PATH_BIN, 'launch-client');
  var a2 = path.join(_config.PATH, 'client.js');

  var proc = spawn(a1, [a2, __port, _config.CLIENT_USER_TMP]); // FIXME

  proc.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  proc.on('exit', function (code) {
    console.log('child process exited with code ' + code);
  });

  __clients.push(proc);

  return __port;
};

var app = express();
app.configure(function() {
  app.get('/', function(req, res) {
    res.header("Content-Type", "text/html");

    var p = createClient();
    var t = 3;
    console.log("Started new client on :" + p);

    //res.redirect('http://localhost:' + __port);
    res.end('<html><head><title>Launching client...</title><meta http-equiv="refresh" content="' + t + ';URL=\'http://localhost:' + p + '\'" /></head><body>Launching client...</body></html>');
  });
});

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

process.on("uncaughtException", killClients);
/*process.on("SIGINT", killClients);
process.on("SIGTERM", killClients);*/

process.on('end', function() {
  killClients();
  return true;
});

app.listen(_config.WEBSERVER_PORT);
console.log('>>> Listening on port ' + _config.WEBSERVER_PORT);

