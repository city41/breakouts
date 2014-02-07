
/** 
 * Title Screen
 */
var GameEndScreen = me.ScreenObject.extend( {
	
	onResetEvent: function() {	
		// load the title screen
		me.levelDirector.loadLevel("title");
		// enable keyboard/mouse/touch event
		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		// map the left button click on the ENTER key
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.ENTER);

		var _this = this;
		// use minpubsub to detect user action
		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "enter") {
				me.timer.clearTimeout(_this.timeoutID);
				me.state.change(me.state.MENU);
			}
		});

		// add the game over text
   		me.game.world.addChild(new (me.Renderable.extend ({
	        // constructor
	        init : function() {
	        	// size does not matter, it's just to avoid having a zero size renderable
	            this.parent(new me.Vector2d(), 100, 100);
				// init a font object
				this.font = new me.Font('Arial', 20, 'black', 'center');

	        },
	        draw : function (context) {
	        	this.font.draw(context, 'you are the master !', me.game.viewport.width/2, me.game.viewport.height/2 + 80);
	        }      
	    })), 2);

		// automatically switch back to Menu screen after 2sec
		this.timeoutID = setTimeout(function(){me.state.change(me.state.MENU)},2000);
	},

	
	onDestroyEvent : function() {
		// unregister the event
		me.event.unsubscribe(this.handler);
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);
	}
});

