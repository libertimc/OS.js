This has only been tested on these Linux distributions:
* Gentoo Linux
* Ubuntu Linux

# Backend Dependencies:
* Node.js 0.8+
* _exiftool_
* _pdf2svg_ (Optional, for use with PDF applications)
* _ffmpeg_ (Optional, for converting samples from OGG to MPEG)

# Frontend Dependencies:
* jQuery and jQuery UI
* Yahoo YUI Compressor _or_ Google Closure Compiler (For production environments)

# Automatic Installation:
* Clone repository
  - `git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git`
* Start installer
  - `./bin/installer`

# Manual Installation:
* Clone repository
  - `git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git`
* Install Node dependencies
  - `npm install`
* Install Packages from vendor repository
  - `./bin/install-all`
* Create users
  - Add yourself a new user to test with using `./bin/add-user <username>`.
  - Or copy `src/template/vfs-user/.osjs` into users already on system
* Install system service (Optional)
  - Located in doc/rc.d

# Running:

## Testing
* Run 'sudo node ./server.js'
* Launch browser in 'localhost:3000'
* Kill the server like normal to quit all running clients

## Development
* For development you can start the client fo your user with:
  'node ./client.js 3000 `whoami`'

## Production evironment
* **ALTERNATIVE 1: ** Yahoo YUI Compressor
  - `http://developer.yahoo.com/yui/compressor/
  - Drop `jar` file into `vendor/yui-compressor
  - Synmlink/copy/move the jar to `vendor/yui-compressor/yuicompressor.jar`
* **ALTERNATIVE 2: ** Google Closure Compiler
  - `https://developers.google.com/closure/`
  - Drop `jar` file into `vendor/closure-compiler/`
  - Set `COMPRESSOR` to `gcc` in `config.js`
* Set your compressor of choice in `config.js`
  - gcc: Google Closure Compiler
  - yui: Yahoo Compressor
* Run `./bin/update-compression` to compress all scripts etc
* Set `ENV_SYSTEM` to _production_ in `config.js` and restart node-server
* Start system-wide service (or start using `sudo node server.js`)

## Standalone / WebSocket
* Set `ENV_STANDALONE` in `config.js`

# Upgrading
* `git pull`
* `git submodules update`
* `npm install`
* `./bin/install-all`
* Check (and correct) user ~/.osjs directories (This is temporary, you need directories located in src/templates/vfs-user/.osjs)
* Restart server/clients
