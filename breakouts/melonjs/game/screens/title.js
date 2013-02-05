
/** 
 * Title Screen
 */
var TitleScreen = me.ScreenObject.extend( {
	init : function() {
		this.parent(true);
		this.font = null;
		// add multiline support would be nice...
		this.instructions = (me.sys.touch ? 'Tap' : 'Click') + ' to start';
		this.instructions2 = 'during the game: use L/R arrow';
		this.instructions3 = 'keys to skip levels';
	},
	
	onResetEvent: function() {	
		// load a level
		me.levelDirector.loadLevel("title");
		// enable keyboard/mouse/touch event
		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		// map the left button click on the ENTER key
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.ENTER);
		// init a font object
		this.font = new me.Font('Arial', 20, 'black', 'center');
	},
	
	update : function() {
		// enter pressed ?
		if (me.input.isKeyPressed('enter')) {
			me.state.change(me.state.PLAY);
		}
		return false;
	},

	
	draw : function(context) {
		this.font.draw(context, this.instructions,  me.game.viewport.width/2, me.game.viewport.height/2 + 80);
		this.font.draw(context, this.instructions2, me.game.viewport.width/2, me.game.viewport.height/2 + 140);
		this.font.draw(context, this.instructions3, me.game.viewport.width/2, me.game.viewport.height/2 + 160);
	},
	
	onDestroyEvent : function() {
		// free the font object
		this.font = null;
		// unregister the event
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);
	}
});

