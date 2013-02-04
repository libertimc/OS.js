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
 */

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config = require('./config.js'),
    _user   = require(_config.PATH_SRC + '/user.js');

// External
var express = require('express'),
    sprintf = require('sprintf').sprintf,
    syslog  = require('node-syslog'),
    spawn   = require('child_process').spawn,
    swig    = require('swig'),
    path    = require('path');

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
      CLIENT_CONNECTION.push(proc);
      CLIENT_PORT++;

      callback(port);
    } else {
      syslog.log(syslog.LOG_INFO, 'Failed to create client session...');

      callback(0);
    }

    console.log('child process exited with code ' + code);
  });
}

/**
 * Check if clients has timed out
 * @return  in
 */
function checkTimeouts() {

}

///////////////////////////////////////////////////////////////////////////////
// TEMPLATING
///////////////////////////////////////////////////////////////////////////////

swig._cache = {};
swig.express3 = function (path, options, fn) {
  swig._read(path, options, function (err, str) {
    if ( err ) {
      return fn(err);
    }

    try {
      options.filename = path;
      var tmpl = swig.compile(str, options);
      fn(null, tmpl(options));
    } catch (error) {
      fn(error);
      console.error(error);
    }

    return true;
  });
};

swig._read = function (path, options, fn) {
  var str = swig._cache[path];

  // cached (only if cached is a string and not a compiled template function)
  if (options.cache && str && typeof str === 'string') {
    return fn(null, str);
  }

  // read
  require('fs').readFile(path, 'utf8', function (err, str) {
    if (err) {
      return fn(err);
    }
    if (options.cache) {
      swig._cache[path] = str;
    }
    fn(null, str);

    return true;
  });

  return true;
};

///////////////////////////////////////////////////////////////////////////////
// APPLICATION
///////////////////////////////////////////////////////////////////////////////

var app = express();

app.configure(function() {
  console.log('>>> Configuring Express');
  app.use(express.bodyParser());
  app.use(express.limit('1024mb'));

  app.engine('html',      swig.express3);
  app.set('view engine',  'html');
  app.set('views',        _config.PATH_TEMPLATES);
  app.set('view options', { layout: false });
  app.set('view cache',   false);

  app.get('/', function getIndex(req, res) {
    console.log('GET /');

    var opts     = _config;
    var language = 'en_US'; // FIXME

    opts.locale   = language;
    opts.language = language.split('_').shift();

    res.render('login', opts);
  });

  app.get('/VFS/resource/:filename', function getResource(req, res) {
    var filename = req.params.filename;

    console.log('/VFS/resource/:filename', filename);
    res.sendfile(sprintf('%s/%s', _config.PATH_JAVASCRIPT, filename));
  });

  app.post('/', function postLogin(req, res) {
    var jsn, action, response = null;
    try {
      jsn     = req.body;//.objectData;
      action  = jsn.action;

      console.log('AJAX /', action);
    } catch ( e ) {
      jsn = {};
      console.error(e);
    }

    if  ( !jsn || !action) {
      res.json(200, {'success': false, 'error': 'Invalid action!', 'result': null});
    } else {
      if ( action == 'login' ) {
        var username = jsn.form ? (jsn.form.username || '') : '';
        var password = jsn.form ? (jsn.form.password || '') : '';
        var resume   = (jsn.resume === true || jsn.resume === 'true');

        if ( _config.AUTOLOGIN_ENABLE ) {
          username = _config.AUTOLOGIN_USERNAME;
          password = _config.AUTOLOGIN_PASSWORD;
        }

        _user.login(username, password, function(success, data) {
          if ( success ) {
            createClient(username, function(port) {
              if ( port > 0 ) {
                console.log('Started new client on :' + port);

                var result = {
                  user    : data,
                  href    : 'http://localhost:' + port,
                  timeout : 3000 // FIXME replaced by a poll
                };

                res.json(200, {'success': true, 'result': result});
              } else {
                res.json(200, {'success': false, 'result': null, 'error': 'Failed to create client!'});
              }
            });
          } else {
            res.json(200, {'success': false, 'error': 'Failed to log in!', 'result': null});
          }
        });
      } else {
        res.json(200, {'success': false, 'error': 'Invalid action!', 'result': null});
      }
    }
  });

  app.use('/', express['static'](_config.PATH_PUBLIC));
});

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

app.listen(_config.SERVER_PORT);
console.log('>>> Listening on port ' + _config.SERVER_PORT);

