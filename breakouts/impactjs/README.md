#Breakouts -- ImpactJS

http://www.impactjs.com

##Commercial Note
ImpactJS is a commercial library requiring a license to develop with. Therefore you can't play with this Breakout unless you have a license and can provide your own copy of Impact. All of the Impact files in `impact/`, `weltmeister/` etc are not in this repo. In other words, the files look like this:

    lib/
      game/
        ... all JS files for Breakout itself ...
    media/
       ... all graphics and sounds ...
    index.html   <-- load this in your browser

But would need to look like this before it will run:

    lib/
      game/
        ... all JS files for Breakout itself ...
      impact/   <-- ImpactJS itself
      weltmeister/   <-- weltmeister, the level editor
    media/
    tools/     <-- misc tools that come with Impact
       ... all graphics and sounds ...
    index.html   <-- load this in your browser
    weltmeister.html   <-- load this in your browser to edit levels

## Impact ideally needs PHP
You can easily run the game itself without a local webserver, but Weltmeister has a small PHP dependency thus needs a server with PHP to run properly.  

If you are on OSX, the easiest way to get Weltmeister up is to set everything up at `~/Sites/breakout`, then you can get to Weltmeister at `http://localhost/~yourUserName/breakout/weltmeister.html`

### Or Node.js

A more recent alternative is [impact-weltmeister](https://github.com/namuol/node-impact-weltmeister). It replaces the PHP dependency with Node and is pretty easy to get setup.
