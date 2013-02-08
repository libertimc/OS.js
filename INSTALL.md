# Compability:
Tested on these Linux distributions:
* Gentoo Linux
* Ubuntu Linux (Help: https://gist.github.com/andersevenrud/4723377)

# Dependencies:
* _bash_
* _node.js_ 0.8+ with _npm_ and _node-gyp_
* _git_ 1.6+
* _PAM_ development libraries (debian users: see help file above)
* _syslog-ng_
* _sudo_ to use administration utilities
* _pdf2svg_ and _exiftool_ (Optional, for use with PDF applications)

# Installation:
* Set up your GitHub account and SSH key correctly
* Clone repository
  - `git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git`
* Start installer
  - `./bin/installer --install`
* Create users
  - Add yourself a new user to test with using `./bin/add-user <username>`.
  - OR run `./bin/update-user-template <username>` on already existing users
* Configure settings and environment (optional)
  - Some are noted further down in this file

# Upgrading:
* Run `./bin/installer --update`
* Update user templates with `./bin/update-user-template <username>`
* Restart server/clients

# Running:

## Testing and Development
* Start the client for your user with:
  `node ./client.js 3000 $(whoami)` (Do **not** run as root!)
* Launch browser in [http://localhost:3000](http://localhost:3000)

## System
**Not done in this branch**

### As web server
* Start using `./bin/launch-server` using `forever`, `screen` or similar
* Launch browser in [http://localhost:3000](http://localhost:3000)

### As system service
* Set `ENV_LOCALHOST` in `config.js`
* Install system services
  - Located in `doc/rc.d`
* Start server service
* Start client service

# Running with compressed (and cached) resources:
This also disables debugging messages and performs some optimizaions.
Runs a bit faster than normal, but harder to track down bugs.

* Set your compressor of choice in `config.js`
  - _gcc_: Google Closure Compiler (Manual download)
  - _yui_: Yahoo Compressor
* Run `./bin/update-compression` to compress all scripts etc
* Set `ENV_SETUP` to _production_ in `config.js`
* Restart server/clients

## Font cache
You can cache installed system fonts to improve rendering performance in some browsers.
All fonts will be served directly in the CSS scheme as base64 data instead of linking
to a file by URI.

Just run `./bin/update-fontcache` and fonts will be automatically loaded from cache
on demand.

# Choosing Authentication module
The default authentication method is PAM. You can change which module to use
in `config.js` setting `AUTHENTICATION`.

**Included:** `pam`, `dummy` (a dict of username/password)

# Choosing Communication mode
**Not done in this branch**

You can switch between XHR and WebSockets with the `ENV_WEBSOCKETS` setting
in `config.js`.
