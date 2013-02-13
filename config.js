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
  /////////////////////////////////////////////////////////////////////////////
  // Project
  /////////////////////////////////////////////////////////////////////////////

  PROJECT_VERSION         : '1.0.1-rc1',
  PROJECT_CODENAME        : 'NodeElk',

  /////////////////////////////////////////////////////////////////////////////
  // Host and Environment
  /////////////////////////////////////////////////////////////////////////////

  // Node.js

  SERVER_PORT             : 3000,
  CLIENT_PORT_START       : 3010,

  // Users

  AUTHENTICATION          : 'pam',            // Loads up `auth_<name>.js`
                                              // 'pam'   PAM (default)
                                              // 'dummy' Simple dict

  // Env

  ENV_SETUP               : 'development',    // `development`, `production`, `demo`
  ENV_WEBSOCKETS          : false,            // TODO: Use with sockets ?
  ENV_LOCALHOST           : false,            // TODO: Use file:// ?

  // Resources

  COMPRESSOR              : 'yui',            // Compression library
                                              // 'gcc' Google closure compiler
                                              // 'yui' Yahoo Compressor

  // Frontend

  SETTINGS_REVISION       : 2,                // Used in frontend
  BUGREPORT_ENABLE        : false,            // TODO: Reporting not yet avail

  // Locale

  DEFAULT_LANGUAGE        : 'en_US',
  ENABLED_LOCALES         : [
    'nb_NO',
    'en_US'
  ],

  /////////////////////////////////////////////////////////////////////////////
  // Paths
  /////////////////////////////////////////////////////////////////////////////

  PATH                    : __dirname,
  PATH_VENDOR             : __dirname + '/vendor',
  PATH_BIN                : __dirname + '/bin',
  PATH_DOC                : __dirname + '/doc',
  PATH_LIB                : __dirname + '/lib',
  PATH_SRC                : __dirname + '/src',
  PATH_LOCALE             : __dirname + '/src/locale',
  PATH_JAVASCRIPT         : __dirname + '/src/javascript',
  PATH_JSLOCALE           : __dirname + '/src/javascript/locale',
  PATH_TEMPLATES          : __dirname + '/src/templates',
  PATH_PACKAGES           : __dirname + '/vendor/packages',
  PATH_PUBLIC             : __dirname + '/public_html',
  PATH_MEDIA              : __dirname + '/public_html/media',

  // URIs

  URI_FONT                : '/media/System/Fonts',
  URI_SOUND               : '/media/Shared/Sounds',
  URI_ICON                : '/media/Shared/Icons',

  /////////////////////////////////////////////////////////////////////////////
  // Build, Cache and Compression
  /////////////////////////////////////////////////////////////////////////////

  MINIMIZE_CACHE          : __dirname + '/.build/minimize.cache',
  FONT_CACHE              : __dirname + '/.build/fontcache.json',
  COMPRESSION_CACHE       : __dirname + '/.build/compression.json',
  PACKAGE_BUILD           : __dirname + '/.build/packages.json',

  METADATA_FILENAME       : 'metadata.json',
  COMPRESS_DIRNAME        : '.compress',

  /////////////////////////////////////////////////////////////////////////////
  // VFS
  /////////////////////////////////////////////////////////////////////////////

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
  PATH_VFS_LOCK           : '/home/%s/.osjs/.lock',
  PATH_VFS_SESSION_LOCK   : '/home/%s/.osjs/.session',

  VFS_TEMPLATE            : __dirname + '/src/templates/vfs-user',
  VFS_MKDIR_PERM          : '0755',


  /////////////////////////////////////////////////////////////////////////////
  // Externs
  /////////////////////////////////////////////////////////////////////////////

  EXTERN_PATHS            : {
    pdf2svg   : '/usr/bin/pdf2svg',
    exiftool  : '/usr/bin/exiftool'
  }

};

