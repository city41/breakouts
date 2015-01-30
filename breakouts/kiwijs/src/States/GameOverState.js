var GameOverState = new Kiwi.State('GameOverState');

GameOverState.create = function () {
    //bg
    this.bg = new Kiwi.GameObjects.Sprite(this, this.textures.bg);
    this.addChild(this.bg);

    //logo
    this.logo = new Kiwi.GameObjects.Sprite(this, this.textures.logo, 100, 100);
    this.addChild(this.logo);

    //end textfield
    this.endTF = new Kiwi.HUD.Widget.TextField(this.game, 'Game Over', 130, 390);
    this.endTF.style.color = "#000000";
    this.endTF.style.fontSize = "18px";
    this.endTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.endTF);

    this.game.input.onUp.add(this.clickGame, this);
}

GameOverState.clickGame = function () {
    this.game.huds.defaultHUD.removeWidget(this.endTF);
    game.states.switchState('IntroState');
}