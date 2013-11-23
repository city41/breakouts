(function(){
	return platformer.createComponentClass({
		id: 'logic-paddle',
		constructor: function(definition){
		    this.score = 0;
		    this.lives = 3;
		    this.level = 1;
		    this.balls = 1;
		    this.bricks = 0;
		    
		    this.goToNewScene = false;
		},

		events: {// These are messages that this component listens for
			"handle-logic": function(){
				if(this.goToNewScene !== false){
		        	this.owner.trigger('new-scene', this.goToNewScene);
				}
			},
			
		    "scene-live": function(data){
		        if(data){
                    this.score = data.score || 0;
                    this.lives = data.lives || 3;
                    this.level = data.level || 1;
                    
                    this.owner.trigger('update-score', "score: " + this.score);
                    this.owner.trigger('update-lives', "lives: " + this.lives);
                    this.owner.trigger('update-level', "level: " + this.level);
		        }
		        
//		        this.owner.trigger('maxify');
		        
	//	        this.owner.trigger('collide-on');
		    },
		    
		    "time-0": function(){
		        this.owner.trigger('maxify');
		        this.owner.trigger('collide-on');
		    },
		
		    "mousemove": function(e){
		        this.owner.x = e.x - (this.owner.width / 2);
		    },
		    
		    "ball-collision": function(collisionData) {
		    	var dx = collisionData.entity.x - (this.owner.x + this.owner.width/2),
		    	h = (this.owner.width / 2) + 7, //7 is the radius of the ball
		    	dy = -Math.sqrt(h*h - dx*dx);
		    	
		    	collisionData.entity.dx = dx / (h - 7) * 0.16;
		    	collisionData.entity.dy = dy / (h - 7) * 0.16;
		    },
		    
		    "peer-entity-added": function(entity){
		    	switch(entity.type){
		    	case "brick-blue":
		    	case "brick-orange":
		    	case "brick-green":
		    	case "brick-red":
		    		this.bricks += 1;
		    	}
		    },
		    
		    "peer-entity-removed": function(entity){
		    	switch(entity.type){
		    	case "brick-blue":
		    	case "brick-orange":
		    	case "brick-green":
		    	case "brick-red":
			        this.bricks -= 1;
		    	}

		        if(!this.bricks){
		        	this.goToNewScene = {
		        		scene: 'scene-level-' + this.level % 4,
		        		persistentData: {
		        			level: (this.level % 4) + 1,
		        			lives: this.lives,
		        			score: this.score
		        		}
		        	};
		        }
		    },
		    
		    "maxify": function(){
		    	this.owner.width = 48;
		    },
		    
		    "minify": function(){
		    	this.owner.width = 32;
		    },
		    
		    "tally": function(){
		        this.score += 100;
		        this.owner.trigger('update-score', "score: " + this.score);
		    },
		    
		    "next-level": function(){
	        	this.goToNewScene = {
	        		scene: 'scene-level-' + this.level % 4,
	        		persistentData: {
	        			level: (this.level % 4) + 1,
	        			lives: this.lives,
	        			score: this.score
	        		}
	        	};
		    },
		    
		    "prev-level": function(){
	        	this.goToNewScene = {
	        		scene: 'scene-level-' + (this.level + 2) % 4,
	        		persistentData: {
	        			level: (this.level + 2) % 4 + 1,
	        			lives: this.lives,
	        			score: this.score
	        		}
	        	};
		    },
		    
		    "lose-ball": function(){
		    	this.balls -= 1;
		    	
		    	if(!this.balls){
		    		this.lives -= 1;
			        this.owner.trigger('update-lives', "lives: " + this.lives);
			        if(!this.lives){
			        	this.goToNewScene = {
			        		scene: 'end',
			        		persistentData: {
			        			score: this.score
			        		}
			        	};
			        } else {
			        	this.owner.trigger('new-ball');
			        }
		    	}
		    },
		    
		    "new-ball": function(){
		    	this.balls += 1;
		    }
		},
		
		methods: {// These are methods that are called by this component.
		},
		
		publicMethods: {// These are methods that are available on the entity.
		}
	});
})();
