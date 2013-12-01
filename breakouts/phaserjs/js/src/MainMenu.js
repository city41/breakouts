
BasicGame.MainMenu = function (game) {

	this.music = null;
    this.logo = null;
	this.playButton = null;
    this.gameMessageText = null;
    this.gameMessageSecondLineText = null;
    this.gameMessageInfoText = null;

};

BasicGame.MainMenu.prototype = {

	create: function () {

		//	We've already preloaded our assets, so let's kick right into the Main Menu itself.
		//	Here all we're doing is playing some mu
		//
		//     game.load.image('bg', 'assets/images/bg_prerendered.png');    game.load.image('bg', 'assets/images/bg_prerendered.png');    game.load.image('bg', 'assets/images/bg_prerendered.png');sic and adding a picture and button
		//	Naturally I expect you to do something significantly better :)

        this.game.add.sprite(0, 0, 'bg');

        //Add logo
		this.logo = this.add.sprite(this.game.world.centerX, 140, 'logo');
        this.logo.anchor.setTo(0.5, 0.5);

        //add text
        this.gameMessageText = this.add.text(this.game.world.centerX, 280, 'click to start', { font: "20px Arial", fill: "#000000", align: "center" });
        this.gameMessageText.anchor.setTo(0.5, 0);

        //add text
        this.gameMessageText = this.add.text(	this.game.world.centerX, 340, 'during the game use: L/R arrow', { font: "20px Arial", fill: "#000000", align: "center" });
        this.gameMessageText.anchor.setTo(0.5, 0);

        //add text
        this.gameMessageSecondLineText = this.add.text(	this.game.world.centerX, 370, 'keys to skip level ', { font: "20px Arial", fill: "#000000", align: "center" });
        this.gameMessageSecondLineText.anchor.setTo(0.5, 0);

        //add a click handler
        this.game.input.onDown.add(this.click, this);

		//this.playButton = this.add.button(320, 416, 'playButton', this.startGame, this, 'buttonOver', 'buttonOut', 'buttonOver');

	},

	update: function () {

		//	Do some nice funky main menu effect here

	},

	startGame: function (pointer) {

		//	Ok, the Play Button has been clicked or touched, so let's stop the music (otherwise it'll carry on playing)
		//this.music.stop();

		//	And start the actual game
		//this.game.state.start('Game');

	} ,

    click: function(x, y, timedown) {
        //console.log("CLICK IS MADE");
        //	And start the actual game
        this.game.state.start('Game');
    }

};
