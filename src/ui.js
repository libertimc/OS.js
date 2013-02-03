/*!
 * @file
 * OS.js - JavaScript Operating System - UI
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

var sprintf = require('sprintf').sprintf,
    swig    = require('swig');

var config  = require('../config.js');

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports =
{
  /**
   * ui::generateThemeCSS() -- Generate theme css from a template
   * @param   String      name          Theme name
   * @param   Function    callback      Callback function
   * @return  String
   */
  generateThemeCSS : function(name, callback) {
  
  
  },

  /**
   * ui::generateFontCSS() -- Generate a Font CSS stylesheet
   * @param   String    filename      Font Filename
   * @return  String
   */
  generateFontCSS : function(filename) {
    var font = filename.replace(/[^a-zA-Z0-9]/, '');

    var sources = {
      "normal"   : sprintf("%s/%s.ttf",        config.URI_FONT, filename),
      "bold"     : sprintf("%s/%sBold.ttf",    config.URI_FONT, filename),
      "italic"   : sprintf("%s/%s%s.ttf",      config.URI_FONT, filename, (font == "FreeSerif" ? "Italic" : "Oblique")),
      "bitalic"  : sprintf("%s/%sBold%s.ttf",  config.URI_FONT, filename, (font == "FreeSerif" ? "Italic" : "Oblique"))
    };

    // Load from cache
    // TODO

    // Render CSS template
    var opts = {
        normal  : sources.normal,
        bold    : sources.bold,
        italic  : sources.italic,
        bitalic : sources.bitalic,
        bcstart : "",
        bcend   : ""
    };

    if ( font == "Sansation" ) {
      opts.bcstart  = "/*";
      opts.bcend    = "*/";
    }

    var file = ([config.PATH_TEMPLATES, 'resource.font.css']).join("/");
    var css  = swig.compileFile(file).render(opts);

    return css;
  }
};

