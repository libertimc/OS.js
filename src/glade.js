/*!
 * @file
 * OS.js - JavaScript Operating System - Glade/Gtk+ parsing
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

var _config   = require('../config.js');
var _utils    = require(_config.PATH_SRC + '/utils.js');

var libxmljs  = require('libxmljs');
var fs        = require('fs');

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

var shortTags = ["GtkImage", "GtkEntry", "GtkSeparator", "GtkSeparatorToolItem"];
var stockItems = {};

/**
 * GladeParser - Parse a Glade XML document
 *
 * @param   String      src         Source document
 * @param   Function    callback    Callback function
 * @return  void
 */
function GladeParser(xmlData) {
  var targetDoc = libxmljs.Document();
  targetDoc.node('div');
  var targetRoot = targetDoc.root();
  var windowSignals = [];

  /**
   * Create stock element for node
   */
  var stock = function(xmlNode) {
  };

  /**
   * Scan node properties and signals
   */
  var scan = function(xmlNode) {
    var node        = null;
    var styles      = [];
    var properties  = [];
    var signals     = [];

    var p = xmlNode.find('property');
    var i = 0;
    var l = p.length;

    var iter;
    for ( i; i < l; i++ ) {
      iter = p[i];
      properties[iter.attr('name').value()] = iter.text();
    }

    // TODO: Signals

    var id = xmlNode.attr('id').value();
    var className = xmlNode.attr('class').value();
    if ( !_utils.inArray(className, ["GtkWindow", "GtkDialog"]) ) {
      if ( typeof properties['width'] !== 'undefined'  ) {
        styles.push('width:' + properties['width'] + 'px');
      }
      if ( typeof properties['height'] !== 'undefined'  ) {
        styles.push('height:' + properties['height'] + 'px');
      }
      if ( typeof properties['width_request'] !== 'undefined'  ) {
        styles.push('width:' + properties['width_request'] + 'px');
      }
      if ( typeof properties['height_request'] !== 'undefined'  ) {
        styles.push('height:' + properties['height_request'] + 'px');
      }
      if ( typeof properties['border_width'] !== 'undefined'  ) {
        styles.push('padding:' + properties['border_width'] + 'px');
      }
      if ( typeof properties['visible'] !== 'undefined'  ) {
        if ( properties['visible'] === 'False' ) {
          styles.push('display:none');
        }
      }
      // FIXME FROM OLD CODEBASE: Move to packing ?!
      if ( typeof properties['x'] !== 'undefined'  ) {
        styles.push('left:' + properties['x'] + 'px');
      }
      if ( typeof properties['y'] !== 'undefined'  ) {
        styles.push('top:' + properties['y'] + 'px');
      }
    }

    switch ( className ) {
      // FIXME
      default :
        node = libxmljs.Element(targetDoc, 'div');
      break;
    }

    node.attr({
      'class' : [className, id].join(' ')
    });

    if ( styles.length ) {
      node.attr('style', styles.join(';'));
    }

    return [node];
  };

  /**
   * Traverse nodes
   * TODO Packing
   */
  var traverse = function(htmlNode, xmlNode, parentHtmlNode) {
    if ( !xmlNode.length )
      return;

    var j = 0;
    var y = xmlNode.length;

    var els, i, l, node, iter, data, tmpnode;
    for ( j; j < y; j++ ) {
      els = xmlNode[j].childNodes();
      i = 0;
      l = els.length;

      for ( i; i < l; i++ ) {
        iter = els[i];
        if ( iter.name() != 'object' ) {
          continue;
        }

        data = scan(iter);
        node = data[0];

        traverse(node, iter.find('child'));
        if ( !node.childNodes().length && !_utils.inArray(iter.attr('class').value(), shortTags) ) {
          node.text(' ');
        }

        if ( parentHtmlNode && (node.name() != 'li' && parentHtmlNode.name() == 'ul') ) { // FIXME
          tmpnode = libxmljs.Element(targetDoc, 'li');
          tmpnode.addChild(node);
          htmlNode.addChild(tmpnode);
        } else {
          htmlNode.addChild(node);
        }
      }
    }
  };

  /**
   * Parse document
   */
  var parseSchema = function(xml) {
    var xmlDoc = libxmljs.parseXml(xml);

    var root = xmlDoc.root();
    var els = root.childNodes();

    var i = 0;
    var l = els.length;
    var node, iter;

    for ( i; i < l; i++ ) {
      iter = els[i];
      if ( iter.name() != 'object' )
        continue;

      node = libxmljs.Element(targetDoc, 'div');
      node.attr({
        'class' : 'GtkWindow'
      });

      // TODO Window attributes

      targetRoot.addChild(node);
      traverse(node, iter.find('child'));
    }

    return {
      html    : targetDoc.toString(),
      signals : windowSignals
    };
  };

  return parseSchema(xmlData);

}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports = {
  parser : function(src, callback) {
    try {
      callback(true, GladeParser(fs.readFileSync(src).toString()));
    } catch ( err ) {
      console.error('Failed to load document', err);
      callback(false, err);
    }
  }
};

