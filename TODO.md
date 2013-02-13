# Node.js
* Glade parser and package compiler conversion from old codebase
  - Finish up create-project also
* Translations (i18n)
* Syslog messages in API etc.
* System Server/Client
  - Totally broken after changes!
    Create a dummy server that just fires up a new client
    using WebSocket
* Client
  - WebSocket client (src/client_socket.js)
  - file:// resources (last)
* Misc
  - New error handling
  - Optimizations
  - TODO and FIXME spread around the code
  - Fix crashes on non-existent user directories/files (.osjs etc)
    also Update dirs on login
* Archive
  - bzip
  - tar
  - jar
  - rar

# Frontend
* Implement IconView in launch dialog
* Theme Packages - Use ui.js generateThemeCSS() css tuple to generate sheets
* Finish up adding/removing panels, etc
* Implement new flexbox model
* Richtext: Add custom contextmenu
* Replace jQuery with a drop-in replacement somehow

# Packages
* ApplicationMusicPlayer - Needs some work
* ApplicationArchiver - Not even close to done
* ApplicationMail - Needs testing (Also: Convert to node.js)
* ApplicationIRC - !?!?!?! (Also: Convert to node.js)
* ApplicationIDE
* Add some more base packages
