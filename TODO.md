# NODE.JS:
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

## PACKAGE CONVERSION (EVENT API):
* ApplicationIDE (Not done yet anyways)
* ApplicationMail
* ApplicationServerStatus (This is some old test stuff, but convert anyway)

# JS:
[HIG] Implement IconView in launch dialog
[MED] Theme Packages - Use ui.js generateThemeCSS() css tuple to generate sheets
[MED] Finish up adding/removing panels, etc
[MED] Implement new flexbox model
[LOW] Richtext: Add custom contextmenu
[LOW] Replace jQuery with a drop-in replacement somehow

# BACKEND:
* Finish archives in VFS (more than zip)

# PACKAGES:
* ApplicationMusicPlayer - Needs some work
* ApplicationArchiver - Not even close to done
* ApplicationMail - Needs testing
* ApplicationIRC - !?!?!?!
* Add some more base packages

# MISC:
* Rebuild repository
