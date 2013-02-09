/*!
 * @file
 * OS.js - JavaScript Operating System - Web Client
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
var _config    = require('../config.js'),
    _registry  = require(_config.PATH_SRC + '/registry.js'),
    _settings  = require(_config.PATH_SRC + '/settings.js'),
    _resources = require(_config.PATH_SRC + '/resources.js'),
    _packages  = require(_config.PATH_SRC + '/packages.js'),
    _vfs       = require(_config.PATH_SRC + '/vfs.js'),
    _user      = require(_config.PATH_SRC + '/user.js'),
    _services  = require(_config.PATH_SRC + '/services.js'),
    _locale    = require(_config.PATH_SRC + '/locale.js'),
    _session   = require(_config.PATH_SRC + '/session.js'),
    _ui        = require(_config.PATH_SRC + '/ui.js');

// External
var express = require('express'),
    sprintf = require('sprintf').sprintf,
    swig    = require('swig'),
    fs      = require('fs'),
    _path   = require('path'); // FIXME Refactor with this

///////////////////////////////////////////////////////////////////////////////
// TEMPLATE HELPERS
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
// HELPERS
///////////////////////////////////////////////////////////////////////////////

var RESPONSE_OK     = 200;
var RESPONSE_ERROR  = 500;

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
// API REQUESTS
///////////////////////////////////////////////////////////////////////////////

function request(action, jsn, pport, req, res) {
  if ( action === null  ) {
    defaultJSONResponse(req, res);
  } else {
    var response = null;
    var suser    = null;

    var _respond = function(http_code, http_data) {
      res.json(http_code, http_data);
    };

    //
    // Calls
    //

    if ( typeof req.session.user === 'object' ) {
      suser = req.session.user;
    } else {
      if ( action != 'boot' && action != 'login' ) {
        _respond(500, {success: false, error: 'No running session found!'});
        console.error('!!! NO RUNNING SESSION !!!');
        return;
      }

      console.log('!API', action, suser ? '(' + suser.username + ')' : '');
    }

    switch ( action ) {
      case 'login' :
        var username = jsn.form ? (jsn.form.username || '') : '';
        var password = jsn.form ? (jsn.form.password || '') : '';

        _user.login(username, password, function(success, data) {
          if ( success ) {
            req.session.user = data;
            req.session.user.sid = req.session.sessionID;

            res.json(200, {'success': true, 'result': {redirect: '/', user: data}});
          } else {
            res.json(200, {'success': false, 'error': data, 'result': null});
          }
        });
      break;

      case 'boot' :
        var _success = function(packages, resume_registry, resume_session) {
          response = {
            environment : {
              bugreporting : _config.BUGREPORT_ENABLE,
              setup        : _config.ENV_SETUP,
              websockets   : _config.ENV_WEBSOCKETS,
              localhost    : _config.ENV_LOCALHOST,
              hosts        : {
                frontend      : 'localhost' + pport
              }
            },

            session : {
              user          : suser,
              registry      : {
                revision      : _config.SETTINGS_REVISION,
                settings      : _settings.getDefaultSettings(_registry.defaults),
                packages      : packages,
                preload       : _resources.getPreloadFiles()
              },
              restore      : {
                registry      : resume_registry,
                session       : resume_session
              },
              locale       : {
                system        : _config.DEFAULT_LANGUAGE,
                browser       : suser.language
              }
            }
          };

          _respond(RESPONSE_OK, {success: true, result: response});
        };

        var _failure = function(msg) {
          console.error('Boot::_failure()', msg);

          _respond(RESPONSE_OK, {success: false, error: msg, result: null});
        };

        _packages.getInstalledPackages(suser, function(success, result) {
          if ( success ) {
            _user.resume(suser, function(resume_registry, resume_session) {
              _success(result, resume_registry, resume_session);
            });
          } else {
            _failure(result);
          }
        });
      break;

      case 'shutdown' :
        var registry = jsn.registry || {};
        var session  = jsn.session || {};
        var save     = (jsn.save === true || jsn.save === 'true');
        var duration = jsn.duration;

        var __done = function() {
          req.session.user = null;
          req.session.destroy();

          _respond(RESPONSE_OK, {success: true, result: true});
        };

        _user.logout(suser, registry, session, save, duration, function() {
          __done();
        });
      break;

      case 'alive' :
        _user.alive(suser, function(success, result) {
          _respond(RESPONSE_OK, {success: success, result: result});
        });
      break;

      case 'updateCache' :
        _packages.getInstalledPackages(suser, function(success, result) {
          if ( success ) {
            _respond(RESPONSE_OK, {success: true, result: {
              packages : result
            }});
          } else {
            _respond(RESPONSE_OK, {success: false, error: result, result: null});
          }
        });
      break;

      case 'settings' :
        _user.store(suser, jsn.registry, null, function(err) {
          _respond(RESPONSE_OK, {success: err ? false : true, result: err ? err : true});
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
            _respond(RESPONSE_OK, {success: true, result: suser.info});
            return;
            break;
        }

        defaultJSONResponse(req, res);
      break;

      case 'event' :
        var ev_instance = jsn.instance || null;
        var ev_action   = ev_instance.action || null;
        var ev_args     = ev_instance.args || [];
        var ev_name     = ev_instance.name ? ev_instance.name.replace(/[^A-z0-9]/, '') : null;

        if ( ev_action === null || ev_instance === null || ev_name === null ) {
          _respond(RESPONSE_OK, { success: false, error: "Invalid event!", result: null });
        } else {
          _packages.getInstalledSystemPackages(suser.language, function(success, result) {
            if ( success ) {
              var load_name  = false;
              var load_class = false;

              for ( var pn in result ) {
                if ( result.hasOwnProperty(pn) ) {
                  if ( pn == ev_name ) {
                    load_name  = ev_name;
                    load_class = ev_name + '.node.js';
                    break;
                  }
                }
              }

              if ( load_name === false || load_class === false ) {
                _respond(RESPONSE_OK, { success: false, error: 'Cannot handle this event!', result: null });
              } else {
                var _cpath = _path.join(_config.PATH_PACKAGES, load_name, load_class);
                var _class = null;
                try {
                  _class = require(_cpath);
                } catch ( err ) {
                  console.error('event', err);
                  _respond(RESPONSE_OK, { success: false, error: err.message, result: null });
                  return;
                }

                if ( _class !== null ) {
                  try {
                    _class.Event(req, res, ev_action, ev_args, function(esuccess, eresult) {
                      if ( esuccess ) {
                        _respond(RESPONSE_OK, { success: true, result: eresult });
                      } else {
                        _respond(RESPONSE_OK, { success: false, error: eresult, result: null });
                      }
                    });
                  } catch ( err ) {
                    console.error('event', err);
                    _respond(RESPONSE_OK, { success: false, error: err.message, result: null });
                  }
                }
              }
            } else {
              _respond(RESPONSE_OK, { success: false, error: result, result: null });
            }
          });
        }
      break;

      case 'package' :
        if ( (jsn.operation) ) {
          var failed = false;
          switch ( jsn.operation ) {
            case 'install' :
              _packages.installPackage(suser, jsn['archive'], function(success, result) {
                if ( success ) {
                  _respond(RESPONSE_OK, { success: true, result: result });
                } else {
                  _respond(RESPONSE_OK, { success: false, error: result, result: null });
                }
              });
            break;

            case 'uninstall' :
              _packages.uninstallPackage(suser, jsn['package'], function(success, result) {
                if ( success ) {
                  _respond(RESPONSE_OK, { success: true, result: result });
                } else {
                  _respond(RESPONSE_OK, { success: false, error: result, result: null });
                }
              });
            break;

            default :
              failed = true;
            break;
          }
        }

        if ( failed ) {
          _respond(RESPONSE_OK, { success: false, error: 'Invalid package operation!', result: null });
        }
      break;

      case 'call' :
        if ( (jsn.method && jsn.args) ) {
          try {
            var ok = _vfs.call(suser, jsn.method, (jsn.args || []), function(vfssuccess, vfsresult) {
              if ( vfssuccess ) {
                _respond(RESPONSE_OK, { success: true, result: vfsresult });
              } else {
                _respond(RESPONSE_OK, { success: false, error: vfsresult, result: null });
              }
            });

            if ( !ok ) {
              _respond(RESPONSE_OK, { success: false, error: 'Invalid VFS action!', result: null });
            }
          } catch ( err ) {
            console.error('call', err);
            _respond(RESPONSE_OK, { success: false, error: err.message, result: null });
          }
        } else {
          _respond(RESPONSE_OK, { success: false, error: 'Invalid VFS arguments!', result: null });
        }
        return;
      break;

      case 'service' : // TODO
        defaultJSONResponse(req, res);
      break;

      case 'bug' : // TODO
        defaultJSONResponse(req, res);
      break;

      case 'snapshotList'   :
        _session.snapshotList(suser, function(success, result) {
          if ( success ) {
            _respond(RESPONSE_OK, {success: true, result: result});
          } else {
            _respond(RESPONSE_OK, {success: false, result: null, error: result});
          }
        });
      break;

      case 'snapshotSave'   :
        if ( jsn.session && jsn.session.name && jsn.session.data ) {
          _session.snapshotSave(suser, jsn.session.name, jsn.session.data, function(success, result) {
            if ( success ) {
              _respond(RESPONSE_OK, {success: true, result: result});
            } else {
              _respond(RESPONSE_OK, {success: false, result: null, error: result});
            }
          });
        } else {
          _respond(RESPONSE_OK, {success: false, result: null, error: 'Invalid snapshot save operation!'});
        }
      break;

      case 'snapshotLoad'   :
        if ( jsn.session && jsn.session.name ) {
          _session.snapshotLoad(suser, jsn.session.name, function(success, result) {
            if ( success ) {
              _respond(RESPONSE_OK, {success: true, result: result});
            } else {
              _respond(RESPONSE_OK, {success: false, result: null, error: result});
            }
          });
        } else {
          _respond(RESPONSE_OK, {success: false, result: null, error: 'Invalid snapshot load operation!'});
        }
      break;

      case 'snapshotDelete' :
        if ( jsn.session && jsn.session.name ) {
          _session.snapshotDelete(suser, jsn.session.name, function(success, result) {
            if ( success ) {
              _respond(RESPONSE_OK, {success: true, result: result});
            } else {
              _respond(RESPONSE_OK, {success: false, result: null, error: result});
            }
          });
        } else {
          _respond(RESPONSE_OK, {success: false, result: null, error: 'Invalid snapshot delete operation!'});
        }
      break;

      default :
        _respond(RESPONSE_OK, { success: false, error: 'Invalid action!', result: null });
      break;
    }
  }
}

///////////////////////////////////////////////////////////////////////////////
// INSTANCE
///////////////////////////////////////////////////////////////////////////////

function createInstance(web_port, web_user) {
  var app = express();

  app.configure(function() {

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
      if ( web_user ) {
        req.session.user          = _user.defaultUser;
        req.session.user.username = web_user;
        req.session.user.sid      = req.session.sessionID;
      }

      if ( !req.session.user || (typeof req.session.user !== 'object') ) {
        res.redirect('/login');
        return;
      }

      console.log('GET /');

      var opts     = _config;
      var language = _locale.getLanguage(req);

      opts.locale   = language;
      opts.language = language.split('_').shift();
      opts.preloads = _resources.vendorDependencies;

      res.render('index', opts);
    });

    app.get('/login', function(req, res) {
      console.log('GET /login');

      var opts     = _config;
      var language = _locale.getLanguage(req);

      opts.locale   = language;
      opts.language = language.split('_').shift();

      res.render('login', opts);
    });

    //
    // XHR
    //

    app.post('/API', function postAPI(req, res) {
      console.log('POST /API');

      try {
        var jsn     = req.body || {};//.objectData;
        var action  = jsn.action || null;
        request(action, jsn, web_port, req, res);
      } catch ( err ) {
        console.error('POST /API error', err);
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

  return app;
}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports = createInstance;

