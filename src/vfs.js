/*!
 * @file
 * OS.js - JavaScript Operating System - VFS
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

/*
 * TODO: Secure input
 */

var fs        = require('fs'),
    http      = require('http'),
    url       = require('url'),
    walk      = require('walk'),
    sprintf   = require('sprintf').sprintf,
    sanitize  = require('validator').sanitize;

var _config = require('../config.js');

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

function mkpath(input) {
  // FIXME Safe
  if ( input.match(/^\/User/) ) {
    var uid = 1; // FIXME
    return sprintf(_config.PATH_VFS_USER, uid) + input.replace(/^\/User/, '');
  }

  return (_config.PATH_MEDIA + input);
}

function is_protected(input) {
  // TODO: Permissions
  if ( input.match(/^\/User/) ) {
    return false;
  }
  return true;
}

function get_icon(filename, mime) {
  return 'emblems/emblem-unreadable.png'; // FIXME
}

///////////////////////////////////////////////////////////////////////////////
// FS WRAPPERS
///////////////////////////////////////////////////////////////////////////////

function _ls(args, callback) {
  var path = mkpath(args);

  console.log("_ls", path);

  var files  = {
    ".." : {
      path        : path,
      size        : 0,
      mime        : null,
      icon        : get_icon(null, "dir"),
      type        : 'dir',
      'protected' : 1
    }
  };

  var walker = walk.walk(path); //, { followLinks: false });

  walker.on('file', function(root, stat, next) {
    try {
      files[stat.name] = {
        path         : root,
        size         : stat.size,
        mime         : "todo/todo", // FIXME
        icon         : get_icon(stat.name, "todo/todo"), // FIXME
        type         : "file",
        'protected'  : is_protected(root) ? 1 : 0
      };
    } catch ( e ) {
      console.error("walker.on(file)", e);
    }

    next();
  });

  walker.on('symlink', function(symlink, stat, next) {
    try {
      files[stat.name] = {
        path         : symlink,
        size         : stat.size,
        mime         : "todo/todo", // FIXME
        icon         : get_icon(stat.file, "todo/todo"), // FIXME
        type         : "file",
        'protected'  : is_protected(symlink) ? 1 : 0
      };
    } catch ( e ) {
      console.error("walker.on(symlink)", e);
    }

    next();
  });

  walker.on('dir', function(dir, stat, next) {
    try {
      files[stat.name] = {
        path         : dir,
        size         : stat.size,
        mime         : "",
        icon         : 'status/folder-visiting.png',
        type         : "dir",
        'protected'  : is_protected(dir) ? 1 : 0
      };
    } catch ( e ) {
      console.error("walker.on(dir)", e);
    }

    next();
  });

  /*walker.on('error', function(er, entry, stat) {
    console.error("_ls error:", er, entry, stat);
  });*/

  walker.on('end', function() {
    callback(true, files);
  });
}

function _cat(filename, callback) {
  var path = mkpath(filename);

  fs.readFile(path, function(err, data) {
    if ( err ) {
      callback(false, err || "File not found or permission denied!");
    } else {
      callback(true, data.toString());
    }
  });
}

function _exists(filename, callback) {
  var path = mkpath(filename);

  fs.exists(path, function(ex) {
    if ( ex ) {
      callback(true, true);
    } else {
      callback(true, false);
    }
  });
}

function _mkdir(name, callback) {
  var path = mkpath(name);

  fs.mkdir(path, _config.VFS_MKDIR_PERM, function(err, files) {
    if ( err ) {
      callback(false, err);
    } else {
      callback(true, true);
    }
  });
}

function _touch(filename, callback) {
  var path = mkpath(filename);

  _exists(path, function(sucess, result) {
    if ( success ) {
      callback(true, false);
    } else {
      fs.writeFile(path, "", function(err) {
        if ( err ) {
          callback(false, err);
        } else {
          callback(true, true);
        }
      });
    }
  });
}

function _rm(name, callback) {
  var path = mkpath(name);

  _exists(path, function(sucess, result) {
    if ( success ) {
      fs.unlink(path, function(err) {
        if ( err ) {
          callback(false, err);
        } else {
          callback(true, true);
        }
      });
    } else {
      callback(true, false);
    }
  });
}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  // Base
  ls        : _ls,
  readdir   : _ls,
  cat       : _cat,
  read      : _cat,
  exists    : _exists,
  mkdir     : _mkdir,
  touch     : _touch,
  'delete'  : _rm,
  rm        : _rm,

  // preview
  // rename
  // mv
  // put
  // write
  // file_info
  // fileinfo
  // readpdf
  // cp
  // copy
  // upload
  // ls_archive
  // extract_archive

  // Wrappers
  lswrap  : function(args, callback) {
    _ls(args.path, function(success, result) {
      if ( success ) {
        var ls_items = [];
        var ls_bytes = 0;
        var ls_path  = args.path; // FIXME

        var iter;
        for ( var f in result ) {
          if ( result.hasOwnProperty(f) ) {
            iter = result[f];

            ls_bytes += iter.size;

            ls_items.push({
                icon        : iter.icon,
                type        : iter.type,
                mime        : sanitize(iter.mime).entityEncode(),
                name        : sanitize(f).entityEncode(),
                path        : iter.path,
                size        : iter.size,
                hsize       : iter.size + "b", // FIXME
                'protected' : is_protected(iter.path) ? 1 : 0
            });
          }
        }

        var data = {
          items : ls_items,
          total : ls_items.length,
          bytes : ls_bytes,
          path  : ls_path
        };

        callback(true, data);
      } else {
        callback(false, result);
      }
    });
  },

  // Extern
  readurl : function(args, callback) {
    if ( args !== null ) {
      var qdata   = url.parse(args, true);
      var options = {
        host    : qdata.host || "http://localhost",
        port    : qdata.port || 80,
        path    : qdata.path || "/"
      };

      http.get(options, function(res) {
        if ( res.statusCode === 200 ) {
          res.setEncoding('utf8'); // FIXME !?
          res.on('data', function (chunk) {
            callback(true, chunk);
          });
        } else {
          callback(false, "Failed to read URL: HTTP Code " + res.statusCode);
        }
      }).on('error', function(e) {
        callback(false, "Failed to read URL: " + e.message);
      });
    } else {
      callback(false, "Invalid URL!");
    }
  }
};

