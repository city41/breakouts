
/**
* The containing Breakout blueprint game file.
* 
* This file is only used to initalise (start-up) the main Kiwi Game 
* and add all of the relevant states to that Game.
*
*/

//Initialise the Kiwi Game. 
var game = new Kiwi.Game('content', 'BreakOut', null, {width: 320, height: 416 });

//Add all the States we are going to use.
game.states.addState(LoadingState);
game.states.addState(IntroState);
game.states.addState(BreakOutState);
game.states.addState(GameOverState);
game.states.addState(GameCompleteState);

//Switch to/use the Preloader state. 
game.states.switchState("LoadingState");