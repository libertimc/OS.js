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
var sanitize  = require('validator').sanitize;

///////////////////////////////////////////////////////////////////////////////
// MAIN
///////////////////////////////////////////////////////////////////////////////

var shortTags = ["GtkImage", "GtkEntry", "GtkSeparator", "GtkSeparatorToolItem"];
var stockItems = {
  'gtk-apply' : {
    'label' : 'Apply',
    'icon' : 'actions/gtk-save.png'
  },
  'gtk-cancel' : {
    'label' : 'Cancel',
    'icon' : 'actions/gtk-cancel.png'
  },
  'gtk-new' : {
    'label' : 'New',
    'icon' : 'actions/gtk-new.png'
  },
  'gtk-close' : {
    'label' : 'Close',
    'icon' : 'actions/gtk-close.png'
  },
  'gtk-home' : {
    'label' : 'Home',
    'icon' : 'actions/gtk-home.png'
  },
  'gtk-refresh' : {
    'label' : 'Refresh',
    'icon' : 'actions/gtk-refresh.png'
  },
  'gtk-open' : {
    'label' : 'Open',
    'icon' : 'actions/gtk-open.png'
  },
  'gtk-save' : {
    'label' : 'Save',
    'icon' : 'actions/gtk-save.png'
  },
  'gtk-save-as' : {
    'label' : 'Save as...',
    'icon' : 'actions/gtk-save-as.png'
  },
  'gtk-cut' : {
    'label' : 'Cut',
    'icon' : 'actions/gtk-cut.png'
  },
  'gtk-copy' : {
    'label' : 'Copy',
    'icon' : 'actions/gtk-copy.png'
  },
  'gtk-paste' : {
    'label' : 'Paste',
    'icon' : 'actions/gtk-paste.png'
  },
  'gtk-delete' : {
    'label' : 'Delete',
    'icon' : 'actions/gtk-delete.png'
  },
  'gtk-about' : {
    'label' : 'About',
    'icon' : 'actions/gtk-about.png'
  },
  'gtk-quit' : {
    'label' : 'Quit',
    'icon' : 'actions/gtk-quit.png'
  },
  'gtk-connect' : {
    'label' : 'Connect',
    'icon' : 'actions/stock_media-play.png'
  },
  'gtk-disconnect' : {
    'label' : 'Disconnect',
    'icon' : 'actions/gtk-stop.png'
  },
  'gtk-preferences' : {
    'label' : 'Preferences',
    'icon' : 'categories/gtk-preferences.png'
  },
  'gtk-ok' : {
    'label' : 'Ok',
    'icon' : 'actions/gtk-save.png'
  },
  'gtk-add' : {
    'label' : 'Add',
    'icon' : 'actions/gtk-add.png'
  },
  'gtk-remove' : {
    'label' : 'Remove',
    'icon' : 'actions/gtk-remove.png'
  },
  'gtk-execute' : {
    'label' : 'Execute',
    'icon' : 'actions/gtk-execute.png'
  },

  'gtk-media-previous' : {
    'label' : 'Prev',
    'icon' : 'actions/media-skip-backward.png'
  },
  'gtk-media-stop' : {
    'label' : 'Stop',
    'icon' : 'actions/media-playback-stop.png'
  },
  'gtk-media-play' : {
    'label' : 'Play',
    'icon' : 'actions/media-playback-start.png'
  },
  'gtk-media-pause' : {
    'label' : 'Pause',
    'icon' : 'actions/media-playback-pause.png'
  },
  'gtk-media-next' : {
    'label' : 'Next',
    'icon' : 'actions/media-skip-forward.png'
  },

  'gtk-bold' : {
    'label' : 'Bold',
    'icon' : 'actions/gtk-bold.png'
  },
  'gtk-underline' : {
    'label' : 'Underline',
    'icon' : 'actions/gtk-underline.png'
  },
  'gtk-italic' : {
    'label' : 'Italic',
    'icon' : 'actions/gtk-italic.png'
  },
  'gtk-strikethrough' : {
    'label' : 'Strikethrough',
    'icon' : 'actions/gtk-strikethrough.png'
  },
  'gtk-select-color' : {
    'label' : 'Color Selection',
    'icon' : 'apps/preferences-desktop-theme.png'
  },
  'gtk-select-font' : {
    'label' : 'Font Selection',
    'icon' : 'apps/fonts.png'
  },
  'format-justify-left' : {
    'label' : 'Align Left',
    'icon' : 'actions/format-justify-left.png'
  },
  'format-justify-center' : {
    'label' : 'Align Center',
    'icon' : 'actions/format-justify-center.png'
  },
  'format-justify-right' : {
    'label' : 'Align Right',
    'icon' : 'actions/format-justify-right.png'
  },
  'gtk-justify-left' : {
    'label' : 'Align Left',
    'icon' : 'actions/format-justify-left.png'
  },
  'gtk-justify-center' : {
    'label' : 'Align Center',
    'icon' : 'actions/format-justify-center.png'
  },
  'gtk-justify-right' : {
    'label' : 'Align Right',
    'icon' : 'actions/format-justify-right.png'
  }
};

/**
 * GladeParser - Parse a Glade XML document
 *
 * @param   String      src         Source document
 * @param   Function    callback    Callback function
 * @return  void
 */
function GladeParser(xmlData) {
  var windowSignals = {};
  var windowElements = {};

  /**
   * Create a hinted string
   */
  var createLabel = function(targetDoc, htmlNode, str) {
    var hinted = str.match(/^_/);
    if ( hinted ) {
      var node = libxmljs.Element(targetDoc, 'span');

      var el = libxmljs.Element(targetDoc, 'u');
      el.text(sanitize(str.substr(1, 1)).entityEncode());

      var txt = libxmljs.Element(targetDoc, 'span');
      txt.text(sanitize(str.substr(2)).entityEncode());

      node.addChild(el);
      node.addChild(txt);

      htmlNode.addChild(node);
    } else {
      htmlNode.text(sanitize(str).entityEncode());
    }
  };

  /**
   * Create stock element for node
   */
  var stock = function(targetDoc, xmlNode, htmlNode, properties, simple) {
    // FIXME: simple from old codebase ?!
    if ( htmlNode.text() ) {
      return;
    }

    if ( properties['label'] ) {
      var lbl = properties['label'];

      if ( properties['stock_id'] || (properties['use_stock'] === 'True') ) {
        var stock_id = properties['stock_id'] || lbl;

        if ( stockItems[stock_id] ) {
          var iter = stockItems[stock_id];
          //var img = '/img/icons/16x16/' + iter.icon;
          var img = _config.URI_ICON + '/Default/16x16/'  + iter.icon;

          var nimg = libxmljs.Element(targetDoc, 'img');
          nimg.attr({
            'src' : img,
            'alt' : sanitize(iter.label).entityEncode()
          });

          var nlbl = libxmljs.Element(targetDoc, 'span');
          createLabel(targetDoc, nlbl, iter.label);

          htmlNode.addChild(nimg);
          htmlNode.addChild(nlbl);

          return;
        }
      }

      if ( lbl ) {
        createLabel(targetDoc, htmlNode, lbl);
        return;
      }
    }

    htmlNode.text('&nbsp;');
  };

  /**
   * Pack elements in a container (liquid layout)
   */
  var pack = function(targetDoc, xmlNode, htmlNode) {
    var classes = ['GtkBoxPackage'];
    var props   = {};

    var els = xmlNode.find('packing/property');
    var i = 0;
    var l = els.length;
    for ( i; i < l; i++ ) {
      props[els[i].attr('name').value()] = els[i].text();
    }

    if ( props['position'] && (parseInt(props['position'], 10) >= 0) ) {
      classes.push('Position_' + props['position']);
    }
    if ( props['expand'] && (props['expand'] == 'True') ) {
      classes.push('Expand');
    }
    //if ( props['fill'] && (props['fill'] == 'True') ) {
    if ( props['expand'] && (props['expand'] == 'True') ) { // FIXME ?!
      classes.push('fill');
    }

    var node = libxmljs.Element(targetDoc, 'div');
    node.attr('class', classes.join(' '));

    node.addChild(htmlNode);

    return node;
  };

  /**
   * Scan node properties and signals
   */
  var scan = function(windowId, targetDoc, xmlNode) {
    var className   = xmlNode.attr('class').value();
    var id          = xmlNode.attr('id').value();
    var node        = null;
    var styles      = [];
    var properties  = [];
    var packed      = false;
    var classes     = [className];

    var p, i, l, iter, ev_name, ev_handler;

    // Properties
    i = 0; p = xmlNode.find('property'); l = p.length;
    for ( i; i < l; i++ ) {
      iter = p[i];
      properties[iter.attr('name').value()] = iter.text();
    }

    // Signals
    i = 0; p = xmlNode.find('signal'); l = p.length;
    for ( i; i < l; i++ ) {
      iter        = p[i];
      ev_name     = iter.attr('name').value();
      ev_handler  = iter.attr('handler').value();

      switch ( ev_name ) {
        case 'item-activated' :
        case 'group-changed' :
        case 'select' :
        case 'clicked' :
          ev_name = 'click';
        break;

        case 'activate' :
          if ( className == 'GtkEntry' ) {
            ev_name = 'input-activate';
          } else {
            ev_name = 'click';
          }
        break;

        default:
          break;
      }

      if ( !windowSignals[windowId][id] ) {
        windowSignals[windowId][id] = {};
      }
      windowSignals[windowId][id][ev_name] = ev_handler;
    }

    if ( !windowElements[windowId][id] ) {
      windowElements[windowId][id] = [];
    }
    windowElements[windowId][id].push(className);

    // Styles
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
      if ( typeof properties['layout_style'] !== 'undefined'  ) {
        styles.push('text-align:' + properties['layout_style']);
      }
      // FIXME FROM OLD CODEBASE: Move to packing ?!
      if ( typeof properties['x'] !== 'undefined'  ) {
        styles.push('left:' + properties['x'] + 'px');
      }
      if ( typeof properties['y'] !== 'undefined'  ) {
        styles.push('top:' + properties['y'] + 'px');
      }
    }

    // Container
    var inner;
    switch ( className ) {

      //
      // INPUTS
      //
      case "GtkTextView" :
        node = libxmljs.Element(targetDoc, 'textarea');
      break;

      case "GtkEntry" :
        node = libxmljs.Element(targetDoc, 'input');
        node.attr('type', 'text');
      break;

      case "GtkComboBox" :
        node = libxmljs.Element(targetDoc, 'select');
      break;

      case "GtkCellRendererText" :
        node = libxmljs.Element(targetDoc, 'option');
      break;

      case "GtkCheckButton" :
      case "GtkToggleButton" :
        node = libxmljs.Element(targetDoc, 'input');
        node.attr('type', 'button');

        if ( properties['active'] && properties['active'] === 'True' ) {
          node.attr('checked', 'checked');
        }
      break;

      case "GtkDrawingArea"   :
        node = libxmljs.Element(targetDoc, 'div');
        classes.push('Canvas');
      break;

      case "GtkFileChooserButton"   :
        // TODO
        node = libxmljs.Element(targetDoc, 'div');
      break;

      //
      // MISC
      //

      case "GtkLabel"   :
        node = libxmljs.Element(targetDoc, 'div');

        inner = libxmljs.Element(targetDoc, 'span');

        node.addChild(inner);

        stock(targetDoc, xmlNode, inner, properties, true);
      break;

      case "GtkImage" :
        node = libxmljs.Element(targetDoc, 'img');
      break;

      case "GtkSeparator" :
        node = libxmljs.Element(targetDoc, 'hr');
      break;

      case "GtkIconView"   :
        node = libxmljs.Element(targetDoc, 'div');
      break;

      case "GtkScale"   :
        node = libxmljs.Element(targetDoc, 'div');
        inner = libxmljs.Element(targetDoc, 'div');
        inner.text('');
        node.addChild(inner);
      break;

      case "GtkButton"   :
        node = libxmljs.Element(targetDoc, 'button');
        stock(targetDoc, xmlNode, node, properties, true);
      break;

      case "GtkColorButton" :
        node = libxmljs.Element(targetDoc, 'button');
        inner = libxmljs.Element(targetDoc, 'span');
        inner.attr('class', className + 'Color');
        inner.text('');
        node.addChild(inner);
      break;

      //
      // TOOLBARS
      //

      case "GtkToolbar"     :
        node = libxmljs.Element(targetDoc, 'ul');
      break;

      case "GtkButtonBox"   :
        node = libxmljs.Element(targetDoc, 'div');
      break;

      case "GtkToolItem" :
        node = libxmljs.Element(targetDoc, 'li');
      break;

      case "GtkSeparatorToolItem" :
        node = libxmljs.Element(targetDoc, 'hr');
      break;

      case "GtkToolButton" :
      case "GtkToggleToolButton" :
      case "GtkToolItemGroup" :
        node = libxmljs.Element(targetDoc, 'button');
        stock(targetDoc, xmlNode, node, properties, false);
      break;

      case "GtkImageMenuItem" :
      case "GtkRadioMenuItem" :
      case "GtkMenuItem" :
        node = libxmljs.Element(targetDoc, 'li');
        inner = libxmljs.Element(targetDoc, 'div');
        inner.attr('class', 'GtkMenuItemInner');
        node.addChild(inner);

        stock(targetDoc, xmlNode, inner, properties, false);
      break;

      //
      // MENUS
      //
      case "GtkMenu"        :
      case "GtkMenuBar"     :
      case "GtkNodebook"    :
        node = libxmljs.Element(targetDoc, 'ul');
      break;

      //
      // CONTAINERS
      //
      case "GtkGrid" :
        node = libxmljs.Element(targetDoc, 'div');
        packed = true;
      break;

      case "GtkBox"  :
      case "GtkHBox" :
      case "GtkVBox" :
        node = libxmljs.Element(targetDoc, 'div');
        packed = true;

        var orientation = "horizontal";
        if ( className == "GtkBox" ) {
          if ( properties['orientation'] ) {
            orientation = properties['orientation'];
          }
        } else if ( $class == "GtkVBox" ) {
          orientation = "vertical";
        }

        classes.push('GtkBox' + _utils.ucfirst(orientation));
      break;

      default :
        node = libxmljs.Element(targetDoc, 'div');
      break;
    } // switch

    classes.push(id);

    node.attr({
      'class' : classes.join(' ')
    });

    if ( styles.length ) {
      node.attr('style', styles.join(';'));
    }

    return [node, packed];
  };

  /**
   * Traverse nodes
   */
  var traverse = function(windowId, targetDoc, htmlNode, xmlNode, parentHtmlNode, is_packed) {
    is_packed = is_packed === true;
    parentHtmlNode = parentHtmlNode || htmlNode;

    if ( !xmlNode.length )
      return;

    var j = 0;
    var y = xmlNode.length;

    var els, i, l, node, iter, data, addnode, packed, tmpnode;
    for ( j; j < y; j++ ) {
      els = xmlNode[j].childNodes();
      i = 0;
      l = els.length;

      for ( i; i < l; i++ ) {
        iter = els[i];
        if ( iter.name() != 'object' ) {
          continue;
        }

        data    = scan(windowId, targetDoc, iter);
        node    = data[0];
        packed  = data[1];

        traverse(windowId, targetDoc, node, iter.find('child'), parentHtmlNode, packed);
        if ( !node.childNodes().length && !_utils.inArray(iter.attr('class').value(), shortTags) ) {
          node.text(' ');
        }

        if ( parentHtmlNode && (node.name() != 'li' && parentHtmlNode.name() == 'ul') ) { // FIXME
          addnode = libxmljs.Element(targetDoc, 'li');
          addnode.addChild(node);
        } else {
          addnode = node;
        }

        if ( is_packed ) {
          tmpnode = pack(targetDoc, iter.parent(), addnode);

          htmlNode.addChild(tmpnode);
        } else {
          htmlNode.addChild(addnode);
        }
      }
    }
  };

  /**
   * Parse document
   */
  var parseSchema = function(xml) {
    var result = {};

    var xmlDoc = libxmljs.parseXml(xml);
    var root = xmlDoc.root();
    var els = root.childNodes();

    var i = 0;
    var l = els.length;
    var node, iter, id, className;
    var targetDoc, targetRoot, props, styles;
    var wprops, wpiter, wpval, j, k;

    for ( i; i < l; i++ ) {
      iter = els[i];
      if ( iter.name() != 'object' )
        continue;

      targetDoc   = libxmljs.Document();
      targetRoot  = targetDoc.node('div');
      wprops      = iter.find('property');
      id          = iter.attr('id').value();
      className   = iter.attr('class').value();

      windowSignals[id] = {};
      windowElements[id] = [];
      styles = [];
      props = {
        "type"            : className == "GtkWindow" ? "window" : "dialog",
        "title"           : "",
        "icon"            : "",
        "is_draggable"    : true,
        "is_resizable"    : true,
        "is_scrollable"   : false,
        "is_sessionable"  : true,
        "is_minimizable"  : true,
        "is_maximizable"  : true,
        "is_closable"     : true,
        "is_orphan"       : false,
        "skip_taskbar"    : false,
        "skip_pager"      : false,
        "width"           : 500,
        "height"          : 300,
        "gravity"         : ""
      };


      j = 0; k = wprops.length;
      for ( j; j < k; j++ ) {
        wpiter = wprops[j];
        wpval = wpiter.text();

        switch ( wpiter.attr('name').value() ) {
          case 'resizable' :
            if ( wpval == "False" ) {
              props['is_resizable'] = false;
            }
            break;
          case 'title' :
            if ( wpval ) {
              props['title'] = wpval;
            }
          break;
          case 'icon' :
            if ( wpval ) {
              $properties['icon'] = wpval;
            }
          break;
          case 'default_width' :
            props['width'] = parseInt(wpval, 10);
          break;
          case 'default_height' :
            props['height'] = parseInt(wpval, 10);
          break;
          case 'window_position' :
            props['gravity'] = wpval;
          break;
          case 'skip_taskbar_hint' :
            if ( wpval == "True" ) {
              props['skip_taskbar'] = true;
            }
          break;
          case 'skip_pager_hint' :
            if ( wpval == "True" ) {
              props['skip_pager'] = true;
            }
          break;

          case "border_width" :
            if ( parseInt(wpval, 10) > 0 ) {
              styles.push('padding:' + wpval + 'px');
            }
          break;

          default:
          break;
        }
      }

      node = libxmljs.Element(targetDoc, 'div');
      node.attr({
        'class' : 'GtkWindow ' + id,
        'style' : styles.length ? styles.join('; ') : ''
      });

      targetRoot.addChild(node);
      traverse(id, targetDoc, node, iter.find('child'));

      result[id] = {
        attributes  : props,
        html        : targetDoc.toString(),
        elements    : windowElements[id] || {},
        signals     : windowSignals[id] || {}
      };
    }

    return result;
  };

  return parseSchema(xmlData);
}

///////////////////////////////////////////////////////////////////////////////
// EXPORTS
///////////////////////////////////////////////////////////////////////////////

module.exports = {
  parser : GladeParser,
  parse : function(src, callback) {
    var data;
    try {
      data = fs.readFileSync(src).toString();
    } catch ( err ) {
      console.error('Failed to load document', err);
      callback(false, err);
      return;
    }

    callback(true, GladeParser(data));
  }
};

