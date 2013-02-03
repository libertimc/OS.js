/*!
 * @file
 * OS.js - JavaScript Operating System - main configuration
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

var path = require('path');

module.exports =
{
  //
  // Host
  //
  WEBSERVER_PORT      : 3000,
  CLIENT_PORT_START   : 3010,
  WEBSOCKET_PORT      : -1,

  //
  // Frontend Settings
  //
  SETTINGS_REVISION   : 2,
  DEFAULT_LANGUAGE    : "en_US",
  AUTOLOGIN_ENABLE    : false,
  AUTOLOGIN_USERNAME  : "test",
  AUTOLOGIN_PASSWORD  : "test",
  COMPRESSOR          : "yui", // "gcc"

  //
  // Project
  //
  PROJECT_VERSION     : "1.0.1-rc1",
  PROJECT_CODENAME    : "NodeElk",
  PROJECT_COPYRIGHT   : "Copyright 2013 Anders Evenrud",
  PROJECT_AUTHOR      : "Anders Evenrud <andersevenrud@gmail.com>",

  //
  // Environment
  //
  BUGREPORT_ENABLE    : false,
  ENV_SETUP           : 'development',
  ENV_STANDALONE      : false,

  SETTINGS_CONFIG     : path.join(__dirname, "config.js"),
  MINIMIZE_CACHE      : path.join(__dirname, ".build/minimize.cache"),
  FONT_CACHE          : path.join(__dirname, ".build/fontcache.xml"),
  PACKAGE_BUILD       : path.join(__dirname, ".build/packages.json"),
  MIME_MAGIC          : path.join(__dirname, ".build/mime.mgc"),
  METADATA_FILENAME   : 'metadata.json',

  //
  // Paths
  //
  PATH                : __dirname,
  PATH_VENDOR         : path.join(__dirname, 'vendor'),
  PATH_LIB            : path.join(__dirname, 'lib'),
  PATH_LOGS           : path.join(__dirname, 'logs'),
  PATH_BIN            : path.join(__dirname, 'bin'),
  PATH_DOC            : path.join(__dirname, 'doc'),
  PATH_SRC            : path.join(__dirname, 'src'),
  PATH_LOCALE         : path.join(__dirname, 'src/locale'),
  PATH_JAVASCRIPT     : path.join(__dirname, 'src/javascript'),
  PATH_JSLOCALE       : path.join(__dirname, 'src/javascript/locale'),
  PATH_TEMPLATES      : path.join(__dirname, 'src/templates'),
  PATH_PACKAGES       : path.join(__dirname, 'vendor/packages'),
  PATH_PUBLIC         : path.join(__dirname, 'public_html'),
  PATH_MEDIA          : path.join(__dirname, 'public_html/media'),

  //
  // URIs
  //
  URI_FONT              : '/media/System/Fonts',
  COMPRESS_DIRNAME      : '.compress',

  //
  // VFS
  //
  PATH_VFS                : '/home',
  PATH_VFS_USER           : '/home/%s',
  PATH_VFS_SNAPSHOTS      : '/home/%s/.osjs/snapshots',
  PATH_VFS_PACKAGES       : '/home/%s/.osjs/packages',
  PATH_VFS_PACKAGEMETA    : '/home/%s/.osjs/packages.json',
  PATH_VFS_LAST_REGISTRY  : '/home/%s/.osjs/last-registry.json',
  PATH_VFS_LAST_SESSION   : '/home/%s/.osjs/last-session.json',
  PATH_VFS_USERMETA       : '/home/%s/.osjs/user.json',
  PATH_VFS_TEMP           : '/home/%s/.osjs/tmp',
  PATH_VFS_LOCK           : '/home/%s/.osjs/lock',

  VFS_TEMPLATE            : path.join(__dirname, "src/templates/vfs-user"),
  VFS_MKDIR_PERM          : '0777'

};

