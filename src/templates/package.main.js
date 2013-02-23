
/*!
 * {{ type }}: {{ package }}
 *
 * @package OSjs.Packages
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @licence Simplified BSD License
 * @class
 */
OSjs.Packages.{{ package|e }} = (function($, undefined) {

  var _LINGUAS = {{ linguas }};
{%- if type == "PanelItem" %}

  /**
   * @param PanelItem     PanelItem           PanelItem API Reference
   * @param Panel         panel               Panel Instance Reference
   * @param API           API                 Public API Reference
   * @param Object        argv                Launch arguments (like cmd)
   */
  return function(PanelItem, panel, API, argv) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language|e }}"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main PanelItem Class
     * @class
     */
    var __{{ package }} = PanelItem.extend({

      init : function() {
        this._super("{{ package|e }}");
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

    return new __{{ package|e }}();
  };

{%- else if type == "Application" %}

  /**
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language|e }}"];
    var MIMES  = {{ mimes }};

    ///////////////////////////////////////////////////////////////////////////
    // WINDOWS
    ///////////////////////////////////////////////////////////////////////////
{%- for w in windows %}

    /**
     * GtkWindow Class
     * @class
     */
    var Window_{{ w.name }} = GtkWindow.extend({

      init : function(app) {
        this._super("Window_{{ w.name|e }}", {{ w.is_dialog }}, app, windows);
        this._content = $("{{ w.html|addslashes }}").html();

{{ w.code_init }}
      },

      destroy : function() {
        this._super();
      },
{% for s in w.signals %}
      /**
       * Signal: [{{ s.id }}]::{{ s.signal }}()
       */
      {{ s.handler }} : function(el, ev) {
        var self = this;

  {%- if s.template == "DefaultFileOpen" %}
        var my_callback = function(fname) {}; // FIXME
        var cur         = (argv && argv['path'] ? argv['path'] : null);

        this.app.defaultFileOpen(function(fname) {
          my_callback(fname);
        }, MIMES, null, cur);
  {%- else if s.template == "DefaultFileSave" %}
        var my_filename = (argv && argv['path'] ? argv['path'] : null);
        var my_content  = ""; // FIXME
        var my_callback = function(fname) {}; // FIXME

        if ( my_filename ) {
          this.app.defaultFileSave(my_filename, my_content, function(fname) {
            my_callback(fname);
          }, MIMES, undefined, false);
        }
  {%- else if s.template == "DefaultFileSaveAs" %}
        var my_filename = (argv && argv['path'] ? argv['path'] : null);
        var my_content  = ""; // FIXME
        var my_callback = function(fname, fmime) {}; // FIXME

        this.app.defaultFileSave(my_filename, my_content, function(fname) {
          my_callback(fname);
        }, MIMES, undefined, true);
  {%- else if s.template == "DefaultClose" %}
        this.$element.find(".ActionClose").click();
  {%- else if s.template == "DefaultClipboardCopy" %}
        this.app._clipboard("copy");
  {%- else if s.template == "DefaultClipboardPaste" %}
        this.app._clipboard("paste");
  {%- else if s.template == "DefaultClipboardCut" %}
        this.app._clipboard("cut");
  {%- else if s.template == "DefaultClipboardDelete" %}
        this.app._clipboard("delete");
  {%- else if s.template == "DefaultClipboardSelectAll" %}
        this.app._clipboard("select");
  {%- else %}
    {%- if s.signal == "file-set" %}
        var my_path     = this.$element.find(".{{ s.id }} input[type=text]").val();
        this.app.createFileDialog(function(fname) {
          self.$element.find(".{{ s.id }} input[type=text]").val(fname);
          self.$element.find(".{{ s.id }} input}type=hidden]").val(fname);
        }, MIMES, "open", dirname(my_path));
    {%- else if s.signal == "input-activate" %}
        // do nothing
    {%- else %}
        // TODO
    {%- endif %}
  {%- endif %}
      },
{% endfor %}
      create : function(id, mcallback) {
        var el = this._super(id, mcallback);
        var self = this;

        if ( el ) {
{% for s in w.signals %}
          // Signal: [{{ s.id }}]::{{ s.signal }}()
  {%- if s.signal == "file-set" %}
          el.find(".{{ s.id }} button").click(function(ev) {
            self.{{ s.handler }}(this, ev);
          });
  {%- else if s.signal == "input-activate" %}
          el.find(".{{ s.id }}").keypress(function(ev) {
            var k = ev.keyCode || ev.which;
            if ( k == 13 ) {
              self.{{ s.handler }}(this, ev);
            }
          });
  {%- else %}
          el.find(".{{ s.id }}").{{ s.signal }}(function(ev) {
            self.{{ s.handler }}(this, ev);
          });
  {%- endif %}
{% endfor %}

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
    var __{{ package|e }} = Application.extend({

      init : function() {
        this._super("{{ package|e }}", argv);
        this._compability = {{ compability }};
      },

      destroy : function() {
        this._super();
      },

      run : function() {
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

    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language|e }}"];

    ///////////////////////////////////////////////////////////////////////////
    // MAIN CLASS
    ///////////////////////////////////////////////////////////////////////////

    /**
     * Main Service Class
     * @class
     */
    var __{{ package|e }} = Service.extend({

      init : function() {
        this._super("{{ package|e }}", "{{ icon|e }}");
      },

      destroy : function() {
        this._super();
      },

      run : function() {
        this._super();
      }
    });

    return new __{{ package|e }}();
  };

{%- endif %}
})($);

