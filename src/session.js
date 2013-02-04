/*!
 * @file
 * OS.js - JavaScript Operating System - Sessions
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
 * @link http://nodejs.org/api/fs.html
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2013-01-27
 */
"use strict";

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

var _fs       = require('fs'),
    _sprintf  = require('sprintf').sprintf,
    _util     = require('util'),
    _path     = require('path');

var _config   = require('../config.js');

///////////////////////////////////////////////////////////////////////////////
// CONFIGS
///////////////////////////////////////////////////////////////////////////////

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  /**
   * session::snapshotList() -- Get a list of user snapshots
   * @param   Object      user        User
   * @param   Function    callback    Callback function
   * @return  void
   */
  snapshotList : function(user, callback) {
    var path = _sprintf(_config.PATH_VFS_SNAPSHOTS, user.username);
    _fs.readdir(path, function(err, files) {
      if ( err ) {
        callback(false, err);
      } else {
        var response = [];

        var i = 0, l = files.length;
        for ( i; i < l; i++ ) {
          if ( files[i].match(/\.json$/) ) {
            response.push(files[i].replace(/\.json/, ''));
          }
        }

        callback(true, response);
      }
    });
  },

  /**
   * session::snapshotSave() -- Save a user snapshot
   * @param   Object      user        User
   * @param   String      name        Snapshot name
   * @param   Object      data        Snapshot data
   * @param   Function    callback    Callback function
   * @return  void
   */
  snapshotSave : function(user, name, data, callback) {
    name += '.json';

    var path = _path.join(_sprintf(_config.PATH_VFS_SNAPSHOTS, user.username), name);
    _fs.writeFile(path, JSON.stringify(data), function(err) {
      if ( err ) {
        callback(false, err);
      } else {
        callback(true, true);
      }
    });
  },

  /**
   * session::snapshotLoad() -- Load a user snapshot by name
   * @param   Object      user        User
   * @param   String      name        Snapshot name
   * @param   Function    callback    Callback function
   * @return  void
   */
  snapshotLoad : function(user, name, callback) {
    name += '.json';

    var path = _path.join(_sprintf(_config.PATH_VFS_SNAPSHOTS, user.username), name);
    _fs.readFile(path, function(err, data) {
      if ( err ) {
        callback(false, err);
      } else {
        // TODO
        callback(false, 'todo');
        //callback(true, JSON.parse(data));
      }
    });
  },

  /**
   * session::snapshotDelete() -- Delete a user snapshot by name
   * @param   Object      user        User
   * @param   String      name        Snapshot name
   * @param   Function    callback    Callback function
   * @return  void
   */
  snapshotDelete : function(user, name, callback) {
    name += '.json';

    var path = _path.join(_sprintf(_config.PATH_VFS_SNAPSHOTS, user.username), name);
    _fs.unlink(path, function(err) {
      if ( err ) {
        callback(false, 'Failed to delete snapshot file!');
      } else {
        callback(true, true);
      }
    });
  }

};

