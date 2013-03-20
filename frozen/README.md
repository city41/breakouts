# Breakouts -- FrozenJS

http://frozenjs.com

##Status

Working implementation using FrozenJS.

Notes:
* Uses Box2d to handle physics calculations.
* src/game.js is the starting point if you want to read the code.
* Source is written with AMD
* Demo loads compressed JS
* Can be run with an AMD loader, or built into a single file.

Working:
* Tested in IE10, Chrome, Firefox, Chrome for Android, Safari
* Sound on desktop and mobile (except iOS 6 with WebAudio)
* Scaling on mobile

Not Working:
* Tile support not implemented
* Firefox for Android touch not working (Ticket in to Mozilla, workaround coming in Dojo)
* WebAudio on iOS 6