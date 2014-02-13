
/** 
 * Title Screen
 */
var TitleScreen = me.ScreenObject.extend( {
	
	onResetEvent: function() {	
		// load the title level
		me.levelDirector.loadLevel("title");
		
		// enable keyboard/mouse/touch event
		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		
		// map the left button click on the ENTER key
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.ENTER);

		// use minpubsub to detect user action
		this.handler = me.event.subscribe(me.event.KEYDOWN, function (action, keyCode, edge) {
			if (action === "enter") {
				me.state.change(me.state.PLAY);
				// silently play an audio clip to unlock audio on iOS devices
				me.audio.play('countdownblip', false, null, 0.0);
			}
		});

		// add all the texts
   		me.game.world.addChild(new (me.Renderable.extend ({
	        // constructor
	        init : function() {
	        	// size does not matter, it's just to avoid having a zero size renderable
	            this.parent(new me.Vector2d(), 100, 100);
				// init a font object
				this.font = new me.Font('Arial', 20, 'black', 'center');
				// add multiline support would be nice...
				this.instructions = (me.device.touch ? 'Tap' : 'Click') + ' to start';
				this.instructions2 = 'during the game: use L/R arrow';
				this.instructions3 = 'keys to skip levels';

	        },
	        draw : function (context) {
	        	this.font.draw(context, this.instructions,  me.game.viewport.width/2, me.game.viewport.height/2 + 80);
				this.font.draw(context, this.instructions2, me.game.viewport.width/2, me.game.viewport.height/2 + 140);
				this.font.draw(context, this.instructions3, me.game.viewport.width/2, me.game.viewport.height/2 + 160);
	        }      
	    })), 3);

	},
	
	onDestroyEvent : function() {
		// unregister the event
		me.event.unsubscribe(this.handler);
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);

	}
});

