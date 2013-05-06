# OS.js X11 Standalone package source
This is Work in Progress! Currently compatible with Ubuntu and Gentoo.
Need to write documentation for this...

## User configuration
By default the user 'osjs' is used. Make sure it has access to all groups
that is required to run X, mount devices, use graphics, etc.

## Installation methods

### Using XDM
This package includes a Slim configuration and theme.
Make sure to use the included xinitrc's

### Using built-in login manager
Add and start the rc.d service. In this case do not use the ~/.xinitrc file
