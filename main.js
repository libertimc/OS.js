/*!
 * @file
 * OS.js - JavaScript Operating System - main node server
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
 * TODO: Custom session managment
 *       - Keep in memory
 *       - Keep-alive and timeout
 *       - FS perms
 * TODO: WebServices
 * TODO: WebSockets
 * TODO: Snapshots
 * TODO: Locales (i18n)
 */

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config    = require('./config.js'),
    _registry  = require(_config.PATH_SRC + '/registry.js'),
    _settings  = require(_config.PATH_SRC + '/settings.js'),
    _preload   = require(_config.PATH_SRC + '/preload.js'),
    _packages  = require(_config.PATH_SRC + '/packages.js'),
    _vfs       = require(_config.PATH_SRC + '/vfs.js'),
    _ui        = require(_config.PATH_SRC + '/ui.js'),
    _user      = require(_config.PATH_SRC + '/user.js'),
    _services  = require(_config.PATH_SRC + '/services.js'),
    _locale    = require(_config.PATH_SRC + '/locale.js');

// External
var express = require('express'),
    sprintf = require('sprintf').sprintf,
    swig    = require('swig'),
    syslog  = require('node-syslog');

///////////////////////////////////////////////////////////////////////////////
// APPLICATION
///////////////////////////////////////////////////////////////////////////////

console.log('>>> Starting up...');
syslog.init("OS.js", syslog.LOG_PID | syslog.LOG_ODELAY, syslog.LOG_LOCAL0);
syslog.log(syslog.LOG_INFO, "Starting up " + new Date());

var app = express();

process.on('exit', function() {
  syslog.close();
});

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
  console.log('>>> Configuring DBUS');

  /*
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
  console.log('>>> Configuring Express');
  app.use(express.bodyParser());
  app.use(express.cookieParser());
  app.use(express.session({ secret:'yodawgyo', cookie: { path: '/', httpOnly: true, maxAge: null} }));
  app.use(express.limit('1024mb'));

  app.engine('html',      swig.express3);
  app.set('view engine',  'html');
  app.set('views',        _config.PATH_TEMPLATES);
  app.set('view options', { layout: false });
  app.set('view cache',   false);

  console.log('>>> Configuring Routes');

  //
  // INDEX
  //
  app.get('/', function(req, res) {
    console.log('GET /');

    var opts     = _config;
    var language = _locale.getLanguage(req);

    opts.locale   = language;
    opts.language = language.split("_").shift();
    opts.preloads = _preload.vendor_dependencies;

    res.render('index', opts);
  });

  //
  // AJAX
  //
  app.post('/', function(req, res) {
    console.log('POST /');

    var jsn, action, response = null;
    try {
      jsn     = req.body;//.objectData;
      action  = jsn.action;

      console.log('AJAX /', action);
    } catch ( e ) {
      jsn = {};
      console.error(e);
    }

    if ( action === null  ) {
      defaultJSONResponse(req, res);
    } else {
      var logged_in = false;
      if ( (req.session && req.session.user) && (typeof req.session.user == 'object') ) {
        logged_in = req.session.user;
      }

      var _respond = function(http_code, http_data) {
        // FIXME: Check for 'error' and pull out message if it's an object
        res.json(http_code, http_data);
      };

      // First check if we need a user
      var need_auth = [
        "snapshotList", "snapshotLoad", "snapshotSave", "snapshotDelete", "updateCache",
        "init", "settings", "logout", "shutdown","user", "event", "package", "service", "call"
      ];

      var i = 0, l = need_auth.length;
      for ( i; i < l; i++ ) {
        if ( (need_auth[i] == action) && (logged_in === false) ) {
          _respond(200,  {
              success : false,
              error   : 'You are not logged in!',
              result  : null
          });
          return;
          //break;
        }
      }

      // Call API
      switch ( action ) {
        case 'boot' :
          var restore = false;

          if ( logged_in !== false ) {
            if ( req.session.user.lock ) {
              restore = true;
            }
          }

          syslog.log(syslog.LOG_INFO, "starting up a new client");

          response = {
            success : true,
            result  : {
              environment : {
                bugreporting : _config.BUGREPORT_ENABLE,
                production   : _config.ENV_PRODUCTION,
                demo         : _config.ENV_DEMO,
                cache        : _config.ENABLE_CACHE,
                connection   : _config.ENV_PLATFORM,
                ssl          : _config.ENV_SSL,
                autologin    : _config.AUTOLOGIN_ENABLE,
                restored     : restore,
                hosts        : {
                  frontend      : _config.HOST_FRONTEND,
                  'static'      : _config.HOST_STATIC
                }
              }
            }
          };

          _respond(200,  response);
        break;

        /*case 'logout' :
        break;*/

        case 'login' :
          var username = jsn.form ? (jsn.form.username || "") : "";
          var password = jsn.form ? (jsn.form.password || "") : "";
          var resume   = (jsn.resume === true || jsn.resume === "true");

          var _success = function(user, packages, resume_registry, resume_session) {
            user.sid = req.sessionID;
            res.cookie('osjs_sessionid', req.sessionID);

            response = {
              user          : user,
              registry      : {
                revision      : _config.SETTINGS_REVISION,
                settings      : _settings.getDefaultSettings(_registry.defaults),
                packages      : packages,
                preload       : _preload.getPreloadFiles()
              },
              restore      : {
                registry      : resume_registry,
                session       : resume_session
              },
              locale       : {
                system        : _config.DEFAULT_LANGUAGE,
                browser       : user.language
              }
            };


            _respond(200, {success: true, result: response});

            req.session.user      = user;

            syslog.log(syslog.LOG_INFO, "client[" + req.session.user.username + "] logged in...");
          };

          var _failure = function(msg) {
            syslog.log(syslog.LOG_ERROR, "Login failed: " + msg);

            console.error('login::_failure()', msg);

            req.session.user = null;
            res.cookie('osjs_sessionid', null);

            _respond(200, {success: false, error: msg, result: null});
          };

          var _proceed = function(puser) {
            _packages.getInstalledPackages(puser, function(success, result) {
              if ( success ) {
                _user.resume(puser, function(resume_registry, resume_session) {
                  _success(puser, result, resume_registry, resume_session);
                });
              } else {
                _failure(result);
              }
            });
          };

          if ( resume ) {
            _proceed(req.session.user);
          } else {
            if ( _config.AUTOLOGIN_ENABLE ) {
              username = _config.AUTOLOGIN_USERNAME;
              password = _config.AUTOLOGIN_PASSWORD;
            }

            _user.login(username, password, function(success, data) {
              if ( success ) {
                _proceed(data);
              } else {
                _failure(data || "Failed to log in!");
              }
            });
          }
        break;

        case 'shutdown' :
          var registry = jsn.registry || {};
          var session  = jsn.session || {};
          var save     = (jsn.save === true || jsn.save === "true");
          var duration = jsn.duration;

          var __done = function() {
            _respond(200, {success: true, result: true});

            try {
              syslog.log(syslog.LOG_INFO, "client[" + req.session.user.username + "] shutdown complete");
            } catch ( err )  {
              syslog.log(syslog.LOG_INFO, "client[???] shutdown complete");
            }

            req.session.user = null;
            req.session.destroy();

          };

          if ( (req.session && req.session.user) && (typeof req.session.user == 'object') ) {
            req.session.user.lock = false;
            _user.logout(req.session.user, registry, session, save, duration, function() {
              __done();
            });
          } else {
            __done();
          }

        break;

        case 'updateCache' :
          _packages.getInstalledPackages(req.session.user, function(success, result) {
            if ( success ) {
              _respond(200, {success: true, result: {
                packages : result
              }});
            } else {
              _respond(200, {success: false, error: result, result: null});
            }
          });
        break;

        case 'settings' :
          syslog.log(syslog.LOG_INFO, "saving client[" + req.session.user.username + "] settings");

          _user.store(req.session.user, jsn.registry, null, function(err) {
            _respond(200, {success: err ? false : true, result: err ? err : true});
          });
        break;

        case 'user' :
          var uid = parseInt(jsn.uid, 10) || 0;
          switch ( jsn.method ) {
            case 'list' :
              // TODO
              break;

            case 'update':
              // TODO
              break;

            case 'delete':
              // TODO
              break;

            case 'info' :
            default     :
              _respond(200, {success: true, result: req.session.user.info});
              return;
              break;
          }

          defaultJSONResponse(req, res);
        break;

        case 'event' : // TODO
          var ev_instance = jsn.instance || null;
          var ev_action   = ev_instance.action || null;
          var ev_args     = ev_instance.args || [];
          var ev_name     = ev_instance.name ? ev_instance.name.replace(/[^A-z0-9]/, '') : null;

          var user = req.session.user;

          if ( ev_action === null || ev_instance === null || ev_name === null ) {
            _respond(200, { success: false, error: "Invalid event!", result: null });
          } else {
            _packages.getInstalledSystemPackages(user.language, function(success, result) {
              if ( success ) {
                var load_class = false;

                for ( var pn in result ) {
                  if ( result.hasOwnProperty(pn) ) {
                    if ( pn == ev_name ) {
                      load_class = ev_name + ".node.js";
                      break;
                    }
                  }
                }

                if ( load_class === false ) {
                  _respond(200, { success: false, error: 'Cannot handle this event!', result: null });
                } else {
                  var _cpath = ([_config.PATH_PACKAGES, load_class]).join("/");
                  var _class = null;
                  try {
                    _class = require(_cpath);
                  } catch ( err ) {
                    console.error('event', err);
                    _respond(200, { success: false, error: err.message, result: null });
                    return;
                  }

                  if ( _class !== null ) {
                    try {
                      _class.Event(ev_action, ev_args, function(esuccess, eresult) {
                        if ( esuccess ) {
                          _respond(200, { success: true, result: eresult });
                        } else {
                          _respond(200, { success: false, error: eresult, result: null });
                        }
                      });
                    } catch ( err ) {
                      console.error('event', err);
                      _respond(200, { success: false, error: err.message, result: null });
                    }
                  }
                }
              } else {
                _respond(200, { success: false, error: result, result: null });
              }
            });
          }
        break;

        case 'package' :
          if ( (jsn.operation) ) {
            var failed = false;
            switch ( jsn.operation ) {
              case 'install' :
                _packages.installPackage(req.session.user, jsn['archive'], function(success, result) {
                  if ( success ) {
                    _respond(200, { success: true, result: result });
                  } else {
                    _respond(200, { success: false, error: result, result: null });
                  }
                });
              break;

              case 'uninstall' :
                _packages.uninstallPackage(req.session.user, jsn['package'], function(success, result) {
                  if ( success ) {
                    _respond(200, { success: true, result: result });
                  } else {
                    _respond(200, { success: false, error: result, result: null });
                  }
                });
              break;

              default :
                failed = true;
              break;
            }
          }

          if ( failed ) {
            _respond(200, { success: false, error: 'Invalid package operation!', result: null });
          }
        break;

        case 'call' :
          console.log("API::call()", jsn);
          if ( (jsn.method && jsn.args) ) {
            try {
              var ok = _vfs.call(req.session.user, jsn.method, (jsn.args || []), function(vfssuccess, vfsresult) {
                if ( vfssuccess ) {
                  _respond(200, { success: true, result: vfsresult });
                } else {
                  _respond(200, { success: false, error: vfsresult, result: null });
                }
              });

              if ( !ok ) {
                _respond(200, { success: false, error: 'Invalid VFS action!', result: null });
              }
            } catch ( err ) {
              console.error('call', err);
              _respond(200, { success: false, error: err.message, result: null });
            }
          } else {
            _respond(200, { success: false, error: 'Invalid VFS arguments!', result: null });
          }
          return;
        break;

        case 'service' : // TODO
          defaultJSONResponse(req, res);
        break;

        // TODO
        case 'snapshotList'   :
          defaultJSONResponse(req, res);
        break;

        case 'snapshotSave'   :
          defaultJSONResponse(req, res);
        break;

        case 'snapshotLoad'   :
          defaultJSONResponse(req, res);
        break;

        case 'snapshotDelete' :
          defaultJSONResponse(req, res);
        break;

        case 'bug' : // TODO
          defaultJSONResponse(req, res);
        break;

        default :
          _respond(200, { success: false, error: 'Invalid action!', result: null });
        break;
      }
    }
  });

  //
  // RESOURCES
  //

  //app.get('/UI/:type/:filename', function(req, res) {
  app.get(/^\/UI\/(sound|icon)\/(.*)/, function(req, res) {
    var type      = req.params[0];//.replace(/[^a-zA-Z0-9]/, '');
    var filename  = req.params[1];//.replace(/[^a-zA-Z0-9-\_\/\.]/, '');

    console.log('/UI/:type/:filename', type, filename);

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

  app.get('/VFS/resource/:package/:filename', function(req, res) {
    var filename = req.params.filename;
    var pkg = req.params['package'];

    console.log('/VFS/resource/:package/:filename', pkg, filename);
    res.sendfile(sprintf('%s/%s/%s', _config.PATH_PACKAGES, pkg, filename));
  });

  app.get('/VFS/resource/:filename', function(req, res) {
    var filename = req.params.filename;

    console.log('/VFS/resource/:filename', filename);
    res.sendfile(sprintf('%s/%s', _config.PATH_JAVASCRIPT, filename));
  });

  app.get('/VFS/:resource/:filename', function(req, res) {
    var filename = req.params.filename;
    var type = req.params.resource;

    console.log('/VFS/:resource/:filename', filename, type);

    switch ( type ) {
      case 'font' :
        var css = _ui.generateFontCSS(filename);
        res.setHeader('Content-Type', 'text/css');
        res.setHeader('Content-Length', css.length);
        res.end(css);
        break;

      case 'theme' :
        var theme = filename.replace(/[^a-zA-Z0-9_\-]/, '');
        res.sendfile(sprintf('%s/theme.%s.css', _config.PATH_JAVASCRIPT, theme));
        break;

      case 'cursor' :
        var cursor = filename.replace(/[^a-zA-Z0-9_\-]/, '');
        res.sendfile(sprintf('%s/cursor.%s.css', _config.PATH_JAVASCRIPT, cursor));
        break;

      case 'language' :
        var lang = filename.replace(/[^a-zA-Z0-9_\-]/, '');
        res.sendfile(sprintf('%s/%s.js', _config.PATH_JSLOCALE, lang));
        break;

      default :
        defaultResponse(req, res);
        break;
    }
  });

  //
  // USER MEDIA
  //

  app.post('/API/upload', function(req, res) {
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

  //app.get('/media/User/:filename', function(req, res) {
  app.get(/^\/media\/User\/(.*)/, function(req, res) {
    var filename = req.params[0];
    var path = _vfs.mkpath(req.session.user, '/User/' + filename);
    res.sendfile(path);
  });

  //app.get('/media-download/User/:filename', function(req, res) {
  app.get(/^\/media-download\/User\/(.*)/, function(req, res) {
    var filename = req.params[0];
    var path = _vfs.mkpath(req.session.user, '/User/' + filename);
    res.download(path);
  });

  app.use("/", express['static'](_config.PATH_PUBLIC));

});

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

app.listen(_config.WEBSERVER_PORT);
console.log('>>> Listening on port ' + _config.WEBSERVER_PORT);

