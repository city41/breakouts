Enchant.js Breakout
==============

This is an enchant.js implementation of the classic Breakout game created for the JavaScript [Breakouts](http://www.jsbreakouts.org/) project. A comparison of different JS game engines.

[Enchant.js](http://enchantjs.com/) is "A simple JavaScript framework for creating games and apps".

It is open source (MIT license).

*Line 5662 of the enchant.js file has been changed from 
this.src.disconnect(this.connectTarget);
to
this.src.disconnect();
which stops Chrome from crashing with the following error:
Uncaught InvalidAccessError: Failed to execute 'disconnect' on 'AudioNode':
*
