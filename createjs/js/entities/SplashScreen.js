/**
 * Init screen class
 */

 var SplashScreen = function(background, logo, world){
	 this.initialize(background, logo, world);
  }
  
  SplashScreen.prototype.initialize = function(background, logo, world){
	 this.background = background;
	 this.logo = logo;
	 this.game = world;
	 this.clickText = new createjs.Text("Click here to start", "24px Arial", '#000');
	 this.clickText.hitArea = new createjs.Shape();
	 this.clickText.hitArea.graphics.beginFill('#000').drawRect(0, 0, this.clickText.getMeasuredWidth(), this.clickText.getMeasuredHeight());
	 this.instructions = new createjs.Text("During the game: use R/L\narrows keys to skip levels", "24px Arial", '#000'); 
	 this.createScreen();
  }
  
  SplashScreen.prototype.createScreen = function(){
	  var back = new createjs.Bitmap(this.background);
	  this.game.stage.addChild(back);
	  var logo = new createjs.Bitmap(this.logo);
	  var stageDim = this.game.stage.getBounds();
	  var logoDim = logo.getBounds();
	  this.instructions.maxWidth = stageDim.width - 30
	  logo.x = (stageDim.width/2) - (logoDim.width/2)
	  logo.y = 30;
	  var clickDim = this.clickText.getBounds();
	  var instDim = this.clickText.getBounds();
	  this.clickText.y = logo.y + logoDim.height + 30;
	  this.clickText.x = (stageDim.width/2) - (clickDim.width/2);
	  this.instructions.x = 20;
	  this.instructions.y = stageDim.height - 50;
	  this.game.stage.addChild(logo);
	  //add Text
	  this.game.stage.addChild(this.clickText);
	  this.game.stage.addChild(this.instructions);
	  this.game.stage.update();
	  
	  //wait for Click
	   this.clickText.addEventListener("click", this.game.reinit );
  }
