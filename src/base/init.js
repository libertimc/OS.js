/*!
 * OS.js - JavaScript Operating System - Namespace
 *
 * @package OSjs.Core.Init
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 */
(function($, undefined) {

  //
  // Override for browsers without console
  //
  if (!window.console) console = {log:function() {}, info:function(){}, error:function(){}};
  if ( !window.console.group ) {
    window.console.group = function() { console.log(arguments); };
  }
  if ( !window.console.groupEnd ) {
    window.console.groupEnd = function() { console.log(arguments); };
  }

  console.group("init.js");

  var video_supported = !!document.createElement('video').canPlayType;
  var audio_supported = !!document.createElement('audio').canPlayType;
  var upload_supported = false;

  try {
    var xhr = new XMLHttpRequest();
    upload_supported = (!! (xhr && ('upload' in xhr) && ('onprogress' in xhr.upload)));
  } catch ( eee ) {}

  //
  // Main OS.js namespace
  //
  window.OSjs =
  {
    // Compability
    Compability : {
      "SUPPORT_UPLOAD"         : (upload_supported),
      "SUPPORT_LSTORAGE"       : (('localStorage'    in window) && window['localStorage']   !== null),
      "SUPPORT_SSTORAGE"       : (('sessionStorage'  in window) && window['sessionStorage'] !== null),
      "SUPPORT_GSTORAGE"       : (('globalStorage'   in window) && window['globalStorage']  !== null),
      "SUPPORT_DSTORAGE"       : (('openDatabase'    in window) && window['openDatabase']   !== null),
      "SUPPORT_SOCKET"         : (('WebSocket'       in window) && window['WebSocket']      !== null),
      "SUPPORT_CANVAS"         : (!!document.createElement('canvas').getContext),
      "SUPPORT_WEBGL"          : false,
      "SUPPORT_CANVAS_CONTEXT" : [],

      // http://www.w3.org/TR/html5/video.html
      "SUPPORT_VIDEO"          : (video_supported),
      "SUPPORT_VIDEO_WEBM"     : (video_supported && !!document.createElement('video').canPlayType('video/webm; codecs="vp8.0, vorbis"')),
      "SUPPORT_VIDEO_OGG"      : (video_supported && !!document.createElement('video').canPlayType('video/ogg; codecs="theora, vorbis"')),
      "SUPPORT_VIDEO_MPEG"     : (video_supported && !!document.createElement('video').canPlayType('video/mp4; codecs="avc1.4D401E, mp4a.40.2"')),    // H.264 Main profile video level 3 and Low-Complexity AAC audio in MP4 container
      "SUPPORT_VIDEO_MKV"      : (video_supported && !!document.createElement('video').canPlayType('video/x-matroska; codecs="theora, vorbis"')),
      "SUPPORT_AUDIO"          : (audio_supported),
      "SUPPORT_AUDIO_OGG"      : (audio_supported && !!document.createElement('audio').canPlayType('audio/ogg; codecs="vorbis')),
      "SUPPORT_AUDIO_MP3"      : (audio_supported && !!document.createElement('audio').canPlayType('audio/mpeg')),
      "SUPPORT_RICHTEXT"       : (!!document.createElement('textarea').contentEditable)
    },

    // Internal namespace containers
    Labels       : { /* ... */ },
    Public       : { /* ... */ },

    // Dynamic namespace containers
    Applications : { /* ... */ },
    Dialogs      : { /* ... */ },
    PanelItems   : { /* ... */ },
    Classes      : { /* ... */ }
  };

  // Compability cont.
  if ( OSjs.Compability.SUPPORT_CANVAS ) {
    var test = ["2d", "webgl", "experimental-webgl", "webkit-3d", "moz-webgl"];
    for ( var i = 0; i < test.length; i++ ) {
      var canv = document.createElement('canvas');
      try {
        if ( !!canv.getContext(test[i]) ) {
          OSjs.Compability.SUPPORT_CANVAS_CONTEXT.push(test[i]);
          if ( i > 0 ) {
            OSjs.Compability.SUPPORT_WEBGL = true;
          }
        }
      } catch ( eee ) {}

      delete canv;
    }
    delete test;
    delete i;
  }

  // Labels
  OSjs.Labels = {
    "ApplicationCheckCompabilityMessage"  : "Your browser does not support '%s'",
    "ApplicationCheckCompabilityStack"    : "Application::_checkCompability(): Application name: %s",
    "CrashApplication"                    : "Application '%s' has crashed with error '%s'!",
    "CrashApplicationResourceMessage"     : "One or more of these resources failed to load:\n%s",
    "CrashApplicationResourceStack"       : "[LaunchApplication]API::system::launch()\n  Application: %s\n  Arguments: %s",
    "CrashDialogTitleApplication"         : "Application '%s' crashed!",
    "CrashDialogTitleProcess"             : "Process '%s' crashed!",
    "InitLaunchError"                     : "Cannot launch '%s'.\nMaximum allowed processes are: %d",
    "WindowManagerMissing"                : "Cannot perform this operation because the Window Manager is not running.",
    "WentOffline"                         : "Seems like you went offline. Please re-connect to continue using OS.js"
  };

  // Application Compability error exceptions
  OSjs.Public.CompabilityErrors = {
    "canvas"          : "<canvas> Context (2d)",
    "webgl"           : "<canvas> WebGL Context (3d)",
    "audio"           : "<audio> DOM Element",
    "audio_ogg"       : "<audio> Does not support OGG/Vorbis",
    "audio_mp3"       : "<audio> Does not support MPEG/MP3",
    "video"           : "<video> DOM Element",
    "video_webm"      : "<video> Does not support VP8/WebM",
    "video_ogg"       : "<video> Does not support OGG/Vorbis",
    "video_mpeg"      : "<video> Does not support MP4/MPEG/h264",
    "video_mkv"       : "<video> Does not support MKV",
    "localStorage"    : "window.localStorage()",
    "sessionStorage"  : "window.sessionStorage()",
    "globalStorage"   : "window.globalStorage()",
    "databaseStorage" : "window.databaseStorage()",
    "socket"          : "window.WebSocket()",
    "richtext"        : "window.contentEditable (Rich Text Editing)",
    "upload"          : "Your browser does not support HTML5 file-upload"
  };

  // Compability mapping
  OSjs.Public.CompabilityMapping = {
    "canvas"          : OSjs.Compability.SUPPORT_CANVS,
    "webgl"           : OSjs.Compability.SUPPORT_WEBGL,
    "audio"           : OSjs.Compability.SUPPORT_AUDIO,
    "audio_ogg"       : OSjs.Compability.SUPPORT_AUDIO_OGG,
    "audio_mp3"       : OSjs.Compability.SUPPORT_AUDIO_MP3,
    "video"           : OSjs.Compability.SUPPORT_VIDEO,
    "video_webm"      : OSjs.Compability.SUPPORT_VIDEO_WEBM,
    "video_ogg"       : OSjs.Compability.SUPPORT_VIDEO_OGG,
    "video_mpeg"      : OSjs.Compability.SUPPORT_VIDEO_MPEG,
    "video_mkv"       : OSjs.Compability.SUPPORT_VIDEO_MKV,
    "localStorage"    : OSjs.Compability.SUPPORT_LSTORAGE,
    "sessionStorage"  : OSjs.Compability.SUPPORT_SSTORAGE,
    "globalStorage"   : OSjs.Compability.SUPPORT_GSTORAGE,
    "databaseStorage" : OSjs.Compability.SUPPORT_DSTORAGE,
    "socket"          : OSjs.Compability.SUPPORT_SOCKET,
    "richtext"        : OSjs.Compability.SUPPORT_RICHTEXT
  };

  // Browser Compability list
  OSjs.Public.CompabilityLabels = {
    "Local Storage"    : OSjs.Compability.SUPPORT_LSTORAGE,
    "Session Storage"  : OSjs.Compability.SUPPORT_SSTORAGE,
    "Global Storage"   : OSjs.Compability.SUPPORT_GSTORAGE,
    "Database Storage" : OSjs.Compability.SUPPORT_DSTORAGE,
    "Canvas"           : OSjs.Compability.SUPPORT_CANVAS,
    "WebGL"            : OSjs.Compability.SUPPORT_WEBGL,
    "Audio"            : OSjs.Compability.SUPPORT_AUDIO,
    "Video"            : OSjs.Compability.SUPPORT_VIDEO,
    "Sockets"          : OSjs.Compability.SUPPORT_SOCKET
  };

  console.log("Compability", OSjs.Compability);
  console.groupEnd();

})($);

