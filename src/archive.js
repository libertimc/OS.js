/*!
 * @file
 * OS.js - JavaScript Operating System - archive managment
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

var spawn = require('child_process').spawn,
    exec  = require('child_process').exec,
    fs    = require('fs');

///////////////////////////////////////////////////////////////////////////////
// CLASSES
///////////////////////////////////////////////////////////////////////////////

var Zip = function(filename) {
  this.filename = filename;
};

Zip.prototype = {
  create : function(path, callback) {
    var destination = this.filename;
    var zdata = [];
    var zlen = 0;
    var errors = [];

    var zip = spawn('zip', ['-rj', '-', path]);

    zip.stdout.on('chunk', function (chunk) {
      zchunk.push(chunk);
      zlen += chunk.length;
    });

    zip.stderr.on('data', function (data) {
      console.log('zip stderr: ' + data);
      errors.push(data);
    });

    zip.on('exit', function (code) {
      if ( code !== 0 ) {
        callback(false, 'zip process exited with code ' + code, errors);
      } else {
        var buf = new Buffer(zlen);
        for (var i=0, len = zdata.length, pos = 0; i < len; i++) {
          zdata[i].copy(buf, pos);
          pos += data[i].length;
        }

        fs.writeFile(destination, 'binary', buf.toString('binary'), function(err) {
          if ( err ) {
            callback(false, err, errors);
          } else {
            callback(true, true, errors);
          }
        });
      }
    });
  },

  extract : function(destination, callback) {
    var source = this.filename;
    var errors = [];

    var zip = spawn('unzip', [source, '-d', destination]);

    zip.stdout.on('chunk', function (chunk) {
    });

    zip.stderr.on('data', function (data) {
      console.log('unzip stderr: ' + data);
      errors.push(data);
    });

    zip.on('exit', function (code) {
      if ( code !== 0 ) {
        callback(false, 'unzip process exited with code ' + code, errors);
      } else {
        callback(true, true);
      }
    });
  },

  ls : function(callback) {
    var source = this.filename;

    exec('unzip -l ' + source, function(error, stdout, stderr) {
      stdout = stdout || '';
      stderr = stderr || '';

      if ( error ) {
        callback(false, error, stderr.split(/(\r?\n)/));
      } else if ( !stdout ) {
        callback(false, 'failed to run ?!', stderr.split(/(\r?\n)/));
      } else {
        var items = stdout.split(/(\r?\n)/), iter;
        var list   = [];
        var total  = 0;

        if ( items.length > 4 ) {
          for ( var i = 5; i < items.length; i++ ) {
            iter = items[i].replace(/\s+/g, ' ').replace(/^\s*/g, '').replace(/\s*$/g, '');
            iter = iter.split(' ');
            if ( iter.length >= 4 ) {
              list.push({
                  'length' : parseInt(iter[0], 10),
                  'date'   : iter[1],
                  'time'   : iter[2],
                  'name'   : iter[3]
              });

              total += parseInt(iter[0], 10);
            }
          }
        }

        callback(true, {
            files   : list,
            length  : list.length,
            total   : total
        });
      }
    });
  }
};

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports = {
  Zip : Zip,

  ls : function(filename, callback) {
    (new Zip(filename)).ls(callback);
  },

  create : function(path, destination, callback) {
    (new Zip(destination)).create(path, callback);
  },

  extract : function(filename, destination, callback) {
    (new Zip(filename)).extract(destination, callback);
  }

};
