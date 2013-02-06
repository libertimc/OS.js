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

module.exports =
{
  //
  // Host
  //
  SERVER_PORT         : 3000,
  CLIENT_PORT_START   : 3010,

  //
  // Frontend Settings
  //
  SETTINGS_REVISION   : 2,
  DEFAULT_LANGUAGE    : 'en_US',
  AUTOLOGIN_ENABLE    : false,
  AUTOLOGIN_USERNAME  : 'test',
  AUTOLOGIN_PASSWORD  : 'test',
  COMPRESSOR          : 'yui', // 'gcc'

  //
  // Project
  //
  PROJECT_VERSION     : '1.0.1-rc1',
  PROJECT_CODENAME    : 'NodeElk',
  PROJECT_COPYRIGHT   : 'Copyright 2013 Anders Evenrud',
  PROJECT_AUTHOR      : 'Anders Evenrud <andersevenrud@gmail.com>',

  //
  // Environment
  //
  BUGREPORT_ENABLE    : false,
  ENV_SETUP           : 'development',
  ENV_STANDALONE      : false,
  ENV_CACHE           : false, // TODO

  //
  // Paths
  //
  PATH                : __dirname,
  PATH_VENDOR         : __dirname + '/vendor',
  PATH_LIB            : __dirname + '/lib',
  PATH_LOGS           : __dirname + '/logs',
  PATH_BIN            : __dirname + '/bin',
  PATH_DOC            : __dirname + '/doc',
  PATH_SRC            : __dirname + '/src',
  PATH_LOCALE         : __dirname + '/src/locale',
  PATH_JAVASCRIPT     : __dirname + '/src/javascript',
  PATH_JSLOCALE       : __dirname + '/src/javascript/locale',
  PATH_TEMPLATES      : __dirname + '/src/templates',
  PATH_PACKAGES       : __dirname + '/vendor/packages',
  PATH_PUBLIC         : __dirname + '/public_html',
  PATH_MEDIA          : __dirname + '/public_html/media',

  //
  // URIs
  //
  URI_FONT                : '/media/System/Fonts',

  //
  // Files
  //
  COMPRESS_DIRNAME        : '.compress',
  SETTINGS_CONFIG         : __dirname + '/config.js',
  MINIMIZE_CACHE          : __dirname + '/.build/minimize.cache',
  FONT_CACHE              : __dirname + '/.build/fontcache.json',
  COMPRESSION_CACHE       : __dirname + '/.build/compression.json',
  PACKAGE_BUILD           : __dirname + '/.build/packages.json',
  MIME_MAGIC              : __dirname + '/.build/mime.mgc',
  METADATA_FILENAME       : 'metadata.json',

  //
  // VFS
  //
  PATH_VFS                : '/home',
  PATH_VFS_USER           : '/home/%s',
  PATH_VFS_USER_DOT       : '/home/%s/.osjs',
  PATH_VFS_SNAPSHOTS      : '/home/%s/.osjs/snapshots',
  PATH_VFS_PACKAGES       : '/home/%s/.osjs/packages',
  PATH_VFS_PACKAGEMETA    : '/home/%s/.osjs/packages.json',
  PATH_VFS_LAST_REGISTRY  : '/home/%s/.osjs/last-registry.json',
  PATH_VFS_LAST_SESSION   : '/home/%s/.osjs/last-session.json',
  PATH_VFS_USERMETA       : '/home/%s/.osjs/user.json',
  PATH_VFS_TEMP           : '/home/%s/.osjs/tmp',
  PATH_VFS_LOCK           : '/home/%s/.osjs/lock',

  VFS_TEMPLATE            : __dirname + '/src/templates/vfs-user',
  VFS_MKDIR_PERM          : '0777',


  //
  // EXTERN
  //
  EXTERN_PATHS            : {
    pdf2svg   : '/usr/bin/pdf2svg',
    exiftool  : '/usr/bin/exiftool'
  }
};

