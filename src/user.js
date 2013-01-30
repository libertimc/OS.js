/*!
 * @file
 * OS.js - JavaScript Operating System - User
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

var fs         = require('fs'),
    sprintf    = require('sprintf').sprintf,
    pam        = require('authenticate-pam'),
    xml2js     = require('xml2js');

var config     = require('../config.js');

// Temporary stuff FIXME
var _defaultLang = "en_US";
var _defaultUser = {
  uid       : -1,
  sid       : '',
  lock      : false,
  language  : _defaultLang,
  username  : "nodejs",
  groups    : ["nodejs"],
  info      : {
    name        : "Node.js user",
    browser     : {
      platform    : "Platform info",
      engine      : "Engine info",
      version     : "Version info"
    }
  }
};


module.exports =
{
  login  : function(username, password, callback) {
    pam.authenticate(username, password, function(err) {
      if ( err ) {
        callback(false, "Failed to log in!");
      } else {

        // Read user info
        var ipath = sprintf(config.PATH_VFS_USERMETA, username);
        fs.readFile(ipath, function(err, data) {
          var info = null;

          if ( !err ) {
            var parser = new xml2js.Parser();
            parser.parseString(data, function (err, doc) {
              console.log(doc);

              if ( !err ) {
                var node = doc.user.property;
                info = {};
                for ( var i = 0; i < node.length; i++ ) {
                  info[node[i]['$'].name] = node[i]['_'];
                }

                info.browser = {};
              }
            });
          }

          var user = _defaultUser;
          user.username  = username;
          user.groups    = [username];
          user.lock      = false;
          user.info      = info || user.info;

          user.info.browser.platform = "Platform";
          user.info.browser.engine   = "Engine";
          user.info.browser.version  = "Version";

          // Lock session
          var lpath = sprintf(config.PATH_VFS_LOCK, user.username);
          fs.exists(lpath, function(ex) {
            if ( ex ) {
              user.lock = true;
              callback(true, user);
              return;
            }

            fs.writeFile(lpath, (new Date()).toString(), function(err) {
              callback(true, user);
            });
          });

        });
      } // if
    });
  },

  logout : function(user, registry, session, save, duration, _callback) {
    if ( !save ) {
      session = {};
    }

    this.store(user, registry, session, function() {
      // Remove session lock
      var lpath = sprintf(config.PATH_VFS_LOCK, user.username);
      fs.unlink(lpath, function(err) {
        _callback(err);
      });
    });
  },

  resume : function(user, _callback) {
    var _loadRegistry = function(callback) {
      var path = sprintf(config.PATH_VFS_LAST_REGISTRY, user.username);
      fs.readFile(path, function(err, data) {
        if ( err ) {
          callback(false);
        } else {
          try {
            data = JSON.parse(data.toString());
            callback(JSON.parse(data.toString())); // FIXME: WTF ?!
          } catch ( err ) {
            callback(false);
          }
        }
      });
    };

    var _loadSession = function(callback) {
      var path = sprintf(config.PATH_VFS_LAST_SESSION, user.username);
      fs.readFile(path, function(err, data) {
        if ( err ) {
          callback(false);
        } else {
          try {
            data = JSON.parse(data.toString());
            callback(JSON.parse(data.toString())); // FIXME WTF ?!
          } catch ( err ) {
            callback(false);
          }
        }
      });
    };

    _loadRegistry(function(rresult) {
      _loadSession(function(sresult) {
        _callback(rresult || {}, sresult || {});
      });
    });
  },

  store : function(user, registry, session, callback) {
    var _saveRegistry = function(clb) {
      if ( registry === null ) {
        clb(null);
      } else {
        var path = sprintf(config.PATH_VFS_LAST_REGISTRY, user.username);
        fs.writeFile(path, JSON.stringify(registry), function(err) {
          clb(err);
        });
      }
    };

    var _saveSession = function(clb) {
      if ( session === null ) {
        clb(null);
      } else {
        var path = sprintf(config.PATH_VFS_LAST_SESSION, user.username);
        fs.writeFile(path, JSON.stringify(session), function(err) {
          clb(err);
        });
      }
    };

    _saveRegistry(function() {
      _saveSession(function() {
        callback();
      });
    });
  }

};

