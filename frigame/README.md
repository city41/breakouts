# Breakouts -- friGame

##About friGame
friGame is a game development library in JavaScript/jQuery. It allows to
create 2D games that run in any modern web browser without having to rely
on external plugins such as Flash.

It started as a porting of the excellent gameQuery library by Selim Arsever
in order to use the HTML5 <canvas> element, but it has developed since then
its own set of unique features.

Web: http://www.frigame.org/
Documentation: http://www.frigame.org/docs.html
Source: https://bitbucket.org/bugnano/frigame

##Breakout Status
The game is pretty feature complete, but it does not currently implement tiled
backgrounds, and it has not been tested on mobile devices

##Notes:
* Implements both a DOM version, with soundmanager2 support for sound, which means
  that sound can be supported on older browser that do not support the HTML5 audio
  element, but support flash (tested and fully working on IE8), and a canvas version
  with only HTML5 audio support
* Tested and working on all major desktop browsers (including older ones, like IE8)
* Not tested on mobile/table device
* Show's off the container support by scaling in the Bricks on each level
* Did not implement Tile support
* friGame does not try to duplicate functionality already found in jQuery. This
  implies that the text rendering is not addressed by friGame, but instead is done
  by adding div elements with the appropriate text, and styled using css. For the
  same reason the input events are done using jQuery.
* Implements a pause/unpause functionality by pressing the P key

##Running the game locally (as opposed to from a website)
Due to security restrictions, the soundmanager2 plugin will not work if the page is
loaded locally. In order to have sound support via flash, the page must be loaded
via a web server.

