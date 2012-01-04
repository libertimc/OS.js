<?php
/*!
 * @file
 * User.class.php
 * @author Anders Evenrud <andersevenrud@gmail.com>
 * @license GPLv3 (see http://www.gnu.org/licenses/gpl-3.0.txt)
 * @created 2012-01-04
 */

/**
 * User -- Application User Class
 *
 * @author  Anders Evenrud <andersevenrud@gmail.com>
 * @package OSjs.Sources.Core
 * @see     DBObject
 * @class
 */
class User extends DBObject {

  public static $Table = "user";
  public static $Columns = Array(
    "id"          => "int",
    "username"    => "str",
    "password"    => "str",
    "privilege"   => "int",
    "real_name"   => "str",
    "created_at"  => "date"
  );
}

?>
