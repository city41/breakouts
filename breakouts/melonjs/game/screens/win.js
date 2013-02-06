
/** 
 * Title Screen
 */
var GameEndScreen = me.ScreenObject.extend( {
	init : function() {
		this.parent(true);
		this.font = null;
		this.instructions = 'you are the master !';
	},
	
	onResetEvent: function() {	
		// load the title screen
		me.levelDirector.loadLevel("title");
		// enable keyboard/mouse/touch event
		me.input.bindKey(me.input.KEY.ENTER, "enter", true);
		// map the left button click on the ENTER key
		me.input.bindMouse(me.input.mouse.LEFT, me.input.KEY.ENTER);
		// init a font object
		this.font = new me.Font('Arial', 20, 'black', 'center');
		// automatically switch back to Menu screen after 2sec
		this.timeoutID = setTimeout(function(){me.state.change(me.state.MENU)},2000);
	},
	
	update : function() {
		// enter/click pressed ?
		if (me.input.isKeyPressed('enter')) {
			clearTimeout(this.timeoutID);
			me.state.change(me.state.MENU);
		}
		return false;
	},
	
	draw : function(context) {
		this.font.draw(context, this.instructions, me.game.viewport.width/2, me.game.viewport.height/2 + 80);
	},
	
	onDestroyEvent : function() {
		// free the font object
		this.font = null;
		// unregister events
		me.input.unbindKey(me.input.KEY.ENTER);
		me.input.unbindMouse(me.input.mouse.LEFT);
	}
});

