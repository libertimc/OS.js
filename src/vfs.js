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
 * @link http://nodejs.org/api/fs.html
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @created 2013-01-27
 */
"use strict";

/*
 * TODO: Secure input
 */

var fs        = require('fs'),
    http      = require('http'),
    url       = require('url'),
    walk      = require('walk'),
    sprintf   = require('sprintf').sprintf,
    sanitize  = require('validator').sanitize,
    mime      = require('mime');

var _config = require('../config.js');

///////////////////////////////////////////////////////////////////////////////
// CONFIGS
///////////////////////////////////////////////////////////////////////////////

var ignore_files = [
  ".", ".gitignore", ".git", ".cvs"
];

var icons_mimetype = {
  "application" : {
    "application/ogg" : {
      "ogv" : "mimetypes/video-x-generic.png",
      "_"   : "mimetypes/audio-x-generic.png"
    },
    "application/pdf"       : "mimetypes/gnome-mime-application-pdf.png",
    "application/x-dosexec" : "mimetypes/binary.png",
    "application/xml"       : "mimetypes/text-x-opml+xml.png",
    "application/zip"       : "mimetypes/folder_tar.png",
    "application/x-tar"     : "mimetypes/folder_tar.png",
    "application/x-bzip2"   : "mimetypes/folder_tar.png",
    "application/x-bzip"    : "mimetypes/folder_tar.png",
    "application/x-gzip"    : "mimetypes/folder_tar.png",
    "application/x-rar"     : "mimetypes/folder_tar.png"
  },

  "image" : "mimetypes/image-x-generic.png",
  "video" : "mimetypes/video-x-generic.png",
  "text"  : {
    "text/html"   : "mimetypes/text-html.png",
    "text/plain"  : "mimetypes/gnome-mime-text.png",
    "_"           : "mimetypes/text-x-generic.png"
  }
};

var icons_ext = {
  "pdf"    : "mimetypes/gnome-mime-application-pdf.png",
  "mp3"    : "mimetypes/audio-x-generic.png",
  "ogg"    : "mimetypes/audio-x-generic.png",
  "flac"   : "mimetypes/audio-x-generic.png",
  "aac"    : "mimetypes/audio-x-generic.png",
  "vob"    : "mimetypes/audio-x-generic.png",
  "mp4"    : "mimetypes/video-x-generic.png",
  "mpeg"   : "mimetypes/video-x-generic.png",
  "avi"    : "mimetypes/video-x-generic.png",
  "3gp"    : "mimetypes/video-x-generic.png",
  "flv"    : "mimetypes/video-x-generic.png",
  "mkv"    : "mimetypes/video-x-generic.png",
  "webm"   : "mimetypes/video-x-generic.png",
  "ogv"    : "mimetypes/video-x-generic.png",
  "bmp"    : "mimetypes/image-x-generic.png",
  "jpeg"   : "mimetypes/image-x-generic.png",
  "jpg"    : "mimetypes/image-x-generic.png",
  "gif"    : "mimetypes/image-x-generic.png",
  "png"    : "mimetypes/image-x-generic.png",
  "zip"    : "mimetypes/folder_tar.png",
  "rar"    : "mimetypes/folder_tar.png",
  "gz"     : "mimetypes/folder_tar.png",
  "bz2"    : "mimetypes/folder_tar.png",
  "bz"     : "mimetypes/folder_tar.png",
  "tar"    : "mimetypes/folder_tar.png",
  "xml"    : "mimetypes/text-x-opml+xml.png",
  "html"   : "mimetypes/text-html.png",
  "txt"    : "mimetypes/gnome-mime-text.png"
};

var vfs_dirs = {
  "/System/Packages" : {
    "type" : "system_packages",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/user-bookmarks.png"
  },
  "/System/Docs" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-documents.png"
  },
  "/System/Wallpapers" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-pictures.png"
  },
  "/System/Fonts" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/user-desktop.png"
  },
  "/System/Sounds" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-music.png"
  },
  "/System/Templates" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-templates.png"
  },
  "/System/Themes" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/user-bookmarks.png"
  },
  "/System" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-templates.png"
  },
  "/User" : {
    "type" : "chroot",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder_home.png"
  },
  "/Public" : {
    "type" : "public",
    "attr" : _config.VFS_ATTR_RW,
    "icon" : "places/folder-publicshare.png"
  },
  "/Shared" : {
    "type" : "core",
    "attr" : _config.VFS_ATTR_READ,
    "icon" : "places/folder-templates.png"
  }
};

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

function sortObj(object, sortFunc) {
  if ( !sortFunc ) {
    sortFunc = function(a, b) {
      if (a > b) return 1;
      if (a < b) return -1;
      return 0;
    };
  }
  var rv = [];
  for (var k in object) {
    if (object.hasOwnProperty(k)) rv.push({key: k, value:  object[k]});
  }
  rv.sort(function(o1, o2) {
    return sortFunc(o1.key, o2.key);
  });
  return rv;
}

function is_protected(input) {
  // TODO: Permissions
  if ( input.match(/^\/User/) ) {
    return false;
  }
  return true;
}

function get_icon(filename, mimetype) {
  if ( typeof filename == 'string' ) {
    if ( mimetype ) {
      if ( icons_mimetype[mimetype] ) {
        return icons_mimetype[mimetype];
      }

      var msplit = mimetype.split("/");
      if ( msplit.length && icons_mimetype[msplit[0]] ) {
        if ( typeof icons_mimetype[msplit[0]] == 'object' ) {
          if ( (msplit.length > 1) && icons_mimetype[msplit[0]][msplit[1]] ) {
            return icons_mimetype[msplit[0]][msplit[1]];
          } else {
            if ( icons_mimetype[msplit[0]]['_'] ) {
              return icons_mimetype[msplit[0]]['_'];
            }
          }
        } else {
          return icons_mimetype[msplit[0]];
        }
      }

      /*var mext = mime.extension(mimetype);
      if ( mext ) {
        if ( icons_ext[mext] ) {
          return icons_ext[mext];
        }
      }*/
    }

    if ( filename.match(/\.([A-z]{2,4})$/) ) {
      var ext = filename.split(/\.([A-z]{2,4})$/);
      if ( ext.length > 1 ) {
        if ( icons_ext[ext[1]] ) {
          return icons_ext[ext[1]];
        }
      }
    }
  }

  return 'emblems/emblem-unreadable.png';
}

function in_array(element, array, cmp) {
  if (typeof cmp != "function") {
    cmp = function (o1, o2) {
      return o1 == o2;
    };
  }
  for (var key in array) {
    if (cmp(element, array[key])) {
      return true;
    }
  }
  return false;
}

function dirname(path) {
  var spl = path.split('/');
  spl.pop();
  return spl.join('/');
}

function basename(path) {
  var spl = path.split('/');
  return spl.pop();
}

function mkpath(user, input) {
  if ( input.match(/^\/User/) ) {
    return sprintf(_config.PATH_VFS_USER, user.username) + input.replace(/^\/User/, '');
  }
  return (_config.PATH_MEDIA + input);
}

function checkMIME(needle, haystack) {
  var i = 0, l = haystack.length, x;
  for ( i; i < l; i++ ) {
    x = haystack[i];
    if ( x.match(/\/\*/) ) {
      if ( needle.split("/")[0] == x.split("/")[0] ) {
        return true;
      }
    } else {
      if ( needle == x )
        return true;
    }
  }
  return false;
}

///////////////////////////////////////////////////////////////////////////////
// FS WRAPPERS
///////////////////////////////////////////////////////////////////////////////

var VFS = function(user) {
  this.user = user;
};

VFS.prototype = {
  ls : function(args, mime_filter, callback) {
    mime_filter = mime_filter || [];

    var path = mkpath(this.user, args);
    console.log("_ls", path);

    var tree  = {
      dirs  : {},
      files : {}
    };

    if ( args != "/" ) {
      var parentdir = args.split('/');
      if ( parentdir.length > 1 ) {
        parentdir.pop();
        parentdir = parentdir.join('/') || "/";
      } else {
        parentdir = "/";
      }

      tree.dirs[".."] = {
        path        : parentdir,
        size        : 0,
        mime        : '',
        icon        : 'status/folder-visiting.png',
        type        : 'dir',
        'protected' : 1
      };
    }

    var __callback = function() {
      var i, result = {};
      var dirs = sortObj(tree.dirs);
      var files = sortObj(tree.files);

      for ( i = 0; i < dirs.length; i++ ) {
        result[dirs[i].key] = dirs[i].value;
      }
      for ( i = 0; i < files.length; i++ ) {
        result[files[i].key] = files[i].value;
      }

      callback(true, result);
    };

    fs.readdir(path, function(err, files) {
      if ( err ) {
        callback(false, err);
        return;
      }

      var list = files;
      var __next = function() {
        if ( list.length ) {
          var iter  = list.pop();

          if ( in_array(iter, ignore_files) ) {
            __next();
          } else {
            var fname = path + '/' + iter;
            var froot = args;
            var fpath = args == "/" ? ('/' + iter) : (args + '/' + iter);
            var fmime = mime.lookup(fname);

            if ( mime_filter.length && !checkMIME(fmime, mime_filter) ) {
              __next();
              return;
            }

            fs.stat(fname, function(err, stats) {
              if ( !err && stats ) {
                var isdir = stats.isDirectory();
                var fiter = {
                  path         : fpath,
                  size         : stats.size,
                  mime         : fmime,
                  icon         : isdir ? "places/folder.png" : get_icon(iter, fmime),
                  type         : isdir ? 'dir' : 'file',
                  'protected'  : is_protected(fpath) ? 1 : 0
                };

                if ( isdir ) {
                  tree.dirs[iter] = fiter;
                } else {
                  tree.files[iter] = fiter;
                }
              }

              __next();
            });
          }
          return;
        }

        __callback();
      };

      __next();
    }); // readdir
  },

  cat : function(filename, callback) {
    fs.readFile(mkpath(this.user, filename), function(err, data) {
      if ( err ) {
        callback(false, err || "File not found or permission denied!");
      } else {
        callback(true, data.toString());
      }
    });
  },

  exists : function(filename, callback) {
    fs.exists(mkpath(this.user, filename), function(ex) {
      if ( ex ) {
        callback(true, true);
      } else {
        callback(true, false);
      }
    });
  },

  mkdir : function(name, callback) {
    fs.mkdir(mkpath(this.user, name), _config.VFS_MKDIR_PERM, function(err) {
      if ( err ) {
        callback(false, err);
      } else {
        callback(true, true);
      }
    });
  },

  touch : function(filename, callback) {
    var path = mkpath(this.user, filename);
    fs.exists(path, function(ex) {
      if ( ex ) {
        callback(false, "File exists!");
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
  },

  rm : function(name, callback) {
    // FIXME: Recursive
    var path = mkpath(this.user, name);
    fs.exists(path, function(ex) {
      if ( ex ) {
        callback(false, "File exists!");
      } else {
        fs.unlink(path, function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, true);
          }
        });
      }
    });
  },

  cp : function(src, dst, callback) {
    var u = this.user;
    fs.exists(mkpath(u, dst), function(ex) {
      if ( ex ) {
        callback(false, 'Destination already exists!');
      } else {
        fs.readFile(mkpath(u, src), function(err, data) {
          if ( err ) {
            callback(false, err);
          } else {
            fs.writeFile(mkpath(u, dst), data, function(err) {
              if ( err ) {
                callback(false, err);
              } else {
                callback(true, true);
              }
            });
          }
        });
      }
    });
  },

  put : function(filename, content, encoding, callback) {
    var path = mkpath(this.user, filename);
    fs.exists(path, function(ex) {
      if ( ex ) {
        fs.appendFile(path, content, encoding || "utf8", function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, true);
          }
        });
      } else {
        callback(false, "File does not exist!");
      }
    });
  },

  fileinfo : function(filename, callback) {
    var path = mkpath(this.user, filename);

    fs.exists(path, function(ex) {
      if ( ex ) {
        fs.stat(path, function(err, stats) {
          if ( err ) {
            callback(false, err);
          } else {
            if ( !stats.isDirectory() ) {
              var media_info;
              var fmime = mime.lookup(path) || null;

              switch ( fmime.split("/").shift() ) {
                case 'image' :
                case 'video' :
                case 'audio' :
                  media_info = {};
                break;
                default :
                  media_info = null;
                break;
              }

              callback(true, {
                filename  : basename(filename),
                path      : dirname(filename),
                size      : stats.size || 0,
                mime      : fmime,
                info      : media_info
              });
            } else {
              callback(false, "Cannot stat a directory!");
            }
          }
        });
      } else {
        callback(false, "File does not exist!");
      }
    });
  },

  //
  // Wrappers
  //
  lswrap  : function(path, mime_filter, view, sort, callback) {
    this.ls(path, mime_filter, function(success, result) {
      if ( success ) {
        var ls_items = [];
        var ls_bytes = 0;
        var ls_path  = path; // FIXME

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
                hsize       : sprintf("%d%s", iter.size, "b"), // FIXME
                'protected' : iter['protected']
            });
          }
        }

        var data = {
          items : ls_items,
          total : ls_items.length,
          bytes : ls_bytes,
          path  : ls_path == '/User' ? 'Home' : ls_path
        };

        callback(true, data);
      } else {
        callback(false, result);
      }
    });
  },

  //
  // Extern
  //
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

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  mkpath  : mkpath,
  call    : function(user, method, args, callback) {
    var v = new VFS(user);

    switch ( method ) {
      case 'ls'       :
      case 'readdir'  :
        if ( typeof args == 'string' ) {
          v.ls(args, null, callback);
        } else {
          v.ls(args.path, args.mime, callback);
        }
      break;

      case 'cat'      :
      case 'read'     :
        v.cat(args, callback);
      break;

      case 'exists'   :
        v.exists(args, callback);
      break;

      case 'mkdir'    :
        v.mkdir(args, callback);
      break;

      case 'touch'    :
        v.touch(args, callback);
      break;

      case 'delete'   :
      case 'rm'       :
        v.rm(args, callback);
      break;

      case 'mv'       :
      case 'rename'   :
        v.mv(args.source, args.destination, callback);
      break;

      case 'cp'       :
      case 'copy'     :
        v.cp(args.source, args.destination, callback);
      break;

      case 'put'      :
      case 'write'    :
        v.pu(args.path, args.content, args.encoding, callback);
      break;

      case 'fileinfo' :
      case 'file_info':
        v.fileinfo(args, callback);
      break;

      case 'readurl'  :
        v.readurl(args, callback);
      break;

      case 'lswrap' :
        v.lswrap(args.path, args.mime, args.view, args.sort, callback);
      break;


      default :
        return false;
      break;
    }

    return true;
  }

  // preview
  // file_info
  // fileinfo
  // readpdf
  // upload
  // ls_archive
  // extract_archive
};

