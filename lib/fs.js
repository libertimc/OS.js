/*!
 * @file
 * OS.js - JavaScript Operating System - FS Wrapper
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

var fs  = require('fs');
var ncp = require('ncp').ncp;

/**
 * Copy recursive
 * @return  void
 */
fs.copyRecursive = ncp;

/**
 * Remove recursive
 * @link https://gist.github.com/1722941
 * @return void
 */
fs.removeRecursive = function(path,cb){
  var self = this;

  fs.stat(path, function(err, stats) {
    if(err){
      cb(err,stats);
      return;
    }
    if(stats.isFile()){
      fs.unlink(path, function(err) {
        if(err) {
          cb(err,null);
        }else{
          cb(null,true);
        }
        return;
      });
    }else if(stats.isDirectory()){
      // A folder may contain files
      // We need to delete the files first
      // When all are deleted we could delete the 
      // dir itself
      fs.readdir(path, function(err, files) {
        if(err){
          cb(err,null);
          return;
        }
        var f_length = files.length;
        var f_delete_index = 0;

        // Check and keep track of deleted files
        // Delete the folder itself when the files are deleted

        var checkStatus = function(){
          // We check the status
          // and count till we r done
          if(f_length===f_delete_index){
            fs.rmdir(path, function(err) {
              if(err){
                cb(err,null);
              }else{ 
              cb(null,true);
              }
            });
            return true;
          }
          return false;
        };
        if(!checkStatus()){
          for(var i=0;i<f_length;i++){
            // Create a local scope for filePath
            // Not really needed, but just good practice
            // (as strings arn't passed by reference)
            (function(){
                var filePath = path + '/' + files[i];
                // Add a named function as callback
                // just to enlighten debugging
                fs.removeRecursive(filePath,function removeRecursiveCB(err,status){
                  if(!err){
                    f_delete_index ++;
                    checkStatus();
                  }else{
                    cb(err,null);
                    return;
                  }
                });

            })();
          }
        }
      });
    }
  });
};

module.exports = fs;

