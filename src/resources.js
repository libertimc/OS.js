/*!
 * @file
 * OS.js - JavaScript Operating System - resources
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
// CONFIGS
///////////////////////////////////////////////////////////////////////////////

var _defaults = {
    sounds : [
      // Extension applied in frontend
      "bell", "complete", "message", "service-login", "service-logout", "dialog-information", "dialog-warning"
    ],
    images : [
      "/img/theme.default/close.png",
      "/img/theme.default/close_unfocused.png",
      "/img/theme.default/maximize.png",
      "/img/theme.default/maximize_unfocused.png",
      "/img/theme.default/menu_expand.png",
      "/img/theme.default/menu_expand_hover.png",
      "/img/theme.default/minimize.png",
      "/img/theme.default/minimize_unfocused.png",
      "/img/theme.default/prelight.png",
      "/img/theme.default/prelight_unfocused.png",
      "/img/theme.default/pressed.png"
      /*
      "categories/applications-development.png", "categories/applications-games.png", "categories/applications-graphics.png", "categories/applications-office.png", "categories/applications-internet.png", "categories/applications-multimedia.png", "categories/applications-system.png", "categories/applications-utilities.png", "categories/gnome-other.png",
      "actions/window_fullscreen.png", "actions/zoom-original.png", "actions/window_nofullscreen.png", "actions/window-close.png",
      "actions/gtk-execute.png", "mimetypes/exec.png", "devices/network-wireless.png", "status/computer-fail.png","apps/system-software-install.png", "apps/system-software-update.png", "apps/xfwm4.png", "places/desktop.png",
      "status/gtk-dialog-error.png", "status/gtk-dialog-info.png", "status/gtk-dialog-question.png", "status/gtk-dialog-warning.png",
      "status/error.png", "emblems/emblem-unreadable.png"*/
    ],
    resources : [
      // Other core resources
    ]
};

var _dialogResources = {
  "ColorOperationDialog" : {
    "resources" : ["dialog.color.js"]
  },
  "FontOperationDialog" : {
    "resources" : ["dialog.font.js"]
  },
  "CopyOperationDialog" : {
    "resources" : ["dialog.copy.js"]
  },
  "FileOperationDialog" : {
    "resources" : ["dialog.file.js"]
  },
  "InputOperationDialog" : {
    "resources" : ["dialog.input.js"]
  },
  "LaunchOperationDialog" : {
    "resources" : ["dialog.launch.js"]
  },
  "PanelItemOperationDialog" : {
    "resources" : ["dialog.panelitem.js"]
  },
  "PanelPreferencesOperationDialog" : {
    "resources" : ["dialog.panel.js"]
  },
  "PanelAddItemOperationDialog" : {
    "resources" : ["dialog.panel.additem.js"]
  },
  "RenameOperationDialog" : {
    "resources" : ["dialog.rename.js"]
  },
  "UploadOperationDialog" : {
    "resources" : ["dialog.upload.js"]
  },
  "FilePropertyOperationDialog" : {
    "resources" : ["dialog.properties.js"]
  },
  "CompabilityDialog" : {
    "resources" : ["dialog.compability.js"]
  },
  "CrashDialog" : {
    "resources" : ["dialog.crash.js"]
  }
};

var _vendorResources = [
  {"script" : 'sprintf.js'},
  {"script" : 'jquery.js'},
  {"script" : 'jquery-ui.js'},
  {"style"  : 'jquery-ui-theme.css'}
];

var _coreResources = [
  'dialogs.css',
  'glade.css',
  'iframe.css',
  'login.css',
  'main.css',
  'theme.dark.css',
  'theme.default.css',
  'theme.light.css',
  'theme.none.css',
  'classes.js',
  'core.js',
  'iframe.js',
  'init.js',
  'login.js',
  'utils.js'
];

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{

  vendorDependencies  : _vendorResources,
  dialogResources     : _dialogResources,
  coreResources       : _coreResources,

  /**
   * preload::getPreloadFiles() -- Get preload resource list
   * @return  Objet
   */
  getPreloadFiles : function() {
    var preloads = _defaults;

    for ( var pn in _dialogResources ) {
      if ( _dialogResources.hasOwnProperty(pn) ) {
        var iter = _dialogResources[pn];
        for ( var i = 0; i < iter.resources.length; i++ ) {
          preloads.resources.push(iter.resources[i]);
        }
      }
    }

    return preloads;
  }
};

