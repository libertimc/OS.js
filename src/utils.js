/*!
 * @file
 * OS.js - JavaScript Operating System - utility functions
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

module.exports = {


  /**
   * Escape an argument for shell
   * @return  String
   */
  escapeshell : function(cmd) {
    return ('' + cmd).replace(/(["\s'$`\\])/g,'\\$1');
  },

  /**
   * Sort a dict
   * @return  Object
   */
  sortObj : function(object, sortFunc) {
    if ( !sortFunc ) {
      sortFunc = function(a, b) {
        if (a > b) return 1;
        if (a < b) return -1;
        return 0;
      };
    }
    var rv = [];
    for (var k in object) {
      if (object.hasOwnProperty(k)) rv.push({key: k, value:  object[k]});
    }
    rv.sort(function(o1, o2) {
      return sortFunc(o1.key, o2.key);
    });
    return rv;
  },

  /**
   * Check if given element is in an array
   * @return  bool
   */
  inArray : function(element, array, cmp) {
    if (typeof cmp != "function") {
      cmp = function (o1, o2) {
        return o1 == o2;
      };
    }
    for (var key in array) {
      if (cmp(element, array[key])) {
        return true;
      }
    }
    return false;
  }

};

