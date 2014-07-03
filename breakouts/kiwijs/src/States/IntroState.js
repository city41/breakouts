var IntroState = new Kiwi.State('IntroState');

IntroState.create = function () {
    //bg
    this.bg = new Kiwi.GameObjects.Sprite(this, this.textures.bg);
    this.addChild(this.bg);

    this.logo = new Kiwi.GameObjects.Sprite(this, this.textures.logo, 100, 100);
    this.addChild(this.logo);

    this.startTF = new Kiwi.HUD.Widget.TextField(this.game, 'Click to start', 120, 390);
    this.startTF.style.color = "#000000";
    this.startTF.style.fontSize = "18px";
    this.startTF.style.fontFamily = "Arial, Helvetica, sans-serif"
    this.game.huds.defaultHUD.addWidget(this.startTF);

    this.game.input.onUp.add(this.clickGame, this);
}

IntroState.clickGame = function () {
    this.game.huds.defaultHUD.removeWidget(this.startTF);
    game.states.switchState('BreakOutState');
}