/*!
 * @file
 * OS.js - JavaScript Operating System - API
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

var RESPONSE_OK     = 200;
var RESPONSE_ERROR  = 500;

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

// Internal
var _config    = require('../config.js'),
    _registry  = require(_config.PATH_SRC + '/registry.js'),
    _settings  = require(_config.PATH_SRC + '/settings.js'),
    _preload   = require(_config.PATH_SRC + '/preload.js'),
    _packages  = require(_config.PATH_SRC + '/packages.js'),
    _vfs       = require(_config.PATH_SRC + '/vfs.js'),
    _user      = require(_config.PATH_SRC + '/user.js'),
    _services  = require(_config.PATH_SRC + '/services.js'),
    _locale    = require(_config.PATH_SRC + '/locale.js'),
    _session   = require(_config.PATH_SRC + '/session.js');

// External
var sprintf = require('sprintf').sprintf,
    syslog  = require('node-syslog');

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
// MAIN
///////////////////////////////////////////////////////////////////////////////

function request(pport, suser, req, res) {
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
    var _respond = function(http_code, http_data) {
      if ( http_data.success === false && (typeof http_data.error === 'object') ) {
        var msg = ["Node.js Exception occured: "];
        msg.push('Filename: ' + err.filename);
        msg.push('Line: ' + err.lineno);
        msg.push('Message: ' + err.message);
        http_data.error = msg.join('<br />');
      }
      res.json(http_code, http_data);
    };

    if ( action != 'boot' ) {
      if ( !(typeof req.session.user === 'object') ) {
        _respond(500, {success: false, error: 'No running session found!'});
        return;
      }
    }

    // Call API
    switch ( action ) {
      case 'boot' :
        syslog.log(syslog.LOG_INFO, "booting up...");

        var user = _user.defaultUser;
        user.username = suser;

        var _success = function(packages, resume_registry, resume_session) {
          user.sid = req.sessionID;
          res.cookie('osjs_sessionid', req.sessionID);

          response = {
            environment : {
              bugreporting : _config.BUGREPORT_ENABLE,
              setup        : _config.ENV_SETUP,
              standalone   : _config.ENV_STANDALONE,
              hosts        : {
                frontend      : 'localhost' + pport
              }
            },

            session : {
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
            }
          };

          _respond(RESPONSE_OK, {success: true, result: response});

          req.session.user      = user;

          syslog.log(syslog.LOG_INFO, "client[" + req.session.user.username + "] logged in...");
        };

        var _failure = function(msg) {
          syslog.log(syslog.LOG_ERROR, "Boot failed: " + msg);

          console.error('Boot::_failure()', msg);

          req.session.user = null;
          res.cookie('osjs_sessionid', null);

          _respond(RESPONSE_OK, {success: false, error: msg, result: null});
        };

        _packages.getInstalledPackages(user, function(success, result) {
          if ( success ) {
            _user.resume(user, function(resume_registry, resume_session) {
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
        var save     = (jsn.save === true || jsn.save === "true");
        var duration = jsn.duration;

        var __done = function() {
          _respond(RESPONSE_OK, {success: true, result: true});

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
            _respond(RESPONSE_OK, {success: true, result: {
              packages : result
            }});
          } else {
            _respond(RESPONSE_OK, {success: false, error: result, result: null});
          }
        });
      break;

      case 'settings' :
        syslog.log(syslog.LOG_INFO, "saving client[" + req.session.user.username + "] settings");

        _user.store(req.session.user, jsn.registry, null, function(err) {
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
            _respond(RESPONSE_OK, {success: true, result: req.session.user.info});
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

        var puser = req.session.user;

        if ( ev_action === null || ev_instance === null || ev_name === null ) {
          _respond(RESPONSE_OK, { success: false, error: "Invalid event!", result: null });
        } else {
          _packages.getInstalledSystemPackages(puser.language, function(success, result) {
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
                _respond(RESPONSE_OK, { success: false, error: 'Cannot handle this event!', result: null });
              } else {
                var _cpath = ([_config.PATH_PACKAGES, load_class]).join("/");
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
                    _class.Event(ev_action, ev_args, function(esuccess, eresult) {
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
              _packages.installPackage(req.session.user, jsn['archive'], function(success, result) {
                if ( success ) {
                  _respond(RESPONSE_OK, { success: true, result: result });
                } else {
                  _respond(RESPONSE_OK, { success: false, error: result, result: null });
                }
              });
            break;

            case 'uninstall' :
              _packages.uninstallPackage(req.session.user, jsn['package'], function(success, result) {
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
        console.log("API::call()", jsn);
        if ( (jsn.method && jsn.args) ) {
          try {
            var ok = _vfs.call(req.session.user, jsn.method, (jsn.args || []), function(vfssuccess, vfsresult) {
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
        _session.snapshotList(req.session.user, function(success, result) {
          if ( success ) {
            _respond(RESPONSE_OK, {success: true, result: result});
          } else {
            _respond(RESPONSE_OK, {success: false, result: null, error: result});
          }
        });
      break;

      case 'snapshotSave'   :
        if ( jsn.session && jsn.session.name && jsn.session.data ) {
          _session.snapshotSave(req.session.user, jsn.session.name, jsn.session.data, function(success, result) {
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
          _session.snapshotLoad(req.session.user, jsn.session.name, function(success, result) {
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
          _session.snapshotDelete(req.session.user, jsn.session.name, function(success, result) {
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
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports = {
  request : request
};


