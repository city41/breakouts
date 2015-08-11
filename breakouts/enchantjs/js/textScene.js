//game over scene
var textScene = Class.create(Scene, {
  initialize: function(text) {
    Scene.apply(this);
    var game = enchant.Game.instance;

    score = 0;
    level = 1;
    lives = 3;

    //background
    var bg = new Sprite(gameWidth,gameHeight);
    bg.image = game.assets['resources/bg_prerendered.png'];
    this.addChild(bg);

    //breakout image
    var logo = new Sprite(131,200);
    logo.image = game.assets['resources/logo.png'];
    logo.x = this.width/2 - logo.width/2;
    logo.y = 20;
    logo.tl.fadeOut(0).fadeIn(50);
    this.addChild(logo);

    //text
    var label = new Label('Click here to start<br>Use L/R arrow to change levels');
    label.textAlign = 'center';
    label.x = 0;
    label.y = this.height/2 + 48;
    label.color = 'black';
    var label2 = new Label(text);
    label2.x = 0;
    label2.y = this.height - 40;
    label2.color = 'black';
    label2.textAlign = 'center';
    label2.font = '32px monospace';
         
    this.addChild(label);
    this.addChild(label2);

    this.addEventListener('touchend', function() {
      enchant.Game.instance.replaceScene(new GameScene(levels));
    });
  } //end initialize

});
