#Breakouts -- Implementation Guidelines

So you want to contribute another engine to Breakouts? Awesome! Here's how to do it...

## Before You Start
I have no idea if Breakouts will take off and become popular. But if it does, maybe contact me first to make sure someone else isn't already working on the engine you had in mind? I'm at [matt.e.greer@gmail.com](mailto:matt.e.greer@gmail.com) or [on Twitter](http://twitter.com/cityfortyone)  
  
You can also check out the [incoming implementations wiki page](https://github.com/city41/breakouts/wiki/Incoming-Implementations) to see which versions are coming or claimed.
  
## Engines We're Looking For

Currently we are only looking for JavaScript engines that focus on 2D games. It doesn't matter how popular or finished the engine is, as long as you can write the game in JavaScript and come up with an implementation that is on par with the existing ones.  
  
Please don't write your implementation in anything but JavaScript. The point is to get to know the engines, and having implementations in different languages clouds the comparison. So yeah, please no CoffeeScript, TypeScript, anything like that.  
  
On a similar note, we're not *yet* interested in systems that compile down to JavaScript, like HaXe or XNA to JavaScript compilers. I think we do want to expand into these at some point, and there has been some interest shown to do this. If you have such a system and want to be the guinea pig to see what it means/takes to get a Breakout implementation in for it, please contact me.
  
Oh and commercial engines are just fine. Just be sure to note they are commercial in your README (see **Supply A Good README** below).

## Target Platforms
The main platforms we are shooting for are desktop machines running modern browsers (IE9 or 10 and better, Chrome, Firefox, Safari, etc). We also really want to hit mobile devices when we can, see the **Mobile Devices** section below

## Implementing The Game

Be sure to use the provided [resources](https://github.com/city41/breakouts/tree/master/resources)

For the most part, if you just check out the [existing implementations](http://city41.github.com/breakouts) and make sure to do everything they do, you should be all set. Here are a few details to keep in mind:

* There is a power up item that adds another ball, ala multiball in pinball. The player doesn't lose a life until he misses all of the balls in the playing field
* There is also a power down item that shrinks the paddle to 2/3's its full size. This wears off after 10 seconds
* There are a good number of sound effects: hitting a brick, powering up, powering down, power down wearing off, and the countdown's "blip"
* The game is entirely mouse driven.
* The background can be prerendered or use tiles (or both). See "The Background" section in the [resources](https://github.com/city41/breakouts/tree/master/resources) README

## Mobile Devices

If your engine is mobile friendly, please make your implementation work on mobile devices. The [Impact version](http://city41.github.com/breakouts/impactjs/index.html) is a good example of this (try it on an iOS or Android device). If there are any limitations for mobile devices, that's fine. For example the Impact version has no sound effects when played on a mobile device.

## Take Advantage Of Your Engine
If your engine can do a part of the game in a better way than prescribed, but has the same overall result, please do it. For example, the Impact and Crafty versions use frame animation for when a brick disappears. But the Lime version uses its scaling action to accomplish the same effect, but does it better. Stuff like that is great, please point out the good things your engine can do!

## Tests?
Writing tests for your implementation is totally up to you. In my opinion they aren't needed, so unless you insist probably don't bother.

## Supply A Good README

This is important. For your implementation, add a good README file to its root directory. This README should ideally cover:

* Homepage for the engine, and open source repository location for it (if applicable)
* How/where/how much to purchase a license for the engine if it's commercial
* What people need to do to get your implementation up and running on their machine
* Anything special or unique that this implementation does

And anything else you think is important.

## Submitting Your Implementation
Just send us a pull request. We'll go from there.


## Thanks!
Thanks for contributing to the project, it's greatly appreciated!

