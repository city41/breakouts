var GameCompleteState = new Kiwi.State('GameCompleteState');

GameCompleteState.create = function () {
    //bg
    this.bg = new Kiwi.GameObjects.Sprite(this, this.textures.bg);
    this.addChild(this.bg);

    //logo
    this.logo = new Kiwi.GameObjects.Sprite(this, this.textures.logo, 100, 100);
    this.addChild(this.logo);

    //end text field
    this.endTF = new Kiwi.HUD.Widget.TextField(this.game, 'Congratulations!', 120, 390);
    this.endTF.style.color = "#000000";
    this.endTF.style.fontSize = "18px";
    this.endTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.endTF);

    this.game.input.onUp.add(this.clickGame, this);
}

GameCompleteState.clickGame = function () {
    this.game.huds.defaultHUD.removeWidget(this.endTF);
    game.states.switchState('IntroState');
}