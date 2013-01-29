/*!
 * @file
 * OS.js - JavaScript Operating System - default settings
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
var _defaults = {
  //
  // Window Manager
  //
  "wm.effects.enable" : {
    "type"      : "bool",
    "value"     : true
  },

  //
  // Desktop
  //

  "desktop.wallpaper.path" : { // CoreSettings
    "type"  : "filename",
    "value" : ""
  },
  "desktop.wallpaper.type" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },
  "desktop.background.color" :  { // CoreSettings
    "type"  : "string",
    "value" : ""
  },
  "desktop.theme" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },
  "desktop.font" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },
  "desktop.icon.theme" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },
  "desktop.cursor.theme" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },

  "desktop.panels" : { // CoreSettings
    "type" : "list",
    "items" : []
  },

  "desktop.grid" : { // CoreSettings
    "type" : "list",
    "items" : []
  },

  //
  // System
  //

  // System locale registry
  "system.locale.location" : {
    "type" : "array",
    "options" : [], // Later in Core::getSettings(}
    "value" : "UTC"
  },
  "system.locale.date-format" : {
    "type" : "string",
    "value" : "%d-%m-%Y"
  },
  "system.locale.time-format" : {
    "type" : "string",
    "value" : "%H:%i:%s"
  },
  "system.locale.timestamp-format" : {
    "type" : "string",
    "value" : "%d-%m-%Y %H:%i"
  },
  "system.locale.language" : {
    "type" : "string",
    "value" : "default"
  },

  // Sounds
  "system.sounds.enable" : {
    "type" : "bool",
    "value" : true
  },
  "system.sounds.volume" : {
    "type" : "integer",
    "value" : 100
  },
  "system.sounds.theme" : { // CoreSettings
    "type"    : "array",
    "options" : [],
    "value"   : ""
  },

  // Package managment
  /*
  "system.pm.repositories" : {
    "type" : "list",
    "items" : {"localhost"}
  },
  "system.pm.updates.enable" : {
    "type" : "bool",
    "value" : true
  },
  "system.pm.updates.interval" : {
    "type" : "integer",
    "value" : 1209600
  },
   */

  //
  // USER
  //

  "user.env.path" : {
    // Package paths
    "type"    : "list",
    "items"   : ["/System/Packages", "/User/Packages"]
  },

  "user.env.home" : {
    // Home directory
    "type"    : "string",
    "value"   : "/User/Documents"
  },

  "user.session.confirm" : {
    // Confirm log-out action (display dialog}
    "type" : "bool",
    "value" : true
  },

  "user.session.autorestore" : {
    // Restore last session upon boot
    "type"  : "bool",
    "value" : true
  },

  "user.session.autosave" : {
    // Store last session on shutdown (see user.session.confirm}
    "type"  : "bool",
    "value" : true
  },

  "user.session.appmime" : {
    // Stored default launch application for specific mime type
    "type"  : "list",
    "items" : []
  },

  "user.session.appstorage" : {
    // Stored package settings/cache etc.
    "type"  : "list",
    "items" : []
  },

  "user.first-run" : {
    // Is user new or using a newly updated registry ?
    "type" : "bool",
    "value" : true
  },

  "user.autorun" : {
    // Run these processes on startup
    "type" : "list",
    "items" : []
  }
};

module.exports =
{
  getDefaultSettings : function(registry) {
    var settings = _defaults;

    for ( var x in registry ) {
      if ( registry.hasOwnProperty(x) ) {
        if ( settings[x] ) {

          for ( var y in registry[x] ) {
            if ( registry[x].hasOwnProperty(y) ) {
              if ( settings[x].hasOwnProperty(y) ) {
                settings[x][y] = registry[x][y];
              }
            }
          }

        }
      }
    }

    return settings;
  },

  defaults : _defaults
};

