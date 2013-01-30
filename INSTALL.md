This has only been tested on these Linux distributions:
* Gentoo Linux
* Ubuntu Linux

# Backend Dependencies:

* Node.js with modules (see `package.json`)
* 'exiftool'  
  Debian users: `apt-get install exiftool`  
  Gentoo users: `emerge exiftool`  
  Download: `http://www.sno.phy.queensu.ca/~phil/exiftool/`  
* 'pdf2svg' (Optional, for use with PDF applications)  
  Debian users: `apt-get install pdf2svg`  
  Gentoo users: `emerge pdf2svg`  
  Download: `http://www.cityinthesky.co.uk/opensource/pdf2svg`  
* _ffmpeg_ (Optional, for converting samples from OGG to MPEG)  
  Download: `http://ffmpeg.org/download.html`

# Frontend Dependencies:
* jQuery and jQuery UI
* Yahoo YUI Compressor or Google Closure Compiler
* JSON2 by Douglas Crockford (Git submodule)
* Sprintf by Alexandru Marasteanu (Git submodule)
* Gnome 2.x icon pack(s) (Git submodule)
* Freedesktop Sound Theme (Git submodule)

# Manual Installation:
* Clone repository 'git clone --recursive -b node.js git@github.com:andersevenrud/OS.js.git'
* Set up `config.js`
* Place jQuery dependencies into `vendor/`` (see symlinks in `public_html/vendor`)
  - `http://code.jquery.com/jquery-1.7.1.min.js`
  - `http://jqueryui.com/download/jquery-ui-1.8.17.custom.zip`
* Run `npm install`
* Compile and install all applications
  - `./bin/compile-all`
  - ``./bin/install-all`
* Create users
  - Add yourself a new user to test with using `./bin/add-user <username>`.
  - Or copy 'src/template/vfs-user/.osjs' into users already on system
* Start server
  - Run `node main.js`
  - You are up and running on 'http://localhost:3000' :)

## Running a production envoironment
* **ALTERNATIVE 1** Download **Yahoo YUI Compressor**
  - `http://developer.yahoo.com/yui/compressor/`  
  - Drop `jar` file into `vendor/yui-compressor`  
  - Synmlink/copy/move the jar to `vendor/yui-compressor/yuicompressor.jar`
* **ALTERNATIVE 2** Download **Google Closure Compiler**
  - `https://developers.google.com/closure/`
  - Drop `jar` file into `vendor/closure-compiler/`  
  - Set 'COMPRESSOR' to 'gcc' in `config.js`
* Run `./bin/update-compression` to compress all scripts etc
* Set 'ENV_PRODUCTION' in `config.js` and restart node-server
