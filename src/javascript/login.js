/*!
 * @file
 * OS.js - JavaScript Operating System - Login
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

(function($, undefined) {

  var ANIMATION_SPEED        = 400;                 //!< Animation speed in ms

  var OSjs = {
    Labels : {
      "LoginConfirm"                        : "You are already logged in, are you sure you want to continue?",
      "LoginFailure"                        : "Failed to log in: %s",
      "LoginFailureOther"                   : "A system error occured while logging in, please try again.",
      "CreateLoginFailure"                  : "Failed to create user: %s",
      "CreateLoginFailureOther"             : "A system error occured while creating user, please try again."
    }
  };

  var KEYCODES = {
    ctrl  : 17,
    alt   : 18,
    shift : 16,
    esc   : 27,
    tab   : 9,
    enter : 13,
    up    : 38,
    down  : 40
  };

  function MessageBox(msg) {
    alert(msg); // FIXME
  }

  function GetEffectsEnabled() {
    return true;
  }

  function DoPost(args, callback, callback_error) {
    callback = callback || {};
    callback_error = callback_error || {};

    $.ajax({
      type      : "POST",
      url       : '/',
      data      : args,
      success   : function(data) {
        callback(data);
      },
      error     : function (xhr, ajaxOptions, thrownError){
        callback_error(xhr, ajaxOptions, thrownError);
      }
    });
  }

  /////////////////////////////////////////////////////////////////////////////
  // LOGIN
  /////////////////////////////////////////////////////////////////////////////

  /**
   * LoginManager -- Login Manager
   * @class
   */
  var LoginManager = {

    confirmation : true, // Confirm dialog on session crash

    /**
     * LoginManager::disableInputs() -- Disable Input Buttons
     * @return void
     */
    disableInputs : function() {
      $("#LoginButton").attr("disabled", "disabled");
      $("#CreateLoginButton").attr("disabled", "disabled");
      $("#LoginUsername").attr("disabled", "disabled").addClass("loading");
      $("#LoginPassword").attr("disabled", "disabled").addClass("loading");
    },

    /**
     * LoginManager::enableInputs() -- Enable Input Buttons
     * @return void
     */
    enableInputs : function() {
      $("#LoginButton").removeAttr("disabled");
      $("#CreateLoginButton").removeAttr("disabled");
      $("#LoginUsername").removeAttr("disabled").removeClass("loading");
      $("#LoginPassword").removeAttr("disabled").removeClass("loading");
    },

    /**
     * LoginManager::handleLogin() -- Handle a login POST result
     * @return void
     */
    handleLogin : function(response, dcallback) {
      dcallback = dcallback || function() {};

      if ( response.user.lock ) {
        var con = !this.confirmation || confirm(OSjs.Labels.LoginConfirm);
        if ( con ) {
          setTimeout(function() {
            window.location = response.href;
          }, response.timeout);
        } else {
          dcallback();
        }
      } else {
        _Core.login(response);
      }
    },

    /**
     * LoginManager::postLogin() -- POST a login form
     * @return void
     */
    postLogin : function(form, ecallback) {
      ecallback = ecallback || function() {};

      LoginManager.disableInputs();

      console.group("Core::_login()");
      console.log("Login data:", form);
      console.groupEnd();

      DoPost({'action' : 'login', 'form' : form}, function(data) {
        console.log("Login success:", data.success);
        console.log("Login result:", data.result);

        if ( data.success && data.result) {
          $("#LoginForm").get(0).onsubmit = null;
          LoginManager.handleLogin(data.result, function() {
            LoginManager.enableInputs();
          });
        } else {
          LoginManager.enableInputs();
          MessageBox(sprintf(OSjs.Labels.LoginFailure, data.error));
          ecallback();
        }

      }, function() {
        MessageBox(OSjs.Labels.LoginFailureOther);
        LoginManager.enableInputs();
        ecallback();
      });
    },

    /**
     * LoginManager::run() -- Init the Login
     * @return void
     */
    run : function(autologin) {
      $("#LoginWindow").show();

      $("#LoginButton").on("click", function() {
        LoginManager.postLogin({
          "username" : $("#LoginUsername").val(),
          "password" : $("#LoginPassword").val()
        });
      });

      $("#LoginUsername").on("keydown", function(ev) {
        var key = ev.keyCode || ev.which;
        if ( key == KEYCODES.enter ) {
          $("#LoginPassword").focus();
          ev.preventDefault();
          ev.stopPropagation();
        }
      });

      $("#LoginPassword").on("keydown", function(ev) {
        var key = ev.keyCode || ev.which;
        if ( key == KEYCODES.enter ) {
          $("#LoginButton").click();
          ev.preventDefault();
          ev.stopPropagation();
        }
      });

      LoginManager.enableInputs();
      $("#LoginUsername").val("");
      $("#LoginPassword").val("");
      $("#LoginUsername").focus();

      if ( autologin ) {
        this.confirmation = false;
        $("#LoginUsername").val("Automatic login ..."); // FIXME: Locale
        $("#LoginPassword").attr("placeholder", "");
        LoginManager.disableInputs();
        LoginManager.postLogin({}, function() {
          LoginManager.disableInputs();
        });
        return;
      }

    },

    /**
     * LoginManager::hide() -- Hide and destroy login window
     * @return void
     */
    hide : function() {
      if ( GetEffectsEnabled() ) {
        $("#LoginWindow").fadeOut(ANIMATION_SPEED, function() {
          $("#LoginWindow").remove();
        });
      } else {
        $("#LoginWindow").hide().remove();
      }
    }

  };

  /////////////////////////////////////////////////////////////////////////////
  // MAIN
  /////////////////////////////////////////////////////////////////////////////

  $(function(){
    LoginManager.run();
  });

})($);

