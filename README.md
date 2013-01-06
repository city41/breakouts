![logo](https://raw.github.com/city41/breakouts/master/logo.png)

## Helping You Select a JavaScript Game Engine

**tl;dr** Breakouts is to JavaScript game engines what [TodoMVC](http://addyosmani.github.com/todomvc/) is to JavaScript MV\* frameworks.

There are a lot of JavaScript game engines out there, the JavaScript wiki lists [over 80 of them](https://github.com/bebraw/jswiki/wiki/Game-Engines). This project is an attempt to get some insight into the engines out there. This was done by implementing a simple version of the game Breakout in various engines. With the implementations in hand, you can compare and contrast and play with the engines to help get a feel for whether you like them or not.

## Breakouts So Far

So far we have Breakout implementations for

* [CraftyJS](http://www.craftyjs.com)
* [ImpactJS](http://www.impactjs.com)
* [LimeJS](http://www.limejs.com)

Yup, just three so far, this project is pretty young.

## About Breakout

The Breakouts generally look like this:

![screenshot](https://raw.github.com/city41/breakouts/master/breakoutScreenshot.png)

and feature:

* player input (mouse for desktop, touch for mobile)
* frame animation
* scene transitions (menus, game over, etc)
* sound effects
* hit detection
* text rendering
* tiled backgrounds

## Play the Breakouts

All of the Breakouts are up and playable at this project's [website](http://city41.github.com/breakouts)

### Turning on or off prerendering the background

It's interesting to see an engine's support for tiles, so all the implementations can load the background via tiles. By default though, they load a prerendered background image for better performance. To turn on use of tiles, add `usetiles` to the URL, for example:

* http://city41.github.com/breakouts/craftyjs/index.html   <---- will use a prerendered background
* http://city41.github.com/breakouts/craftyjs/index.html?usetiles   <---- will create the background via individual tiles

**NOTE:** A mobile device will always use the prerendered background, even if `usetiles` is set. Tiles on mobile devices tend to kill performance quite a bit

## Contribute

If you would like to contribute a Breakout implementation, great! Please head over to [the implementation guidelines](https://github.com/city41/breakouts/blob/master/ImplementationGuidelines.md) to get started.

## Todo

A major gap is mobile devices. I only have iOS devices, so these games have had no loving for Android or anything else yet. If you find anything wrong on your mobile device with these games, please file a bug.


## License

All of the various engines have their own licenses, but the Breakout code itself (and the resources) is MIT licensed. Generally speaking, feel free to do whatever you want with it.

## Thanks!

Thanks to Addy Osmani, Sindre Sorhus and everyone else involved with TodoMVC for the idea and inspiration





