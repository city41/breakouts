/*! Quintus - v0.0.5 - 2013-02-02
* Copyright (c) 2013 Pascal Rettig; Licensed MIT, GPLv2 */

//     Quintus Game Engine
//     (c) 2012 Pascal Rettig, Cykod LLC
//     Quintus may be freely distributed under the MIT license or GPLv2 License.
//     For all details and documentation:
//     http://html5quintus.com
//
// Quintus HTML5 Game Engine 
// =========================
//
// The code in `quintus.js` defines the base `Quintus()` method
// which create an instance of the engine. The basic engine doesn't
// do a whole lot - it provides an architecture for extension, a
// game loop, and a method for creating or binding to an exsiting
// canvas context. The engine has dependencies on Underscore.js and jQuery,
// although the jQuery dependency will be removed in the future.
//
// Most of the game-specific functionality is in the 
// various other modules:
//
// * `quintus_input.js` - `Input` module, which allows for user input via keyboard and touchscreen
// * `quintus_sprites.js` - `Sprites` module, which defines a basic `Q.Sprite` class along with spritesheet support in `Q.SpriteSheet`.
// * `quintus_scenes.js` - `Scenes` module. It defines the `Q.Scene` class, which allows creation of reusable scenes, and the `Q.Stage` class, which handles managing a number of sprites at once.
// * `quintus_anim.js` - `Anim` module, which adds in support for animations on sprites along with a `viewport` component to follow the player around and a `Q.Repeater` class that can create a repeating, scrolling background.


// Engine Bootstrapping
// ====================

// Top-level Quintus engine factory wrapper, 
// creates new instances of the engine by calling:
//
//      var Q = Quintus({  ...  });
//
// Any initial setup methods also all return the `Q` object, allowing any initial 
// setup calls to be chained together.
//
//      var Q = Quintus()
//              .include("Input, Sprites, Scenes")
//              .setup('quintus', { maximize: true })
//              .controls();
//                       
// `Q` is used internally as the object name, and is used in most of the examples, 
// but multiple instances of the engine on the same page can have different names.
//
//     var Game1 = Quintus(), Game2 = Quintus();
//
var Quintus = function Quintus(opts) {

  // A la jQuery - the returned `Q` object is actually
  // a method that calls `Q.select`. `Q.select` doesn't do anything
  // initially, but can be overridden by a module to allow
  // selection of game objects. The `Scenes` module adds in 
  // the select method which selects from the default stage.
  //
  //     var Q = Quintus().include("Sprites, Scenes");
  //     ... Game Code ...
  //     // Set the angry property on all Enemy1 class objects to true
  //     Q("Enemy1").p({ angry: true });
  //     
  //
  var Q = function(selector,scope,options) {   
    return Q.select(selector,scope,options);
  };

  Q.select = function() { /* No-op */ };

  // Syntax for including other modules into quintus, can accept a comma-separated
  // list of strings, an array of strings, or an array of actual objects. Example:
  //
  //     Q.include("Input, Sprites, Scenes")
  //
  Q.include = function(mod) {
    Q._each(Q._normalizeArg(mod),function(name) {
      var m = Quintus[name] || name;
      if(!Q._isFunction(m)) { throw "Invalid Module:" + name; }
      m(Q);
    });
    return Q;
  };

  // Utility Methods
  // ===============
  //
  // Most of these utility methods are a subset of Underscore.js,
  // Most are pulled directly from underscore and some are
  // occasionally optimized for speed and memory usage in lieu of flexibility.
  // Underscore.js is (c) 2009-2012 Jeremy Ashkenas, DocumentCloud Inc.
  // Underscore is freely distributable under the MIT license.
  // http://underscorejs.org

  // An internal utility method (utility methods are prefixed with underscores)
  // It's used to take a string of comma separated names and turn it into an `Array`
  // of names. If an array of names is passed in, it's left as is. Example usage:
  //
  //     Q._normalizeArg("Sprites, Scenes, Physics   ");
  //     // returns [ "Sprites", "Scenes", "Physics" ]
  //
  // Used by `Q.include` and `Q.Sprite.add` to add modules and components, respectively.
  Q._normalizeArg = function(arg) {
    if(Q._isString(arg)) {
      arg = arg.replace(/\s+/g,'').split(",");
    }
    if(!Q._isArray(arg)) {
      arg = [ arg ];
    }
    return arg;
  };


  // Extends a destination object
  // with a source object
  Q._extend = function(dest,source) {
    if(!source) { return dest; }
    for (var prop in source) {
      dest[prop] = source[prop];
    }
    return dest;
  };

  // Return a shallow copy of an object. Sub-objects (and sub-arrays) are not cloned.
  Q._clone = function(obj) {
    return Q._extend({},obj);
  };

  // Method that adds default properties onto
  // an object only if the key is undefined
  Q._defaults = function(dest,source) {
    if(!source) { return dest; }
    for (var prop in source) {
      if(dest[prop] === void 0) {
        dest[prop] = source[prop];
      }
    }
    return dest;
  };

  // Shortcut for hasOwnProperty
  Q._has = function(obj, key) {
    return Object.prototype.hasOwnProperty.call(obj, key);
  };

  // Check if something is a string
  // NOTE: this fails for non-primitives
  Q._isString = function(obj) {
    return typeof obj === "string";
  };

  Q._isNumber = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Number]';
  };

  // Check if something is a function
  Q._isFunction = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Function]';
  };

  // Check if something is a function
  Q._isObject = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Object]';
  };

  // Check if something is a function
  Q._isArray = function(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  };

  // Check if something is undefined
  Q._isUndefined = function(obj) {
    return obj === void 0;
  };

  // Removes a property from an object and returns it
  Q._popProperty = function(obj,property) {
    var val = obj[property];
    delete obj[property];
    return val;
  };

  // Basic iteration method. This can often be a performance
  // handicap when the callback iterator is created inline,
  // as this leads to lots of functions that need to be GC'd.
  // Better is to define the iterator as a private method so
  // it is only created once.
  Q._each = function(obj,iterator,context) {
    if (obj == null) { return; }
    if (obj.forEach) {
      obj.forEach(iterator,context);
    } else if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        iterator.call(context, obj[i], i, obj);
      }
    } else {
      for (var key in obj) {
        iterator.call(context, obj[key], key, obj);
      }
    }
  };

  // Invoke the named property on each element of the array
  Q._invoke= function(arr,property,arg1,arg2) {
    if (arr == null) { return; }
    for (var i = 0, l = arr.length; i < l; i++) {
      arr[i][property](arg1,arg2);
    }
  };



  // Basic detection method, returns the first instance where the
  // iterator returns truthy. 
  Q._detect = function(obj,iterator,context,arg1,arg2) {
    var result;
    if (obj == null) { return; }
    if (obj.length === +obj.length) {
      for (var i = 0, l = obj.length; i < l; i++) {
        result = iterator.call(context, obj[i], i, arg1,arg2);
        if(result) { return result; }
      }
      return false;
    } else {
      for (var key in obj) {
        result = iterator.call(context, obj[key], key, arg1,arg2);
        if(result) { return result; }
      }
      return false;
    }
  };

  // Returns a new Array with entries set to the return value of the iterator.
  Q._map = function(obj, iterator, context) {
    var results = [];
    if (obj == null) { return results; }
    if (obj.map) { return obj.map(iterator, context); }
    Q._each(obj, function(value, index, list) {
      results[results.length] = iterator.call(context, value, index, list);
    });
    if (obj.length === +obj.length) { results.length = obj.length; }
    return results;
  };

  // Returns a sorted copy of unique array elements with null remove
  Q._uniq = function(arr) {
    arr = arr.slice().sort();

    var output = [];

    var last = null;
    for(var i=0;i<arr.length;i++) {
      if(arr[i] !== void 0 && last !== arr[i]) {
        output.push(arr[i]);
      }
      last = arr[i];
    }
    return output;
  };

  // returns a new array with the same entries as the source but in a random order.
  Q._shuffle = function(obj) {
    var shuffled = [], rand;
    Q._each(obj, function(value, index, list) {
      rand = Math.floor(Math.random() * (index + 1));
      shuffled[index] = shuffled[rand];
      shuffled[rand] = value;
    });
    return shuffled;
  };

  // Return an object's keys
  Q._keys = Object.keys || function(obj) {
    if(Q._isObject(obj)) { throw new TypeError('Invalid object'); }
    var keys = [];
    for (var key in obj) { if (Q._has(obj, key)) { keys[keys.length] = key; } } 
    return keys;
  };

  Q._range = function(start,stop,step) {
    step = arguments[2] || 1;

    var len = Math.max(Math.ceil((stop - start) / step), 0);
    var idx = 0;
    var range = new Array(len);

    while(idx < len) {
      range[idx++] = start;
      start += step;
    }

    return range;

  };

  var idIndex = 0;
  // Return a unique identifier
  Q._uniqueId = function() {
    return idIndex++;
  };



  // Options
  // ========
  
  // Default engine options defining the paths 
  // where images, audio and other data files should be found
  // relative to the base HTML file. As well as a couple of other
  // options.
  //
  // These can be overriden by passing in options to the `Quintus()` 
  // factory method, for example:
  //
  //     // Override the imagePath to default to /assets/images/
  //     var Q = Quintus({ imagePath: "/assets/images/" });
  //
  // If you follow the default convention from the examples, however,
  // you should be able to call `Quintus()` without any options.
  Q.options = {
    imagePath: "images/",
    audioPath: "audio/",
    dataPath:  "data/",
    audioSupported: [ 'mp3','ogg' ],
    sound: true,
    frameTimeLimit: 100
  };
  if(opts) { Q._extend(Q.options,opts); }


  // Game Loop support
  // =================



  // By default the engine doesn't start a game loop until you actually tell it to.
  // Usually the loop is started the first time you call `Q.stageScene`, but if you 
  // aren't using the `Scenes` module you can explicitly start the game loop yourself
  // and control **exactly** what the engine does each cycle. For example:
  //
  //     var Q = Quintus().setup();
  //
  //     var ball = new Q.Sprite({ .. });
  //
  //     Q.gameLoop(function(dt) {
  //       Q.clear(); 
  //       ball.step(dt);
  //       ball.draw(Q.ctx);
  //     });
  //
  // The callback will be called with fraction of a second that has elapsed since 
  // the last call to the loop method.
  Q.gameLoop = function(callback) {
    Q.lastGameLoopFrame = new Date().getTime();

    // Short circuit the loop check in case multiple scenes
    // are staged immediately
    Q.loop = true; 

    // Keep track of the frame we are on (so that animations can be synced
    // to the next frame)
    Q._loopFrame = 0;

    // Wrap the callback to save it and standardize the passed
    // in time. 
    Q.gameLoopCallbackWrapper = function() {
      var now = new Date().getTime();
      Q._loopFrame++;
      Q.loop = window.requestAnimationFrame(Q.gameLoopCallbackWrapper);
      var dt = now - Q.lastGameLoopFrame;
      /* Prevent fast-forwarding by limiting the length of a single frame. */
      if(dt > Q.options.frameTimeLimit) { dt = Q.options.frameTimeLimit; }
      callback.apply(Q,[dt / 1000]);  
      Q.lastGameLoopFrame = now;
    };

    window.requestAnimationFrame(Q.gameLoopCallbackWrapper);
    return Q;
  };

  // Pause the entire game by canceling the requestAnimationFrame call. If you use setTimeout or
  // setInterval in your game, those will, of course, keep on rolling...
  Q.pauseGame = function() {
    if(Q.loop) {
      window.cancelAnimationFrame(Q.loop); 
    }
    Q.loop = null;
  };

  // Unpause the game by restarting the requestAnimationFrame-based loop.
  Q.unpauseGame = function() {
    if(!Q.loop) {
      Q.lastGameLoopFrame = new Date().getTime();
      Q.loop = window.requestAnimationFrame(Q.gameLoopCallbackWrapper);
    }
  };


  // The base Class object
  // ===============
  //
  // Quintus uses the Simple JavaScript inheritance Class object, created by
  // John Resig and described on his blog: 
  //
  // [http://ejohn.org/blog/simple-javascript-inheritance/](http://ejohn.org/blog/simple-javascript-inheritance/)
  //
  // The class is used wholesale, with the only differences being that instead
  // of appearing in a top-level namespace, the `Class` object is available as 
  // `Q.Class` and a second argument on the `extend` method allows for adding
  // class level methods and the class name is passed in a parameter for introspection
  // purposes.
  //
  // Classes can be created by calling `Q.Class.extend(name,{ .. })`, although most of the time
  // you'll want to use one of the derivitive classes, `Q.Evented` or `Q.GameObject` which
  // have a little bit of functionality built-in. `Q.Evented` adds event binding and 
  // triggering support and `Q.GameObject` adds support for components and a destroy method.
  //
  // The main things Q.Class get you are easy inheritance, a constructor method called `init()`,
  // dynamic addition of a this._super method when a method is overloaded (be careful with 
  // this as it adds some overhead to method calls.) Calls to `instanceof` also all 
  // work as you'd hope.
  //
  // By convention, classes should be added onto to the `Q` object and capitalized, so if 
  // you wanted to create a new class for your game, you'd write:
  //
  //     Q.Class.extend("MyClass",{ ... });
  //
  // Examples:
  //
  //     Q.Class.extend("Bird",{ 
  //       init: function(name) { this.name = name; },
  //       speak: function() { console.log(this.name); },
  //       fly: function()   { console.log("Flying"); }
  //     });
  //
  //     Q.Bird.extend("Penguin",{
  //       speak: function() { console.log(this.name + " the penguin"); },
  //       fly: function()   { console.log("Can't fly, sorry..."); }
  //     });
  //
  //     var randomBird = new Q.Bird("Frank"),
  //         pengy      = new Q.Penguin("Pengy");
  //
  //     randomBird.fly(); // Logs "Flying"
  //     pengy.fly();      // Logs "Can't fly,sorry..."
  //
  //     randomBird.speak(); // Logs "Frank"
  //     pengy.speak();      // Logs "Pengy the penguin"
  //
  //     console.log(randomBird instanceof Q.Bird);    // true 
  //     console.log(randomBird instanceof Q.Penguin); // false
  //     console.log(pengy instanceof Q.Bird);         // true 
  //     console.log(pengy instanceof Q.Penguin);      // true 


  /* Simple JavaScript Inheritance
   * By John Resig http://ejohn.org/
   * MIT Licensed.
   *
   * Inspired by base2 and Prototype
   */
  (function(){
    var initializing = false, 
        fnTest = /xyz/.test(function(){ var xyz;}) ? /\b_super\b/ : /.*/;
    /* The base Class implementation (does nothing) */
    Q.Class = function(){};

    // See if a object is a specific class
    Q.Class.prototype.isA = function(className) {
      return this.className === className;
    };
    
    /* Create a new Class that inherits from this class */
    Q.Class.extend = function(className, prop, classMethods) {
      /* No name, don't add onto Q */
      if(!Q._isString(className)) {
        classMethods = prop;
        prop = className;
        className = null;
      }
      var _super = this.prototype,
          ThisClass = this;
      
      /* Instantiate a base class (but only create the instance, */
      /* don't run the init constructor) */
      initializing = true;
      var prototype = new ThisClass();
      initializing = false;

      function _superFactory(name,fn) {
        return function() {
          var tmp = this._super;

          /* Add a new ._super() method that is the same method */
          /* but on the super-class */
          this._super = _super[name];

          /* The method only need to be bound temporarily, so we */
          /* remove it when we're done executing */
          var ret = fn.apply(this, arguments);        
          this._super = tmp;

          return ret;
        };
      }

      /* Copy the properties over onto the new prototype */
      for (var name in prop) {
        /* Check if we're overwriting an existing function */
        prototype[name] = typeof prop[name] === "function" && 
          typeof _super[name] === "function" && 
            fnTest.test(prop[name]) ? 
              _superFactory(name,prop[name]) : 
              prop[name];
      }
      
      /* The dummy class constructor */
      function Class() {
        /* All construction is actually done in the init method */
        if ( !initializing && this.init ) {
          this.init.apply(this, arguments);
        }
      }
      
      /* Populate our constructed prototype object */
      Class.prototype = prototype;
      
      /* Enforce the constructor to be what we expect */
      Class.prototype.constructor = Class;
      /* And make this class extendable */
      Class.extend = Q.Class.extend;
      
      /* If there are class-level Methods, add them to the class */
      if(classMethods) {
        Q._extend(Class,classMethods);
      }

      if(className) { 
        /* Save the class onto Q */
        Q[className] = Class;

        /* Let the class know its name */
        Class.prototype.className = className;
        Class.className = className;
      }
      
      return Class;
    };
  }());
    

  // Event Handling
  // ==============

  // The `Q.Evented` class adds event handling onto the base `Q.Class` 
  // class. Evented objects can trigger events and other objects can
  // bind to those events.
  Q.Class.extend("Evented",{

    // Binds a callback to an event on this object. If you provide a
    // `target` object, that object will add this event to it's list of
    // binds, allowing it to automatically remove it when it is destroyed.
    on: function(event,target,callback) {
      if(Q._isArray(event) || event.indexOf(",") !== -1) {
        event = Q._normalizeArg(event);
        for(var i=0;i<event.length;i++) {
          this.on(event[i],target,callback);
        }
        return;
      }

      // Handle the case where there is no target provided,
      // swapping the target and callback parameters.
      if(!callback) {
        callback = target;
        target = null;
      }

      // If there's still no callback, default to the event name
      if(!callback) {
        callback = event;
      }
      // Handle case for callback that is a string, this will
      // pull the callback from the target object or from this
      // object.
      if(Q._isString(callback)) {
        callback = (target || this)[callback];
      }

      // To keep `Q.Evented` objects from needing a constructor,
      // the `listeners` object is created on the fly as needed.
      // `listeners` keeps a list of callbacks indexed by event name
      // for quick lookup. 
      this.listeners = this.listeners || {};
      this.listeners[event] = this.listeners[event] || [];
      this.listeners[event].push([ target || this, callback]);

      // With a provided target, the target object keeps track of
      // the events it is bound to, which allows for automatic 
      // unbinding on destroy.
      if(target) {
        if(!target.binds) { target.binds = []; }
        target.binds.push([this,event,callback]);
      }
    },

    // Triggers an event, passing in some optional additional data about
    // the event. 
    trigger: function(event,data) {
      // First make sure there are any listeners, then check for any listeners
      // on this specific event, if not, early out.
      if(this.listeners && this.listeners[event]) {
        // Call each listener in the context of either the target passed into
        // `on` or the object itself.
        for(var i=0,len = this.listeners[event].length;i<len;i++) {
          var listener = this.listeners[event][i];
          listener[1].call(listener[0],data);
        }
      }
    },
    
    // Unbinds an event. Can be called with 1, 2, or 3 parameters, each 
    // of which unbinds a more specific listener.
    off: function(event,target,callback) {
      // Without a target, remove all teh listeners.
      if(!target) {
        if(this.listeners[event]) {
          delete this.listeners[event];
        }
      } else {
        // If the callback is a string, find a method of the
        // same name on the target.
        if(Q._isString(callback) && target[callback]) {
          callback = target[callback];
        }
        var l = this.listeners && this.listeners[event];
        if(l) {
          // Loop from the end to the beginning, which allows us
          // to remove elements without having to affect the loop.
          for(var i = l.length-1;i>=0;i--) {
            if(l[i][0] === target) {
              if(!callback || callback === l[i][1]) {
                this.listeners[event].splice(i,1);
              }
            }
          }
        }
      }
    },

    // `debind` is called to remove any listeners an object had
    // on other objects. The most common case is when an object is
    // destroyed you'll want all the event listeners to be removed
    // for you.
    debind: function() {
       if(this.binds) {
         for(var i=0,len=this.binds.length;i<len;i++) {
           var boundEvent = this.binds[i],
               source = boundEvent[0],
               event = boundEvent[1];
           source.off(event,this);
         }
       }
     }

   });


   
  // Components
  // ==============
  //
  // Components are self-contained pieces of functionality that can be added onto and removed
  // from objects. The allow for a more dynamic functionality tree than using inheritance (i.e.
  // by favoring composition over inheritance) and are added and removed on the fly at runtime.
  // (yes, I know everything in JS is at runtime, but you know what I mean, geez)
  //
  // Combining components with events makes it easy to create reusable pieces of
  // functionality that can be decoupled from each other.


  // The master list of registered components, indexed in an object by name.
  Q.components = {};

  // The base class for components. These are usually not derived directly but are instead
  // created by calling `Q.register` to register a new component given a set of methods the 
  // component supports. Components are created automatically when they are added to a 
  // `Q.GameObject` with the `add` method.
  //
  // Many components also define an `added` method, which is called automatically by the
  // `init` constructor after a component has been added to an object. This is a good time
  // to add event listeners on the object.
  Q.Evented.extend("Component",{

    // Components are created when they are added onto a `Q.GameObject` entity. The entity
    // is directly extended with any methods inside of an `extend` property and then the 
    // component itself is added onto the entity as well. 
    init: function(entity) {
      this.entity = entity;
      if(this.extend) { Q._extend(entity,this.extend);   }
      entity[this.name] = this;

      entity.activeComponents.push(this.componentName);

      if(entity.stage && entity.stage.addToList) {
        entity.stage.addToList(this.componentName,entity);
      }
      if(this.added) { this.added(); }    
    },

    // `destroy` is called automatically when a component is removed from an entity. It is 
    // not called, however, when an entity is destroyed (for performance reasons).
    // 
    // It's job is to remove any methods that were added with `extend` and then remove and
    // debind itself from the entity. It will also call `destroyed` if the component has
    // a method by that name.
    destroy: function() {
      if(this.extend) {
        var extensions = Q._keys(this.extend);
        for(var i=0,len=extensions.length;i<len;i++) {
          delete this.entity[extensions[i]];
        }
      }
      delete this.entity[this.name];
      var idx = this.entity.activeComponents.indexOf(this.componentName);
      if(idx !== -1) { 
        this.entity.activeComponents.splice(idx,1);

        if(this.entity.stage && this.entity.stage.addToList) {
          this.entity.stage.addToLists(this.componentName,this.entity);
        }
      }
      this.debind();
      if(this.destroyed) { this.destroyed(); }
    }
  });

  // This is the base class most Quintus objects are derived from, it extends 
  // `Q.Evented` and adds component support to an object, allowing components to
  // be added and removed from an object. It also defines a destroyed method
  // which will debind the object, remove it from it's parent (usually a scene)
  // if it has one, and trigger a destroyed event.
  Q.Evented.extend("GameObject",{

    // Simple check to see if a component already exists
    // on an object by searching for a property of the same name.
    has: function(component) {
      return this[component] ? true : false; 
    },


    // Adds one or more components to an object. Accepts either 
    // a comma separated string or an array of strings that map
    // to component names.
    //
    // Instantiates a new component object of the correct type
    // (if the component exists) and then triggers an addComponent
    // event.
    //
    // Returns the object to allow chaining.
    add: function(components) {
      components = Q._normalizeArg(components);
      if(!this.activeComponents) { this.activeComponents = []; }
      for(var i=0,len=components.length;i<len;i++) {
        var name = components[i],
            Comp = Q.components[name];
        if(!this.has(name) && Comp) { 
          var c = new Comp(this); 
          this.trigger('addComponent',c);
        }
      }
      return this;
    }, 

    // Removes one or more components from an object. Accepts the
    // same style of parameters as `add`. Triggers a delComponent event
    // and and calls destroy on the component.
    //
    // Returns the element to allow chaining.
    del: function(components) {
      components = Q._normalizeArg(components);
      for(var i=0,len=components.length;i<len;i++) {
        var name = components[i];
        if(name && this.has(name)) { 
          this.trigger('delComponent',this[name]);
          this[name].destroy(); 
        }
      }
      return this;
    },

    // Destroys the object by calling debind and removing the
    // object from it's parent. Will trigger a destroyed event
    // callback.
    destroy: function() {
      if(this.isDestroyed) { return; }
      this.trigger('destroyed');
      this.debind();
      if(this.stage && this.stage.remove) {
        this.stage.remove(this);
      }
      this.isDestroyed = true;
      if(this.destroyed) { this.destroyed(); }
    }
  });

  // This registers a component with the engine, making it available to `Q.GameObject`'s 
  // This creates a new descendent class of `Q.Component` with new methods added in.
  Q.component = function(name,methods) {
    if(!methods) { return Q.components[name]; }
    methods.name = name;
    methods.componentName = "." + name;
    return (Q.components[name] = Q.Component.extend(name + "Component",methods));
  };


  // Generic Game State object that can be used to
  // track of the current state of the Game, for example when the player starts
  // a new game you might want to keep track of their score and remaining lives:
  //
  //     Q.reset({ score: 0, lives: 2 });
  //
  // Then in your game might want to add to the score:
  //     
  //      Q.state.inc("score",50);
  //
  // In your hud, you can listen for change events on the state to update your 
  // display:
  //
  //      Q.state.on("change.score",function() { .. update the score display .. });
  //
  Q.GameObject.extend("GameState",{
    init: function(p) {
      this.p = Q._extend({},p);
      this.listeners = {};
    },

    // Resets the state to value p
    reset: function(p) { this.init(p); this.trigger("reset"); },
    
    // Internal helper method to set an individual property
    _triggerProperty: function(value,key) {
      if(this.p[key] !== value) {
        this.p[key] = value;
        this.trigger("change." + key,value);
      }
    },

    // Set one or more properties, trigger events on those
    // properties changing
    set: function(properties,value) {
      if(Q._isObject(properties)) {
        Q._each(properties,this._triggerProperty,this);
      } else {
        this._triggerProperty(value,properties);
      }
      this.trigger("change");
    },

    // Increment an individual property by amount
    inc: function(property,amount) {
      this.set(property,this.get(property) + amount);
    },

    // Increment an individual property by amount
    dec: function(property,amount) {
      this.set(property,this.get(property) - amount);
    },

    // Return an individual property
    get: function(property) {
      return this.p[property];
    }
  });

  // The instance of the Q.stage property
  Q.state = new Q.GameState();

  // Reset the game state and unbind all state events
  Q.reset = function() { Q.state.reset(); };


  // Canvas Methods
  // ==============
  //
  // The `setup` and `clear` method are the only two canvas-specific methods in 
  // the core of Quintus. `imageData`  also uses canvas but it can be used in
  // any type of game.


  // Setup will either create a new canvas element and append it
  // to the body of the document or use an existing one. It will then
  // pull out the width and height of the canvas for engine use.
  //
  // It also adds a wrapper container around the element.
  //
  // If the `maximize` is set to true, the canvas element is maximized
  // on the page and the scroll trick is used to try to get the address bar away.
  //
  // The engine will also resample the game to CSS dimensions at twice pixel
  // dimensions if the `resampleWidth` or `resampleHeight` options are set.
  //
  // TODO: add support for auto-resize w/ engine event notifications, remove
  // jQuery.

  Q.touchDevice = ('ontouchstart' in document);

  Q.setup = function(id, options) {
    if(Q._isObject(id)) {
      options = id;
      id = null;
    }
    options = options || {};
    id = id || "quintus";

    if(Q._isString(id)) {
      Q.el = document.getElementById(id);
    } else {
      Q.el = id;
    }

    if(!Q.el) {
      Q.el = document.createElement("canvas");
      Q.el.width = options.width || 320;
      Q.el.height = options.height || 420;
      Q.el.id = id;

      document.body.appendChild(Q.el);
    }

    var w = parseInt(Q.el.width,10),
        h = parseInt(Q.el.height,10);

    var maxWidth = options.maxWidth || 5000,
        maxHeight = options.maxHeight || 5000,
        resampleWidth = options.resampleWidth,
        resampleHeight = options.resampleHeight,
        upsampleWidth = options.upsampleWidth,
        upsampleHeight = options.upsampleHeight;

    if(options.maximize === true || (Q.touchDevice && options.maximize === 'touch'))  {
      document.body.style.padding = 0;
      document.body.style.margin = 0;

      w = Math.min(window.innerWidth,maxWidth);
      h = Math.min(window.innerHeight - 5,maxHeight);

      if(Q.touchDevice) {
        Q.el.style.height = (h*2) + "px";
        window.scrollTo(0,1);

        w = Math.min(window.innerWidth,maxWidth);
        h = Math.min(window.innerHeight,maxHeight);
      }
    } else if(Q.touchDevice) {
      window.scrollTo(0,1);
    }

    if((upsampleWidth && w <= upsampleWidth) ||
       (upsampleHeight && h <= upsampleHeight)) {
      Q.el.style.height = h + "px";
      Q.el.style.width = w + "px";
      Q.el.width = w * 2;
      Q.el.height = h * 2;
    }
    else if(((resampleWidth && w > resampleWidth) ||
        (resampleHeight && h > resampleHeight)) && 
       Q.touchDevice) { 
      Q.el.style.height = h + "px";
      Q.el.style.width = w + "px";
      Q.el.width = w / 2;
      Q.el.height = h / 2;
    } else {
      Q.el.style.height = h + "px";
      Q.el.style.width = w + "px";
      Q.el.width = w;
      Q.el.height = h;
    }

    var elParent = Q.el.parentNode;

    if(elParent) {
      Q.wrapper = document.createElement("div");
      Q.wrapper.id = id + '_container';
      Q.wrapper.style.width = w + "px";
      Q.wrapper.style.margin = "0 auto";
      Q.wrapper.style.position = "relative";


      elParent.insertBefore(Q.wrapper,Q.el);
      Q.wrapper.appendChild(Q.el);
    }
    
    Q.el.style.position = 'relative';

    Q.ctx = Q.el.getContext && 
            Q.el.getContext("2d");


    Q.width = parseInt(Q.el.width,10);
    Q.height = parseInt(Q.el.height,10);
    Q.cssWidth = w;
    Q.cssHeight = h;

    window.addEventListener('orientationchange',function() {
      setTimeout(function() { window.scrollTo(0,1); }, 0);
    });

    return Q;
  };


  // Clear the canvas completely.
  Q.clear = function() {
    if(Q.clearColor) {
      Q.ctx.globalAlpha = 1;
      Q.ctx.fillStyle = Q.clearColor;
      Q.ctx.fillRect(0,0,Q.width,Q.height);
    } else {
      Q.ctx.clearRect(0,0,Q.width,Q.height);
    }
  };


  // Return canvas image data given an Image object.
  Q.imageData = function(img) {
    var canvas = document.createElement("canvas");
    
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img,0,0);

    return ctx.getImageData(0,0,img.width,img.height);
  };

  

  // Asset Loading Support
  // =====================
  //
  // The engine supports loading assets of different types using
  // `load` or `preload`. Assets are stored by their name so the 
  // same asset won't be loaded twice if it already exists.

  // Augmentable list of asset types, loads a specific asset 
  // type if the file type matches, otherwise defaults to a Ajax
  // load of the data.
  //
  // You can new types of assets based on file extension by
  // adding to `assetTypes` and adding a method called
  // loadAssetTYPENAME where TYPENAME is the name of the
  // type you added in.
  Q.assetTypes = { 
    png: 'Image', jpg: 'Image', gif: 'Image', jpeg: 'Image',
    ogg: 'Audio', wav: 'Audio', m4a: 'Audio', mp3: 'Audio'
  };

  // Determine the type of asset based on the lookup table above
  Q.assetType = function(asset) {
    /* Determine the lowercase extension of the file */
    var fileParts = asset.split("."),
        fileExt = fileParts[fileParts.length-1].toLowerCase();

    /* Lookup the asset in the assetTypes hash, or return other */
    return Q.assetTypes[fileExt] || 'Other';
  };

  // Loader for Images, creates a new `Image` object and uses the 
  // load callback to determine the image has been loaded
  Q.loadAssetImage = function(key,src,callback,errorCallback) {
    var img = new Image();
    img.onload = function() {  callback(key,img); };
    img.onerror = errorCallback;
    img.src = Q.options.imagePath + src;
  };


  // List of mime types given an audio file extension, used to 
  // determine what sound types the browser can play using the 
  // built-in `Sound.canPlayType`
  Q.audioMimeTypes = { mp3: 'audio/mpeg', 
                       ogg: 'audio/ogg; codecs="vorbis"',
                       m4a: 'audio/m4a',
                       wav: 'audio/wav' };

  // Loader for Audio assets. By default chops off the extension and 
  // will automatically determine which of the supported types is 
  // playable by the browser and load that type.
  //
  // Which types are available are determined by the file extensions
  // listed in the Quintus `options.audioSupported`
  Q.loadAssetAudio = function(key,src,callback,errorCallback) {
    if(!document.createElement("audio").play || !Q.options.sound) {
      callback(key,null);
      return;
    }

    var snd = new Audio(),
        baseName = Q._removeExtension(src),
        extension = null,
        filename = null;

    /* Find a supported type */
    extension = 
      Q._detect(Q.options.audioSupported,
         function(extension) {
         return snd.canPlayType(Q.audioMimeTypes[extension]) ? 
                                extension : null;
    });

    /* No supported audio = trigger ok callback anyway */
    if(!extension) {
      callback(key,null);
      return;
    }

    snd.addEventListener("error",errorCallback);
    snd.addEventListener('canplaythrough',function() { 
      callback(key,snd); 
    });
    snd.src = Q.options.audioPath + baseName + "." + extension;
    snd.load();
    return snd;
  };

  // Loader for other file types, just store the data
  // returned from an Ajax call.
  Q.loadAssetOther = function(key,src,callback,errorCallback) {
    var request = new XMLHttpRequest();

    var fileParts = src.split("."),
        fileExt = fileParts[fileParts.length-1].toLowerCase();

    request.onreadystatechange = function() {
      if(request.readyState === 4) {
        if(request.status === 200) {
          if(fileExt === 'json') {
            callback(key,JSON.parse(request.responseText));
          } else {
            callback(key,request.responseText);
          }
        } else {
          errorCallback();
        }
      }
    };

    request.open("GET",Q.options.dataPath + src, true);
    request.send(null);
  };

  // Helper method to return a name without an extension
  Q._removeExtension = function(filename) {
    return filename.replace(/\.(\w{3,4})$/,"");
  };

  // Asset hash storing any loaded assets
  Q.assets = {};


  // Getter method to return an asset by its name.
  //
  // Asset names default to their filenames, but can be overridden
  // by passing a hash to `load` to set different names.
  Q.asset = function(name) {
    return Q.assets[name];
  };

  // Load assets, and call our callback when done.
  //
  // Also optionally takes a `progressCallback` which will be called 
  // with the number of assets loaded and the total number of assets
  // to allow showing of a progress. 
  //
  // Assets can be passed in as an array of file names, and Quintus
  // will use the file names as the name for reference, or as a hash of 
  // `{ name: filename }`. 
  //
  // Example usage:
  //     Q.load(['sprites.png','sprites.,json'],function() {
  //        Q.stageScene("level1"); // or something to start the game.
  //     });
  Q.load = function(assets,callback,options) {
    var assetObj = {};

    /* Make sure we have an options hash to work with */
    if(!options) { options = {}; }

    /* Get our progressCallback if we have one */
    var progressCallback = options.progressCallback;

    var errors = false,
        errorCallback = function(itm) {
          errors = true;
          (options.errorCallback  ||
           function(itm) { throw("Error Loading: " + itm ); })(itm);
        };

    /* Convert to an array if it's a string */
    if(Q._isString(assets)) {
      assets = Q._normalizeArg(assets);
    }

    /* If the user passed in an array, convert it */
    /* to a hash with lookups by filename */
    if(Q._isArray(assets)) { 
      Q._each(assets,function(itm) {
        if(Q._isObject(itm)) {
          Q._extend(assetObj,itm);
        } else {
          assetObj[itm] = itm;
        }
      });
    } else {
      /* Otherwise just use the assets as is */
      assetObj = assets;
    }

    /* Find the # of assets we're loading */
    var assetsTotal = Q._keys(assetObj).length,
        assetsRemaining = assetsTotal;

    /* Closure'd per-asset callback gets called */
    /* each time an asset is successfully loadded */
    var loadedCallback = function(key,obj,force) {
      if(errors) { return; }

      // Prevent double callbacks (I'm looking at you Firefox, canplaythrough
      if(!Q.assets[key]||force) {

        /* Add the object to our asset list */
        Q.assets[key] = obj;

        /* We've got one less asset to load */
        assetsRemaining--;

        /* Update our progress if we have it */
        if(progressCallback) { 
           progressCallback(assetsTotal - assetsRemaining,assetsTotal); 
        }
      }

      /* If we're out of assets, call our full callback */
      /* if there is one */
      if(assetsRemaining === 0 && callback) {
        /* if we haven't set up our canvas element yet, */
        /* assume we're using a canvas with id 'quintus' */
        callback.apply(Q); 
      }
    };

    /* Now actually load each asset */
    Q._each(assetObj,function(itm,key) {

      /* Determine the type of the asset */
      var assetType = Q.assetType(itm);

      /* If we already have the asset loaded, */
      /* don't load it again */
      if(Q.assets[key]) {
        loadedCallback(key,Q.assets[key],true);
      } else {
        /* Call the appropriate loader function */
        /* passing in our per-asset callback */
        /* Dropping our asset by name into Q.assets */
        Q["loadAsset" + assetType](key,itm,
                                   loadedCallback,
                                   function() { errorCallback(itm); });
      }
    });

  };

  // Array to store any assets that need to be 
  // preloaded
  Q.preloads = [];
  
  // Let us gather assets to load at a later time,
  // and then preload them all at the same time with
  // a single callback. Options are passed through to the
  // Q.load method if used.
  //
  // Example usage:
  //      Q.preload("sprites.png");
  //      ...
  //      Q.preload("sprites.json");
  //      ...
  //
  //      Q.preload(function() {
  //         Q.stageScene("level1"); // or something to start the game
  //      });
  Q.preload = function(arg,options) {
    if(Q._isFunction(arg)) {
      Q.load(Q._uniq(Q.preloads),arg,options);
      Q.preloads = [];
    } else {
      Q.preloads = Q.preloads.concat(arg);
    }
  };


  // Math Methods
  // ==============
  //
  // Math methods, for rotating and scaling points

  // A list of matrices available
  Q.matrices2d = [];

  Q.matrix2d = function() {
    return Q.matrices2d.length > 0 ? Q.matrices2d.pop().identity() : new Q.Matrix2D();
  };

  // A 2D matrix class, optimized for 2D points,
  // where the last row of the matrix will always be 0,0,1 
  // Good Docs where: 
  //    https://github.com/heygrady/transform/wiki/calculating-2d-matrices
  Q.Matrix2D = Q.Class.extend({
    init: function(source) {

      if(source) {
        this.m = [];
        this.clone(source);
      } else {
        this.m = [1,0,0,0,1,0];
      }
    },

    // Turn this matrix into the identity
    identity: function() {
      var m = this.m;
      m[0] = 1; m[1] = 0; m[2] = 0;
      m[3] = 0; m[4] = 1; m[5] = 0;
      return this;
    },

    // Clone another matrix into this one
    clone: function(matrix) {
      var d = this.m, s = matrix.m;
      d[0]=s[0]; d[1]=s[1]; d[2] = s[2];
      d[3]=s[3]; d[4]=s[4]; d[5] = s[5];
      return this;
    },

    // a * b = 
    //   [ [ a11*b11 + a12*b21 ], [ a11*b12 + a12*b22 ], [ a11*b31 + a12*b32 + a13 ] ,
    //   [ a21*b11 + a22*b21 ], [ a21*b12 + a22*b22 ], [ a21*b31 + a22*b32 + a23 ] ]
    multiply: function(matrix) {
      var a = this.m, b = matrix.m;

      var m11 = a[0]*b[0] + a[1]*b[3];
      var m12 = a[0]*b[1] + a[1]*b[4];
      var m13 = a[0]*b[2] + a[1]*b[5] + a[2];

      var m21 = a[3]*b[0] + a[4]*b[3];
      var m22 = a[3]*b[1] + a[4]*b[4];
      var m23 = a[3]*b[2] + a[4]*b[5] + a[5];

      a[0]=m11; a[1]=m12; a[2] = m13;
      a[3]=m21; a[4]=m22; a[5] = m23;
      return this;
    },

    // Multiply this matrix by a rotation matrix rotated radians radians 
    rotate: function(radians) {
      if(radians === 0) { return this; }
      var cos = Math.cos(radians),
          sin = Math.sin(radians),
          m = this.m;

      var m11 = m[0]*cos  + m[1]*sin;
      var m12 = m[0]*-sin + m[1]*cos;

      var m21 = m[3]*cos  + m[4]*sin;
      var m22 = m[3]*-sin + m[4]*cos;

      m[0] = m11; m[1] = m12; // m[2] == m[2]
      m[3] = m21; m[4] = m22; // m[5] == m[5]
      return this;
    },

    // Helper method to rotate by a set number of degrees
    rotateDeg: function(degrees) {
      if(degrees === 0) { return this; }
      return this.rotate(Math.PI * degrees / 180);
    },

    // Multiply this matrix by a scaling matrix scaling sx and sy
    scale: function(sx,sy) {
      var m = this.m;
      if(sy === void 0) { sy = sx; }

      m[0] *= sx;
      m[1] *= sy;
      m[3] *= sx;
      m[4] *= sy;
      return this;
    },


    // Multiply this matrix by a translation matrix translate by tx and ty
    translate: function(tx,ty) {
      var m = this.m;

      m[2] += m[0]*tx + m[1]*ty;
      m[5] += m[3]*tx + m[4]*ty;
      return this;
    },

    // Memory Hoggy version
    transform: function(x,y) {
      return [ x * this.m[0] + y * this.m[1] + this.m[2], 
               x * this.m[3] + y * this.m[4] + this.m[5] ];
    },

    // Transform an object with an x and y property by this Matrix
    transformPt: function(obj) {
      var x = obj.x, y = obj.y;

      obj.x = x * this.m[0] + y * this.m[1] + this.m[2];
      obj.y = x * this.m[3] + y * this.m[4] + this.m[5];

      return obj;
    },

    // Transform an array with an x and y property by this Matrix
    transformArr: function(inArr,outArr) {
      var x = inArr[0], y = inArr[1];
      
      outArr[0] = x * this.m[0] + y * this.m[1] + this.m[2];
      outArr[1] = x * this.m[3] + y * this.m[4] + this.m[5];

      return outArr;
    },


    // Return just the x component by this Matrix
    transformX: function(x,y) {
      return x * this.m[0] + y * this.m[1] + this.m[2];
    },

    // Return just the y component by this Matrix
    transformY: function(x,y) {
      return x * this.m[3] + y * this.m[4] + this.m[5];
    },

    // Release this Matrix to be reused
    release: function() {
      Q.matrices2d.push(this);
      return null;
    },

    setContextTransform: function(ctx) {
      var m = this.m;
      // source:
      //  m[0] m[1] m[2]
      //  m[3] m[4] m[5]
      //  0     0   1
      //
      // destination:
      //  m11  m21  dx
      //  m12  m22  dy
      //  0    0    1
      //  setTransform(m11, m12, m21, m22, dx, dy)
      ctx.transform(m[0],m[3],m[1],m[4],m[2],m[5]);
      //ctx.setTransform(m[0],m[1],m[2],m[3],m[4],m[5]);
    }

  });

  // And that's it..
  // ===============
  //
  // Return the `Q` object from the `Quintus()` factory method. Create awesome games. Repeat.
  return Q;
};

// Lastly, add in the `requestAnimationFrame` shim, if necessary. Does nothing 
// if `requestAnimationFrame` is already on the `window` object.
(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = 
          window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame) {
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
    }
 
    if (!window.cancelAnimationFrame) {
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
    }
}());



/*global Quintus:false */
/*global $:false */

Quintus.SVG = function(Q) {
  var SVG_NS ="http://www.w3.org/2000/svg"; 
  Q.setupSVG = function(id,options) {
    options = options || {};
    id = id || "quintus";
    Q.svg = $(Q._isString(id) ? "#" + id : id)[0];
    if(!Q.svg) {
      Q.svg = document.createElementNS(SVG_NS,'svg');
      Q.svg.setAttribute('width',320);
      Q.svg.setAttribute('height',420);
      document.body.appendChild(Q.svg);
    }

    if(options.maximize) {
      var w = $(window).width()-1;
      var h = $(window).height()-10;
      Q.svg.setAttribute('width',w);
      Q.svg.setAttribute('height',h);
    }
 
    Q.width = Q.svg.getAttribute('width');
    Q.height = Q.svg.getAttribute('height');
    Q.wrapper = $(Q.svg)
                 .wrap("<div id='" + id + "_container'/>")
                 .parent()
                 .css({ width: Q.width,
                        height: Q.height,
                        margin: '0 auto' });
 
    setTimeout(function() { window.scrollTo(0,1); }, 0);
    $(window).bind('orientationchange',function() {
      setTimeout(function() { window.scrollTo(0,1); }, 0);
    });
    return Q;
  };

  Q.SVGSprite = Q.Sprite.extend({
    init: function(props) {
      this._super(Q._defaults(props,{
        shape: 'block',
        color: 'black',
        angle: 0,
        active: true,
        cx: 0,
        cy: 0
      }));
      this.createShape();
      this.svg.sprite = this;
      this.rp = {};
      this.setTransform();
    },

    set: function(attr) {
      Q._each(attr,function(value,key) {
        this.svg.setAttribute(key,value);
      },this);
    },
    
    createShape: function() {
      var p = this.p;
      switch(p.shape) {
        case 'block':
          this.svg = document.createElementNS(SVG_NS,'rect');
          Q._extend(p,{ cx: p.w/2, cy: p.h/2 });
          this.set({ width: p.w, height: p.h });
          break;
        case 'circle':
          this.svg = document.createElementNS(SVG_NS,'circle');
          this.set({ r: p.r, cx: 0, cy: 0 });
          break;
        case 'polygon':
          this.svg = document.createElementNS(SVG_NS,'polygon');
          var pts = Q._map(p.points, 
                          function(pt) { 
                            return pt[0] + "," + pt[1];
                          }).join(" ");
          this.set({ points: pts });
          break;
          
      }
      this.set({ fill: p.color });
      if(p.outline) {
        this.set({
          stroke: p.outline,
          "stroke-width": p.outlineWidth || 1
        });
      }
    },

    setTransform: function() {
      var p = this.p;
      var rp = this.rp;
      if(rp.x !== p.x || 
         rp.y !== p.y || 
         rp.angle !== p.angle ) {
        var transform = "translate(" + (p.x - p.cx) + "," +
                                       (p.y - p.cy) + ") " +
                        "rotate(" + p.angle + 
                                "," + p.cx +
                                "," + p.cy +
                                ")";
        this.svg.setAttribute('transform',transform);
        rp.angle = p.angle;
        rp.x = p.x;
        rp.y = p.y;
      } 
    },

    draw: function(ctx) {
      this.trigger('draw');
    },

    step: function(dt) {
      this.trigger('step',dt);
      this.setTransform();
    },

    destroy: function() {
      if(this.destroyed) { return false; }
      this._super();
      this.parent.svg.removeChild(this.svg);
    }
  });


  Q.SVGStage = Q.Stage.extend({
    init: function(scene) {
      this.svg = document.createElementNS(SVG_NS,'svg');
      this.svg.setAttribute('width',Q.width);
      this.svg.setAttribute('height',Q.height);
      Q.svg.appendChild(this.svg);
      
      this.viewBox = { x: 0, y: 0, w: Q.width, h: Q.height };
      this._super(scene);
    },

    insert: function(itm) {
      if(itm.svg) { this.svg.appendChild(itm.svg); }
      return this._super(itm);
    },

    destroy: function() {
      Q.svg.removeChild(this.svg);
      this._super();
    },

    viewport: function(w,h) {
      this.viewBox.w = w;
      this.viewBox.h = h;
      if(this.viewBox.cx || this.viewBox.cy) {
        this.centerOn(this.viewBox.cx,
                      this.viewBox.cy);
      } else {
        this.setViewBox();
      }
    },

    centerOn: function(x,y) {
      this.viewBox.cx = x;
      this.viewBox.cy = y;
      this.viewBox.x = x - this.viewBox.w/2;
      this.viewBox.y = y - this.viewBox.h/2;
      this.setViewBox();
    },

    setViewBox: function() {
      this.svg.setAttribute('viewBox',
                            this.viewBox.x + " " + this.viewBox.y + " " +
                            this.viewBox.w + " " + this.viewBox.h);
    },

    browserToWorld: function(x,y) {
      var m = this.svg.getScreenCTM();
      var p = this.svg.createSVGPoint();
      p.x = x; p.y = y;
      return p.matrixTransform(m.inverse());
    }
  });

  Q.svgOnly = function() {
    Q.Stage = Q.SVGStage;
    Q.setup = Q.setupSVG;
    Q.Sprite = Q.SVGSprite;
    return Q;
  };


};


/*global Quintus:false */

Quintus.Audio = function(Q) {

  Q.audio = {
    channels: [],
    channelMax:  Q.options.channelMax || 10,
    active: {}
  };

  Q.enableSound = function() {
    var hasTouch =  !!('ontouchstart' in window);

    if(!hasTouch) {
      Q.audio.enableDesktopSound();
    } else {
      Q.audio.enableMobileSound();
    }

    return Q;
  };

  // Dummy methods
  Q.play = function() {};
  Q.audioSprites = function() {};

  Q.audio.enableDesktopSound = function() {
    for (var i=0;i<Q.audio.channelMax;i++) {	
      Q.audio.channels[i] = {};
      Q.audio.channels[i]['channel'] = new Audio(); 
      Q.audio.channels[i]['finished'] = -1;	
    }

    Q.play = function(s,debounce) {
      if(Q.audio.active[s]) { return; }
      if(debounce) {
        Q.audio.active[s] = true;
        setTimeout(function() {
          delete Q.audio.active[s];
        },debounce);
      }
      for (var i=0;i<Q.audio.channels.length;i++) {
        var now = new Date();
        if (Q.audio.channels[i]['finished'] < now.getTime()) {	
          Q.audio.channels[i]['finished'] = now.getTime() + Q.asset(s).duration*1000;
          Q.audio.channels[i]['channel'].src = Q.asset(s).src;
          Q.audio.channels[i]['channel'].load();
          Q.audio.channels[i]['channel'].play();
          break;
        }
      }
    };
  };

  Q.audio.enableMobileSound = function() {
    var isiOS = navigator.userAgent.match(/iPad|iPod|iPhone/i) != null;

    Q.audioSprites = function(asset) {
      if(Q._isString(asset)) { asset = Q.asset(asset); }

      Q.audio.spriteFile = asset['resources'][0].replace(/\.[a-z]+$/,"");
      Q.audio.sprites = asset['spritemap'];

      Q.el.addEventListener("touchstart",Q.audio.start);
    };

    // Turn off normal sound loading and processing
    Q.options.sound = false;

    Q.audio.timer = function() {
      Q.audio.sheet.currentTime = 0;
      Q.audio.sheet.play();
      Q.audio.silenceTimer = setTimeout(Q.audio.timer,500);
    };

    Q.audio.start = function() {
      Q.audio.sheet = new Audio();
      Q.audio.sheet.preload = true;
      Q.audio.sheet.addEventListener("canplaythrough", function() {
        Q.audio.sheet.play();
        Q.audio.silenceTimer = setTimeout(Q.audio.timer,500);
      });

      var spriteFilename = Q.options.audioPath + Q.audio.spriteFile;
      if(isiOS) {
        Q.audio.sheet.src = spriteFilename + ".caf";
      } else {
        Q.audio.sheet.src = spriteFilename + ".mp3";
      }
      Q.audio.sheet.load();

      Q.el.removeEventListener("touchstart",Q.audio.start);
    };

    Q.play = function(sound,debounce) {
      if(!Q.audio.sheet || !Q.audio.silenceTimer) { return; }
      if(Q.audio.activeSound) { return; }
      if(debounce) {
        Q.activeSound = true;
        setTimeout(function() {
          Q.audio.activeSound = null;
        },debounce);
      }
      sound = sound.replace(/\.[a-z0-9]+$/,"");

      if(Q.audio.sprites && Q.audio.sprites[sound]) {

        var startTime = Q.audio.sprites[sound].start - 0.05,
            endDelay = Q.audio.sprites[sound].end - startTime;

        Q.audio.sheet.currentTime = startTime;
        Q.audio.sheet.play();

        clearTimeout(Q.audio.silenceTimer);
        Q.audio.silenceTimer = setTimeout(Q.audio.timer,endDelay*1000 + 500);
      }
    };

  };
};
  

/*global Quintus:false */

Quintus.UI = function(Q) {
  if(Q._isUndefined(Quintus.Touch)) {
    throw "Quintus.UI requires Quintus.Touch Module";
  }

  Q.UI = {};

  // Draw a rounded rectangle centered on 0,0
  Q.UI.roundRect = function(ctx, rect) {
    ctx.beginPath();
    ctx.moveTo(-rect.cx + rect.radius, -rect.cy);
    ctx.lineTo(-rect.cx + rect.w - rect.radius, -rect.cy);
    ctx.quadraticCurveTo(-rect.cx + rect.w, -rect.cy, -rect.cx + rect.w, -rect.cy + rect.radius);
    ctx.lineTo(-rect.cx + rect.w, -rect.cy + rect.h - rect.radius);
    ctx.quadraticCurveTo(-rect.cx + rect.w, 
                         -rect.cy + rect.h, 
                         -rect.cx + rect.w - rect.radius, 
                         -rect.cy + rect.h);
    ctx.lineTo(-rect.cx + rect.radius, -rect.cy + rect.h);
    ctx.quadraticCurveTo(-rect.cx, -rect.cy + rect.h, -rect.cx, -rect.cy + rect.h - rect.radius);
    ctx.lineTo(-rect.cx, -rect.cy + rect.radius);
    ctx.quadraticCurveTo(-rect.cx, -rect.cy, -rect.cx + rect.radius, -rect.cy);
    ctx.closePath();
  };



  Q.UI.Container = Q.Sprite.extend("UI.Container", {
    init: function(p,defaults) {
      var adjustedP = Q._clone(p),
          match;

      if(Q._isString(p.w) && (match = p.w.match(/[0-9]%/))) {
        adjustedP.w = parseInt(p.w,10) * Q.width / 100;         
        adjustedP.x = Q.width/2 - adjustedP.w/2;
      }

      if(Q._isString(p.h) && (match = p.h.match(/[0-9]%/))) {
        adjustedP.h = parseInt(p.h,10) * Q.height / 100;         
        adjustedP.y = Q.height /2 - adjustedP.h/2;
      }

      this._super(adjustedP,{
        opacity: 1,
        hidden: false, // Set to true to not show the container
        fill:   null, // Set to color to add backbround
        radius: 5, // Border radius
        stroke: "#000", 
        border: false, // Set to a width to show a border
        shadow: false, // Set to true or a shadow offest
        shadowColor: false, // Set to a rgba value for the shadow
        type: Q.SPRITE_NONE
      });

    },

    insert: function(obj) {
      this.stage.insert(obj,this);
      return obj;
    },

    fit: function(paddingY,paddingX) {
      if(this.children.length === 0) { return; }

      if(paddingY === void 0) { paddingY = 0; }
      if(paddingX === void 0) { paddingX = paddingY; }

      var minX = Infinity,
          minY = Infinity,
          maxX = -Infinity,
          maxY = -Infinity;

      for(var i =0;i < this.children.length;i++) {
        var obj = this.children[i];
        var minObjX = obj.p.x - obj.p.cx,
            minObjY = obj.p.y - obj.p.cy,
            maxObjX = obj.p.x - obj.p.cx + obj.p.w,
            maxObjY = obj.p.y - obj.p.cy + obj.p.h;

        if(minObjX < minX) { minX = minObjX; }
        if(minObjY < minY) { minY = minObjY; }

        if(maxObjX > maxX) { maxX = maxObjX; }
        if(maxObjY > maxY) { maxY = maxObjY; }

      }

      this.p.cx = -minX + paddingX;
      this.p.cy = -minY + paddingY;
      this.p.w = maxX - minX + paddingX * 2;
      this.p.h = maxY - minY + paddingY * 2;
    },

    addShadow: function(ctx) {
      if(this.p.shadow) {
        var shadowAmount = Q._isNumber(this.p.shadow) ? this.p.shadow : 5;
        ctx.shadowOffsetX=shadowAmount;
        ctx.shadowOffsetY=shadowAmount;
        ctx.shadowColor = this.p.shadowColor || "rgba(0,0,50,0.1)";
      }
    },

    clearShadow: function(ctx) {
      ctx.shadowColor = "transparent";
    },

    drawRadius: function(ctx) {
      Q.UI.roundRect(ctx,this.p);
      this.addShadow(ctx);
      ctx.fill();
      if(this.p.border) {
        this.clearShadow(ctx);
        ctx.lineWidth = this.p.border;
        ctx.stroke();
      }
    },

    drawSquare: function(ctx) {
      this.addShadow(ctx);
      if(this.p.fill) { 
        ctx.fillRect(-this.p.cx,-this.p.cy,
                      this.p.w,this.p.h);
      }

      if(this.p.border) {
        this.clearShadow(ctx);
        ctx.lineWidth = this.p.border;
        ctx.strokeRect(-this.p.cx,-this.p.cy,
                        this.p.w,this.p.h);
      }
    },

    draw: function(ctx) {
      if(this.p.hidden) { return false; }
      if(!this.p.border && !this.p.fill) { return; }

      ctx.globalAlpha = this.p.opacity;
      ctx.fillStyle = this.p.fill;
      ctx.strokeStyle = this.p.stroke;

      if(this.p.radius > 0) { 
        this.drawRadius(ctx);
      } else {
        this.drawSquare(ctx);
      }

    }
  });


  Q.UI.Text = Q.Sprite.extend("UI.Text", {
    init: function(p,defaultProps) {
      this._super(Q._defaults(p||{},defaultProps),{
        type: Q.SPRITE_UI,
        size: 24
      });

      //this.el = document.createElement("canvas");
      //this.ctx = this.el.getContext("2d");

      if(this.p.label) {
        this.calcSize();
      }

      //this.prerender();
    },

    calcSize: function() {
      this.setFont(Q.ctx);
      this.splitLabel = this.p.label.split("\n");
      var maxLabel = "";
      for(var i = 0;i < this.splitLabel.length;i++) {
        if(this.splitLabel[i].length > maxLabel.length) {
          maxLabel = this.splitLabel[i];
        }
      }

      var metrics = Q.ctx.measureText(maxLabel);
      this.p.h = (this.p.size || 24) * this.splitLabel.length * 1.2;
      this.p.w = metrics.width;
      this.p.cx = this.p.w / 2;
      this.p.cy = this.p.h / 2;
    },

    prerender: function() {
      if(this.p.oldLabel === this.p.label) { return; }
      this.p.oldLabel = this.p.label;
      this.calcSize();
      this.el.width = this.p.w;
      this.el.height = this.p.h * 4;
      this.ctx.clearRect(0,0,this.p.w,this.p.h);

      this.ctx.fillStyle = "#FF0";
      this.ctx.fillRect(0,0,this.p.w,this.p.h/2);
      this.setFont(this.ctx);

      this.ctx.fillText(this.p.label,0,0);
    },

    draw: function(ctx) {
       //this.prerender();
      if(this.p.opacity === 0) { return; }

      if(this.p.oldLabel !== this.p.label) { this.calcSize(); }

      this.setFont(ctx);
      if(this.p.opacity !== void 0) { ctx.globalAlpha = this.p.opacity; }
      for(var i =0;i<this.splitLabel.length;i++) {
        if(this.p.align === 'center') { 
          ctx.fillText(this.splitLabel[i],0,-this.p.cy + i * this.p.size * 1.2);
        } else if(this.p.align === 'right') {
          ctx.fillText(this.splitLabel[i],this.p.cx,-this.p.cy + i * this.p.size * 1.2);
        } else { 
          ctx.fillText(this.splitLabel[i],-this.p.cx,-this.p.cy +i * this.p.size * 1.2);
        }
      }
    },

    asset: function() {
      return this.el;
    },

    setFont: function(ctx) {
      ctx.textBaseline = "top";
      ctx.font= this.font();
      ctx.fillStyle = this.p.color || "black";
      ctx.textAlign = this.p.align || "left";
    },

    font: function() {
      if(this.fontString) { return this.fontString; }

      this.fontString = (this.p.weight || "800") + " " +
                        (this.p.size || 24) + "px " +
                        (this.p.family || "Arial");

      return this.fontString;
    }

  });


  Q.UI.Button = Q.UI.Container.extend("UI.Button", {
    init: function(p,callback) {
      this._super(Q._defaults(p,{
        type: Q.SPRITE_UI | Q.SPRITE_DEFAULT
      }));
      if(this.p.label && (!this.p.w || !this.p.h)) {
        Q.ctx.save();
        this.setFont(Q.ctx);
        var metrics = Q.ctx.measureText(this.p.label);
        Q.ctx.restore();
        this.p.h = 24 + 20;
        this.p.w = metrics.width + 20;
        this.p.cx = this.p.w / 2;
        this.p.cy = this.p.h / 2;
      }

      this.callback = callback;
      this.on('touch',this,"highlight");
      this.on('touchEnd',this,"push");
    },

    highlight: function() {
      if(this.sheet() && this.sheet().frames > 1) {
        this.p.frame = 1;
      }
    },

    push: function() {
      this.p.frame = 0;
      if(this.callback) { this.callback(); }
      this.trigger('click');
    },

    draw: function(ctx) {
      this._super(ctx);

      if(this.p.asset || this.p.sheet) {
        Q.Sprite.prototype.draw.call(this,ctx);
      }

      if(this.p.label) {
        ctx.save();
        this.setFont(ctx);
        ctx.fillText(this.p.label,0,0);
        ctx.restore();
      }
    },

    setFont: function(ctx) {
      ctx.textBaseline = "middle";
      ctx.font = this.p.font || "400 24px arial";
      ctx.fillStyle = this.p.fontColor || "black";
      ctx.textAlign = "center";
    }

  });

  Q.UI.IFrame = Q.Sprite.extend("UI.IFrame", {
    init: function(p) {
      this._super(p, { opacity: 1, type: Q.SPRITE_UI | Q.SPRITE_DEFAULT });

      Q.wrapper.style.overflow = "hidden";

      this.iframe = document.createElement("IFRAME");
      this.iframe.setAttribute("src",this.p.url);
      this.iframe.style.position = "absolute";
      this.iframe.style.zIndex = 500;
      this.iframe.setAttribute("width",this.p.w);
      this.iframe.setAttribute("height",this.p.h);
      this.iframe.setAttribute("frameborder",0);

      if(this.p.background) {
        this.iframe.style.backgroundColor = this.p.background;

      }


      Q.wrapper.appendChild(this.iframe);
      this.on("inserted",function(parent) {
        this.positionIFrame();
        parent.on("destroyed",this,"remove");
      });
    },

    positionIFrame: function() {
      var x = this.p.x;
      var y = this.p.y;
      if(this.stage.viewport) {
        x -= this.stage.viewport.x;
        y -= this.stage.viewport.y;
      }

      if(this.oldX !== x || this.oldY !== y || this.oldOpacity !== this.p.opacity) {

        this.iframe.style.top = (y - this.p.cy) + "px";
        this.iframe.style.left = (x - this.p.cx) + "px";
        this.iframe.style.opacity = this.p.opacity;

        this.oldX = x;
        this.oldY = y;
        this.oldOpacity = this.p.opacity;
      }
    },

    step: function(dt) {
      this._super(dt);
      this.positionIFrame();
    },

    remove: function() {
      if(this.iframe) { 
        Q.wrapper.removeChild(this.iframe);
        this.iframe = null;
      }
    }
  });

  Q.UI.HTMLElement = Q.Sprite.extend("UI.HTMLElement", {
    init: function(p) {
      this._super(p, { opacity: 1, type: Q.SPRITE_UI  });

      Q.wrapper.style.overflow = "hidden";

      this.el = document.createElement("div");
      this.el.innerHTML = this.p.html;

      Q.wrapper.appendChild(this.el);
      this.on("inserted",function(parent) {
        this.position();
        parent.on("destroyed",this,"remove");
        parent.on("clear",this,"remove");
      });
    },

    position: function() {
    },

    step: function(dt) {
      this._super(dt);
      this.position();
    },

    remove: function() {
      if(this.el) { 
        Q.wrapper.removeChild(this.el);
        this.el= null;
      }
    }
  });

  Q.UI.VerticalLayout = Q.Sprite.extend("UI.VerticalLayout",{


    init: function(p) {
      this.children = [];
      this._super(p, { type: 0 });
    },

    insert: function(sprite) {
      this.stage.insert(sprite,this);
      this.relayout();
      // Bind to destroy
      return sprite;
    },

    relayout: function() {
      var totalHeight = 0;
      for(var i=0;i<this.children.length;i++) {
        totalHeight += this.children[i].p.h || 0;
      }

      // Center?
      var totalSepartion = this.p.h - totalHeight;

      // Make sure all elements have the same space between them
    }
  });



};

/*global Quintus:false */

Quintus.Anim = function(Q) {

  Q._animations = {};
  Q.animations = function(sprite,animations) {
    if(!Q._animations[sprite]) { Q._animations[sprite] = {}; }
    Q._extend(Q._animations[sprite],animations);
  };

  Q.animation = function(sprite,name) {
    return Q._animations[sprite] && Q._animations[sprite][name];
  };

  Q.component('animation',{
    added: function() {
      var p = this.entity.p;
      p.animation = null;
      p.animationPriority = -1;
      p.animationFrame = 0;
      p.animationTime = 0;
      this.entity.on("step",this,"step");
    },
    extend: {
      play: function(name,priority) {
        this.animation.play(name,priority);
      }
    },
    step: function(dt) {
      var entity = this.entity,
          p = entity.p;
      if(p.animation) {
        var anim = Q.animation(p.sprite,p.animation),
            rate = anim.rate || p.rate,
            stepped = 0;
        p.animationTime += dt;
        if(p.animationChanged) {
          p.animationChanged = false;
        } else { 
          p.animationTime += dt;
          if(p.animationTime > rate) {
            stepped = Math.floor(p.animationTime / rate);
            p.animationTime -= stepped * rate;
            p.animationFrame += stepped;
          }
        }
        if(stepped > 0) {
          if(p.animationFrame >= anim.frames.length) {
            if(anim.loop === false || anim.next) {
              p.animationFrame = anim.frames.length - 1;
              entity.trigger('animEnd');
              entity.trigger('animEnd.' + p.animation);
              p.animation = null;
              p.animationPriority = -1;
              if(anim.trigger) {  
                entity.trigger(anim.trigger,anim.triggerData);
              }
              if(anim.next) { this.play(anim.next,anim.nextPriority); }
              return;
            } else {
              entity.trigger('animLoop');
              entity.trigger('animLoop.' + p.animation);
              p.animationFrame = p.animationFrame % anim.frames.length;
            }
          }
          entity.trigger("animFrame");
        }
        p.sheet = anim.sheet || p.sheet;
        p.frame = anim.frames[p.animationFrame];
      }
    },

    play: function(name,priority) {
      var entity = this.entity,
          p = entity.p;
      priority = priority || 0;
      if(name !== p.animation && priority >= p.animationPriority) {
        p.animation = name;
        p.animationChanged = true;
        p.animationTime = 0;
        p.animationFrame = 0;
        p.animationPriority = priority;
        entity.trigger('anim');
        entity.trigger('anim.' + p.animation);
      }
    }
  
  });


  Q.Sprite.extend("Repeater",{
    init: function(props) {
      this._super(Q._defaults(props,{
        speedX: 1,
        speedY: 1,
        repeatY: true,
        repeatX: true
      }));
      this.p.repeatW = this.p.repeatW || this.p.w;
      this.p.repeatH = this.p.repeatH || this.p.h;
    },

    draw: function(ctx) {
      var p = this.p,
          asset = this.asset(),
          sheet = this.sheet(),
          scale = this.stage.viewport ? this.stage.viewport.scale : 1,
          viewX = this.stage.viewport ? this.stage.viewport.x : 0,
          viewY = this.stage.viewport ? this.stage.viewport.y : 0,
          offsetX = p.x + viewX * this.p.speedX,
          offsetY = p.y + viewY * this.p.speedY,
          curX, curY, startX;
      if(p.repeatX) {
        curX = Math.floor(-offsetX % p.repeatW);
        if(curX > 0) { curX -= p.repeatW; }
      } else {
        curX = p.x - viewX;
      }
      if(p.repeatY) {
        curY = Math.floor(-offsetY % p.repeatH);
        if(curY > 0) { curY -= p.repeatH; }
      } else {
        curY = p.y - viewY;
      }
      startX = curX;
      while(curY < Q.height / scale) {
        curX = startX;
        while(curX < Q.width / scale) {
          if(sheet) {
            sheet.draw(ctx,Math.floor(curX + viewX), Math.floor(curY + viewY),p.frame);
          } else {
            ctx.drawImage(asset,Math.floor(curX + viewX),Math.floor(curY + viewY));
          }
          curX += p.repeatW;
          if(!p.repeatX) { break; }
        }
        curY += p.repeatH;
        if(!p.repeatY) { break; }
      }
    }
  });

  Q.Tween = Q.Class.extend({
    init: function(entity,properties,duration,easing,options) {
      if(Q._isObject(easing)) { options = easing; easing = Q.Easing.Linear; }
      if(Q._isObject(duration)) { options = duration; duration = 1; }

      this.entity = entity;
      this.p = (entity instanceof Q.Stage) ? entity.viewport : entity.p;
      this.duration = duration || 1;
      this.time = 0;
      this.options = options || {};
      this.delay = this.options.delay || 0;
      this.easing = easing || this.options.easing || Q.Easing.Linear;


      this.startFrame = Q._loopFrame + 1;
      this.start = {};
      this.diff = {};
      for(var property in properties) {
        this.start[property] = this.p[property];
        if(!Q._isUndefined(this.start[property])) {
          this.diff[property] = properties[property] - this.start[property];
        }
      }
    },

    step: function(dt) {
      if(this.startFrame > Q._loopFrame) { return true; }
      if(this.delay >= dt) {
        this.delay -= dt;
        return true;
      }

      if(this.delay > 0) {
        dt -= this.delay;
        this.delay = 0;
      }

      this.time += dt;

      var progress = Math.min(1,this.time / this.duration),
          location = this.easing(progress);

      for(var property in this.start) {
        if(!Q._isUndefined(this.p[property])) {
          this.p[property] = this.start[property] + this.diff[property] * location;
        }
      }

      if(progress >= 1) {
        if(this.options.callback) { 
          this.options.callback.apply(this.entity);
        }
      }
      return progress < 1;
    }
  });

  // Code ripped directly from Tween.js
  // https://github.com/sole/tween.js/blob/master/src/Tween.js
  Q.Easing = {
    Linear: function (k) { return k; },

    Quadratic: {
      In: function ( k )  { return k * k; },
      Out: function ( k ) {return k * ( 2 - k ); },
      InOut: function ( k ) {
        if ((k *= 2 ) < 1) { return 0.5 * k * k; }
        return -0.5 * (--k * (k - 2) - 1);
      }
    }
  };

  Q.component('tween',{
    added: function() {
      this._tweens = [];
      this.entity.on("step",this,"step");
    },
    extend: {
      animate: function(properties,duration,easing,options) {
        this.tween._tweens.push(new Q.Tween(this,properties,duration,easing,options));
        return this;
      },

      chain: function(properties,duration,easing,options) {
        if(Q._isObject(easing)) { options = easing; easing = Q.Easing.Linear; }
        // Chain an animation to the end
        var tweenCnt = this.tween._tweens.length;
        if(this.tweenCnt > 0) {
          var lastTween = this.tween._tweens[tweenCnt - 1];
          options = options || {};
          options['delay'] = lastTween.duration - lastTween.time + lastTween.delay;
        } 

        this.animate(properties,duration,easing,options);
        return this;
      },

      stop: function() {
        this.tween._tweens.length = 0;
        return this;
      }
    },

    step: function(dt) {
      for(var i=this._tweens.length-1;i>=0;i--) {
        if(!this._tweens[i].step(dt)) {
          this._tweens.splice(i,1);
        }
      }
    }
  });


};


/*global Quintus:false */
/*global $:false */

Quintus.DOM = function(Q) {
  
  Q.setupDOM = function(id,options) {
    options = options || {};
    id = id || "quintus";
    Q.el = $(Q._isString(id) ? "#" + id : id);
    if(Q.el.length === 0) {
      Q.el = $("<div>")
                .attr('id',id)
                .css({width: 320, height:420 })
                .appendTo("body");
    }
    if(options.maximize) {
      var w = $(window).width();
      var h = $(window).height();
      Q.el.css({width:w,height:h});
    }
   Q.wrapper = Q.el
                 .wrap("<div id='" + id + "_container'/>")
                 .parent()
                 .css({ width: Q.el.width(),
                        height: Q.el.height(),
                        margin: '0 auto' });
    Q.el.css({ position:'relative', overflow: 'hidden' });
    Q.width = Q.el.width();
    Q.height = Q.el.height();
    setTimeout(function() { window.scrollTo(0,1); }, 0);
    $(window).bind('orientationchange',function() {
      setTimeout(function() { window.scrollTo(0,1); }, 0);
    });
    return Q;
  };

(function() { 
    function translateBuilder(attribute) {
      return function(dom,x,y) {
        dom.style[attribute] = 
        "translate(" + Math.floor(x) + "px," +
        Math.floor(y) + "px)";
      };
    }
    function translate3DBuilder(attribute) {
      return function(dom,x,y) {
        dom.style[attribute] = 
        "translate3d(" + Math.floor(x) + "px," +
        Math.floor(y) + "px,0px)";
      };
    }
    function scaleBuilder(attribute) {
      return function(dom,scale) {
        dom.style[attribute + 'Origin'] = "0% 0%";
        dom.style[attribute] = "scale(" + scale + ")";
      };
    }
    function fallbackTranslate(dom,x,y) {
      dom.style.left = x + "px";
      dom.style.top = y + "px";
    }
    var has3d =  ('WebKitCSSMatrix' in window && 
                  'm11' in new window.WebKitCSSMatrix());
    var dummyStyle = $("<div>")[0].style;
    var transformMethods = ['transform',
                            'webkitTransform',
                            'MozTransform',
                            'msTransform' ];
    for(var i=0;i<transformMethods.length;i++) {
      var transformName = transformMethods[i];
      if(!Q._isUndefined(dummyStyle[transformName])) {
        if(has3d) {
          Q.positionDOM = translate3DBuilder(transformName);
        } else {
          Q.positionDOM = translateBuilder(transformName); 
        }
        Q.scaleDOM = scaleBuilder(transformName);
        break;
      }
    }
    Q.positionDOM = Q.positionDOM || fallbackTranslate;
    Q.scaleDOM = Q.scaleDOM || function(scale) {};
  }());

  (function() {
     function transitionBuilder(attribute,prefix){
      return function(dom,property,sec,easing) {
        easing = easing || "";
        if(property === 'transform') {
          property = prefix + property;
        }
        sec = sec || "1s";
        dom.style[attribute] = property + " " + sec + " " + easing;
      };
    }
    // Dummy method
    function fallbackTransition() { }
    var dummyStyle = $("<div>")[0].style;
    var transitionMethods = ['transition',
                            'webkitTransition',
                            'MozTransition',
                            'msTransition' ];
    var prefixNames = [ '', '-webkit-', '-moz-', '-ms-' ];
    for(var i=0;i<transitionMethods.length;i++) {
      var transitionName = transitionMethods[i];
      var prefixName = prefixNames[i];
      if(!Q._isUndefined(dummyStyle[transitionName])) {
        Q.transitionDOM = transitionBuilder(transitionName,prefixName); 
        break;
      }
    }
    Q.transitionDOM = Q.transitionDOM || fallbackTransition;
  }());

  Q.DOMSprite = Q.Sprite.extend({
    init: function(props) {
      this._super(props);
      this.el = $("<div>").css({
        width: this.p.w,
        height: this.p.h,
        zIndex: this.p.z || 0,
        position: 'absolute'
      });
      this.dom = this.el[0];
      this.rp = {};
      this.setImage();
      this.setTransform();
    },
  
    setImage: function() {
      var asset;
      if(this.sheet()) {
        asset = Q.asset(this.sheet().asset);
      } else {
        asset = this.asset();
      }
      if(asset) {
        this.dom.style.backgroundImage = "url(" + asset.src + ")";
      }
    },
  
    setTransform: function() {
      var p = this.p;
      var rp = this.rp;
      if(rp.frame !== p.frame) {
        if(p.sheet) {
          this.dom.style.backgroundPosition = 
              (-this.sheet().fx(p.frame)) + "px " + 
              (-this.sheet().fy(p.frame)) + "px";
        } else {
          this.dom.style.backgroundPosition = "0px 0px";
        }
        rp.frame = p.frame;
      }
      if(rp.x !== p.x || rp.y !== p.y) {
        Q.positionDOM(this.dom,p.x,p.y);
        rp.x = p.x;
        rp.y = p.y;
      } 
    },

    hide: function() {
      this.dom.style.display = 'none';
    },

    show: function() {
      this.dom.style.display = 'block';
    },

    draw: function(ctx) {
      this.trigger('draw');
    },

    step: function(dt) {
      this.trigger('step',dt);
      this.setTransform();
    },

    destroy: function() {
      if(this.destroyed) { return false; }
      this._super();
      this.el.remove();
    }
  });
  

  if(Q.Stage) {
    Q.DOMStage = Q.Stage.extend({
      init: function(scene) {
        this.el = $("<div>").css({
          top:0,
          position:'relative'
        }).appendTo(Q.el);
        this.dom = this.el[0];
        this.wrapper = this.el.wrap('<div>').parent().css({
          position:'absolute',
          left:0,
          top:0
        });
        this.scale = 1;
        this.wrapper_dom = this.wrapper[0];
        this._super(scene);
      },

      insert: function(itm) {
        if(itm.dom) { this.dom.appendChild(itm.dom); }
        return this._super(itm);
      },

      destroy: function() {
        this.wrapper.remove();
        this._super();
      },

      rescale: function(scale) {
        this.scale = scale;
        Q.scaleDOM(this.wrapper_dom,scale);
      },

      centerOn: function(x,y) {
        this.x = Q.width/2/this.scale -  x;
        this.y = Q.height/2/this.scale - y;
        Q.positionDOM(this.dom,this.x,this.y);
      }
    });
  }

  Q.domOnly = function() {
    Q.Stage = Q.DOMStage;
    Q.setup = Q.setupDOM;
    Q.Sprite = Q.DOMSprite;
    return Q;
  };
  
  Q.DOMTileMap = Q.DOMSprite.extend({
    // Expects a sprite sheet, along with cols and rows properties
    init:function(props) {
      var sheet = Q.sheet(props.sheet);
      this._super(Q._extend(props,{
        w: props.cols * sheet.tilew,
        h: props.rows * sheet.tileh,
        tilew: sheet.tilew,
        tileh: sheet.tileh
      }));
      this.shown = [];
      this.domTiles = [];
    },

    setImage: function() { },
  
    setup: function(tiles,hide) {
      this.tiles = tiles;
      for(var y=0,height=tiles.length;y<height;y++) {
        this.domTiles.push([]);
        this.shown.push([]);
        for(var x=0,width=tiles[0].length;x<width;x++) {
          var domTile = this._addTile(tiles[y][x]);
          if(hide) { domTile.style.visibility = 'hidden'; }
          this.shown.push(hide ? false : true);
          this.domTiles[y].push(domTile);
        }
      }
    },

    _addTile: function(frame) {
      var p = this.p;
      var div = document.createElement('div');
      div.style.width = p.tilew + "px";
      div.style.height = p.tileh + "px";
      div.style.styleFloat = div.style.cssFloat = 'left';
      this._setTile(div,frame);
      this.dom.appendChild(div);
      return div;
    },

    _setTile: function(dom,frame) {
      var asset = Q.asset(this.sheet().asset);
      dom.style.backgroundImage = "url(" + asset.src + ")";
      dom.style.backgroundPosition = (-this.sheet().fx(frame)) +"px " + (-this.sheet().fy(frame)) + "px";
    },

    validTile: function(x,y) {
      return (y >= 0 && y < this.p.rows) && 
             (x >= 0 && x < this.p.cols);
    },

    get: function(x,y) { return this.validTile(x,y) ? 
                                this.tiles[y][x] : null; },

    getDom: function(x,y) { return this.validTile(x,y) ? 
                                   this.domTiles[y][x] : null; },
    set: function(x,y,frame) {
      if(!this.validTile(x,y)) { return; }
      this.tiles[y][x] = frame;
      var domTile = this.getDom(x,y);
      this._setFile(domTile,frame);
    },

    show: function(x,y) {
      if(!this.validTile(x,y)) { return; }
      if(this.shown[y][x]) { return; }
      this.getDom(x,y).style.visibility = 'visible';
      this.shown[y][x] = true;
    },

    hide: function(x,y) {
      if(!this.validTile(x,y)) { return; }
      if(!this.shown[y][x]) { return; }
      this.getDom(x,y).style.visibility = 'hidden';
      this.shown[y][x] = false;
    }
  }); 




};


/*global Quintus:false */

Quintus.Input = function(Q) {
  var KEY_NAMES = { LEFT: 37, RIGHT: 39, SPACE: 32,
                    UP: 38, DOWN: 40,
                    Z: 90, X: 88   
                  };
  
  var DEFAULT_KEYS = { LEFT: 'left', RIGHT: 'right',
                       UP: 'up',     DOWN: 'down',
                       SPACE: 'fire',
                       Z: 'fire',
                       X: 'action' };

  var DEFAULT_TOUCH_CONTROLS  = [ ['left','<' ],
                            ['right','>' ],
                            [],
                            ['action','b'],
                            ['fire', 'a' ]];

  // Clockwise from midnight (a la CSS)
  var DEFAULT_JOYPAD_INPUTS =  [ 'up','right','down','left'];

  Q.inputs = {};
  Q.joypad = {};

  var hasTouch =  !!('ontouchstart' in window);


  // Convert a canvas point to a stage point, x dimension
  Q.canvasToStageX = function(x,stage) {
    x = x / Q.cssWidth * Q.width;
    if(stage.viewport) {
      x /= stage.viewport.scale;
      x += stage.viewport.x;
    }

    return x;
  };

  Q.canvasToStageY = function(y,stage) {
      y = y / Q.cssWidth * Q.width;
      if(stage.viewport) {
        y /= stage.viewport.scale;
        y += stage.viewport.y;
      }

      return y;
  };



  Q.InputSystem = Q.Evented.extend({
    keys: {},
    keypad: {},
    keyboardEnabled: false,
    touchEnabled: false,
    joypadEnabled: false,

    bindKey: function(key,name) {
      Q.input.keys[KEY_NAMES[key] || key] = name;
    },

    keyboardControls: function(keys) {
      keys = keys || DEFAULT_KEYS;
      Q._each(keys,function(name,key) {
       this.bindKey(key,name);
      },Q.input);
      this.enableKeyboard();
    },

    enableKeyboard: function() {
      if(this.keyboardEnabled) { return false; }

      // Make selectable and remove an :focus outline
      Q.el.tabIndex = 0;
      Q.el.style.outline = 0;

      Q.el.addEventListener("keydown",function(e) {
        if(Q.input.keys[e.keyCode]) {
          var actionName = Q.input.keys[e.keyCode];
          Q.inputs[actionName] = true;
          Q.input.trigger(actionName);
          Q.input.trigger('keydown',e.keyCode);
        }
        e.preventDefault();
      },false);

      Q.el.addEventListener("keyup",function(e) {
        if(Q.input.keys[e.keyCode]) {
          var actionName = Q.input.keys[e.keyCode];
          Q.inputs[actionName] = false;
          Q.input.trigger(actionName + "Up");
          Q.input.trigger('keyup',e.keyCode);
        }
        e.preventDefault();
      },false);
      this.keyboardEnabled = true;
    },

    touchLocation: function(touch) {
      var el = Q.el, 
        posX = touch.offsetX,
        posY = touch.offsetY,
        touchX, touchY;

      if(Q._isUndefined(posX) || Q._isUndefined(posY)) {
        posX = touch.layerX;
        posY = touch.layerY;
      }

      if(Q._isUndefined(posX) || Q._isUndefined(posY)) {
        posX = touch.clientX;
        posY = touch.clientY;
      }

      touchX = Q.width * posX / Q.cssWidth;
      touchY = Q.height * posY / Q.cssHeight;

      return { x: touchX, y: touchY };
    },

    touchControls: function(opts) {
      if(this.touchEnabled) { return false; }
      if(!hasTouch) { return false; }

      Q.input.keypad = opts = Q._extend({
        left: 0,
        gutter:10,
        controls: DEFAULT_TOUCH_CONTROLS,
        width: Q.width,
        bottom: Q.height
      },opts);

      opts.unit = (opts.width / opts.controls.length);
      opts.size = opts.unit - 2 * opts.gutter;

      function getKey(touch) {
        var pos = Q.input.touchLocation(touch);
        for(var i=0,len=opts.controls.length;i<len;i++) {
          if(pos.x < opts.unit * (i+1)) {
            return opts.controls[i][0];
          }
        }
      }

      function touchDispatch(event) {
        var wasOn = {},
            i, len, tch, key, actionName;

        // Reset all the actions bound to controls
        // but keep track of all the actions that were on
        for(i=0,len = opts.controls.length;i<len;i++) {
          actionName = opts.controls[i][0];
          if(Q.inputs[actionName]) { wasOn[actionName] = true; }
          Q.inputs[actionName] = false;
        }

        var touches = event.touches ? event.touches : [ event ];

        for(i=0,len=touches.length;i<len;i++) {
          tch = touches[i];
          key = getKey(tch);

          if(key) {
            // Mark this input as on
            Q.inputs[key] = true;

            // Either trigger a new action
            // or remove from wasOn list
            if(!wasOn[key]) {
              Q.input.trigger(key);
            } else {
              delete wasOn[key];
            }
          }
        }

        // Any remaining were on the last frame
        // and need to trigger an up action
        for(actionName in wasOn) {
          Q.input.trigger(actionName + "Up");
        }

        return null;
      }

      this.touchDispatchHandler = function(e) {
        touchDispatch(e);
        e.preventDefault();
      };


      Q._each(["touchstart","touchend","touchmove","touchcancel"],function(evt) {
        Q.el.addEventListener(evt,this.touchDispatchHandler);
      },this);

      this.touchEnabled = true;
    },

    disableTouchControls: function() {
      Q._each(["touchstart","touchend","touchmove","touchcancel"],function(evt) {
        Q.el.removeEventListener(evt,this.touchDispatchHandler);
      },this);

      Q.el.removeEventListener('touchstart',this.joypadStart);
      Q.el.removeEventListener('touchmove',this.joypadMove);
      Q.el.removeEventListener('touchend',this.joypadEnd);
      Q.el.removeEventListener('touchcancel',this.joypadEnd);
      this.touchEnabled = false;
    },

   joypadControls: function(opts) {
      if(this.joypadEnabled) { return false; }
      if(!hasTouch) { return false; }

      var joypad = Q.joypad = Q._defaults(opts || {},{
        size: 50,
        trigger: 20,
        center: 25,
        color: "#CCC",
        background: "#000",
        alpha: 0.5,
        zone: Q.width / 2,
        joypadTouch: null,
        inputs: DEFAULT_JOYPAD_INPUTS,
        triggers: []
      });

      this.joypadStart = function(e) {
        if(joypad.joypadTouch === null) {
          var evt = e.originalEvent,
          touch = evt.changedTouches[0],
          loc = Q.input.touchLocation(touch);

          if(loc.x < joypad.zone) {
            joypad.joypadTouch = touch.identifier;
            joypad.centerX = loc.x;
            joypad.centerY = loc.y; 
            joypad.x = null;
            joypad.y = null;
          }
        }
      };

      
      this.joypadMove = function(e) {
        if(joypad.joypadTouch !== null) {
          var evt = e;

          for(var i=0,len=evt.changedTouches.length;i<len;i++) {
            var touch = evt.changedTouches[i];

            if(touch.identifier === joypad.joypadTouch) {
              var loc = Q.input.touchLocation(touch),
                  dx = loc.x - joypad.centerX,
                  dy = loc.y - joypad.centerY,
                  dist = Math.sqrt(dx * dx + dy * dy),
                  overage = Math.max(1,dist / joypad.size),
                  ang =  Math.atan2(dx,dy);

              if(overage > 1) {
                dx /= overage;
                dy /= overage;
                dist /= overage;
              }

              var triggers = [
                dy < -joypad.trigger,
                dx > joypad.trigger,
                dy > joypad.trigger,
                dx < -joypad.trigger
              ];

              for(var k=0;k<triggers.length;k++) {
                var actionName = joypad.inputs[k];
                if(triggers[k]) {
                  Q.inputs[actionName] = true;

                  if(!joypad.triggers[k]) { 
                    Q.input.trigger(actionName);
                  }
                } else {
                  Q.inputs[actionName] = false;
                  if(joypad.triggers[k]) { 
                    Q.input.trigger(actionName + "Up");
                  }
                }
              }

              Q._extend(joypad, {
                dx: dx, dy: dy,
                x: joypad.centerX + dx,
                y: joypad.centerY + dy,
                dist: dist,
                ang: ang,
                triggers: triggers
              });

              break;
            }
          }
        }
        e.preventDefault();
      };

      this.joypadEnd = function(e) { 
          var evt = e;

          if(joypad.joypadTouch !== null) {
            for(var i=0,len=evt.changedTouches.length;i<len;i++) { 
            var touch = evt.changedTouches[i];
              if(touch.identifier === joypad.joypadTouch) {
                for(var k=0;k<joypad.triggers.length;k++) {
                  var actionName = joypad.inputs[k];
                  Q.inputs[actionName] = false;
                }
                joypad.joypadTouch = null;
                break;
              }
            }
          }
          e.preventDefault();
      };


      Q.el.addEventListener("touchstart",this.joypadStart);
      Q.el.addEventListener("touchmove",this.joypadMove);
      Q.el.addEventListener("touchend",this.joypadEnd);
      Q.el.addEventListener("touchcancel",this.joypadEnd);

      this.joypadEnabled = true;
    },

    mouseControls: function(options) {
      options = options || {};

      var stageNum = options.stageNum || 0;
      var mouseInputX = options.mouseX || "mouseX";
      var mouseInputY = options.mouseY || "mouseY";

      var mouseMoveObj = {};

      Q.el.style.cursor = 'none';

      Q.inputs[mouseInputX] = 0;
      Q.inputs[mouseInputY] = 0;

      Q._mouseMove = function(e) {
        e.preventDefault();
        var touch = e.touches ? e.touches[0] : e;
        var el = Q.el, 
            posX = touch.offsetX,
            posY = touch.offsetY,
            eX, eY,
            stage = Q.stage(stageNum);

        if(Q._isUndefined(posX) || Q._isUndefined(posY)) {
          posX = touch.layerX;
          posY = touch.layerY;
        }

        if(Q._isUndefined(posX) || Q._isUndefined(posY)) {
          posX = touch.clientX;
          posY = touch.clientY;
        }

        if(stage) {
          mouseMoveObj.x= Q.canvasToStageX(posX,stage);
          mouseMoveObj.y= Q.canvasToStageY(posY,stage);

          Q.inputs[mouseInputX] = mouseMoveObj.x;
          Q.inputs[mouseInputY] = mouseMoveObj.y;

          Q.input.trigger('mouseMove',mouseMoveObj);
        }
      };

      Q.el.addEventListener('mousemove',Q._mouseMove,true);
      Q.el.addEventListener('touchstart',Q._mouseMove,true);
      Q.el.addEventListener('touchmove',Q._mouseMove,true);
    },

    disableMouseControls: function() {
      if(Q._mouseMove) {
        Q.el.removeEventListener("mousemove",Q._mouseMove);
        Q.el.style.cursor = 'inherit';
        Q._mouseMove = null;
      }
    },

    drawButtons: function() {
      var keypad = Q.input.keypad,
          ctx = Q.ctx;

      ctx.save();
      ctx.textAlign = "center"; 
      ctx.textBaseline = "middle";

      for(var i=0;i<keypad.controls.length;i++) {
        var control = keypad.controls[i];

        if(control[0]) {
          ctx.font = "bold " + (keypad.size/2) + "px arial";
          var x = i * keypad.unit + keypad.gutter,
              y = keypad.bottom - keypad.unit,
              key = Q.inputs[control[0]];

          ctx.fillStyle = keypad.color || "#FFFFFF";
          ctx.globalAlpha = key ? 1.0 : 0.5;
          ctx.fillRect(x,y,keypad.size,keypad.size);

          ctx.fillStyle = keypad.text || "#000000";
          ctx.fillText(control[1],
                       x+keypad.size/2,
                       y+keypad.size/2);
        }
      }

      ctx.restore();
    },

    drawCircle: function(x,y,color,size) {
      var ctx = Q.ctx,
          joypad = Q.joypad;

      ctx.save();
      ctx.beginPath();
      ctx.globalAlpha=joypad.alpha;
      ctx.fillStyle = color;
      ctx.arc(x, y, size, 0, Math.PI*2, true); 
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    },

    drawJoypad: function() {
      var joypad = Q.joypad;
      if(joypad.joypadTouch !== null) {
        Q.input.drawCircle(joypad.centerX,
                           joypad.centerY,
                           joypad.background,
                           joypad.size);

        if(joypad.x !== null) {
          Q.input.drawCircle(joypad.x,
                           joypad.y,
                           joypad.color,
                           joypad.center);
        }
      }

    },

    drawCanvas: function() {
      if(this.touchEnabled) {
        this.drawButtons();
      }

      if(this.joypadEnabled) {
        this.drawJoypad();
      }
    }


  });
  
  Q.input = new Q.InputSystem();

  Q.controls = function(joypad) {
    Q.input.keyboardControls();

    if(joypad) {
      Q.input.touchControls({
        controls: [ [],[],[],['action','b'],['fire','a']]
      });
      Q.input.joypadControls();
    } else {
      Q.input.touchControls();
    }

    return Q;
  };
  

  Q.component("platformerControls", {
    defaults: {
      speed: 200,
      jumpSpeed: -300
    },

    added: function() {
      var p = this.entity.p;

      Q._defaults(p,this.defaults);

      this.entity.on("step",this,"step");
      this.entity.on("bump.bottom",this,"landed");

      p.landed = 0;
      p.direction ='right';
    },

    landed: function(col) {
      var p = this.entity.p;
      p.landed = 1/5;
    },

    step: function(dt) {
      var p = this.entity.p;

      if(Q.inputs['left']) {
        p.vx = -p.speed;
        p.direction = 'left';
      } else if(Q.inputs['right']) {
        p.direction = 'right';
        p.vx = p.speed;
      } else {
        p.vx = 0;
      }

      if(p.landed > 0 && (Q.inputs['up'] || Q.inputs['action'])) {
        p.vy = p.jumpSpeed;
        p.landed = -dt;
      }
      p.landed -= dt;

    }
  });


  Q.component("stepControls", {

    added: function() {
      var p = this.entity.p;

      if(!p.stepDistance) { p.stepDistance = 32; }
      if(!p.stepDelay) { p.stepDelay = 0.2; }

      p.stepWait = 0;
      this.entity.on("step",this,"step");
      this.entity.on("hit", this,"collision");
    },

    collision: function(col) {
      var p = this.entity.p;

      if(p.stepping) {
        p.stepping = false;
        p.x = p.origX;
        p.y = p.origY;
      }

    },

    step: function(dt) {
      var p = this.entity.p,
          moved = false;
      p.stepWait -= dt;

      if(p.stepping) {
        p.x += p.diffX * dt / p.stepDelay;
        p.y += p.diffY * dt / p.stepDelay;
      }

      if(p.stepWait > 0) { return; }
      if(p.stepping) {
        p.x = p.destX;
        p.y = p.destY;
      }
      p.stepping = false;

      p.diffX = 0;
      p.diffY = 0;

      if(Q.inputs['left']) {
        p.diffX = -p.stepDistance;
      } else if(Q.inputs['right']) {
        p.diffX = p.stepDistance;
      }

      if(Q.inputs['up']) {
        p.diffY = -p.stepDistance;
      } else if(Q.inputs['down']) {
        p.diffY = p.stepDistance;
      }

      if(p.diffY || p.diffX ) { 
        p.stepping = true;
        p.origX = p.x;
        p.origY = p.y;
        p.destX = p.x + p.diffX;
        p.destY = p.y + p.diffY;
        p.stepWait = p.stepDelay; 
      }

    }

  });
};


/*global Quintus:false */

Quintus.Touch = function(Q) {
  if(Q._isUndefined(Quintus.Sprites)) {
    throw "Quintus.Touch requires Quintus.Sprites Module";
  }

  var hasTouch =  !!('ontouchstart' in window);

  var touchStage = [0];
  var touchType = 0;

  Q.Evented.extend("TouchSystem",{

    init: function() {
      var touchSystem = this;

      this.boundTouch = function(e) { touchSystem.touch(e); };
      this.boundDrag = function(e) { touchSystem.drag(e); };
      this.boundEnd = function(e) { touchSystem.touchEnd(e); };

      Q.el.addEventListener('touchstart',this.boundTouch);
      Q.el.addEventListener('mousedown',this.boundTouch);

      Q.el.addEventListener('touchmove',this.boundDrag);
      Q.el.addEventListener('mousemove',this.boundDrag);

      Q.el.addEventListener('touchend',this.boundEnd);
      Q.el.addEventListener('mouseup',this.boundEnd);
      Q.el.addEventListener('touchcancel',this.boundEnd);

      this.touchPos = new Q.Evented();
      this.touchPos.grid = {};
      this.touchPos.p = { w:1, h:1, cx: 0, cy: 0 };
      this.activeTouches = {};
      this.touchedObjects = {};
    },

    destroy: function() {
      Q.el.removeEventListener('touchstart',this.boundTouch);
      Q.el.removeEventListener('mousedown',this.boundTouch);

      Q.el.removeEventListener('touchmove',this.boundDrag);
      Q.el.removeEventListener('mousemove',this.boundDrag);

      Q.el.removeEventListener('touchend',this.boundEnd);
      Q.el.removeEventListener('mouseup',this.boundEnd);
      Q.el.removeEventListener('touchcancel',this.boundEnd);
    },

    normalizeTouch: function(touch,stage) {
      var canvasPosX = touch.offsetX,
          canvasPosY = touch.offsetY;
         
      if(Q._isUndefined(canvasPosX) || Q._isUndefined(canvasPosY)) {
        canvasPosX = touch.layerX;
        canvasPosY = touch.layerY;
      }

      if(Q._isUndefined(canvasPosX) || Q._isUndefined(canvasPosY)) {
        canvasPosX = touch.clientX;
        canvasPosY = touch.clientY;
      }


      this.touchPos.p.ox = this.touchPos.p.px = canvasPosX / Q.cssWidth * Q.width;
      this.touchPos.p.oy = this.touchPos.p.py = canvasPosY / Q.cssHeight * Q.height;
      
      if(stage.viewport) {
        this.touchPos.p.px /= stage.viewport.scale;
        this.touchPos.p.py /= stage.viewport.scale;
        this.touchPos.p.px += stage.viewport.x;
        this.touchPos.p.py += stage.viewport.y;
      }

      this.touchPos.p.x = this.touchPos.p.px;
      this.touchPos.p.y = this.touchPos.p.py;
      this.touchPos.obj = null;
      return this.touchPos;
    },

    touch: function(e) {
      var touches = e.changedTouches || [ e ];

      for(var i=0;i<touches.length;i++) {

        for(var stageIdx=0;stageIdx < touchStage.length;stageIdx++) {
          var touch = touches[i],
              stage = Q.stage(touchStage[stageIdx]);

          if(!stage) { continue; }

          touch.identifier = touch.identifier || 0;
          var pos = this.normalizeTouch(touch,stage);

          stage.regrid(pos,true);
          var col = stage.search(pos,touchType), obj;

          if(col || stageIdx === touchStage.length - 1) {
            obj = col && col.obj;
            pos.obj = obj;
            this.trigger("touch",pos);
          }

          if(obj && !this.touchedObjects[obj]) {
            this.activeTouches[touch.identifier] = {
              x: pos.p.px,
              y: pos.p.py,
              origX: obj.p.x,
              origY: obj.p.y,
              sx: pos.p.ox,
              sy: pos.p.oy,
              identifier: touch.identifier,
              obj: obj,
              stage: stage
            };
            this.touchedObjects[obj.p.id] = true;
            obj.trigger('touch', this.activeTouches[touch.identifier]);
            break;
          }

        }

      }
      //e.preventDefault();
    },

    drag: function(e) {
      var touches = e.changedTouches || [ e ];

      for(var i=0;i<touches.length;i++) {
        var touch = touches[i];
        touch.identifier = touch.identifier || 0;

        var active = this.activeTouches[touch.identifier],
            stage = active && active.stage;

        if(active) {
          var pos = this.normalizeTouch(touch,stage);
          active.x = pos.p.px;
          active.y = pos.p.py;
          active.dx = pos.p.ox - active.sx;
          active.dy = pos.p.oy - active.sy;

          active.obj.trigger('drag', active);
        }
      }
      e.preventDefault();
    },

    touchEnd: function(e) {
      var touches = e.changedTouches || [ e ];

      for(var i=0;i<touches.length;i++) {
        var touch = touches[i];

        touch.identifier = touch.identifier || 0;

        var active = this.activeTouches[touch.identifier];

        if(active) {
          active.obj.trigger('touchEnd', active);
          delete this.touchedObjects[active.obj.p.id];
          this.activeTouches[touch.identifier] = null;
        }
      }
      e.preventDefault();
    }

  });

  Q.touch = function(type,stage) {
    Q.untouch();
    touchType = type || Q.SPRITE_UI;
    touchStage = stage || [2,1,0];
    if(!Q._isArray(touchStage)) {
      touchStage = [touchStage];
    }

    if(!Q._touch) {
      Q.touchInput = new Q.TouchSystem();
    }
    return Q;
  };

  Q.untouch = function() {
    if(Q.touchInput) {
      Q.touchInput.destroy();
      delete Q['touchInput'];
    }
    return Q;
  };

};

/*global Quintus:false */
/*global Box2D:false */



Quintus.Physics = function(Q) {
  var B2d = Q.B2d = {
      World: Box2D.Dynamics.b2World,
      Vec: Box2D.Common.Math.b2Vec2,
      BodyDef: Box2D.Dynamics.b2BodyDef,
      Body: Box2D.Dynamics.b2Body,
      FixtureDef: Box2D.Dynamics.b2FixtureDef,
      Fixture: Box2D.Dynamics.b2Fixture,
      PolygonShape: Box2D.Collision.Shapes.b2PolygonShape,
      CircleShape: Box2D.Collision.Shapes.b2CircleShape,
      Listener:  Box2D.Dynamics.b2ContactListener
    };

  var defOpts = Q.PhysicsDefaults = {
    gravityX: 0,
    gravityY: 9.8,
    scale: 30,
    velocityIterations: 8,
    positionIterations: 3
  };

  Q.register('world',{
    added: function() {
      this.opts = Q._extend({},defOpts);
      this._gravity = new B2d.Vec(this.opts.gravityX,
                                 this.opts.gravityY);
      this._world = new B2d.World(this._gravity, true);

      var physics = this,
          boundBegin = function(contact) { physics.beginContact(contact); },
          boundEnd = function(contact) { physics.endContact(contact); },
          boundPostSolve = function(contact,impulse) { physics.postSolve(contact,impulse); };
  
      this._listener = new B2d.Listener();
      this._listener.BeginContact = boundBegin;
      this._listener.EndContact = boundEnd;
      this._listener.PostSolve = boundPostSolve;
      this._world.SetContactListener(this._listener);
      
      this.col = {};
      this.scale = this.opts.scale;
      this.entity.bind('step',this,'boxStep');
    },

    setCollisionData: function(contact,impulse) {
      var spriteA = contact.GetFixtureA().GetBody().GetUserData(),
          spriteB = contact.GetFixtureB().GetBody().GetUserData();
       
      this.col["a"] = spriteA;
      this.col["b"] = spriteB;
      this.col["impulse"] = impulse;
      this.col["sprite"] = null;
    },

    beginContact: function(contact) {
      this.setCollisionData(contact,null);
      this.col.a.trigger("contact",this.col.b);
      this.col.b.trigger("contact",this.col.a);
      this.entity.trigger("contact",this.col);
    },

    endContact: function(contact) {
      this.setCollisionData(contact,null);
      this.col.a.trigger("endContact",this.col.b);
      this.col.b.trigger("endContact",this.col.a);
      this.entity.trigger("endContact",this.col);
    },

    postSolve: function(contact, impulse) {
      this.setCollisionData(contact,impulse);
      this.col["sprite"] = this.col.b;
      this.col.a.trigger("impulse",this.col);
      this.col["sprite"] = this.col.a;
      this.col.b.trigger("impulse",this.col);
      this.entity.trigger("impulse",this.col);
    },

    createBody: function(def) {
      return this._world.CreateBody(def);
    },

    destroyBody: function(body) {
      return this._world.DestroyBody(body);
    },

    boxStep: function(dt) {
      if(dt > 1/20) { dt = 1/20; }
      this._world.Step(dt, 
                      this.opts.velocityIterations,
                      this.opts.positionIterations);
    }
  });

  var entityDefaults = Q.PhysicsEntityDefaults = {
    density: 1,
    friction: 1,
    restitution: 0.1
  };

  Q.register('physics',{
    added: function() {
      if(this.entity.stage) {
        this.inserted();
      } else {
        this.entity.bind('inserted',this,'inserted');
      }
      this.entity.bind('step',this,'step');
      this.entity.bind('removed',this,'removed');
    },

    position: function(x,y) {
      var stage = this.entity.stage;
      this._body.SetAwake(true);
      this._body.SetPosition(new B2d.Vec(x / stage.world.scale,
                                         y / stage.world.scale));
    },

    angle: function(angle) {
      this._body.SetAngle(angle / 180 * Math.PI);
    },

    velocity: function(x,y) {
      var stage = this.entity.stage;
      this._body.SetAwake(true);
      this._body.SetLinearVelocity(new B2d.Vec(x / stage.world.scale,
                                               y / stage.world.scale));
    },
 
    inserted: function() {
      var entity = this.entity,
          stage = entity.parent,
          scale = stage.world.scale,
          p = entity.p,
          ops = entityDefaults,
          def = this._def = new B2d.BodyDef(),
          fixtureDef = this._fixture = new B2d.FixtureDef();
            
      def.position.x = p.x / scale;
      def.position.y = p.y / scale;
      def.type = p.type === 'static' ? 
                 B2d.Body.b2_staticBody :
                 B2d.Body.b2_dynamicBody;
      def.active = true;
      
      this._body = stage.world.createBody(def); 
      this._body.SetUserData(entity);
      fixtureDef.density = p.density || ops.density;
      fixtureDef.friction = p.friction || ops.friction;
      fixtureDef.restitution = p.restitution || ops.restitution;
      
      switch(p.shape) {
        case "block":
          fixtureDef.shape = new B2d.PolygonShape();
          fixtureDef.shape.SetAsBox(p.w/2/scale, p.h/2/scale);
          break;
        case "circle":
          fixtureDef.shape = new B2d.CircleShape(p.r/scale);
          break;
        case "polygon":
          fixtureDef.shape = new B2d.PolygonShape();
          var pointsObj = Q._map(p.points,function(pt) {
            return { x: pt[0] / scale, y: pt[1] / scale };
          });
          fixtureDef.shape.SetAsArray(pointsObj, p.points.length);
          break;
      }
      
      this._body.CreateFixture(fixtureDef);
      this._body._bbid = p.id;
    },

    removed: function() {
      var entity = this.entity,
          stage = entity.parent;
      stage.world.destroyBody(this._body);
    },

    step: function() {
      var p = this.entity.p,
          stage = this.entity.stage,
          pos = this._body.GetPosition(),
          angle = this._body.GetAngle();
      p.x = pos.x * stage.world.scale;
      p.y = pos.y * stage.world.scale;
      p.angle = angle / Math.PI * 180;
    }
  });


};

/*global Quintus:false */

Quintus.Sprites = function(Q) {
 
  // Create a new sprite sheet
  // Options:
  //  tilew - tile width
  //  tileh - tile height
  //  w     - width of the sprite block
  //  h     - height of the sprite block
  //  sx    - start x
  //  sy    - start y
  //  cols  - number of columns per row
  Q.Class.extend("SpriteSheet",{
    init: function(name, asset,options) {
      if(!Q.asset(asset)) { throw "Invalid Asset:" + asset; }
      Q._extend(this,{
        name: name,
        asset: asset,
        w: Q.asset(asset).width,
        h: Q.asset(asset).height,
        tilew: 64,
        tileh: 64,
        sx: 0,
        sy: 0
        });
      if(options) { Q._extend(this,options); }
      this.cols = this.cols || 
                  Math.floor(this.w / this.tilew);
    },

    fx: function(frame) {
      return Math.floor((frame % this.cols) * this.tilew + this.sx);
    },

    fy: function(frame) {
      return Math.floor(Math.floor(frame / this.cols) * this.tileh + this.sy);
    },

    draw: function(ctx, x, y, frame) {
      if(!ctx) { ctx = Q.ctx; }
      ctx.drawImage(Q.asset(this.asset),
                    this.fx(frame),this.fy(frame),
                    this.tilew, this.tileh,
                    Math.floor(x),Math.floor(y),
                    this.tilew, this.tileh);

    }

  });


  Q.sheets = {};
  Q.sheet = function(name,asset,options) {
    if(asset) {
      Q.sheets[name] = new Q.SpriteSheet(name,asset,options);
    } else {
      return Q.sheets[name];
    }
  };

  Q.compileSheets = function(imageAsset,spriteDataAsset) {
    var data = Q.asset(spriteDataAsset);
    Q._each(data,function(spriteData,name) {
      Q.sheet(name,imageAsset,spriteData);
    });
  };


  Q.SPRITE_NONE     = 0;
  Q.SPRITE_DEFAULT  = 1;
  Q.SPRITE_PARTICLE = 2;
  Q.SPRITE_ACTIVE   = 4;
  Q.SPRITE_FRIENDLY = 8;
  Q.SPRITE_ENEMY    = 16;
  Q.SPRITE_POWERUP  = 32;
  Q.SPRITE_UI       = 64;
  Q.SPRITE_ALL   = 0xFFFF;


  Q._generatePoints = function(obj,force) {
    if(obj.p.points && !force) { return; }
    var p = obj.p,
        halfW = p.w/2,
        halfH = p.h/2;

    p.points = [ 
      [ -halfW, -halfH ],
      [  halfW, -halfH ],
      [  halfW,  halfH ],
      [ -halfW,  halfH ]
      ];
  };

 Q._generateCollisionPoints = function(obj) {
    if(!obj.matrix && !obj.refreshMatrix) { return; }
    if(!obj.c) { obj.c = { points: [] }; }
    var p = obj.p, c = obj.c;

    if(!p.moved && 
       c.origX === p.x &&
       c.origY === p.y &&
       c.origScale === p.scale &&
       c.origScale === p.angle) { 
        return;
    }

    c.origX = p.x;
    c.origY = p.y;
    c.origScale = p.scale;
    c.origAngle = p.angle;

    obj.refreshMatrix();

    var container = obj.container || Q._nullContainer;

    // TODO: see if we care or if it's more 
    // efficient just to do the calc each time
    c.x = container.matrix.transformX(p.x,p.y);
    c.y = container.matrix.transformY(p.x,p.y);
    c.angle = p.angle + container.c.angle;
    c.scale = (container.c.scale || 1) * (p.scale || 1);

    var minX = Infinity,
        minY = Infinity,
        maxX = -Infinity,
        maxY = -Infinity;

    for(var i=0;i<obj.p.points.length;i++) {
      if(!obj.c.points[i]) {
        obj.c.points[i] = [];
      }
      obj.matrix.transformArr(obj.p.points[i],obj.c.points[i]);
      var x = obj.c.points[i][0],
          y = obj.c.points[i][1];

          if(x < minX) { minX = x; }
          if(x > maxX) { maxX = x; }
          if(y < minY) { minY = y; }
          if(y > maxY) { maxY = y; }
    }

    if(minX === maxX) { maxX+=1; }
    if(minY === maxY) { maxY+=1; }

    c.cx = c.x - minX;
    c.cy = c.y - minY;

    c.w = maxX - minX;
    c.h = maxY - minY;

    // TODO: Invoke moved on children
  };
  
  
  
// Properties:
  //    x
  //    y
  //    z - sort order
  //    sheet or asset
  //    frame
  Q.GameObject.extend("Sprite",{
    init: function(props,defaultProps) {
      this.p = Q._extend({ 
        x: 0,
        y: 0,
        z: 0,
        angle: 0,
        frame: 0,
        type: Q.SPRITE_DEFAULT | Q.SPRITE_ACTIVE
      },defaultProps);

      this.matrix = new Q.Matrix2D();
      this.children = [];

      Q._extend(this.p,props); 

      this.size();
      this.p.id = this.p.id || Q._uniqueId();

      this.c = { points: [] };

      this.refreshMatrix();
    },

    // Resets the width, height and center based on the
    // asset or sprite sheet
    size: function(force) {
      if(force || (!this.p.w || !this.p.h)) { 
        if(this.asset()) {
          this.p.w = this.asset().width;
          this.p.h = this.asset().height;
        } else if(this.sheet()) {
          this.p.w = this.sheet().tilew;
          this.p.h = this.sheet().tileh;
        }
      } 

      this.p.cx = (force || this.p.cx === void 0) ? (this.p.w / 2) : this.p.cx;
      this.p.cy = (force || this.p.cy === void 0) ? (this.p.h / 2) : this.p.cy;
    },

    // Get or set the asset associate with this sprite
    asset: function(name,resize) {
      if(!name) { return Q.asset(this.p.asset); }

      this.p.asset = name;
      if(resize) {
        this.size(true);
        Q._generatePoints(this,true);
      }
    },

    // Get or set the sheet associate with this sprite
    sheet: function(name,resize) {
      if(!name) { return Q.sheet(this.p.sheet); }

      this.p.sheet = name;
      if(resize) { 
        this.size(true);
        Q._generatePoints(this,true);
      }
    },

    hide: function() {
      this.p.hidden = true;
    },

    show: function() {
      this.p.hidden = false;
    },

    set: function(properties) {
      Q._extend(this.p,properties);
      return this;
    },

    render: function(ctx) {
      var p = this.p;

      if(p.hidden) { return; }
      if(!ctx) { ctx = Q.ctx; }

      this.trigger('predraw',ctx);

      ctx.save();

        if(this.p.opacity !== void 0 && this.p.opacity !== 1) {
          ctx.globalAlpha = this.p.opacity;
        }

        this.matrix.setContextTransform(ctx);

        this.trigger('beforedraw',ctx);
        this.draw(ctx);
        this.trigger('draw',ctx);

      ctx.restore();
      
      // Children set up their own complete matrix
      // from the base stage matrix
      Q._invoke(this.children,"render",ctx);
      
      this.trigger('postdraw',ctx);

      if(Q.debug) { this.debugRender(ctx); }

    },

    center: function() {
      if(this.container) {
        this.p.x = this.container.p.w / 2;
        this.p.y = this.container.p.h / 2;
      } else {
        this.p.x = Q.width / 2;
        this.p.y = Q.height / 2;
      }

    },

    draw: function(ctx) {
      var p = this.p;
      if(p.sheet) {
        this.sheet().draw(ctx,-p.cx,-p.cy,p.frame);
      } else if(p.asset) {
        ctx.drawImage(Q.asset(p.asset),-p.cx,-p.cy);
      }
    },

    debugRender: function(ctx) {
      if(!this.p.points) {
        Q._generatePoints(this);
      }
      ctx.save();
      this.matrix.setContextTransform(ctx);
      ctx.beginPath();
      ctx.fillStyle = this.p.hit ? "blue" : "red";
      ctx.strokeStyle = "#FF0000";
      ctx.fillStyle = "rgba(0,0,0,0.5)";

      ctx.moveTo(this.p.points[0][0],this.p.points[0][1]);
      for(var i=0;i<this.p.points.length;i++) {
        ctx.lineTo(this.p.points[i][0],this.p.points[i][1]);
      }
      ctx.lineTo(this.p.points[0][0],this.p.points[0][1]);
      ctx.stroke();
      if(Q.debugFill) { ctx.fill(); }

      ctx.restore();

      if(this.c) { 
        var c = this.c;
        ctx.save();
          ctx.globalAlpha = 1;
          ctx.lineWidth = 2;
          ctx.strokeStyle = "#FF00FF";
          ctx.beginPath();
          ctx.moveTo(c.x - c.cx,       c.y - c.cy);
          ctx.lineTo(c.x - c.cx + c.w, c.y - c.cy);
          ctx.lineTo(c.x - c.cx + c.w, c.y - c.cy + c.h);
          ctx.lineTo(c.x - c.cx      , c.y - c.cy + c.h);
          ctx.lineTo(c.x - c.cx,       c.y - c.cy);
          ctx.stroke();
        ctx.restore();
      }
    },

    update: function(dt) {
      this.trigger('prestep',dt);
      if(this.step) { this.step(dt); }
      this.trigger('step',dt);
      this.refreshMatrix();

      // Ugly coupling to stage - workaround?
      if(this.stage && this.children.length > 0) {
        this.stage.updateSprites(this.children,dt,true);
      }
    },

    refreshMatrix: function() {
      var p = this.p;
      this.matrix.identity();

      if(this.container) { this.matrix.multiply(this.container.matrix); }
      
      this.matrix.translate(p.x,p.y);

      if(p.scale) { this.matrix.scale(p.scale,p.scale); }

      this.matrix.rotateDeg(p.angle);
    }
  });

  Q.Sprite.extend("MovingSprite",{
    init: function(props,defaultProps) {
      this._super(Q._extend({
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0
      },props),defaultProps);
   },

   step: function(dt) {
     var p = this.p;

     p.vx += p.ax * dt;
     p.vy += p.ay * dt;

     p.x += p.vx * dt;
     p.y += p.vy * dt;
   }
 });




  return Q;
};


/*global Quintus:false */

Quintus.Scenes = function(Q) {

  Q.scenes = {};
  Q.stages = [];

  Q.Scene = Q.Class.extend({
    init: function(sceneFunc,opts) {
      this.opts = opts || {};
      this.sceneFunc = sceneFunc;
    }
  });

  // Set up or return a new scene
  Q.scene = function(name,sceneObj,opts) {
    if(sceneObj === void 0) {
      return Q.scenes[name];
    } else {
      if(Q._isFunction(sceneObj)) {
        sceneObj = new Q.Scene(sceneObj,opts);
      }
      Q.scenes[name] = sceneObj;
      return sceneObj;
    }
  };

  Q._nullContainer = {
    c: {
      x: 0,
      y: 0,
      cx: 0,
      cy: 0,
      angle: 0,
      scale: 1
    },
    matrix: Q.matrix2d()
  };

 
  // Default to SAT collision between two objects
  // Thanks to doc's at: http://www.sevenson.com.au/actionscript/sat/
  // TODO: handle angles on objects 
  Q.collision = (function() { 
    var normalX, normalY,
        offset = [ 0,0 ],
        result1 = { separate: [] },
        result2 = { separate: [] };

    function calculateNormal(points,idx) {
      var pt1 = points[idx],
          pt2 = points[idx+1] || points[0];

      normalX = -(pt2[1] - pt1[1]);
      normalY = pt2[0] - pt1[0];

      var dist = Math.sqrt(normalX*normalX + normalY*normalY);
      if(dist > 0) {
        normalX /= dist;
        normalY /= dist;
      }
    }

    function dotProductAgainstNormal(point) {
      return (normalX * point[0]) + (normalY * point[1]);

    }

    function collide(o1,o2,flip) {
      var min1,max1,
          min2,max2,
          d1, d2,
          offsetLength,
          tmp, i, j,
          minDist, minDistAbs,
          shortestDist = Number.POSITIVE_INFINITY,
          collided = false,
          p1, p2;

      var result = flip ? result2 : result1;

      offset[0] = 0; //o1.x + o1.cx - o2.x - o2.cx;
      offset[1] = 0; //o1.y + o1.cy - o2.y - o2.cy;

      // If we have a position matrix, just use those points,
      if(o1.c) {
        p1 = o1.c.points;
      } else {
        p1 = o1.p.points;
        offset[0] += o1.p.x;
        offset[1] += o1.p.y;
      }

      if(o2.c) {
        p2 = o2.c.points;
      } else {
        p2 = o2.p.points;
        offset[0] += -o2.p.x;
        offset[1] += -o2.p.y; 
      }

      o1 = o1.p;
      o2 = o2.p;


      for(i = 0;i<p1.length;i++) {
        calculateNormal(p1,i);

        min1 = dotProductAgainstNormal(p1[0]);
        max1 = min1;

        for(j = 1; j<p1.length;j++) {
          tmp = dotProductAgainstNormal(p1[j]);
          if(tmp < min1) { min1 = tmp; }
          if(tmp > max1) { max1 = tmp; }
        }

        min2 = dotProductAgainstNormal(p2[0]);
        max2 = min2;

        for(j = 1;j<p2.length;j++) {
          tmp = dotProductAgainstNormal(p2[j]);
          if(tmp < min2) { min2 = tmp; }
          if(tmp > max2) { max2 = tmp; }
        }

        offsetLength = dotProductAgainstNormal(offset);
        min1 += offsetLength;
        max1 += offsetLength;

        d1 = min1 - max2;
        d2 = min2 - max1;

        if(d1 > 0 || d2 > 0) { return null; }

        minDist = (max2 - min1) * -1;
        if(flip) { minDist *= -1; }

        minDistAbs = Math.abs(minDist);

        if(minDistAbs < shortestDist) {
          result.distance = minDist;
          result.magnitude = minDistAbs;
          result.normalX = normalX;
          result.normalY = normalY;

          if(result.distance > 0) {
            result.distance *= -1;
            result.normalX *= -1;
            result.normalY *= -1;
          }

          collided = true;
          shortestDist = minDistAbs;
        }
      }

      // Do return the actual collision
      return collided ? result : null;
    }

    function satCollision(o1,o2) {
      var result1, result2, result;

      // Don't compare a square to a square for no reason
      // if(!o1.p.points && !o2.p.points) return true;

      if(!o1.p.points) { Q._generatePoints(o1); }
      if(!o2.p.points) { Q._generatePoints(o2); }

      Q._generateCollisionPoints(o1);
      Q._generateCollisionPoints(o2);

      result1 = collide(o1,o2);
      if(!result1) { return false; }

      result2 = collide(o2,o1,true);
      if(!result2) { return false; }

      result = (result2.magnitude < result1.magnitude) ? result2 : result1;

      if(result.magnitude === 0) { return false; }
      result.separate[0] = result.distance * result.normalX;
      result.separate[1] = result.distance * result.normalY;

      return result;
    }

    return satCollision;
  }());


  Q.overlap = function(o1,o2) {
    var c1 = o1.c || o1.p;
    var c2 = o2.c || o2.p;

    var o1x = c1.x - c1.cx,
        o1y = c1.y - c1.cy;
    var o2x = c2.x - c2.cx,
        o2y = c2.y - c2.cy;

    return !((o1y+c1.h<o2y) || (o1y>o2y+c2.h) ||
             (o1x+c1.w<o2x) || (o1x>o2x+c2.w));
  };

  Q.Stage = Q.GameObject.extend({
    // Should know whether or not the stage is paused
    defaults: {
      sort: false,
      gridW: 400,
      gridH: 400
    },

    init: function(scene,opts) {
      this.scene = scene;
      this.items = [];
      this.lists = {};
      this.index = {};
      this.removeList = [];
      this.grid = {};

      this.options = Q._extend({},this.defaults);
      if(this.scene)  { 
        Q._extend(this.options,scene.opts);
      }
      if(opts) { Q._extend(this.options,opts); }


      if(this.options.sort && !Q._isFunction(this.options.sort)) {
          this.options.sort = function(a,b) { return ((a.p && a.p.z) || -1) - ((b.p && b.p.z) || -1); };
      }
    },

    destroyed: function() {
      this.invoke("debind");
      this.trigger("destroyed");
    },

    // Needs to be separated out so the current stage can be set
    loadScene: function() {
      if(this.scene)  { 
        this.scene.sceneFunc(this);
      }
    },

    each: function(callback) {
      for(var i=0,len=this.items.length;i<len;i++) {
        callback.call(this.items[i],arguments[1],arguments[2]);
      }
    },

    invoke: function(funcName) {
      for(var i=0,len=this.items.length;i<len;i++) {              
        this.items[i][funcName].call(
          this.items[i],arguments[1],arguments[2]
        );
      }
    },

    detect: function(func) {
      for(var i = this.items.length-1;i >= 0; i--) {
        if(func.call(this.items[i],arguments[1],arguments[2],arguments[3])) {
          return this.items[i];
        }
      }
      return false;
    },


    identify: function(func) {
      var result;
      for(var i = this.items.length-1;i >= 0; i--) {
        if(result = func.call(this.items[i],arguments[1],arguments[2],arguments[3])) {
          return result;
        }
      }
      return false;
    },

    addToLists: function(lists,object) {
      for(var i=0;i<lists.length;i++) {
        this.addToList(lists[i],object);
      }
    },

    addToList: function(list, itm) {
      if(!this.lists[list]) { this.lists[list] = []; }
      this.lists[list].push(itm);
    },


    removeFromLists: function(lists, itm) {
      for(var i=0;i<lists.length;i++) {
        this.removeFromList(lists[i],itm);
      }
    },

    removeFromList: function(list, itm) {
      var listIndex = this.lists[list].indexOf(itm);
      if(listIndex !== -1) { 
        this.lists[list].splice(listIndex,1);
      }
    },

    insert: function(itm,container) {
      this.items.push(itm);
      itm.stage = this;
      itm.container = container;
      if(container) {
        container.children.push(itm);
      }

      itm.grid = {};


      // Make sure we have a square of collision points
      Q._generatePoints(itm);
      Q._generateCollisionPoints(itm);

      
      if(itm.className) { this.addToList(itm.className, itm); }
      if(itm.activeComponents) { this.addToLists(itm.activeComponents, itm); }

      if(itm.p) {
        this.index[itm.p.id] = itm;
      }
      this.trigger('inserted',itm);
      itm.trigger('inserted',this);

      this.regrid(itm);
      return itm;
    },

    remove: function(itm) {
      this.delGrid(itm);
      this.removeList.push(itm);
    },

    forceRemove: function(itm) {
      var idx =  this.items.indexOf(itm);
      if(idx !== -1) { 
        this.items.splice(idx,1);

        if(itm.className) { this.removeFromList(itm.className,itm); }
        if(itm.activeComponents) { this.removeFromLists(itm.activeComponents,itm); }
        if(itm.container) {
          var containerIdx = itm.container.children.indexOf(itm);
          if(containerIdx !== -1) {
            itm.container.children.splice(containerIdx,1);
          }
        }

        if(itm.destroy) { itm.destroy(); }
        if(itm.p.id) {
          delete this.index[itm.p.id];
        }
        this.trigger('removed',itm);
      }
    },

    pause: function() {
      this.paused = true;
    },

    unpause: function() {
      this.paused = false;
    },

    _gridCellCheck: function(type,id,obj,collisionMask) {
      if(!collisionMask || collisionMask & type) {
        var obj2 = this.index[id];
        if(obj2 && obj2 !== obj && Q.overlap(obj,obj2)) {
          var col= Q.collision(obj,obj2);
          if(col) {
            col.obj = obj2;
            return col;
          } else {
            return false;
          }
        }
      }
    },

    gridTest: function(obj,collisionMask,collisionLayer) {
      var grid = obj.grid, gridCell, col;

      for(var y = grid.Y1;y <= grid.Y2;y++) {
        if(this.grid[y]) {
          for(var x = grid.X1;x <= grid.X2;x++) {
            gridCell = this.grid[y][x];
            if(gridCell) { 
              col = Q._detect(gridCell,this._gridCellCheck,this,obj,collisionMask);
              if(col) { return col; }
            }
          }
        }
      }
      return false;
    },

    collisionLayer: function(layer) {
      this._collisionLayer = layer;
      this.insert(layer);
    },

    search: function(obj,collisionMask) {
      var col;

      collisionMask = collisionMask || (obj.p && obj.p.collisionMask);
      if(this._collisionLayer && (this._collisionLayer.p.type & collisionMask)) {
        col = this._collisionLayer.collide(obj);
        if(col) { return col; }
      }

      col = this.gridTest(obj,collisionMask,this._collisionLayer);
      return col;
    },

    _locateObj: {
      p: { 
        x: 0,
        y: 0,
        w: 1,
        h: 1
      }, grid: {}
    },

    locate: function(x,y,collisionMask) {
      var col = null;

      this._locateObj.p.x = x;
      this._locateObj.p.y = y;

      this.regrid(this._locateObj,true);

      if(this._collisionLayer && (this._collisionLayer.p.type & collisionMask)) {
        col = this._collisionLayer.collide(this._locateObj);
      }

      if(!col) { 
        col = this.gridTest(this._locateObj,collisionMask,this._collisionLayer);
      }

      if(col && col.obj) {
        return col.obj;
      } else {
        return false;
      }

    },

    collide: function(obj,collisionMask) {
      var col, col2, maxCol = 3;
      collisionMask = collisionMask || (obj.p && obj.p.collisionMask);
      this.regrid(obj);
      if(this._collisionLayer && (this._collisionLayer.p.type & collisionMask)) {
        while(maxCol > 0 && (col = this._collisionLayer.collide(obj))) {
          col.obj = this._collisionLayer;
          obj.trigger('hit',col);
          obj.trigger('hit.collision',col);
          this.regrid(obj);
          maxCol--;
        }
      }

      col2 = this.gridTest(obj,collisionMask,this._collisionLayer);
      if(col2) {
        obj.trigger('hit',col2);
        obj.trigger('hit.sprite',col2);

        // Do the recipricol collision
        // TODO: extract
        var obj2 = col2.obj;
        col2.obj = obj;
        col2.normalX *= -1;
        col2.normalY *= -1;
        col2.distance = 0;
        col2.magnitude = 0;
        col2.separate[0] = 0;
        col2.separate[1] = 0;

        obj2.trigger('hit',col2);
        obj2.trigger('hit.sprite',col2);

        this.regrid(obj);
      }

      return col2 || col;
    },

    delGrid: function(item) {
      var grid = item.grid;

      for(var y = grid.Y1;y <= grid.Y2;y++) {
        if(this.grid[y]) {
          for(var x = grid.X1;x <= grid.X2;x++) {
            if(this.grid[y][x]) {
            delete this.grid[y][x][item.p.id];
            }
          }
        }
      }
    },

    addGrid: function(item) {
      var grid = item.grid;

      for(var y = grid.Y1;y <= grid.Y2;y++) {
        if(!this.grid[y]) { this.grid[y] = {}; }
        for(var x = grid.X1;x <= grid.X2;x++) {
          if(!this.grid[y][x]) { this.grid[y][x] = {}; }
          this.grid[y][x][item.p.id] = item.p.type;
        }
      }

    },

    // Add an item into the collision detection grid,
    // Ignore the collision layer or objects without a type
    regrid: function(item,skipAdd) {
      if(this._collisionLayer && item === this._collisionLayer) { return; }
      if(!item.p.type && !skipAdd) { return; }

      var c = item.c || item.p;

      var gridX1 = Math.floor(c.x / this.options.gridW),
          gridY1 = Math.floor(c.y / this.options.gridH),
          gridX2 = Math.floor((c.x + c.w) / this.options.gridW),
          gridY2 = Math.floor((c.y + c.h) / this.options.gridH),
          grid = item.grid;

      if(grid.X1 !== gridX1 || grid.X2 !== gridX2 || 
         grid.Y1 !== gridY1 || grid.Y2 !== gridY2) {

         if(grid.X1 !== void 0) { this.delGrid(item); }
         grid.X1 = gridX1;
         grid.X2 = gridX2;
         grid.Y1 = gridY1;
         grid.Y2 = gridY2;

         if(!skipAdd) { this.addGrid(item); }
      }
    },

    updateSprites: function(items,dt,isContainer) {
      var item;

      for(var i=0,len=items.length;i<len;i++) {              
        item = items[i];
        if(isContainer || !item.container) { 
          item.update(dt);
          Q._generateCollisionPoints(item);
          this.regrid(item);
        }
      }
    },



    step:function(dt) {
      if(this.paused) { return false; }

      this.trigger("prestep",dt);
      this.updateSprites(this.items,dt);
      this.trigger("step",dt);

      if(this.removeList.length > 0) {
        for(var i=0,len=this.removeList.length;i<len;i++) {
          this.forceRemove(this.removeList[i]);
        }
        this.removeList.length = 0;
      }

      this.trigger('poststep',dt);
    },

    render: function(ctx) {
      if(this.options.sort) {
        this.items.sort(this.options.sort);
      }
      this.trigger("prerender",ctx);
      this.trigger("beforerender",ctx);

      for(var i=0,len=this.items.length;i<len;i++) {              
        var item = this.items[i];
        // Don't render sprites with containers (sprites do that themselves)
        if(!item.container) { 
          item.render(ctx);
        }
      }
      this.trigger("render",ctx);
      this.trigger("postrender",ctx);
    }
  });

  Q.activeStage = 0;

  Q.StageSelector = Q.Class.extend({
    emptyList: [],

    init: function(stage,selector) {
      this.stage = stage;
      this.selector = selector;

      // Generate an object list from the selector
      // TODO: handle array selectors
      this.items = this.stage.lists[this.selector] || this.emptyList;
      this.length = this.items.length;
    },

    each: function(callback) {
      for(var i=0,len=this.items.length;i<len;i++) {
        callback.call(this.items[i],arguments[1],arguments[2]);
      }
      return this;
    },

    invoke: function(funcName) {
      for(var i=0,len=this.items.length;i<len;i++) {              
        this.items[i][funcName].call(
          this.items[i],arguments[1],arguments[2]
        );
      }
      return this;
    },

    trigger: function(name,params) {
      this.invoke("trigger",name,params);
    },

    destroy: function() {
      this.invoke("destroy");
    },

    detect: function(func) {
      for(var i = 0,val=null, len=this.items.length; i < len; i++) {
        if(func.call(this.items[i],arguments[1],arguments[2])) {
          return this.items[i];
        }
      }
      return false;
    },

    identify: function(func) {
      var result = null;
      for(var i = 0,val=null, len=this.items.length; i < len; i++) {
        if(result = func.call(this.items[i],arguments[1],arguments[2])) {
          return result;
        }
      }
      return false;

    },

    // This hidden utility method extends
    // and object's properties with a source object.
    // Used by the p method to set properties.
    _pObject: function(source) {
      Q._extend(this.p,source);
    },

    _pSingle: function(property,value) {
      this.p[property] = value;
    },

    set: function(property, value) {
      // Is value undefined
      if(value === void 0) {
        this.each(this._pObject,property);
      } else {
        this.each(this._pSingle,property,value);
      }

      return this;
    },

    at: function(idx) {
      return this.items[idx];
    },

    first: function() {
      return this.items[0];
    },

    last: function() {
      return this.items[this.items.length-1];
    }

  });

  // Maybe add support for different types
  // entity - active collision detection
  //  particle - no collision detection, no adding components to lists / etc
  //

  // Q("Player").invoke("shimmer); - needs to return a selector
  // Q(".happy").invoke("sasdfa",'fdsafas',"fasdfas");
  // Q("Enemy").p({ a: "asdfasf"  });

  Q.select = function(selector,scope) {
    scope = (scope === void 0) ? Q.activeStage : scope;
    scope = Q.stage(scope);
    if(Q._isNumber(selector)) {
      return scope.index[selector];
    } else {
      return new Q.StageSelector(scope,selector);
      // check if is array
      // check is has any commas
         // split into arrays
      // find each of the classes
      // find all the instances of a specific class
    }
  };

  Q.stage = function(num) {
    // Use activeStage is num is undefined
    num = (num === void 0) ? Q.activeStage : num;
    return Q.stages[num];
  };

  Q.stageScene = function(scene,num,options) {
    // If it's a string, find a registered scene by that name
    if(Q._isString(scene)) {
      scene = Q.scene(scene);
    }

    // If the user skipped the num arg and went straight to options,
    // swap the two and grab a default for num
    if(Q._isObject(num)) {
      options = num;
      num = Q._popProperty(options,"stage") || (scene && scene.opts.stage) || 0;
    }

    // Clone the options arg to prevent modification
    options = Q._clone(options);

    // Grab the stage class, pulling from options, the scene default, or use
    // the default stage
    var StageClass = (Q._popProperty(options,"stageClass")) || 
                     (scene && scene.opts.stageClass) || Q.Stage;

    // Figure out which stage to use
    num = Q._isUndefined(num) ? ((scene && scene.opts.stage) || 0) : num;

    // Clean up an existing stage if necessary
    if(Q.stages[num]) {
      Q.stages[num].destroy();
    }

    // Make this this the active stage and initialize the stage,
    // calling loadScene to popuplate the stage if we have a scene.
    Q.activeStage = num;
    Q.stages[num] = new StageClass(scene,options);
    if(scene) {
      Q.stages[num].loadScene();
    }
    Q.activeStage = 0;

    // If there's no loop active, run the default stageGameLoop
    if(!Q.loop) {
      Q.gameLoop(Q.stageGameLoop);
    }

    // Finally return the stage to the user for use if needed
    return Q.stages[num];
  };

  Q.stageGameLoop = function(dt) {
    if(Q.ctx) { Q.clear(); }

    if(dt < 0) { dt = 1.0/60; }
    if(dt > 1/15) { dt  = 1.0/15; }

    for(var i =0,len=Q.stages.length;i<len;i++) {
      Q.activeStage = i;
      var stage = Q.stage();
      if(stage) {
        stage.step(dt);
        stage.render(Q.ctx);
      }
    }

    Q.activeStage = 0;

    if(Q.input && Q.ctx) { Q.input.drawCanvas(Q.ctx); }
  };

  Q.clearStage = function(num) {
    if(Q.stages[num]) { 
      Q.stages[num].destroy(); 
      Q.stages[num] = null;
    }
  };

  Q.clearStages = function() {
    for(var i=0,len=Q.stages.length;i<len;i++) {
      if(Q.stages[i]) { Q.stages[i].destroy(); }
    }
    Q.stages.length = 0;
  };


};


/*global Quintus:false */

Quintus["2D"] = function(Q) {

  Q.component('viewport',{
    added: function() {
      this.entity.on('prerender',this,'prerender');
      this.entity.on('render',this,'postrender');
      this.x = 0;
      this.y = 0;
      this.offsetX = 0;
      this.offsetY = 0;
      this.centerX = Q.width/2;
      this.centerY = Q.height/2;
      this.scale = 1;
    },

    extend: {
      follow: function(sprite,directions) {
        this.off('poststep',this.viewport,'follow');
        this.viewport.directions = directions || { x: true, y: true };
        this.viewport.following = sprite;
        this.on('poststep',this.viewport,'follow');
        this.viewport.follow(true);
      },

      unfollow: function() {
        this.off('poststep',this.viewport,'follow');
      },

      centerOn: function(x,y) {
        this.viewport.centerOn(x,y);
      },

      moveTo: function(x,y) {
        return this.viewport.moveTo(x,y);
      }
    },

    follow: function(first) {
      this[first === true ? 'centerOn' : 'softCenterOn'](
                    this.directions.x ? 
                      this.following.p.x + this.following.p.w/2 - this.offsetX :
                      undefined,
                    this.directions.y ?
                     this.following.p.y + this.following.p.h/2 - this.offsetY :
                     undefined
                  );
    },

    offset: function(x,y) {
      this.offsetX = x;
      this.offsetY = y;
    },

    softCenterOn: function(x,y) {
      if(x !== void 0) {
        this.x += (x - Q.width / 2 / this.scale - this.x)/3;
      }
      if(y !== void 0) { 
        this.y += (y - Q.height / 2 / this.scale - this.y)/3;
      }

    },
    centerOn: function(x,y) {
      if(x !== void 0) {
        this.x = x - Q.width / 2 / this.scale;
      }
      if(y !== void 0) { 
        this.y = y - Q.height / 2 / this.scale;
      }

    },

    moveTo: function(x,y) {
      if(x !== void 0) {
        this.x = x;
      }
      if(y !== void 0) { 
        this.y = y;
      }
      return this.entity;

    },

    prerender: function() {
      this.centerX = this.x + Q.width / 2 /this.scale;
      this.centerY = this.y + Q.height / 2 /this.scale;
      Q.ctx.save();
      Q.ctx.translate(Math.floor(Q.width/2),Math.floor(Q.height/2));
      Q.ctx.scale(this.scale,this.scale);
      Q.ctx.translate(-Math.floor(this.centerX), -Math.floor(this.centerY));
    },

    postrender: function() {
      Q.ctx.restore();
    }
  });


 Q.TileLayer = Q.Sprite.extend({

    init: function(props) {
      this._super(props,{
        tileW: 32,
        tileH: 32,
        blockTileW: 10,
        blockTileH: 10,
        type: 1
      });
      if(this.p.dataAsset) {
        this.load(this.p.dataAsset);
      }
      this.blocks = [];
      this.p.blockW = this.p.tileW * this.p.blockTileW;
      this.p.blockH = this.p.tileH * this.p.blockTileH;
      this.colBounds = {}; 
      this.directions = [ 'top','left','right','bottom'];

      this.collisionObject = { 
        p: {
          w: this.p.tileW,
          h: this.p.tileH,
          cx: this.p.tileW/2,
          cy: this.p.tileH/2
        }
      };

      this.collisionNormal = { separate: []};
    },

    load: function(dataAsset) {
      var data = Q._isString(dataAsset) ?  Q.asset(dataAsset) : dataAsset;
      this.p.tiles = data;
      this.p.rows = data.length;
      this.p.cols = data[0].length;
      this.p.w = this.p.rows * this.p.tileH;
      this.p.h = this.p.cols * this.p.tileW;
    },

    getTile: function(tileX,tileY) {
      return this.p.tiles[tileY] && this.p.tiles[tileY][tileX];
    },

    setTile: function(x,y,tile) {
      var p = this.p,
          blockX = Math.floor(x/p.blockTileW),
          blockY = Math.floor(y/p.blockTileH);

      if(blockX >= 0 && blockY >= 0 &&
         blockX < this.p.cols &&
         blockY <  this.p.cols) {
        this.p.tiles[y][x] = tile;
        if(this.blocks[blockY]) {
          this.blocks[blockY][blockX] = null;
        }
      }
    },

    tilePresent: function(tileX,tileY) {
      return this.p.tiles[tileY] && this.collidableTile(this.p.tiles[tileY][tileX]);
    },

    // Overload this method to draw tiles at frame 0 or not draw
    // tiles at higher number frames
    drawableTile: function(tileNum) {
      return tileNum > 0;
    },

    // Overload this method to control which tiles trigger a collision
    // (defaults to all tiles > number 0)
    collidableTile: function(tileNum) {
      return tileNum > 0;
    },

    collide: function(obj) {
      var p = this.p,
          tileStartX = Math.floor((obj.p.x - obj.p.cx - p.x) / p.tileW),
          tileStartY = Math.floor((obj.p.y - obj.p.cy - p.y) / p.tileH),
          tileEndX =  Math.floor((obj.p.x - obj.p.cx + obj.p.w - p.x) / p.tileW),
          tileEndY =  Math.floor((obj.p.y - obj.p.cy + obj.p.h - p.y) / p.tileH),
          colObj = this.collisionObject,
          normal = this.collisionNormal,
          col;
  
      normal.collided = false;

      for(var tileY = tileStartY; tileY<=tileEndY; tileY++) {
        for(var tileX = tileStartX; tileX<=tileEndX; tileX++) {
          if(this.tilePresent(tileX,tileY)) {
            colObj.p.x = tileX * p.tileW + p.x + p.tileW/2;
            colObj.p.y = tileY * p.tileH + p.y + p.tileH/2;
            
            col = Q.collision(obj,colObj);
            if(col && col.magnitude > 0 && 
               (!normal.collided || normal.magnitude < col.magnitude )) {
                 normal.collided = true;
                 normal.separate[0] = col.separate[0];
                 normal.separate[1] = col.separate[1];
                 normal.magnitude = col.magnitude;
                 normal.distance = col.distance;
                 normal.normalX = col.normalX;
                 normal.normalY = col.normalY;
                 normal.tileX = tileX;
                 normal.tileY = tileY;
                 normal.tile = this.getTile(tileX,tileY);
            }
          }
        }
      }

      return normal.collided ? normal : false;
    },

    prerenderBlock: function(blockX,blockY) {
      var p = this.p,
          tiles = p.tiles,
          sheet = this.sheet(),
          blockOffsetX = blockX*p.blockTileW,
          blockOffsetY = blockY*p.blockTileH;

      if(blockOffsetX < 0 || blockOffsetX >= this.p.cols ||
         blockOffsetY < 0 || blockOffsetY >= this.p.rows) {
           return;
      }

      var canvas = document.createElement('canvas'),
          ctx = canvas.getContext('2d');

      canvas.width = p.blockW;
      canvas.height= p.blockH;
      this.blocks[blockY] = this.blocks[blockY] || {};
      this.blocks[blockY][blockX] = canvas;

      for(var y=0;y<p.blockTileH;y++) {
        if(tiles[y+blockOffsetY]) {
          for(var x=0;x<p.blockTileW;x++) {
            if(this.drawableTile(tiles[y+blockOffsetY][x+blockOffsetX])) {
              sheet.draw(ctx,
                         x*p.tileW,
                         y*p.tileH,
                         tiles[y+blockOffsetY][x+blockOffsetX]);
            }
          }
        }
      }
    },

    drawBlock: function(ctx, blockX, blockY) {
      var p = this.p,
          startX = Math.floor(blockX * p.blockW + p.x),
          startY = Math.floor(blockY * p.blockH + p.y);

      if(!this.blocks[blockY] || !this.blocks[blockY][blockX]) {
        this.prerenderBlock(blockX,blockY);
      }

      if(this.blocks[blockY]  && this.blocks[blockY][blockX]) {
        ctx.drawImage(this.blocks[blockY][blockX],startX,startY);
      }
    },

    draw: function(ctx) {
      var p = this.p,
          viewport = this.stage.viewport,
          scale = viewport ? viewport.scale : 1,
          x = viewport ? viewport.x : 0,
          y = viewport ? viewport.y : 0,
          viewW = Q.width / scale,
          viewH = Q.height / scale,
          startBlockX = Math.floor((x - p.x) / p.blockW),
          startBlockY = Math.floor((y - p.y) / p.blockH),
          endBlockX = Math.floor((x + viewW - p.x) / p.blockW),
          endBlockY = Math.floor((y + viewH - p.y) / p.blockH);

      for(var iy=startBlockY;iy<=endBlockY;iy++) {
        for(var ix=startBlockX;ix<=endBlockX;ix++) {
          this.drawBlock(ctx,ix,iy);
        }
      }
    }
  });

  Q.gravityY = 9.8*100;
  Q.gravityX = 0;
  Q.dx = 0.05;

  Q.component('2d',{
    added: function() {
      var entity = this.entity;
      Q._defaults(entity.p,{
        vx: 0,
        vy: 0,
        ax: 0,
        ay: 0,
        gravity: 1,
        collisionMask: Q.SPRITE_DEFAULT
      });
      entity.on('step',this,"step");
      entity.on('hit',this,'collision');
    },

    collision: function(col,last) {
      var entity = this.entity,
          p = entity.p,
          magnitude = 0;

      col.impact = 0;
      var impactX = Math.abs(p.vx);
      var impactY = Math.abs(p.vy);

      p.x -= col.separate[0];
      p.y -= col.separate[1];

      // Top collision
      if(col.normalY < -0.3) { 
        if(p.vy > 0) { p.vy = 0; }
        col.impact = impactY;
        entity.trigger("bump.bottom",col);
      }
      if(col.normalY > 0.3) {
        if(p.vy < 0) { p.vy = 0; }
        col.impact = impactY;

        entity.trigger("bump.top",col);
      }

      if(col.normalX < -0.3) { 
        if(p.vx > 0) { p.vx = 0;  }
        col.impact = impactX;
        entity.trigger("bump.right",col);
      }
      if(col.normalX > 0.3) { 
        if(p.vx < 0) { p.vx = 0; }
        col.impact = impactX;

        entity.trigger("bump.left",col);
      }


    },

    step: function(dt) {
      var p = this.entity.p,
          dtStep = dt;
      // TODO: check the entity's magnitude of vx and vy,
      // reduce the max dtStep if necessary to prevent 
      // skipping through objects.
      while(dtStep > 0) {
        dt = Math.min(1/30,dtStep);
        // Updated based on the velocity and acceleration
        p.vx += p.ax * dt + Q.gravityX * dt * p.gravity;
        p.vy += p.ay * dt + Q.gravityY * dt * p.gravity;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        this.entity.stage.collide(this.entity);
        dtStep -= dt;
      }
    }
  });

  Q.component('aiBounce', {
    added: function() {
      this.entity.on("bump.right",this,"goLeft");
      this.entity.on("bump.left",this,"goRight");
    },

    goLeft: function(col) {
      this.entity.p.vx = -col.impact;
    },

    goRight: function(col) {
      this.entity.p.vx = col.impact;
    }
  });

};

