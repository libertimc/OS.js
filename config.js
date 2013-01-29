
/*!
 * @file
 * config.js
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license LICENSE
 * @created 2013-01-27
 */

var path = require('path');

module.exports =
{
  //
  // Host
  //
  WEBSERVER_PORT      : 3000,
  WEBSOCKET_PORT      : -1,

  HOST_FRONTEND       : 'localhost:3000',
  HOST_STATIC         : 'localhost:3000',

  //
  // Frontend Settings
  //
  SETTINGS_REVISION   : 2,
  DEFAULT_LANGUAGE    : "en_US",
  AUTOLOGIN_ENABLE    : true,
  AUTOLOGIN_UID       : 1,

  //
  // Project
  //
  PROJECT_VERSION     : "0.9",
  PROJECT_CODENAME    : "Catwalk",
  PROJECT_COPYRIGHT   : "Copyright 2012 Anders Evenrud",
  PROJECT_AUTHOR      : "Anders Evenrud <andersevenrud@gmail.com>",

  GA_ENABLE           : false,
  GA_ACCOUNT_ID       : "",

  //
  // Environment
  //
  BUGREPORT_ENABLE    : false,
  ENV_PRODUCTION      : false,
  ENV_DEMO            : false,
  ENV_PLATFORM        : false,
  ENV_SSL             : false,
  ENABLE_CACHE        : false,

  SETTINGS_CONFIG     : path.join(__dirname, "config.js"),
  MINIMIZE_CACHE      : path.join(__dirname, "src/build/minimize.cache"),
  FONT_CACHE          : path.join(__dirname, "src/build/fontcache.xml"),
  PACKAGE_BUILD       : path.join(__dirname, "src/build/packages.xml"),
  PACKAGE_USER_BUILD  : path.join(__dirname, "VFS/%d/packages.xml"),
  MIME_MAGIC          : path.join(__dirname, "vendor/mime.mgc"),
  VFS_TEMPLATE        : path.join(__dirname, "src/templates/vfs-user"),

  //
  // Paths
  //
  PATH_LIB            : path.join(__dirname, 'lib'),
  PATH_SRC            : path.join(__dirname, 'src'),
  PATH_LOCALE         : path.join(__dirname, 'src/locale'),
  PATH_JAVASCRIPT     : path.join(__dirname, 'src/javascript'),
  PATH_JSLOCALE       : path.join(__dirname, 'src/javascript/locale'),
  PATH_TEMPLATES      : path.join(__dirname, 'src/templates'),
  PATH_PACKAGES       : path.join(__dirname, 'src/packages'),
  PATH_PUBLIC         : path.join(__dirname, 'public_html'),
  PATH_VENDOR         : path.join(__dirname, 'vendor'),
  PATH_MEDIA          : path.join(__dirname, 'public_html/media'),
  PATH_LOGS           : path.join(__dirname, 'logs'),
  PATH_BIN            : path.join(__dirname, 'bin'),
  PATH_DOC            : path.join(__dirname, 'doc'),
  PATH_VFS            : path.join(__dirname, 'VFS'),

  URI_FONT            : '/media/System/Fonts'
};

