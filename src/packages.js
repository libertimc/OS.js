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
    xml2js    = require('xml2js');

var config = require('../config.js');

///////////////////////////////////////////////////////////////////////////////
// HELPERS
///////////////////////////////////////////////////////////////////////////////

/**
 * parseList() -- Parse a package.xml list
 * @param   String      language    Current language
 * @param   Object      result      The xml2js parsed data
 * @param   Function    callback    Callback function
 * @return  void
 */
function parseList(language, result, callback) {
  var packages = {};

  if ( result && result.packages && result.packages['package'] ) {
    var items = result.packages['package'];
    var p, i = 0, l = items.length, iter, prop;
    var pname, ptype, pinfo, psys, enabled;

    for ( i; i < l; i++ ) {
      iter          = items[i];
      pname         = iter['$'].packagename;
      ptype         = iter['$'].type;
      psys          = false;
      enabled       = true;

      pinfo         = {
        type        : ptype,
        packagename : pname,
        name        : iter['$'].name,
        title       : ptype,
        titles      : {},
        icon        : 'emblems/emblem-unreadable.png',
        resources   : iter.resource
      };

      for ( p = 0; p < iter.property.length; p++) {
        prop = iter.property[p];

        if ( prop['$'].name == 'title' ) {
          if ( prop['$'].language ) {
            pinfo.titles[prop['$'].language] = prop['_'];
          } else {
            pinfo.titles[language] = prop['_'];
            pinfo.title = pinfo.titles[language];
          }
        } else if ( prop['$'].name == 'description' ) {
          if ( !pinfo.descriptions ) pinfo.descriptions = {};

          if ( prop['$'].language ) {
            pinfo.descriptions[prop['$'].language] = prop['_'];
          } else {
            pinfo.descriptions[language] = prop['_'];
            pinfo.description = pinfo.descriptions[language];
          }
        } else if ( prop['$'].name == 'icon' ) {
          pinfo.icon = prop['_'];
        } else if ( prop['$'].name == 'system' ) {
          if ( prop['_'] === true || prop['_'] === "true" ) {
            psys = true;
          }
        } else if ( prop['$'].name == 'enabled' ) {
          if ( prop['_'] === false || prop['_'] === "false" ) {
            enabled = false;
          }
        }
      }

      if ( !enabled ) continue;

      if ( !pinfo.titles[language] ) {
        pinfo.titles[language] = pinfo.title || pname;
      }
      if ( pinfo.descriptions && !pinfo.descriptions[language] && pinfo.description ) {
        pinfo.descriptions[language] = pinfo.description;
      }


      switch ( ptype ) {
        case 'Service'            :
        case 'BackgroundService'  :
        case 'PanelItem'          :
          pinfo.description  = pinfo.description || pinfo.title || pname;
          pinfo.descriptions = pinfo.descriptions || {};
        break;

        case 'Application'        :
        default                   :
          pinfo.schema      = iter['$'].schema || null;
          pinfo.category    = psys ? "system" : (iter['$'].category || "unknown");
          pinfo.mimes       = iter.mime;
        break;
      }

      packages[pname] = pinfo;
    }
  }

  callback(true, packages);
}

/**
 * _GetPackages() -- Abstract for reading xml package file
 */
function _GetPackages(language, filename, callback) {
  var parser = new xml2js.Parser();

  fs.readFile(filename, function(err, data) {
    if ( err ) {
      callback(false, err);
    } else {
      parser.parseString(data, function (err, result) {
        if ( err ) {
          callback(false, err);
        } else {
          parseList(language, result, callback);
        }
      });
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

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
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
   * @param   Object    archive   Package archive
   * @param   Function  callback  Callback function
   * @return  void
   */
  installPackage : function(archive, callback) {
    callback(false, "TODO");
  },

  /**
   * packages::uninstallPackage() -- Uninstall a User package
   * @param   Object    pkg       Package info
   * @param   Function  callback  Callback function
   * @return  void
   */
  uninstallPackage : function(pkg, callback) {
    callback(false, "TODO");
  }
};

