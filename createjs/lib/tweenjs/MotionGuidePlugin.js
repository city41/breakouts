/*
 * MotionGuidePlugin
 * Visit http://createjs.com/ for documentation, updates and examples.
 *
 * Copyright (c) 2010 gskinner.com, inc.
 *
 * Permission is hereby granted, free of charge, to any person
 * obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without
 * restriction, including without limitation the rights to use,
 * copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the
 * Software is furnished to do so, subject to the following
 * conditions:
 *
 * The above copyright notice and this permission notice shall be
 * included in all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
 * OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
 * NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
 * HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
 * WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
 * FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
 * OTHER DEALINGS IN THE SOFTWARE.
 */

/**
 * @module TweenJS
 */

// namespace:
this.createjs = this.createjs||{};

(function() {
	"use strict";
	/**
	 * A TweenJS plugin for working with motion guides.
	 *
	 * To use, install the plugin after TweenJS has loaded. Next tween the 'guide' property with an object as detailed below.
	 *
	 *       createjs.MotionGuidePlugin.install();
	 *
	 * <h4>Example</h4>
	 *
	 *      // Using a Motion Guide
	 *	    createjs.Tween.get(target).to({guide:{ path:[0,0, 0,200,200,200, 200,0,0,0] }},7000);
	 *	    // Visualizing the line
	 *	    graphics.moveTo(0,0).curveTo(0,200,200,200).curveTo(200,0,0,0);
	 *
	 * Each path needs pre-computation to ensure there's fast performance. Because of the pre-computation there's no
	 * built in support for path changes mid tween. These are the Guide Object's properties:<UL>
	 *      <LI> path: Required, Array : The x/y points used to draw the path with a moveTo and 1 to n curveTo calls.</LI>
	 *      <LI> start: Optional, 0-1 : Initial position, default 0 except for when continuing along the same path.</LI>
	 *      <LI> end: Optional, 0-1 : Final position, default 1 if not specified.</LI>
	 *      <LI> orient: Optional, string : "fixed"/"auto"/"cw"/"ccw"<UL>
	 *				<LI>"fixed" forces the object to face down the path all movement (relative to start rotation),</LI>
	 *      		<LI>"auto" rotates the object along the path relative to the line.</LI>
	 *      		<LI>"cw"/"ccw" force clockwise or counter clockwise rotations including flash like behaviour</LI>
	 * 		</UL></LI>
	 * </UL>
	 * Guide objects should not be shared between tweens even if all properties are identical, the library stores
	 * information on these objects in the background and sharing them can cause unexpected behaviour. Values
	 * outside 0-1 range of tweens will be a "best guess" from the appropriate part of the defined curve.
	 *
	 * @class MotionGuidePlugin
	 * @constructor
	 **/
	var MotionGuidePlugin = function() {
		throw("MotionGuidePlugin cannot be instantiated.")
	};

	// static interface:
	/**
	 * @property priority
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.priority = 0; // high priority, should run sooner

	/**
	 * @property temporary variable storage
	 * @private
	 * @static
	 */
	MotionGuidePlugin._rotOffS;
	/**
	 * @property temporary variable storage
	 * @private
	 * @static
	 */
	MotionGuidePlugin._rotOffE;
	/**
	 * @property temporary variable storage
	 * @private
	 * @static
	 */
	MotionGuidePlugin._rotNormS;
	/**
	 * @property temporary variable storage
	 * @private
	 * @static
	 */
	MotionGuidePlugin._rotNormE;

	/**
	 * Installs this plugin for use with TweenJS. Call this once after TweenJS is loaded to enable this plugin.
	 * @method install
	 * @static
	 **/
	MotionGuidePlugin.install = function() {
		createjs.Tween.installPlugin(MotionGuidePlugin, ["guide", "x", "y", "rotation"]);
		return createjs.Tween.IGNORE;
	};

	/**
	 * @method init
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.init = function(tween, prop, value) {
		var target = tween.target;
		if(!target.hasOwnProperty("x")){ target.x = 0; }
		if(!target.hasOwnProperty("y")){ target.y = 0; }
		if(!target.hasOwnProperty("rotation")){ target.rotation = 0; }

		if(prop=="rotation"){ tween.__needsRot = true; }
		return prop=="guide"?null:value;
	};

	/**
	 * @method step
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.step = function(tween, prop, startValue, endValue, injectProps) {
		// other props
		if(prop == "rotation"){
			tween.__rotGlobalS = startValue;
			tween.__rotGlobalE = endValue;
			MotionGuidePlugin.testRotData(tween, injectProps);
		}
		if(prop != "guide"){ return endValue; }

		// guide only information - Start -
		var temp, data = endValue;
		if(!data.hasOwnProperty("path")){ data.path = []; }
		var path = data.path;
		if(!data.hasOwnProperty("end")){ data.end = 1; }
		if(!data.hasOwnProperty("start")){
			data.start = (startValue&&startValue.hasOwnProperty("end")&&startValue.path===path)?startValue.end:0;
		}

		// Figure out subline information
		if(data.hasOwnProperty("_segments") && data._length){ return endValue; }
		var l = path.length;
		var accuracy = 10;		// Adjust to improve line following precision but sacrifice performance (# of seg)
		if(l >= 6 && (l-2) % 4 == 0){	// Enough points && contains correct number per entry ignoring start
			data._segments = [];
			data._length = 0;
			for(var i=2; i<l; i+=4){
				var sx = path[i-2], sy = path[i-1];
				var cx = path[i+0], cy = path[i+1];
				var ex = path[i+2], ey = path[i+3];
				var oldX = sx, oldY = sy;
				var tempX, tempY, total = 0;
				var sublines = [];
				for(var j=1; j<=accuracy; j++){
					var t = j/accuracy;
					var inv = 1 - t;
					tempX = inv*inv * sx + 2 * inv * t * cx + t*t * ex;
					tempY = inv*inv * sy + 2 * inv * t * cy + t*t * ey;
					total += sublines[sublines.push(Math.sqrt((temp=tempX-oldX)*temp + (temp=tempY-oldY)*temp))-1];
					oldX = tempX;
					oldY = tempY;
				}
				data._segments.push(total);
				data._segments.push(sublines);
				data._length += total;
			}
		} else {
			throw("invalid 'path' data, please see documentation for valid paths");
		}

		// Setup x/y tweens
		temp = data.orient;
		data.orient = true;
		var o = {};
		MotionGuidePlugin.calc(data, data.start, o);
		tween.__rotPathS = Number(o.rotation.toFixed(5));
		MotionGuidePlugin.calc(data, data.end, o);
		tween.__rotPathE = Number(o.rotation.toFixed(5));
		data.orient = false;	//here and now we don't know if we need to
		MotionGuidePlugin.calc(data, data.end, injectProps);
		data.orient = temp;

		// Setup rotation properties
		if(!data.orient){ return endValue; }
		tween.__guideData = data;
		MotionGuidePlugin.testRotData(tween, injectProps);
		return endValue;
	};

	/**
	 * @method testRotData
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.testRotData = function(tween, injectProps){

		// no rotation informat? if we need it come back, if we don't use 0 & ensure we have guide data
		if(tween.__rotGlobalS === undefined || tween.__rotGlobalE === undefined){
			if(tween.__needsRot){ return; }
			if(tween._curQueueProps.rotation !== undefined){
				tween.__rotGlobalS = tween.__rotGlobalE = tween._curQueueProps.rotation;
			} else {
				tween.__rotGlobalS = tween.__rotGlobalE = injectProps.rotation = tween.target.rotation || 0;
			}
		}
		if(tween.__guideData === undefined){ return; }

		// Process rotation properties
		var data = tween.__guideData;
		var rotGlobalD = tween.__rotGlobalE - tween.__rotGlobalS;
		var rotPathD = tween.__rotPathE - tween.__rotPathS;
		var rot = rotGlobalD - rotPathD;

		if(data.orient == "auto"){
			if(rot > 180){			rot -= 360; }
			else if(rot < -180){	rot += 360; }

		} else if(data.orient == "cw"){
			while(rot < 0){ rot += 360; }
			if(rot == 0 && rotGlobalD > 0 && rotGlobalD != 180){ rot += 360; }

		} else if(data.orient == "ccw"){
			rot = rotGlobalD - ((rotPathD > 180)?(360-rotPathD):(rotPathD));	// sign flipping on path
			while(rot > 0){ rot -= 360; }
			if(rot == 0 && rotGlobalD < 0 && rotGlobalD != -180){ rot -= 360; }
		}

		data.rotDelta = rot;
		data.rotOffS = tween.__rotGlobalS - tween.__rotPathS;

		// reset
		tween.__rotGlobalS = tween.__rotGlobalE = tween.__guideData = tween.__needsRot = undefined;
	};

	/**
	 * @method tween
	 * @protected
	 * @static
	 **/
	MotionGuidePlugin.tween = function(tween, prop, value, startValues, endValues, ratio, wait, end) {
		var data = endValues.guide;
		if(data == undefined || data === startValues.guide){ return value; }
		if(data.lastRatio != ratio){
			// first time through so calculate what I need to
			var t = ((data.end-data.start)*(wait?data.end:ratio)+data.start);
			MotionGuidePlugin.calc(data, t, tween.target);
			switch(data.orient){
				case "cw":		// mix in the original rotation
				case "ccw":
				case "auto": tween.target.rotation += data.rotOffS + data.rotDelta*ratio; break;
				case "fixed":	// follow fixed behaviour to solve potential issues
				default: tween.target.rotation += data.rotOffS; break;
			}
			data.lastRatio = ratio;
		}
		if(prop == "rotation" && ((!data.orient) || data.orient == "false")){ return value; }
		return tween.target[prop];
	};

	/**
	 * Determine the appropriate x/y/rotation information about a path for a given ratio along the path.
	 * Assumes a path object with all optional parameters specified.
	 * @param data Data object you would pass to the "guide:" property in a Tween
	 * @param ratio 0-1 Distance along path, values outside 0-1 are "best guess"
	 * @param target Object to copy the results onto, will use a new object if not supplied.
	 * @return {Object} The target object or a new object w/ the tweened properties
	 * @static
	 */
	MotionGuidePlugin.calc = function(data, ratio, target) {
		if(data._segments == undefined){ MotionGuidePlugin.validate(data); }
		if(target == undefined){ target = {x:0, y:0, rotation:0}; }
		var seg = data._segments;
		var path = data.path;

		// find segment
		var pos = data._length * ratio;
		var cap = seg.length - 2;
		var n = 0;
		while(pos > seg[n] && n < cap){
			pos -= seg[n];
			n+=2;
		}

		// find subline
		var sublines = seg[n+1];
		var i = 0;
		cap = sublines.length-1;
		while(pos > sublines[i] && i < cap){
			pos -= sublines[i];
			i++;
		}
		var t = (i/++cap)+(pos/(cap*sublines[i]));

		// find x/y
		n = (n*2)+2;
		var inv = 1 - t;
		target.x = inv*inv * path[n-2] + 2 * inv * t * path[n+0] + t*t * path[n+2];
		target.y = inv*inv * path[n-1] + 2 * inv * t * path[n+1] + t*t * path[n+3];

		// orientation
		if(data.orient){
			target.rotation = 57.2957795 * Math.atan2(
				(path[n+1]-path[n-1])*inv + (path[n+3]-path[n+1])*t,
				(path[n+0]-path[n-2])*inv + (path[n+2]-path[n+0])*t);
		}

		return target;
	};

	// public properties:

	// private properties:

	// constructor:

	// public methods:

	// private methods:

	createjs.MotionGuidePlugin = MotionGuidePlugin;
}());
