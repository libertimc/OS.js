/*!
 * @file
 * OS.js - JavaScript Operating System - User process
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
 * TODO: Locales (i18n)
 */

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config    = require('./config.js'),
    _resources = require(_config.PATH_SRC + '/resources.js'),
    _locale    = require(_config.PATH_SRC + '/locale.js'),
    _vfs       = require(_config.PATH_SRC + '/vfs.js'),
    _api       = require(_config.PATH_SRC + '/api.js'),
    _ui        = require(_config.PATH_SRC + '/ui.js');

// External
var express = require('express'),
    sprintf = require('sprintf').sprintf,
    swig    = require('swig'),
    syslog  = require('node-syslog');

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
  try {
    var t = require('fs').statSync(sprintf(_config.PATH_VFS_USER_DOT, __user));
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

console.info('>>> Starting up...');
console.info('port', __port);
console.info('user', __user);

///////////////////////////////////////////////////////////////////////////////
// APPLICATION
///////////////////////////////////////////////////////////////////////////////

var app = express();

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
// HELPERS
///////////////////////////////////////////////////////////////////////////////

function defaultResponse(req, res) {
  var body = req.url;
  res.setHeader('Content-Type', 'text/plain');
  res.setHeader('Content-Length', body.length);
  res.end(body);
}

function defaultJSONResponse(req, res) {
  res.json(200, { url: req.url });
}

///////////////////////////////////////////////////////////////////////////////
// CONFIGURATION
///////////////////////////////////////////////////////////////////////////////

app.configure(function() {
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

  // Setup
  console.info('>>> Configuring Express');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret:'yodawgyo', cookie: { path: '/', httpOnly: true, maxAge: null} })); // FIXME
  app.use(express.limit('1024mb'));

  app.engine('html',      swig.express3);
  app.set('view engine',  'html');
  app.set('views',        _config.PATH_TEMPLATES);
  app.set('view options', { layout: false });
  app.set('view cache',   false);

  console.info('>>> Configuring Routes');

  //
  // INDEX
  //
  app.get('/', function getIndex(req, res) {
    console.log('GET /');

    var opts     = _config;
    var language = _locale.getLanguage(req);

    opts.locale   = language;
    opts.language = language.split('_').shift();
    opts.preloads = _resources.vendorDependencies;

    res.render('index', opts);
  });

  //
  // XHR
  //

  app.post('/API', function postAPI(req, res) {
    console.log('POST /API');

    try {
      var jsn     = req.body || {};//.objectData;
      var action  = jsn.action || null;

      _api.request(action, jsn, __port, __user, req, res);
    } catch ( err ) {
      res.json(200, {success: false, error: err, node_exception: true});
    }
  });

  app.post('/API/upload', function postAPIUpload(req, res) {
    console.log('POST /API/upload');

    var ok = _vfs.call(req.session.user, 'upload', {'file': req.files.upload, 'path': req.body.path}, function(vfssuccess, vfsresult) {
      if ( vfssuccess ) {
        res.json(200, { success: true, result: vfsresult });
      } else {
        res.json(200, { success: false, error: vfsresult, result: null });
      }
    });

    if ( !ok ) {
      res.json(200, { success: false, error: 'Upload error!', result: null });
    }
  });

  //
  // RESOURCES
  //

  //app.get('/UI/:type/:filename', function(req, res) {
  app.get(/^\/UI\/(sound|icon)\/(.*)/, function getSharedResource(req, res) {
    var type      = req.params[0];//.replace(/[^a-zA-Z0-9]/, '');
    var filename  = req.params[1];//.replace(/[^a-zA-Z0-9-\_\/\.]/, '');

    console.log('GET /UI/:type/:filename', type, filename);

    switch ( type ) {
      case 'sound' :
        res.sendfile(sprintf('%s/Shared/Sounds/%s', _config.PATH_MEDIA, filename));
      break;
      case 'icon' :
        res.sendfile(sprintf('%s/Shared/Icons/%s', _config.PATH_MEDIA, filename));
      break;
      default :
        defaultResponse(req, res);
      break;
    }
  });

  app.get('/VFS/resource/:package/:filename', function getPackageResource(req, res) {
    var filename = req.params.filename;
    var pkg = req.params['package'];

    console.log('GET /VFS/resource/:package/:filename', pkg, filename);
    // FIXME: Check if this is a user package, if not use compressed resources on 'production'
    res.sendfile(sprintf('%s/%s/%s', _config.PATH_PACKAGES, pkg, filename));
  });

  app.get('/VFS/resource/:filename', function getResource(req, res) {
    var filename = req.params.filename;

    console.log('GET /VFS/resource/:filename', filename);
    if ( _config.ENV_SETUP == 'production' ) {
      res.sendfile(sprintf('%s/%s/%s', _config.PATH_JAVASCRIPT, _config.COMPRESS_DIRNAME, filename));
    } else {
      res.sendfile(sprintf('%s/%s', _config.PATH_JAVASCRIPT, filename));
    }
  });

  app.get('/VFS/:resource/:filename', function getResourceByType(req, res) {
    var filename  = req.params.filename;
    var type      = req.params.resource;

    console.log('GET /VFS/:resource/:filename', filename, type);

    switch ( type ) {
      case 'font' :
        _ui.generateFontCSS(filename, function(css) {
          res.setHeader('Content-Type', 'text/css');
          res.setHeader('Content-Length', css.length);
          res.end(css);
        });
        break;

      case 'theme' :
        var theme = filename;//.replace(/[^a-zA-Z0-9_\-]/, '');
        if ( _config.ENV_SETUP == 'production' ) {
          res.sendfile(sprintf('%s/%s/theme.%s.css', _config.PATH_JAVASCRIPT, _config.COMPRESS_DIRNAME , theme));
        } else {
          res.sendfile(sprintf('%s/theme.%s.css', _config.PATH_JAVASCRIPT, theme));
        }

        break;

      case 'cursor' :
        var cursor = filename;//.replace(/[^a-zA-Z0-9_\-]/, '');
        res.sendfile(sprintf('%s/cursor.%s.css', _config.PATH_JAVASCRIPT, cursor));
        break;

      case 'language' :
        var lang = filename.replace(/[^a-zA-Z0-9_\-]/, '');
        if ( _config.ENV_SETUP == 'production' ) {
          res.sendfile(sprintf('%s/%s/%s.js', _config.PATH_JSLOCALE, _config.COMPRESS_DIRNAME, lang));
        } else {
          res.sendfile(sprintf('%s/%s.js', _config.PATH_JSLOCALE, lang));
        }
        break;

      default :
        defaultResponse(req, res);
        break;
    }
  });

  //
  // USER MEDIA
  //

  //app.get('/media/User/:filename', function(req, res) {
  app.get(/^\/media\/*User\/(.*)/, function getUserMedia(req, res) {
    if ( !req.session.user ) {
      defaultResponse(req, res);
      return;
    }

    var filename = req.params[0].replace(/^\//, '');
    var path = _vfs.mkpath(req.session.user, '/User/' + filename);

    console.log('GET /media', filename);

    res.sendfile(path);
  });

  //app.get('/media-download/User/:filename', function(req, res) {
  app.get(/^\/media-download\/*User\/(.*)/, function getUserMediaDownload(req, res) {
    if ( !req.session.user ) {
      defaultResponse(req, res);
      return;
    }

    var filename = req.params[0].replace(/^\//, '');
    var path = _vfs.mkpath(req.session.user, '/User/' + filename);

    console.log('GET /media-download', filename);

    res.download(path);
  });

  app.use('/', express['static'](_config.PATH_PUBLIC));

});

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

syslog.init('OS.js client.js', syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
syslog.log(syslog.LOG_INFO, 'Starting up ' + new Date());
process.on('exit', function() {
  syslog.close();
});
process.on('uncaughtException', function (err) {
  console.error('Caught exception: ' + err); // FIXME
});

app.listen(__port);
console.info('>>> Listening on port ' + __port);

