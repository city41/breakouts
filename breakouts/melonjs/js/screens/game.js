
/** 
 * Main Game Screen
 */

var PlayScreen = me.ScreenObject.extend( {

	onResetEvent: function() {	
		// reset the game data
		game.data.lives = 3;
		game.data.score = 0;
		game.data.level = -1;
		// # bricks in the level
		game.data.bricks = 0;
		
		// enable keyboard
		me.input.bindKey(me.input.KEY.LEFT,	 "left", true);
		me.input.bindKey(me.input.KEY.RIGHT, "right", true);

		var _this = this;
		// use minpubsub to detect user action
		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "right") {
			_this.nextLevel();
			} else if (action === 'left') {
				_this.previousLevel();
			}
		});
	
		// load next level
		this.nextLevel();
	},
	
	// called by EntityBrick 
	addScore: function (type) {
		game.data.score += 100;
	},
	
	// called by EntityBrick 
	countBrick: function (type) {
		game.data.bricks -=1;
		if (game.data.bricks === 0) {
			// all balls should be deactivated
			game.ball.active = false;
			this.nextLevel();
		}
	},
	
	// call by EntityBall
	onBallDeath: function () {
		if (me.game.world.getChildByName('ball').length === 0) {
			if (game.data.lives -1 <= 0) {
				me.state.change(me.state.GAMEOVER);
			} else {
				game.data.lives--;
				this._reset();
			}
		}
	},
	
	nextLevel: function() {
		game.data.level++;
		// -1 is to remove the title screen
		if (game.data.level === me.levelDirector.levelCount()-1) {
			me.state.change(me.state.GAME_END);
			return;
		}
		me.levelDirector.loadLevel("level"+game.data.level);

		this._reset();
	},

	_reset: function() {
		this._removeAllOf('ball');
		this._removeAllOf('countdown');
		this._removeAllOf('power-down');
		this._removeAllOf('power-up');


		me.game.world.addChild(new EntityBall(50, me.game.viewport.height / 2, {}), 19000);
		me.game.world.addChild(new EntityCountdown(0, 0, {}), 20000);

		game.paddle = me.game.world.getChildByName('paddle')[0];
		game.ball = me.game.world.getChildByName('ball')[0];
		game.data.bricks = me.game.world.getChildByName('brick').length;

		// add a basic HUD
		me.game.world.addChild( new (me.Renderable.extend ({
	        // constructor
	        init : function() {
	        	// size does not matter, it's just to avoid having a zero size renderable
	            this.parent(new me.Vector2d(), 100, 100);
	            // init a font object
				this.font = new me.Font('Arial', 20, 'black');
				this.font.textBaseline = "bottom";
				this.fontYpos = me.game.viewport.height - 10;

	        },
	        draw : function (context) {
	        	this.font.draw(context, 'lives: ' + game.data.lives, 25, this.fontYpos);
				this.font.draw(context, 'score: ' + game.data.score, 105, this.fontYpos);
				this.font.draw(context, 'level: ' + (game.data.level+1), 230, this.fontYpos);
	        }        
	    })), 3);
	},

	_removeAllOf: function(name) {
		var entities = me.game.world.getChildByName(name) || [];

		for(var i = 0, l = entities.length; i < l; ++i) {
			me.game.world.removeChild(entities[i], true);
		}
	},
	
	previousLevel: function() {
		game.data.level--;
		if (game.data.level < 0) {
			me.state.change(me.state.MENU);
			return;
		}
		me.levelDirector.loadLevel("level"+game.data.level);
		this._reset();
	},
	
	onDestroyEvent : function() {
		// free object references
		game.paddle = null;
		game.ball = null;
		// unregister the event
		me.event.unsubscribe(this.handler);
		me.input.unbindKey(me.input.KEY.LEFT);
		me.input.unbindKey(me.input.KEY.RIGHT);
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);
	}

});
