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

var fs        = require('fs'),
    http      = require('http'),
    url       = require('url'),
    sprintf   = require('sprintf').sprintf,
    sanitize  = require('validator').sanitize,
    mime      = require('mime'),
    util      = require('util'),
    _path     = require('path'),
    ncp       = require('ncp').ncp;

    // Also uses: exif, imagemagick, child_process (in code)

var _config   = require('../config.js'),
    _packages = require(_config.PATH_SRC + '/packages.js'),
    _archive  = require(_config.PATH_SRC + '/archive.js');

///////////////////////////////////////////////////////////////////////////////
// CONFIGS
///////////////////////////////////////////////////////////////////////////////

/**
 * @var Files to ingnore in listings
 */
var ignore_files = [
  ".", ".gitignore", ".git", ".cvs"
];

/**
 * @var Default file icon
 */
var icon_default = 'emblems/emblem-unreadable.png';

/**
 * @var Icons mapping: MIME type
 */
var icons_mime = {
  "application/pdf"       : "mimetypes/gnome-mime-application-pdf.png",
  "application/x-dosexec" : "mimetypes/binary.png",
  "application/xml"       : "mimetypes/text-x-opml+xml.png",
  "application/zip"       : "mimetypes/folder_tar.png",
  "application/x-tar"     : "mimetypes/folder_tar.png",
  "application/x-bzip2"   : "mimetypes/folder_tar.png",
  "application/x-bzip"    : "mimetypes/folder_tar.png",
  "application/x-gzip"    : "mimetypes/folder_tar.png",
  "application/x-rar"     : "mimetypes/folder_tar.png",
  "text/html"             : "mimetypes/text-html.png",
  "text/plain"            : "mimetypes/gnome-mime-text.png"
};

/**
 * @var Icons mapping: MIME category
 */
var icons_category = {
  "application" : "mimetypes/binary.png",
  "image"       : "mimetypes/image-x-generic.png",
  "video"       : "mimetypes/video-x-generic.png",
  "text"        : "mimetypes/text-x-generic.png"
};

/**
 * @var Icons mapping: File extension
 */
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
  "tgz"    : "mimetypes/folder_tar.png",
  "xml"    : "mimetypes/text-x-opml+xml.png",
  "html"   : "mimetypes/text-html.png",
  "txt"    : "mimetypes/gnome-mime-text.png",
  "m3u"    : "application/x-winamp-playlist"
};

/**
 * @var Virtual directories
 */
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

// https://gist.github.com/1722941
fs.removeRecursive = function(path,cb){
  var self = this;

  fs.stat(path, function(err, stats) {
    if(err){
      cb(err,stats);
      return;
    }
    if(stats.isFile()){
      fs.unlink(path, function(err) {
        if(err) {
          cb(err,null);
        }else{
          cb(null,true);
        }
        return;
      });
    }else if(stats.isDirectory()){
      // A folder may contain files
      // We need to delete the files first
      // When all are deleted we could delete the 
      // dir itself
      fs.readdir(path, function(err, files) {
        if(err){
          cb(err,null);
          return;
        }
        var f_length = files.length;
        var f_delete_index = 0;

        // Check and keep track of deleted files
        // Delete the folder itself when the files are deleted

        var checkStatus = function(){
          // We check the status
          // and count till we r done
          if(f_length===f_delete_index){
            fs.rmdir(path, function(err) {
              if(err){
                cb(err,null);
              }else{ 
              cb(null,true);
              }
            });
            return true;
          }
          return false;
        };
        if(!checkStatus()){
          for(var i=0;i<f_length;i++){
            // Create a local scope for filePath
            // Not really needed, but just good practice
            // (as strings arn't passed by reference)
            (function(){
                var filePath = path + '/' + files[i];
                // Add a named function as callback
                // just to enlighten debugging
                fs.removeRecursive(filePath,function removeRecursiveCB(err,status){
                  if(!err){
                    f_delete_index ++;
                    checkStatus();
                  }else{
                    cb(err,null);
                    return;
                  }
                });

            })();
          }
        }
      });
    }
  });
};

/**
 * Sort a dict
 * @return  Object
 */
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

/**
 * Check if given VFS path is protected [from user actions]
 * @return  bool
 */
function isProtected(input) { // FIXME
  if ( input.match(/^\/User/) ) {
    return false;
  }
  return true;
}

/**
 * Create a VFS path
 *
 * Translates paths
 *
 * @return  String
 */
function mkpath(user, input) {
  if ( input.match(/^\/User/) ) {
    return _path.normalize(_path.join(sprintf(_config.PATH_VFS_USER, user.username), input.replace(/^\/User/, '')));
  }
  return _path.normalize(_path.join(_config.PATH_MEDIA, input));
}

/**
 * Check if path is a VFS directory and return type
 * @return  String
 */
function getVFSType(vfspath) {
  if ( vfspath && vfs_dirs[vfspath] ) {
    return vfs_dirs[vfspath].type;
  }
  return null;
}

/**
 * Check if path is a VFS item and return icon
 * @return  String
 */
function getVFSIcon(vfspath) {
  if ( vfspath && vfs_dirs[vfspath] ) {
    return vfs_dirs[vfspath].icon;
  }
  return 'places/folder.png';
}

/**
 * Get icon for given filename and/or MIME
 * @return  String
 */
function getIcon(filename, mimetype) {
  if ( typeof filename == 'string' ) {
    if ( filename.match(/\.([A-z]{2,4})$/) ) {
      var ext = filename.split(/\.([A-z]{2,4})$/);
      if ( ext.length > 1 ) {
        if ( icons_ext[ext[1]] ) {
          return icons_ext[ext[1]];
        }
      }
    }

    if ( mimetype ) {
      var msplit = mimetype.split("/");
      if ( icons_mime[mimetype] ) {
        return icons_mime[mimetype];
      } else {
        if ( icons_category[msplit[0]] ) {
          return icons_category[msplit[0]];
        }
      }
    }
  }

  return icon_default;
}

/**
 * Check if given element is in an array
 * @return  bool
 */
function inArray(element, array, cmp) {
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

/**
 * Check if MIME is matched in an array
 * @return  bool
 */
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

/**
 * Escape an argument for shell
 * @return  String
 */
function escapeshell(cmd) {
  return ('' + cmd).replace(/(["\s'$`\\])/g,'\\$1');
}

///////////////////////////////////////////////////////////////////////////////
// FS WRAPPERS
///////////////////////////////////////////////////////////////////////////////

/**
 * VFS -- Virtual Filesystem helper library
 * @class
 */
var VFS = function(user) {
  this.user = user;
};

VFS.prototype =
{
  /**
   * VFS::ls() -- List directory
   * @param   String    args          Path
   * @param   Array     mime_filter   MIME Filter
   * @param   Function  callback      Callback function
   * @return  void
   */
  ls : function(args, mime_filter, callback) {
    mime_filter = mime_filter || [];

    var vtype = getVFSType(args.replace(/\/$/, ''));
    var path  = mkpath(this.user, args);

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
        path        : parentdir, //args,
        root        : parentdir,
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


    //
    // VFS directories
    //
    if ( vtype === "system_packages" ) {
      _packages.getInstalledSystemPackages(this.user.language, function(success, result) {
        if ( success && result ) {
          for ( var i in result ) {
            if ( result.hasOwnProperty(i) ) {
              tree.files[i] = {
                path         : args + '/' + i,
                root         : args,
                size         : 0,
                mime         : 'OSjs/' + result[i].type,
                icon         : result[i].icon,
                type         : 'file',
                'protected'  : 1
              };
            }
          }
        }
        __callback();
      });

      return;
    }

    //
    // Normal directory
    //
    fs.readdir(path, function(err, files) {
      if ( err ) {
        callback(false, err);
        return;
      }

      var list = files;
      var __next = function() {
        if ( list.length ) {
          var iter  = list.pop();

          if ( inArray(iter, ignore_files) ) {
            __next();
          } else {
            var fname = (path + '/' + iter).replace(/\/$/, '');
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
                var ficon = isdir ? getVFSIcon(fpath) : getIcon(iter, fmime);

                var fiter = {
                  path         : fpath,
                  root         : froot,
                  size         : stats.size,
                  mime         : fmime,
                  icon         : ficon,
                  type         : isdir ? 'dir' : 'file',
                  'protected'  : isProtected(fpath) ? 1 : 0
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

  /**
   * VFS::cat() -- Get file(s) content
   * FIXME: Multiples
   * @param   String    filename      Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  cat : function(filename, callback) {
    fs.readFile(mkpath(this.user, filename), function(err, data) {
      if ( err ) {
        callback(false, err || "File not found or permission denied!");
      } else {
        callback(true, data.toString());
      }
    });
  },

  /**
   * VFS::exist() -- Check if a file exists
   * @param   String    filename      Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  exists : function(filename, callback) {
    fs.exists(mkpath(this.user, filename), function(ex) {
      if ( ex ) {
        callback(true, true);
      } else {
        callback(true, false);
      }
    });
  },

  /**
   * VFS::mkdir() -- Create a new directory
   * @param   String    name          Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  mkdir : function(name, callback) {
    fs.mkdir(mkpath(this.user, name), _config.VFS_MKDIR_PERM, function(err) {
      if ( err ) {
        callback(false, err);
      } else {
        callback(true, true);
      }
    });
  },

  /**
   * VFS::touch() -- Create a new file
   * @param   String    filename      Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
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

  /**
   * VFS::rmdir() -- Remove/unlink a directory
   * @param   String    name          Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  rmdir : function(name, callback) {
    var path = mkpath(this.user, name);
    fs.removeRecursive(path, function(err) {
      callback(err ? false : true, err ? err : true);
    });
  },

  /**
   * VFS::rm() -- Remove/unlink a file
   * @param   String    name          Source Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  rm : function(name, callback) {
    var path = mkpath(this.user, name);
    fs.exists(path, function(ex) {
      if ( ex ) {
        fs.unlink(path, function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, true);
          }
        });
      } else {
        callback(false, "File exists!");
      }
    });
  },

  /**
   * VFS::mv() -- Move a file
   * @param   String    src           Source Filename/path
   * @param   String    dst           Destination Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  mv : function(src, dest, callback) {
    var psrc = mkpath(this.user, src);
    var pdest = mkpath(this.user, dest);

    fs.exists(pdest, function(ex) {
      if ( ex ) {
        callback(false, "File exists!");
      } else {
        fs.rename(psrc, pdest, function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, true);
          }
        });
      }
    });
  },

  /**
   * VFS::cp() -- Copy a file
   * @param   String    src           Source Filename/path
   * @param   String    dst           Destination Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  cp : function(src, dst, callback) {
    var u = this.user;
    fs.exists(mkpath(u, dst), function(ex) {
      if ( ex ) {
        callback(false, 'Destination already exists!');
      } else {
        /*
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
        */

        ncp(src, dst, function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, true);
          }
        });
      }
    });
  },

  /**
   * VFS::put() -- Put something into a file
   * @param   String    filename      Filename/path
   * @param   String    content       Data to write
   * @param   String    encoding      File encoding
   * @param   Function  callback      Callback function
   * @return  void
   */
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

  /**
   * VFS::fileinfo() -- Get file information
   * @param   String    filename      Filename/path
   * @param   Function  callback      Callback function
   * @return  void
   */
  fileinfo : function(filename, callback) {
    var path = mkpath(this.user, filename);

    fs.exists(path, function(ex) {
      if ( ex ) {
        fs.stat(path, function(err, stats) {
          if ( err ) {
            callback(false, err);
          } else {
            if ( !stats.isDirectory() ) {
              var fmime = mime.lookup(path) || null;

              switch ( fmime.split("/").shift() ) {
                case 'image' :
                case 'video' :
                case 'audio' :
                  var exif = require('exif2');

                  exif(path, function(err, obj) {
                    if ( err ) {
                      callback(false, err);
                    } else {
                      if ( obj.directory ) {
                        delete obj.directory;
                      }

                      callback(true, {
                        filename  : _path.basename(filename),
                        path      : _path.dirname(filename),
                        size      : stats.size || 0,
                        mime      : fmime,
                        info      : obj
                      });
                    }
                  });

                break;
                default :
                  callback(true, {
                    filename  : _path.basename(filename),
                    path      : _path.dirname(filename),
                    size      : stats.size || 0,
                    mime      : fmime,
                    info      : null
                  });
                break;
              }

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

  /**
   * @see VFS::ls()
   */
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
                root        : iter.root,
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

  /**
   * VFS::upload() -- Upload a file to a directory
   * @param   Object    ref           HTTP Request File
   * @param   String    path          Destination path
   * @param   Function  callback      Callback function
   * @return  void
   */
  upload : function(ref, path, callback) {
    if ( (typeof ref == 'object') && (typeof path == 'string') && (ref.path) ) {
      var psrc = ref.path;
      var pdest = mkpath(this.user, path + '/' + ref.name);

      fs.exists(pdest, function(ex) {
        if ( ex ) {
          callback(false, "File already exists!");
        } else {
          var is = fs.createReadStream(psrc);
          var os = fs.createWriteStream(pdest);

          util.pump(is, os, function(err) {
            fs.unlinkSync(psrc);

            if ( err ) {
              callback(false, err);
            } else {
              callback(true, true);
            }
          });
        }
      });
    } else {
      callback(false, 'Invalid upload!');
    }
  },

  //
  // Extern
  //

  /**
   * VFS::readurl() -- Read URL contents (GET request)
   * @param   String      args          URL
   * @param   Function    callback      Callback function
   * @return  void
   */
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
  },

  /**
   * VFS::preview() -- Preview file contents
   * @param   String      filename        Filename/path
   * @param   String      mime            MIME Type
   * @param   bool        iframe          Return IFrame type content
   * @param   Function    callback        Callback function
   * @return  void
   */
  preview : function(filename, mime, iframe, callback) {
    var path = mkpath(this.user, filename);
    var split = mime.split(/\//);
    var result = false;
    var max_width = 240, max_height = 240;

    switch ( split[0] ) {
      case 'audio' :
        if ( iframe ) {
          result = sprintf('<audio src="/media%s" width="%d" height="%d"></audio>', filename, max_width, max_height);
        }
      break;

      case 'video' :
        if ( iframe ) {
          result = sprintf('<video src="/media%s" width="%d" height="%d"></video>', filename, max_width, max_height);
        }
      break;

      case 'text' :
        fs.readFile(path, function(err, data) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, sprintf('<pre>%s</pre>', sanitize(data.toString().substr(0, 255)).entityEncode()));
          }
        });
      break;

      case 'image' :
        fs.stat(path, function (err, stat) {
          if ( err ) {
            callback(false, err);
          } else {
            fs.readFile(path, 'binary', function (err, data) {
              if ( err ) {
                callback(false, err);
              } else {
                var im = require('imagemagick');
                im.resize({
                    srcData       : data,
                    width         : max_width,
                    //height        : max_height,
                    format        : 'png',
                    quality       : 0.7,
                    progressive   : false
                }, function (err, stdout, stderr) {
                  if ( err ) {
                    callback(false, err);
                  } else {
                    var data = (new Buffer(stdout, 'binary')).toString('base64');
                    callback(true, sprintf('<img alt="%s" src="data:image/png;base64,%s" width="%d" />', filename, data, max_width));
                  }
                });
              }
            });
          }
        });
      break;

      default :
        result = false;
      break;
    }

    if ( result !== false ) {
      callback(true, result);
    }
  },

  /**
   * VFS::ls_archive() -- List archive contents
   * @param   String      filename        Archive Filename/path
   * @param   bool        iframe          Return IFrame type content
   * @param   Function    callback        Callback function
   * @return  void
   */
  ls_archive : function(filename, callback) {
    var path = mkpath(this.user, filename);
    _archive.ls(path, function(success, result) {
      if ( success ) {
        var response = {};
        var i, iter;

        // FIXME: Types not implemented in archive
        if ( result.files ) {
          for ( i = 0; i < result.files.length; i++ ) {
            iter = result.files[i];
            response[iter.name] = {
              path         : iter.name,
              size         : iter.length || 0,
              mime         : 'application/octet-stream',
              icon         : 'mimetypes/binary.png',
              type         : 'file',
              'protected'  : 0
            };
          }
        }

        callback(true, response);
      } else {
        callback(false, result);
      }
    });
  },

  /**
   * VFS::extract_archive() -- Extract archive contents
   * @param   String      filename        Archive Filename/path
   * @param   String      destination     Destination path
   * @param   bool        iframe          Return IFrame type content
   * @param   Function    callback        Callback function
   * @return  void
   */
  extract_archive : function(filename, destination, callback) {
    var spath = mkpath(this.user, filename);
    var dpath = mkpath(this.user, destination);

    _archive.extract(spath, dpath, function(success, result) {
      if ( success ) {
        callback(true, true);
      } else {
        callback(false, result);
      }
    });
  }

};

/**
 * Read a PDF file info in JSON format
 * @param   Object          user          User
 * @param   String          name          PDF Filename
 * @param   Function        callback      Callback function
 * @return  void
 */
function readPDFInfo(user, name, callback) {
  var filename = mkpath(user, name);
  var cmd = _config.EXTERN_PATHS.exiftool;
  var args = ['-ee', '-j', escapeshell(filename)];

  console.log('readPDFInfo()', cmd, args.join(' '));

  var _cp = require('child_process');
  var stdout = "", stderr = "";
  var child = _cp.spawn(cmd, args);

  /*child.stdout.on('chunk', function (data) {
    if (data !== null) {
      stdout += data;
    }
  });*/
  child.stdout.on('data', function (data) {
    if ( data !== null ) {
      stdout = data.toString();
    }
  });

  child.stderr.on('data', function (data) {
    if (data !== null) {
      stderr += data;
    }
  });

  child.on("exit", function(code) {
    if ( code !== 0 ) {
      console.error('readPDFInfo() child process exited with code ' + code + ': ' + stderr);
      callback(false, stderr);
    } else {
      var info = {};
      var data = JSON.parse(stdout.toString());

      if ( data.length ) {
        data = data[0];
        for ( var i in data ) {
          if ( data.hasOwnProperty(i) ) {
            switch ( i ) {
              case "FileSize":
              case "PDFVersion":
              case "PageCount":
              case "Description":
              case "ModifyDate":
              case "CreateDate":
              case "Title":
              case "Creator":
              case "Producer":
              case "Author":
              case "Subject":
              case "Identifier":
                info[i] = data[i];
              break;

              default:
              break;
            }
          }
        }
      }

      callback(true, info);
    }
  });

}

/**
 * Read a PDF file and convert to SVG
 * @param   Object          user          User
 * @param   String          name          PDF Filename
 * @param   Function        callback      Callback function
 * @return  void
 */
function readPDF(user, name, callback) {
  var split = name.split(':');
  var page  = 0;

  name = split.shift();
  if ( split.length ) {
    page = parseInt(split.shift(), 10);
  }

  readPDFInfo(user, name, function(success, pdfinfo) {
    if ( success ) {
      var filename  = mkpath(user, name);
      var tmpfile   = '/tmp/_pdf2svg_' + _path.basename(name)  + '_' + (new Date()).getTime() + '.svg';
      var cmd       = [_config.EXTERN_PATHS.pdf2svg, escapeshell(filename), escapeshell(tmpfile)];

      if ( page > 0 ) {
        cmd.push(page);
      }

      console.log('readPDF()', cmd.join(' '));

      var _cp = require('child_process');
      var proc = _cp.exec(cmd.join(' '), function(err, stdout, stderr) {
        if ( err !== null ) {
          console.log('readPDF() child process exited with code ' + err);
          callback(false, stderr);
        } else {
          fs.readFile(tmpfile, function(err, pdfdata) {
            if ( err ) {
              console.error("readPDF readFile()", err);
              callback(false, err);
            } else {
              fs.unlink(tmpfile, function(err) {
                if ( err ) {
                  console.error("readPDF unlink()", err);
                }

                callback(true, {
                  'info'      : pdfinfo,
                  'document'  : pdfdata.toString()
                });
              });
            }
          });
        }
      });
    } else {
      callback(false, pdfinfo);
    }
  });
}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  /**
   * @see mkpath
   */
  mkpath            : mkpath,

  /**
   * @see fs.removeRecursive
   */
  removeRecursive   : fs.removeRecursive,

  /**
   * vfs::call() -- Call a VFS method by name
   * @param   Object      user          User
   * @param   String      method        Method to call
   * @param   Mixed       args          Argument(s)
   * @param   Function    callback      Callback function {result, data|error}
   * @return  void
   */
  call    : function(user, method, args, callback) {
    console.log('VFS', method, user.username);

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

      case 'rmdir'    :
        v.rmdir(args, callback);
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

      case 'upload' :
        v.upload(args.file, args.path, callback);
      break;

      case 'preview' :
        v.preview(args.path, args.mime, args.iframe === true || args.iframe === 'true', callback);
      break;

      case 'readpdf' :
        readPDF(user, args, callback);
      break;

      case 'ls_archive' :
        v.ls_archive(args, callback);
      break;

      case 'extract_archive' :
        v.extract_archive(args.archive, args.destination, callback);
      break;

      default :
        return false;
      break;
    }

    return true;
  }

};

