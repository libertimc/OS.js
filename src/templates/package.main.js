/*!
 * {{ type }}: {{ package }}
 *
 * @package OSjs.Packages
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Packages.{{ package }} = (function($, undefined) {

  var _LINGUAS = {{ linguas }};

{% if type == "PanelItem" -%}

  /**
   * @param PanelItem     PanelItem           PanelItem API Reference
   * @param Panel         panel               Panel Instance Reference
   * @param API           API                 Public API Reference
   * @param Object        argv                Launch arguments (like cmd)
   */
  return function(PanelItem, panel, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language }}"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main PanelItem Class
     * @class
     */
    var __{{ package }} = PanelItem.extend({

      init : function() {
        this._super("{{ package }}");
      },

      destroy : function() {
        this._super();
      },

      create : function(pos) {
        var ret = this._super(pos);
        // Do your stuff here

        return ret;
      }
    });

    return new __{{ package }}();
  };

{%- else if type == "Application" -%}

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language }}"];
    var MIMES  = {{ mimes }};

    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////

{% for w in windows -%}

    /**
     * GtkWindow Class
     * @class
     */
    var Window_{{ w.name }} = GtkWindow.extend({

      init : function(app) {
        this._super("Window_{{ w.name }}", {{ w.is_dialog }}, app, windows);
        this._content = $("{{ w.html }}");
{{ w.code_init }}
      },

      destroy : function() {
        this._super();
      },

{{ w.code_class }}

      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
{{ w.code_create }}
          // Do your stuff here

          return true;
        }

        return false;
      }
    });

{%- endfor %}

    ///////////////////////////////////////////////////////////////////////////
    // APPLICATION
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Application Class
     * @class
     */
    var __{{ package }} = Application.extend({

      init : function() {
        this._super("{{ package }}", argv);
        this._compability = {{ compability }};
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        var self = this;

{{ code_prepend }}

        this._super({{ glade_window }});

{{ code_append }}

        // Do your stuff here
      }
    });

    return new __{{ package }}();
  };

{% else -%}

  /**
   * @param Service       Service             Service API Reference
   * @param API           API                 Public API Reference
   * @param Object        argv                Launch arguments (like cmd)
   */
  return function(Service, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language }}"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Service Class
     * @class
     */
    var __{{ package }} = Service.extend({

      init : function() {
        this._super("{{ package }}", "{{ icon }}");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        this._super();
      }
    });

    return new __{{ package }}();
  };

{%- endif %}
})($);

