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

/*
 * TODO: Every x second loop through clients and terminate timed out sessions
 * TODO: Locales (i18n)
 *
 * http://stackoverflow.com/questions/9245126/node-js-epipe-exception-on-child-process-spawn
 */

console.error("BROKEN AND NEEDS CONVERSION TO WEBSOCKET");
process.exit(1);

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config = require('./config.js'),
    _user   = require(_config.PATH_SRC + '/user.js');

// External
var sprintf = require('sprintf').sprintf,
    syslog  = require('node-syslog'),
    spawn   = require('child_process').spawn,
    path    = require('path'),
    fs      = require('fs');

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

var CLIENT_PORT         = _config.CLIENT_PORT_START;
var CLIENT_CONNECTION   = [];

/**
 * Kill all connected clients
 * @return  int   Result
 */
function killClients() {
  CLIENT_CONNECTION.forEach(function(worker) {
    syslog.log(syslog.LOG_INFO, 'Killing client...');
    process.kill(worker);
  });

  return 0;
}

/**
 * Create a new client connection
 * @return  int   Created port
 */
function createClient(username, callback) {
  var port = CLIENT_PORT;
  var a1 = path.join(_config.PATH_BIN, 'launch-client');
  var a2 = path.join(_config.PATH, 'client.js');

  var proc = spawn(a1, [a2, port, username, username]);

  proc.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  proc.stderr.on('data', function (data) {
    console.log('stderr: ' + data);
  });

  proc.on('exit', function (code) {
    if ( code === 0 ) {
      syslog.log(syslog.LOG_INFO, 'Created client session...');
    } else {
      syslog.log(syslog.LOG_INFO, 'Failed to create client session...');
    }
    console.log('child process exited with code ' + code);
  });

  CLIENT_CONNECTION.push(proc);
  CLIENT_PORT++;

  callback(port);
}

/**
 * Check if clients has timed out
 * @return  in
 */
function checkTimeouts() {

}

function checkLock(username, callback) {
  fs.stat(sprintf(_config.PATH_VFS_SESSION_LOCK, username), function(err, stat) {
    callback(!err);
  });
}

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

syslog.init('OS.js server.js', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
syslog.log(syslog.LOG_INFO, 'Starting up ' + new Date());

process.on('uncaughtException', killClients);
/*process.on('SIGINT', killClients);
process.on('SIGTERM', killClients);*/

process.on('end', function() {
  killClients();
  return true;
});

console.log('>>> Listening on port ' + _config.SERVER_PORT);

