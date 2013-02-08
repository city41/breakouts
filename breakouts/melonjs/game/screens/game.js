
/** 
 * Main Game Screen
 */

var PlayScreen = me.ScreenObject.extend( {
	init: function(){
		this.parent(true);
		this.font = null;
		// make it persistent across levels
		this.isPersistent = true;
	},

	onResetEvent: function() {	
		this.lives = 3;
		this.score = 0;
		this.level = -1;
		// # bricks in the level
		this.bricks = 0;
		
		// init a font object
		this.font = new me.Font('Arial', 20, 'black');
		this.fontYpos = me.game.viewport.height - 10;
		
		// enable keyboard
		me.input.bindKey(me.input.KEY.LEFT,	 "left", true);
		me.input.bindKey(me.input.KEY.RIGHT, "right", true);
		
		// load next level
		this.nextLevel();
	},
	
	// called by EntityBrick 
	addScore: function (type) {
		this.score += 100;
	},
	
	// called by EntityBrick 
	countBrick: function (type) {
		this.bricks -=1;
		if (this.bricks === 0) {
			// all balls should be deactivated
			game.ball.active = false;
			this.nextLevel();
		}
	},
	
	// call by EntityBall
	onBallDeath: function () {
		if (me.game.getEntityByName('ball').length === 0) {
			if (this.lives -1 <= 0) {
				me.state.change(me.state.GAMEOVER);
			} else {
				this.lives--;
				this._reset();
			}
		}
	},
	
	nextLevel: function() {
		this.level++;
		// -1 is to remove the title screen
		if (this.level === me.levelDirector.levelCount()-1) {
			me.state.change(me.state.GAME_END);
			return;
		}
		me.levelDirector.loadLevel("level"+this.level);

		this._reset();
	},

	_reset: function() {
		this._removeAllOf('ball');
		this._removeAllOf('countdown');

		me.game.add(new EntityBall(50, me.game.viewport.height / 2, {}), 19000);
		me.game.add(new EntityCountdown(0, 0, {}), 20000);
		me.game.sort();

		game.paddle = me.game.getEntityByName('paddle')[0];
		game.ball = me.game.getEntityByName('ball')[0];
		this.bricks = me.game.getEntityByName('brick').length;
	},

	_removeAllOf: function(name) {
		var entities = me.game.getEntityByName(name) || [];

		for(var i = 0, l = entities.length; i < l; ++i) {
			me.game.remove(entities[i], true);
		}
	},
	
	previousLevel: function() {
		this.level--;
		if (this.level < 0) {
			me.state.change(me.state.MENU);
			return;
		}
		me.levelDirector.loadLevel("level"+this.level);
		this._reset();
	},
	
	update : function() {
		if (me.input.isKeyPressed('right'))	{
			this.nextLevel();
		} else if (me.input.isKeyPressed('left')) {
			this.previousLevel();
		}
		return false;
	},

	
	draw : function(context) {
		this.font.draw(context, 'lives: ' + this.lives, 25, this.fontYpos);
		this.font.draw(context, 'score: ' + this.score, 105, this.fontYpos);
		this.font.draw(context, 'level: ' + (this.level+1), 230, this.fontYpos);
	},
	
	onDestroyEvent : function() {
		// free object references
		this.font = null;
		game.paddle = null;
		game.ball = null;
		// unregister the event
		me.input.unbindKey(me.input.KEY.LEFT);
		me.input.unbindKey(me.input.KEY.RIGHT);
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);
	}

});
