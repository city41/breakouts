#Breakouts -- melonJS

##About melonJS
melonJS is a free and lightweight HTML5 game engine, that fully 
integrates the TMX Tiled map format (www.mapeditor.org), allowing
to easily design levels using the powerful Tiled map editor, and 
to focus on the game features.

melonJS is an open-source HTML5 game engine, released under the 
MIT license, and built in the spirit of a community based project.

Useful links:

- Official Website: www.melonjs.org
- Documentation : www.melonjs.org/docs/index.html
- Tutorial: www.melonjs.org/tutorial/index.html
- Source : https://github.com/melonjs/melonjs

##Breakout Status
first version with all features implemented (including power-up/power-down)
globally working, though it might requires some tweaks.

##Notes:
* tested and working on all recent major browsers (including audio)
* optimized (through specific settings) for mobile/table device
  (tested & running on iPhone4 & iPad2)
* audio is disabled on mobile devices
* additional fadeIn/fadeOut effect have been used for transition
* all levels (including the title screen) have been fully designed using Tiled


##Running the game locally (as opposed to from a website)
Due to the "cross-origin request" security mechanism implemented, 
most browsers will complain when trying to load the game locally. 
On Chrome, the "--disable-web-security" parameter or better 
"--allow-file-access-from-files" can be used when launching the 
browser in order to deactivate the security policy check.
