/*!
 * @file
 * OS.js - JavaScript Operating System - Web Server
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

// Internal
var _config    = require('./config.js'),
    _client    = require(_config.PATH_SRC + '/client_web.js');

// External
var fs         = require('fs');

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

(function() {
  var f = (_config.PATH_SRC + '/auth_' + _config.AUTHENTICATION + '.js');
  try {
    fs.statSync(f);
    console.info('>>> Loaded authentication module:', f);
  } catch ( err ) {
    console.error('Failed to load authentication module:', f);
    console.error(err);
    process.exit(1);
  }
})();

// FIXME: Temporary replacement for 'server-sys.js'
var __x11 = false;
if ( process.argv && process.argv.length > 2 ) {
  if ( process.argv[2] == "x11" ) {
    __x11 = true;
  }
}

process.on('uncaughtException', function (err) {
  console.error('Caught exception: ' + err); // FIXME
});

var app = _client(_config.SERVER_PORT, null, __x11);
app.listen(_config.SERVER_PORT);
console.info('>>> Listening on port ' + _config.SERVER_PORT);

