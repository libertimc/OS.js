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
    sprintf    = require('sprintf').sprintf;

var config     = require('../config.js');

// Temporary stuff FIXME
var _defaultLang = "en_US";
var _defaultUser = {
  uid       : 1,
  sid       : '',
  lock      : false,
  language  : _defaultLang,
  info      : {
    "User ID"       : 1,
    "Username"      : "nodejs",
    "Name"          : "Node.js user",
    "Groups"        : ["root"],
    "Registered"    : "2013-01-01 00:00:00",
    "Last Modified" : "2013-01-01 00:00:00",
    "Last Login"    : "2013-01-01 00:00:00",
    "Browser"       : {
      "platform"  : "Platform info",
      "engine"    : "Engine info",
      "version"   : "Version info"
    }
  }
};


module.exports =
{
  login  : function(username, password, callback) {
    if ( username == "test" && password == "test" ) {
      callback(true, _defaultUser);
    } else {
      callback(false, "Invalid username or password!");
    }
  },

  resume : function(user, _callback) {
    var _loadRegistry = function(callback) {
      var path = sprintf(config.PATH_VFS_USER, user.uid) + '/.registry.osjs';
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
      var path = sprintf(config.PATH_VFS_USER, user.uid) + '/.session.osjs';
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

  logout : function(user, registry, session, save, duration, _callback) {
    if ( !save ) {
      session = {};
    }

    var _saveRegistry = function(callback) {
      var path = sprintf(config.PATH_VFS_USER, user.uid) + '/.registry.osjs';
      fs.writeFile(path, JSON.stringify(registry), function(err) {
        callback(err);
      });
    };

    var _saveSession = function(callback) {
      var path = sprintf(config.PATH_VFS_USER, user.uid) + '/.session.osjs';
      fs.writeFile(path, JSON.stringify(session), function(err) {
        callback(err);
      });
    };

    _saveRegistry(function() {
      _saveSession(function() {
        _callback();
      });
    });
  }

};

