This has only been tested on these Linux distributions:
* Gentoo Linux
* Ubuntu Linux

# Backend Dependencies:

* Node.js with modules (see `package.json`)
* _exiftool_
  - Debian users: `apt-get install exiftool`  
  - Gentoo users: `emerge exiftool`  
  - Download: `http://www.sno.phy.queensu.ca/~phil/exiftool/`  
* _pdf2svg_ (Optional, for use with PDF applications)  
  - Debian users: `apt-get install pdf2svg`  
  - Gentoo users: `emerge pdf2svg`  
  - Download: `http://www.cityinthesky.co.uk/opensource/pdf2svg`  
* _ffmpeg_ (Optional, for converting samples from OGG to MPEG)  
  - Download: `http://ffmpeg.org/download.html`

# Frontend Dependencies:
* jQuery and jQuery UI
* Yahoo YUI Compressor _or_ Google Closure Compiler
* JSON2 by Douglas Crockford (_Git submodule_)
* Sprintf by Alexandru Marasteanu (_Git submodule_)
* Gnome 2.x icon pack(s) (_Git submodule_)
* Freedesktop Sound Theme (_Git submodule_)

# Manual Installation:
* Clone repository
  - `git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git`
* Place jQuery dependencies into `vendor/` (see symlinks in `public_html/vendor`)
  - `http://code.jquery.com/jquery-1.7.1.min.js`
  - `http://jqueryui.com/download/jquery-ui-1.8.17.custom.zip`
* Install Node dependencies
  - `npm install`
* Compile and install all applications
  - `./bin/compile-all`
  - `./bin/install-all`
* Create users
  - Add yourself a new user to test with using `./bin/add-user <username>`.
  - Or copy `src/template/vfs-user/.osjs` into users already on system
* Start server
  - Run `node main.js`
  - You are up and running on `http://localhost:3000` :)

## Running a production envoironment
* **ALTERNATIVE 1: ** Yahoo YUI Compressor
  - `http://developer.yahoo.com/yui/compressor/
  - Drop `jar` file into `vendor/yui-compressor
  - Synmlink/copy/move the jar to `vendor/yui-compressor/yuicompressor.jar`
* **ALTERNATIVE 2: ** Google Closure Compiler
  - `https://developers.google.com/closure/`
  - Drop `jar` file into `vendor/closure-compiler/`
  - Set `COMPRESSOR` to `gcc` in `config.js`
* Run `./bin/update-compression` to compress all scripts etc
* Set `ENV_PRODUCTION` in `config.js` and restart node-server

# IMPORTANT INFORMATION ABOUT THIS BRANCH -- HOW TO RUN

You can only run as a designated user at this moment because XHR calls
are not finished.

* Set the user you will use in 'config.js' in 'CLIENT_USER_TMP'.
* Run 'sudo node ./server.js'
* Launch browser in 'localhost:3000'
  - You will be redirected to your process
* Kill the server like normal to quit all running clients

