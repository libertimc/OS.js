/*!
 * @file
 * OS.js - JavaScript Operating System - package managment
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

///////////////////////////////////////////////////////////////////////////////
// IMPORTS
///////////////////////////////////////////////////////////////////////////////

var fs        = require('fs'),
    sprintf   = require('sprintf').sprintf,
    _path     = require('path');

var config  = require('../config.js'),
    archive = require(config.PATH_SRC + '/archive.js');

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

/**
 * validateMetadata() -- Validate a package.json
 * @param   String      filename    Filename to validate
 * @param   Function    callback    Callback function
 * @return  void
 */
function validateMetadata(filename, callback) {
  var root   = _path.dirname(filename);

  var _validate = function(jsn) {
    var valid = true;
    var check = [];
    // TODO
    callback(valid, valid || 'Validation failed!');
  };

  fs.readFile(filename, function(err, data) {
    if ( err ) {
      callback(false, err);
    } else {
      _validate(JSON.parse(data.toString()));
    }
  });
}

/**
 * _GetPackages() -- Abstract for reading JSON package file
 */
function _GetPackages(language, filename, callback) {
  fs.readFile(filename, function(err, data) {
    if ( err ) {
      callback(false, err);
    } else {
      var packages = {}; // result
      var pkgs = JSON.parse(data.toString());
      var list = {};

      var i = 0, l = pkgs.length, iter, pinfo;
      for ( i; i < l; i++ ) {
        iter = pkgs[i];

        iter.title = iter.title || {};
        if ( !iter.title[language] )
          iter.title[language] = iter.name;

        iter.description = iter.description || {};
        if ( !iter.description[language] )
          iter.description[language] = iter.name;

        pinfo = {
          type          : iter.type,
          name          : iter.name,
          title         : iter.title[language],
          titles        : iter.title,
          icon          : iter.icon,
          resources     : iter.resource || []
        };

        if ( iter.type == 'Application' ) {
          pinfo.schema    = iter.schema || null;
          pinfo.category  = iter.category || 'unknown';
          pinfo.mimes     = iter.mime || [];
        } else {
          pinfo.description = iter.description[language];
          pinfo.descriptions = iter.description;
        }

        packages[iter.packagename] = pinfo; // packagename is from _UpdatePackageMetadata()
      }

      callback(true, packages);
    }
  });
}

/**
 * getSystemPackages() -- Get installed system packages
 * @param   String    language      Current language
 * @param   Function  callback      Callback function
 * @return  void
 */
function getSystemPackages(language, callback) {
  var filename = config.PACKAGE_BUILD;
  _GetPackages(language, filename, callback);
}

/**
 * getUserPackages() -- Get installed user packages
 * @param   String    language      Current language
 * @param   Function  callback      Callback function
 * @return  void
 */
function getUserPackages(username, language, callback) {
  var filename = sprintf(config.PATH_VFS_PACKAGEMETA, username);
  _GetPackages(language, filename, callback);
}

/**
 * _UpdatePackageMeta() -- Abstract for updating JSON package file
 */
function _UpdatePackageMeta(outfile, readdir, callback) {
  var doc = [];

  fs.readdir(readdir, function(err, files) {
    if ( err ) {
      callback(false, err);
    } else {
      var queue = files;
      var installed = 0;

      var __finished = function() {
        fs.writeFile(outfile, JSON.stringify(doc), function(err) {
          if ( err ) {
            callback(false, err);
          } else {
            callback(true, 'Pulled ' + installed + ' packages');
          }
        });
      };

      var __next = function() {
        if ( queue.length ) {
          var iter  = queue.pop();
          var ipath = _path.join(readdir, iter);
          var mpath = _path.join(ipath, config.METADATA_FILENAME);

          fs.stat(mpath, function(err, stats) {
            if ( !err ) {
              if ( !stats.isDirectory() ) {
                fs.readFile(mpath, function(err, data) {
                  if ( err ) {
                    callback(false, err);
                  } else {
                    console.log('>', mpath);
                    var pdoc = JSON.parse(data.toString());
                    if ( typeof pdoc == 'object' ) {
                      pdoc.packagename = iter;

                      if ( pdoc.enabled === true ) {
                        console.log('... installing');
                        doc.push(pdoc);
                        installed++;
                      }
                    }
                  }

                  __next();
                });
              }
              return;
            }
            __next();
          });
        } else {
          __finished();
        }
      };

      __next();
    }
  });
}

/**
 * updateUserPackageMetadata() -- Create/Update a user package.json list
 * @param   Object      user        User
 * @param   Function    callback    Callback function
 * @return  void
 */
function updateUserPackageMetadata(user, callback) {
  var outfile   = sprintf(config.PATH_VFS_PACKAGEMETA, user.username);
  var readdir   = sprintf(config.PATH_VFS_PACKAGES, user.username);
  _UpdatePackageMeta(outfile, readdir, callback);
}

/**
 * updateSystemPackageMetadata() -- Create/Update a system package.json list
 * @param   Function    callback    Callback function
 * @return  void
 */
function updateSystemPackageMetadata(callback) {
  var outfile   = config.PACKAGE_BUILD;
  var readdir   = config.PATH_PACKAGES;
  _UpdatePackageMeta(outfile, readdir, callback);
}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  /**
   * packages::createPackageMeta() -- Create package metafile(s)
   * @see     updateUserPackageMetadata()
   * @see     updateSystemPackageMetadata()
   * @return  void
   */
  createPackageMetadata : function(user, callback) {
    if ( (typeof user === 'object') && (user !== null) ) {
      updateUserPackageMetadata(user, callback);
    } else {
      updateSystemPackageMetadata(callback);
    }
  },

  /**
   * packages::getInstalledSystemPackages() -- Get installed system packages
   * @param   String    language    Current language
   * @param   Function  callback    Callback function
   * @return  void
   */
  getInstalledSystemPackages : function(language, callback) {
    var _finished = function(packages) {
      callback(true, packages);
    };
    var _failed = function(msg) {
      callback(false, msg);
    };

    getSystemPackages(language, function(success, result) {
      if ( success ) {
        _finished(result);
      } else {
        _failed(result);
      }
    });
  },

  /**
   * packages::getInstalledUserPackages() -- Get installed user packages
   * @param   String    username    Username
   * @param   String    language    Current language
   * @param   Function  callback    Callback function
   * @return  void
   */
  getInstalledUserPackages : function(username, language, callback) {
    var _finished = function(packages) {
      callback(true, packages);
    };
    var _failed = function(msg) {
      callback(false, msg);
    };

    getUserPackages(username, language, function(success, result) {
      if ( success ) {
        _finished(result);
      } else {
        _failed(result);
      }
    });
  },

  /**
   * packages::getInstalledPackages() -- Get installed packages
   * @param   Object    user        User reference
   * @param   Function  callback    Callback function
   * @return  void
   */
  getInstalledPackages : function(user, callback) {
    var _finished = function(sys, usr) {
       callback(true, {
        System : sys || [],
        User   : usr || []
       });
    };

    var _failed = function(msg) {
      callback(false, msg);
    };

    getUserPackages(user.username, user.language, function(success, user_result) {
      user_result = success ? (user_result || []) : [];

      getSystemPackages(user.language, function(success, system_result) {
        if ( success ) {
          _finished(system_result, user_result);
        } else {
          _failed(system_result);
        }
      });
    });
  },

  /**
   * packages::installPackage() -- Install a User package
   *
   * TODO Check for collisions
   *
   * @param   Object    user            User
   * @param   Object    archive_path    Package archive file
   * @param   Function  fcallback       Callback function
   * @return  void
   */
  installPackage : function(user, archive_path, fcallback) {
    var _vfs = require(config.PATH_SRC + '/vfs.js');
    archive_path = _vfs.mkpath(user, archive_path);

    var archive_filename  = _path.basename(archive_path);
    var destination       = _path.join(sprintf(config.PATH_VFS_PACKAGES, user.username), archive_filename.split('.').shift());
    var metadata          = _path.join(destination, config.METADATA_FILENAME);

    var callback = function(success, result) {
      /* FIXME: Cleanup
      if ( !success ) {
        return;
      }
      */
      fcallback(success, result);
    };

    fs.stat(destination, function(err, stat) {
      if ( !err && stat ) {
        callback(false, 'Installation directory already exist!');
        return;
      }

      fs.mkdir(destination, function installPackageMkdir(err) {
        if ( err ) {
          callback(false, err);
        } else {
          fs.stat(archive_path, function installPackageCheck(err, stat) {
            if ( err ) {
              callback(false, err);
            } else {
              try {
                archive.extract(archive_path, destination, function installPackageArchive(success, result, errors) {
                  if ( success ) {
                    validateMetadata(metadata, function installPackageValidate(validated, validate_result) {
                      if ( validated ) {
                        updateUserPackageMetadata(user, function installPackagePost(updated, message) {
                          callback(updated, message);
                        });
                      } else {
                        callback(false, validate_result);
                      }
                    });
                  } else {
                    callback(false, result || errors.join(',') );
                  }
                });
              } catch ( err ) {
                callback(false, err);
              }
            }
          });
        }
      });

    });

  },

  /**
   * packages::uninstallPackage() -- Uninstall a User package
   * @param   Object    user      User
   * @param   Object    pkg       Package info
   * @param   Function  callback  Callback function
   * @return  void
   */
  uninstallPackage : function(user, pkg, callback) {
    if ( pkg && pkg.name ) {
      var destination = _path.join(sprintf(config.PATH_VFS_PACKAGES, user.username), pkg.name);
      fs.exists(destination, function uninstallPackageCheck(ex) {
        if ( ex ) {
          var _vfs = require(config.PATH_SRC + '/vfs.js');

          _vfs.removeRecursive(destination, function uninstallPackageCleanup(err) {
            if ( err ) {
              callback(false, err);
            } else {
              updateUserPackageMetadata(user, function uninstallPackagePost(updated, message) {
                callback(updated, updated ? pkg : message);
              });
            }
          });
        } else {
          callback(false, 'Could not find package install directory!');
        }
      });
      return;
    }

    callback(false, 'Invalid package requested!');
  }
};

