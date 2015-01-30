/**
* The Loading State is going to be used to load in all of the in-game assets that we need in game.
*
* Because in this blueprint there is only a single "BreakOut" section we are going to load in all of 
* the assets at this point.
*
*/

/**
* Since we want to use the custom Kiwi.JS loader with the bobbing kiwi/html5 logo and everything. We need to extend the KiwiLoadingScreen State.  
* The KiwiLoadingScreen State is an extentsion of a normal State but it has some custom code to handle the loading/bobbing/fading of all the items, so if you override a method (like the preload) for example just make sure you call the super method.
* 
* The parameters we are passing into this method are as ordered.
* 1 - name {String} Name of this state.
* 2 - stateToSwitch {String} Name of the state to switch to AFTER all the assets have loaded. Note: The state you want to switch to should already have been added to the game.
* 3 - dimensions {Object} A Object containing the width/height that the game is to be. For example {width: 1024, height: 768}
* 4 - subfolder {String} The folder that the loading graphics are located at. 
*/
var LoadingState = new KiwiLoadingScreen('LoadingState', 'IntroState', { width: 320, height: 416 }, 'assets/img/loading/');

/**
* This preload method is responsible for preloading all your in game assets.
* @method preload
* @private
*/
LoadingState.preload = function () {
    
    //Make sure to call the super at the top.
    //Otherwise the loading graphics will load last, and that defies the whole point in loading them. 
    KiwiLoadingScreen.prototype.preload.call(this);
    
    //graphics
    //this.addSpriteSheet('tiles', 'assets/img/tileset.png', 48, 48);
    this.addImage('bg', 'assets/img/bg_prerendered.png');
    this.addImage('logo', 'assets/img/logo.png');

    this.addTextureAtlas('tiles', 'assets/img/tiles.png', 'tileJSON', 'assets/textureAtlas.json');

    //audio
    //detect browser audio support
    if(Kiwi.DEVICE.mp3){
        this.addAudio('brickDeath', 'assets/sfx/mp3/brickDeath.mp3');
        this.addAudio('countdownBlip', 'assets/sfx/mp3/countdownBlip.mp3');
        this.addAudio('powerdown', 'assets/sfx/mp3/powerdown.mp3');
        this.addAudio('powerup', 'assets/sfx/mp3/powerup.mp3');
        this.addAudio('recover', 'assets/sfx/mp3/recover.mp3');
    } else {
        this.addAudio('brickDeath', 'assets/sfx/wav/brickDeath.wav');
        this.addAudio('countdownBlip', 'assets/sfx/wav/countdownBlip.wav');
        this.addAudio('powerdown', 'assets/sfx/wav/powerdown.wav');
        this.addAudio('powerup', 'assets/sfx/wav/powerup.wav');
        this.addAudio('recover', 'assets/sfx/wav/recover.wav');
    }

    this.game.stage.canvas.style.cssText = "idtkscale:ScaleAspectFit";
};