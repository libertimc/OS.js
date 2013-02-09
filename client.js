/*!
 * @file
 * OS.js - JavaScript Operating System - A development/testing client
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
var _config    = require('./config.js'),
    _client    = require(_config.PATH_SRC + '/client_web.js');

// External
var sprintf = require('sprintf').sprintf,
    syslog  = require('node-syslog'),
    fs      = require('fs');

///////////////////////////////////////////////////////////////////////////////
// ARGV HANDLING
///////////////////////////////////////////////////////////////////////////////

var __port = 0;
var __user = null;

if ( process.argv && process.argv.length > 3 ) {
  __port = parseInt(process.argv[2], 10);
  __user = process.argv[3];
}

if ( isNaN(__port) || __port <= 0 ) {
  console.error('Cannot open client on port ', __port);
  process.exit(1);
}

if ( __user === null ) {
  console.error('You need to specify a username');
  process.exit(1);
}

(function() {
  // User template
  try {
    var t = fs.statSync(sprintf(_config.PATH_VFS_USER_DOT, __user));
    if ( t.isDirectory() ) {
      console.info("User has .osjs directory");
    } else {
      console.error("This user does not have a .osjs directory");
      console.info("Remove and run ./bin/update-user-template <username>");
      process.exit(1);
    }
  } catch ( err ) {
    if ( err.errno === 34 ) {
      console.error("This user does not have a .osjs directory");
      console.info("Run ./bin/update-user-template <username>");
      process.exit(1);
    }
  }
})();

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

console.info('>>> Starting up...');
console.info('port', __port);
console.info('user', __user);

/*
console.info('>>> Configuring DBUS');
var dbus_server = _services.dbus.createSession();
dbus_server.connection.on('message', function(msg) {
  if ( msg.destination === name && msg['interface'] === 'com.github.andersevenrud.OSjs' && msg.path === '/0/1' ) {
    var reply = {
      type        : dbus.messageType.methodReturn,
      destination : msg.sender,
      replySerial : msg.serial,
      sender      : name,
      signature   : 's',
      body        : [msg.body[0].split('').reverse().join('')]
    };
    bus.invoke(reply);
  }
});

dbus_server.requestName('com.github.andersevenrud', 0);
*/

syslog.init('OS.js client.js', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
syslog.log(syslog.LOG_INFO, 'Starting up ' + new Date());

process.on('exit', function() {
  syslog.close();

  // Client lockfile
  fs.unlinkSync(sprintf(_config.PATH_VFS_SESSION_LOCK, __user));
});

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ' + err); // FIXME
});

var app = _client(__port, __user);
app.listen(__port);
console.info('>>> Listening on port ' + __port);

// Client lockfile
fs.writeFileSync(sprintf(_config.PATH_VFS_SESSION_LOCK, __user));

