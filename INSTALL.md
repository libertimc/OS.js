This has only been tested on these Linux distributions:
* Gentoo Linux
* Ubuntu Linux

# Backend Dependencies:
* node.js 0.8+ and npm
* PAM development libraries (libpam0g-dev on debian)
* syslog-ng
* sudo to use administration utilities
* _pdf2svg_ and _exiftool_ (Optional, for use with PDF applications)

# Installation:
* Clone repository
  - `git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git`
* Start installer
  - `./bin/installer`
* Create users
  - Add yourself a new user to test with using `./bin/add-user <username>`.
  - OR run `./bin/update-user-template <username>` on already existing users

# Upgrading:
* Run `git pull && git submodules update`
* `npm install`
* `./bin/install-all`
* Update user templates with `./bin/update-user-template <username>`
* Restart server/clients

# Running:

## Development
* For development you can start the client for your user with:
  `node ./client.js 3000 $(whoami)` (Do **not** run as root!)

## Testing
* Run `sudo node ./server.js`
* Launch browser in `localhost:3000`
* Kill the server like normal to quit all running clients

## Standalone
* Set `ENV_STANDALONE` in `config.js`
* Install system service
  - Located in `doc/rc.d`
  - Start system-wide service
* OR start using `./bin/launch-server` using `forever`, `screen` or similar

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
