
/*!
 * {{ type }}: {{ package }} -- Wrapper for package
 *
 * @package     OSjs.Packages
 * @generator   OS.js create-project
 * @author      Anders Evenrud <andersevenrud@gmail.com>
 * @licence     Simplified BSD License
 */
OSjs.Packages.{{ package|e }} = (function($, undefined) {

  /**
   * @desc Translation Table
   */
  var _LINGUAS = {{ linguas }};
{%- if type == "PanelItem" %}

  /**
   * {{ package }} -- PanelItem Package Namespace
   *
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
     * {{ package }} -- Main PanelItem Class
     * @class
     */
    var __{{ package }} = PanelItem.extend({

      /**
       * [PanelItem]{{ package }}::init() -- Constructor
       */
      init : function() {
        this._super("{{ package|e }}");
      },

      /**
       * {{ package }}::destroy() -- Destruction method
       */
      destroy : function() {
        this._super();
      },

      /**
       * {{ package }}::run() -- Called when created/started
       * @return  bool
       */
      create : function(pos) {
        var _ret = this._super(pos);

        // NOTE: Do your stuff here

        return _ret;
      }
    });

    return new __{{ package|e }}();
  };

{%- else if type == "Application" %}

  /**
   * {{ package }} -- Application Package Namespace
   *
   * @param GtkWindow     GtkWindow            GtkWindow API Reference
   * @param Application   Application          Application API Reference
   * @param API           API                  Public API Reference
   * @param Object        argv                 Application arguments (like cmd)
   * @param Array         windows              Application windows from session (restoration)
   */
  return function(GtkWindow, Application, API, argv, windows) {

    /**
     * @desc Localized Translations
     */
    var LABELS = _LINGUAS[API.system.language()] || _LINGUAS["{{ default_language|e }}"];

    /**
     * @desc Accepted MIME type(s)
     */
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

      /**
       * Window_{{ w.name }}::init() -- Constructor
       * @param   Application     app     Application reference
       */
      init : function(app) {
        this._super("Window_{{ w.name|e }}", {{ w.is_dialog }}, app, windows);
        this._content = $("{{ w.html|addslashes }}").html();

{{ w.code_init }}
      },

      /**
       * Window_{{ w.name }}::destroy() -- Destruction method
       */
      destroy : function() {
        this._super();
      },
{% for s in w.signals %}
      /**
       * Window_{{ w.name }}::{{ s.handler }}()
       * @signal  {{ s.id }} > {{ s.signal }}
       * @return  void
       */
      {{ s.handler }} : function(el, ev) {
  {%- if s.template == "DefaultFileOpen" %}
        // TODO: Create callback here
        var my_callback = function(fname) {};

        var my_filename = this.app._getArgv('path');
        this.app.defaultFileOpen(function(fname) {
          my_callback(fname);
        }, MIMES, null, my_filename);
  {%- else if s.template == "DefaultFileSave" %}
        // TODO: Fill contents, and create callback here
        var my_content  = "";
        var my_callback = function(fname) {};

        var my_filename = this.app._getArgv('path');
        if ( my_filename ) {
          this.app.defaultFileSave(my_filename, my_content, function(fname) {
            my_callback(fname);
          }, MIMES, undefined, false);
        }
  {%- else if s.template == "DefaultFileSaveAs" %}
        // TODO: Fill contents, and create callback here
        var my_content  = "";
        var my_callback = function(fname, fmime) {};

        var my_filename = this.app._getArgv('path');
        this.app.defaultFileSave(my_filename, my_content, function(fname) {
          my_callback(fname);
        }, MIMES, undefined, true);
  {%- else if s.template == "DefaultClose" %}
        this.close();
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
        var self = this;

        var my_path     = this.$element.find(".{{ s.id }} input[type=text]").val();
        this.app.createFileDialog(function(fname) {
          self.$element.find(".{{ s.id|e }} input[type=text]").val(fname);
          self.$element.find(".{{ s.id|e }} input}type=hidden]").val(fname);
        }, MIMES, "open", dirname(my_path));
    {%- else if s.signal == "input-activate" %}
        // do nothing
    {%- else %}
        // TODO: Implement your event here
    {%- endif %}
  {%- endif %}
      },
{% endfor %}
      /**
       * Window_{{ w.name }}::create() -- Called when created/started
       * @param   String    id            Window ID
       * @param   Function  mcallback     Callback when created
       * @return  bool
       */
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

          // NOTE: Do your stuff here

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
     * {{ package }} -- Main Application Class
     * @class
     */
    var __{{ package|e }} = Application.extend({

      /**
       * {{ package }}::init() -- Constructor
       */
      init : function() {
        this._super("{{ package|e }}", argv);
        this._compability = {{ compability }};
      },

      /**
       * {{ package }}::destroy() -- Destruction method
       */
      destroy : function() {
        this._super();
      },

      /**
       * {{ package }}::run() -- Called when started
       * @return  void
       */
      run : function() {
        {{ code_prepend }}

        this._super({{ glade_window }});

        {{ code_append }}

        // NOTE: Do your stuff here
      }
    });

    return new __{{ package }}();
  };

{% else -%}

  /**
   * {{ package }} -- BackgroundService Package Namespace
   *
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
     * {{ package }} -- Main Application/Service Class
     * @class
     */
    var __{{ package|e }} = Service.extend({

      /**
       * {{ package }}::init() -- Constructor
       */
      init : function() {
        this._super("{{ package|e }}", "{{ icon|e }}");
      },

      /**
       * {{ package }}::destroy() -- Destruction method
       */
      destroy : function() {
        this._super();
      },

      /**
       * {{ package }}::run() -- Called when started
       * @return  void
       */
      run : function() {
        this._super();
      }
    });

    return new __{{ package|e }}();
  };

{%- endif %}
})($);

