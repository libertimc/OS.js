<?php
/*!
 * @file
 * OS.js - JavaScript Operating System - Contains Core Class
 *
 * Copyright (c) 2011, Anders Evenrud
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
 * @created 2011-05-22
 */

/**
 * Core -- Main OS.js interfacing Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources
 * @class
 */
class Core
{
  /////////////////////////////////////////////////////////////////////////////
  // CONSTANTS
  /////////////////////////////////////////////////////////////////////////////

  /////////////////////////////////////////////////////////////////////////////
  // VARIABLES
  /////////////////////////////////////////////////////////////////////////////

  protected $_oUser = null;       //!< Current session User
  protected $_aLocale = Array();  //!< Current session Locale

  /**
   * @var Current instance
   */
  protected static $__Instance;

  /**
   * @var doPOST 'action' argument method mapping
   */
  protected static $__POSTEvents = Array(
    "boot"          => "doBoot",
    "shutdown"      => "doShutdown",
    "snapshotSave"  => "doSnapshotSave",
    "snapshotLoad"  => "doSnapshotLoad",
    "updateCache"   => "doCacheUpdate",
    "init"          => "doInit",
    "settings"      => "doSettings",
    "login"         => "doUserLogin",
    "logout"        => "doUserLogout",
    "user"          => "doUserOperation",
    "event"         => "doApplicationEvent",
    "package"       => "doPackageOperation",
    "service"       => Array(
      "method" => "doService",
      "depend" => Array("arguments")
    ),
    "call"          => Array(
      "method" => "doVFS",
      "depend" => Array("method", "args")
    )
  );

  /**
   * @var doPOST 'action' argument security mapping (session required)
   */
  protected static $__POSTEventsSecure = Array(
    "shutdown", "snapshotLoad", "snapshotSave", "updateCache",
    "init", "settings", "logout", "user", "event", "package", "service", "call"
  );

  /////////////////////////////////////////////////////////////////////////////
  // MAGICS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * @constructor
   */
  protected function __construct() {
    // Start session
    Session::initSession();

    // Set user from session
    if ( $u = Session::getUser() ) {
      $this->setUser($u);
    }

    // Set timezone from session
    if ( $l = Session::getLocale() ) {
      $this->setLocale($l);
    } else {
      Session::setLocale($this->setLocale(null));
    }

    self::$__Instance = $this;
  }

  /////////////////////////////////////////////////////////////////////////////
  // STATIC FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Initialize Core (Create Instance)
   * @return Core
   */
  public static function initialize() {
    return self::$__Instance ? self::$__Instance : (new Core());
  }

  /**
   * Get current Instance
   * @return Core
   */
  public static function get() {
    return self::$__Instance;
  }

  /////////////////////////////////////////////////////////////////////////////
  // MEMBER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a GET request
   * @param  Array    $args   Argument list
   * @return Mixed
   */
  public function doGET(Array $args) {
    return false;
  }

  /**
   * Do a POST request
   * @param  String    $args    Argument list (raw data)
   * @param  bool      $is_raw  Format if raw data
   * @return Mixed
   */
  public function doPOST($data, $is_raw = false) {
    $args = Array();

    if ( $data && $is_raw ) {
      try {
        $args = (Array)JSON::decode($data, true);
      } catch ( Exception $e ) {
        error_log($raw);
      }
    } else if ( is_array($data) ) {
      $args = $data;
    }

    if ( sizeof($args) ) {

      // Require a specific parameter to trigger this function
      if ( isset($args['ajax']) ) {
        // Default output
        $json = Array(
          "success" => false,
          "error"   => _("Unknown error"),
          "result"  => null
        );

        // Map actions to methods
        if ( isset($args['action']) ) {

          // Check if a user session is required!
          if ( in_array($args['action'], self::$__POSTEventsSecure) ) {
            if ( !(($user = Core::get()->getUser()) && ($uid = $user->id) ) ) {
              $json["error"] = _("You are not logged in!");

              $json["exception"] = Array(
                "type"  => "session",
                "value" => "user"
              );
              return JSON::encode($json);
            }
          }

          if ( !ENV_PRODUCTION ) {
            if ( $args['action'] == "debug" ) {
              return JSON::encode(Array(
                "post"    => $_POST,
                "get"     => $_GET,
                "session" => Session::getSession(),
                "core"    => $this
              ));
            }
          }

          if ( (isset(self::$__POSTEvents[$args['action']])) && ($pev = self::$__POSTEvents[$args['action']]) ) {
            $method   = "_";
            $continue = true;

            // Check for dependencies here, generate method name
            if ( is_array($pev) ) {
              $method .= $pev['method'];
              foreach ( $pev['depend'] as $v ) {
                if ( !isset($args[$v]) ) {
                  $continue = false;
                  break;
                }
              }
            } else {
              $method .= $pev;
            }

            // Run method
            if ( $continue && method_exists($this, $method) ) {
              self::$method($args, $json, $this);
            }
          } else {
            $json['error'] = _("Unknown action given!");
          }
        } else {
          $json['error'] = _("No action given!");
        }

        // Remove error if successfull
        if ( $json['success'] !== false && $json['result'] !== null ) {
          $json['error'] = null;
        }

        return JSON::encode($json);
      }
    }

    return false;
  }

  /////////////////////////////////////////////////////////////////////////////
  // AJAX FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Do a 'Core Boot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doBoot(Array $args, Array &$json, Core $inst = null) {
    $json['success'] = true;
    $json['result']  = Array(
      "production"  => ENV_PRODUCTION,
      "cache"       => ENABLE_CACHE,
      "preload"     => Array(
        "images" => ResourceManager::$Preload["images"]
      )
    );
  }

  /**
   * Do a 'Package Operation' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doPackageOperation(Array $args, Array &$json, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      Package::LoadAll(Package::TYPE_APPLICATION | Package::TYPE_PANELITEM | Package::TYPE_SERVICE, $user);

      $json['success'] = true;
      $json['result']  = $args;
    }
  }

  /**
   * Do a 'Core Cache Update' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doCacheUpdate(Array $args, Array &$json, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      $json['success'] = true;
      $json['result']  = Array(
        "packages" => Package::GetInstalledPackages($user)
      );
    }
  }

  /**
   * Do a 'Core Init' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doInit(Array $args, Array &$json, Core $inst = null) {
    $init_language    = isset($args['language']) ? $args['language'] : "default";
    $browser_language = self::_getBrowserLanguage();

    if ( $user = $inst->getUser() ) {
      $installed_packages = Package::GetInstalledPackages($user);

      $resources = Array();
      foreach ( Dialog::$Registered as $name => $opts ) {
        foreach ( $opts["resources"] as $res ) {
          $resources[] = $res;
        }
      }

      $json = Array("success" => true, "error" => null, "result" => Array(
        "settings"      => User::getDefaultSettings($installed_packages),
        "cache"         => Array(
          "resources"         => $resources,
          "packages"          => $installed_packages
        ),
        "config"        => Array(
          "sid"               => session_id(),
          "system_language"   => DEFAULT_LANGUAGE,
          "browser_language"  => $browser_language,
          "init_language"     => $init_language,
          "stored_settings"   => $user->settings
        ),
        "user" => $user->getUserInfo()
      ));
    }
  }

  /**
   * Do a 'Core Settings' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSettings(Array $args, Array &$json, Core $inst = null) {
    if ( isset($args['settings']) ) {
      if ( $inst instanceof Core ) {
        if ( isset($args['settings']['locale']) ) {
          $inst->setLocale($args['settings']['locale']);
          $json['success'] = true;
          $json['result']  = true;

          Session::setLocale($args['settings']['locale']);
        }
      }
    }
  }

  /**
   * Do a 'Core Shutdown' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doShutdown(Array $args, Array &$json, Core $inst = null) {
    $settings = isset($args['settings']) ? $args['settings'] : Array();
    $session  = isset($args['session'])  ? $args['session']  : Array();
    $save     = isset($args['save'])     ? ($args['save'] == "true" ? true : false)     : Array();

    $result = Array();
    if ( $save === true ) {
      if ( $user = $inst->getUser() ) {
        $result['saved'] = $user->saveUser($session, $settings);
      }
    }

    $json['result']   = $result;
    $json['success']  = true;

    Session::clearSession();
  }

  /**
   * Do a 'Save Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotSave(Array $args, Array &$json, Core $inst = null) {
    if ( ($inst instanceof Core) && ($user = $inst->getUser()) ) {
      $name     = "";
      $session  = Array();

      if ( isset($args['session']) ) {
        $name     = $args['session']['name'];
        $session  = $args['session']['data'];
      }

      if ( $name && $session ) {
        if ( !($snapshot = Session::snapshotLoad($user, $name)) ) {
          if ( ($snapshot = Session::snapshotSave($user, $name, $session)) ) {
            $json['success'] = true;
            $json['result']  = $snapshot;
          } else {
            $json['error'] = _("Cannot save snapshot. Failed to save in database!");
          }
        } else {
          $json['error'] = _("Cannot save snapshot. Snapshot name already used!");
        }
      } else {
        $json['error'] = _("Cannot save snapshot. No input data given!");
      }
    } else {
      $json['error'] = _("Cannot save snapshot. No running session found!");
    }
  }

  /**
   * Do a 'Load Session Snapshot' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doSnapshotLoad(Array $args, Array &$json, Core $inst = null) {
    if ( ($inst instanceof Core) && ($user = $inst->getUser()) ) {
      $name     = "";
      if ( isset($args['session']) ) {
        $name     = $args['session']['name'];
      }

      if ( $name ) {
        if ( ($snapshot = Session::snapshotLoad($user, $name)) ) {
          $json['success'] = true;
          $json['result']  = $snapshot;
        } else {
          $json['error'] = _("Cannot load snapshot. Failed to load from database!");
        }
      } else {
        $json['error'] = _("Cannot load snapshot. No input data given!");
      }
    } else {
      $json['error'] = _("Cannot load snapshot. No running session found!");
    }
  }

  /**
   * Do a 'User Login' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogin(Array $args, Array &$json, Core $inst = null) {
    $uname = "demo";
    $upass = "demo";
    $time  = isset($args['time']) ? $args['time'] : null;

    if ( isset($args['form']) ) {
      if ( isset($args['form']['username']) ) {
        $uname = $args['form']['username'];
      }
      if ( isset($args['form']['password']) ) {
        $upass = $args['form']['password'];
      }
    }

    $user = null;
    if ( $user = User::getByUsername($uname) ) {
      if ( $user->password == $upass ) {
        $user->last_login       = new DateTime();
        $user->last_session_id  = session_id();
        User::save($user);

        $json['success'] = true;
        $json['result'] = Array(
          "user"    => $user->getUserInfo()
        );
      }
    }

    Session::setUser(($user && ($user instanceof User)) ? $user : null);
  }

  /**
   * Do a 'User Logout' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserLogout(Array $args, Array &$json, Core $inst = null) {
    $json['success']  = true;

    // FIXME
    //Session::setUser(null);
  }

  /**
   * Do a 'User Operation' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doUserOperation(Array $args, Array &$json, Core $inst = null) {
    if ( $user = $inst->getUser() ) {
      $result = null;
      $arg    = isset($args['type']) ? $args['type'] : null;

      switch ( $arg ) {
        default :
          $result = $user->getUserInfo();
        break;
      }

      $json['success'] = true;
      $json['result']  = $result;
    }
  }

  /**
   * Do a 'Application Event' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doApplicationEvent(Array $args, Array &$json, Core $inst = null) {
    if ( ($result = Application::Handle($args['action'], $args['instance'])) ) {
      $json['success'] = ($result === true) || is_array($result);
      $json['error']   = $json['success'] ? null : (is_string($result) ? $result : _("Unknown error"));
      $json['result']  = $json['success'] ? $result : null;
    } else {
      $json['error'] = _("Failed to handle application");
    }
  }

  /**
   * Do a 'Service' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doService(Array $args, Array &$json, Core $inst = null) {
    if ( !class_exists("Service") ) {
      require PATH_LIB . "/Services.php";
    }

    $iargs = $args['arguments'];
    if ( isset($iargs['type']) && isset($iargs['uri']) && isset($iargs['data']) && isset($iargs['options']) && isset($iargs['timeout']) ) {
      if ( $s = Service::createFromType($iargs['type']) ) {
        $uri      = $iargs['uri'];
        $data     = $iargs['data'];
        $timeout  = $iargs['timeout'];
        $options  = $iargs['options'];

        if ( $res = $s->call($uri, $data, $timeout, $options) ) {
          $json['success'] = true;
          $json['error']   = null;
          $json['result']  = $res;
        } else {
          $json['error']   = _("Failed to call Service!");
        }
      } else {
        $json['error']   = _("Failed to construct Service!");
      }
    } else {
      $json['error']   = _("Missing some arguments!");
    }
  }

  /**
   * Do a 'VFS' AJAX Call
   * @see Core::doPost
   * @return void
   */
  protected static final function _doVFS(Array $args, Array &$json, Core $inst = null) {
    $method = $args['method'];
    $argv   = $args['args'];

    if ( method_exists("VFS", $method) ) {
      try {
        $json['result']  = call_user_func_array(Array("VFS", $method), Array($argv));
        if ( ($json['result']) !== false ) {
          $json['success'] = true;
        } else {
          throw new ExceptionVFS(ExceptionVFS::GENERIC, Array($argv));
        }
      } catch ( ExceptionVFS $e ) {
        $json['success'] = false;
        $json['error'] = $e->getMessage();
      }
    }
  }

  /**
   * Get browser language by looking at headers
   * @return String
   */
  protected static final function _getBrowserLanguage() {
    $browser_language = DEFAULT_LANGUAGE;

    if ( function_exists('apache_request_headers') ) {
      if ( $headers = apache_request_headers() ) {
        if ( isset($headers["Accept-Language"]) ) {
          if ( $langs = explode(",", $headers["Accept-Language"]) ) {
            $browser_language = reset($langs);
            $browser_language = explode(";", $browser_language);
            $browser_language = str_replace("-", "_", end($browser_language));
          }
        }
      }
    }

    return $browser_language;
  }

  /////////////////////////////////////////////////////////////////////////////
  // SETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Set the User of current session
   * @param   User    $u      User Object (or NULL)
   * @return  void
   */
  protected function setUser(User $u = null) {
    $this->_oUser = $u;
  }

  /**
   * Set the current session locale
   * @param   Array     $locale       Locale
   * @return  Array
   */
  protected function setLocale(Array $locale = null) {
    if ( is_array($locale) ) {
      $this->_aLocale = $locale;
    } else {
      $this->_aLocale = Array(
        "locale_location" => SettingsManager::$Settings['system.locale.location']['value'],
        "locale_date"     => SettingsManager::$Settings['system.locale.date-format']['value'],
        "locale_time"     => SettingsManager::$Settings['system.locale.time-format']['value'],
        "locale_stamp"    => SettingsManager::$Settings['system.locale.timestamp-format']['value'],
        "locale_language" => SettingsManager::$Settings['system.locale.language']['value']
      );
    }

    date_default_timezone_set($this->_aLocale["locale_location"]);

    //
    // i18n
    //

    if ( ENABLE_GETTEXT ) {
      // Figure out language
      $lang = $this->_aLocale["locale_language"];
      if ( $lang == "default" ) {
        $lang = self::_getBrowserLanguage();
      }

      $ulang = "{$lang}.utf8";
      if ( !defined("LC_MESSAGES") ) {
        define("LC_MESSAGES", $lang);
      }

      // Env locale
      putenv("LANG={$ulang}");
      putenv("LANGUAGE={$ulang}");
      putenv("LC_ALL={$ulang}");

      // System locale
      setlocale(LC_ALL,       $ulang);
      setlocale(LC_MESSAGES,  $ulang);
      setlocale(LC_CTYPE,     $ulang);

      // Gettext locale
      bind_textdomain_codeset(GETTEXT_DOMAIN, "UTF-8");
      bindtextdomain(GETTEXT_DOMAIN, PATH_LOCALE);
      textdomain(GETTEXT_DOMAIN);
    }

    return $this->_aLocale;
  }

  /////////////////////////////////////////////////////////////////////////////
  // GETTER FUNCTIONS
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Get the current session user
   * @return User
   */
  public final function getUser() {
    return $this->_oUser;
  }

  /**
   * Get the current session locale
   * @return Array
   */
  public final function getLocale() {
    $loc  = $this->_aLocale;
    $lang = $loc["locale_language"];
    if ( $lang == "default" ) {
      $lang = self::_getBrowserLanguage();
    } else {
      $lang = "{$lang}";
    }

    $loc['locale_language'] = $lang;

    return $loc;
  }

}

?>
