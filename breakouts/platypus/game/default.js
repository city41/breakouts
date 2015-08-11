/**
 *   If template.html is viewed, this script will load config.js and all of its referenced files to
 *   allow for testing a game without running one of the compiling scripts in tools/. This script is
 *   for testing, not deployment, as a just-in-time compiled game loads slower than a compiled build.
 *   
 *    NOTE: Due to XHR, template.html must be loaded from a web server (localhost is fine). Also,
 *    assets such as images may load fine when directly loading template.html if not referenced in
 *    config.json, but all assets must be listed in config.json to be included in the compiled build. 
 */

//Compile JSON (without file saving) from tools/js/compile-json.js
(function(){
    var alert  = function(val){console.error(val);},
    print      = function(txt){console.log(txt);},
    getText    = function(path){
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', path, false);
		xhr.send();
		if(xhr.status === 200){
			return xhr.responseText;
		} else {
			   alert('Error opening "' + path + '": ' + xhr.description);
		}
    },
    getJSON    = function(path){
	    try{
		    return eval('(' + getText(path) + ')'); //Using "eval" to allow comments in JSON definition files
	    } catch(e) {
		    alert('Error in "' + path + '": ' + e.description);
		    return {};
	    }
    },
    getSubDir  = function (path){
	    var arr = undefined, subDir = '';
	    if(path.indexOf('/') > -1){
		    arr = path.split('/');
		    for (var i = 0; i < arr.length - 1; i++){
			    subDir += arr[i] + '/'; 
		    }
	    }
	    return subDir;
    },
    fixUpPath  = function(path) {
	    var arr = undefined, preArr = [], postArr = [];
	    if(path.indexOf('/') > -1){
		    arr = path.split('/');
		    postArr = arr.slice();
		    postArr.splice(0,1);
		    for (var i = 1; i < arr.length; i++){
			    postArr.splice(0,1);
			    if((arr[i] === '..') && (arr[i - 1] !== '..')){
				    return fixUpPath(preArr.join('/') + '/' + postArr.join('/'));
			    } else {
				    preArr.push(arr[i - 1]);
			    }
		    }
	    }
	    return arr.join('/');
    },
    isJSON     = function(path){
	    var check = path.substring(path.length - 4).toLowerCase();
	    return (check === 'json');
    },
    workingDir = '',
    subDir     = '',
    gameConfig = getText(workingDir + 'config.json'),
    game       = eval('(' + gameConfig + ')'), //Using "eval" to allow comments in JSON config file
    source     = game.source,
    section    = undefined,
    sectionId  = '',
    asset      = undefined,
    assetId    = 0,
    retainId   = '',
    srcId      = '';
    
    print('Composing full config.json from /game/config.json.');
    
    for(sectionId in source){
    	print('..Handling "' + sectionId + '" section.');
    	section = source[sectionId];
    	source[sectionId] = {};
    	
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
			    if(asset.src){
			    	if((typeof asset.src) == 'string'){
			    		if(asset.src.substring(0,4).toLowerCase() !== 'http'){
				    		if(isJSON(asset.src)){
				    			print('....Filling in data for "' + asset.id + '" from "' + asset.src + '"');
				    			retainId = asset.id;
							    subDir = workingDir + getSubDir(asset.src);
							    asset  = getJSON(workingDir + asset.src);
							    if(asset.tilesets){
			 				    	for (var ts in asset.tilesets){
									    if(asset.tilesets[ts].image) asset.tilesets[ts].image = fixUpPath(subDir + asset.tilesets[ts].image);
								    }
			 				    }
			 				    asset.id = asset.id || retainId;
				    		} else {
			    			    asset.src = fixUpPath(workingDir + asset.src);
				    		}
			    		}
			    	} else {
			    		for(srcId in asset.src){
					    	if((typeof asset.src[srcId]) == 'string'){
					    		if(asset.src[srcId].substring(0,4).toLowerCase() !== 'http'){
				    			    asset.src[srcId] = fixUpPath(workingDir + asset.src[srcId]);
					    		}
					    	} else {
					    		if(asset.src[srcId].src.substring(0,4).toLowerCase() !== 'http'){
				    			    asset.src[srcId].src = fixUpPath(workingDir + asset.src[srcId].src);
					    		}
					    	}
			    		}
			    	}
			    }
			    game.source[sectionId][assetId] = asset;
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
    }
   
    //insert entities and scenes into compiled config file
    window.config = game;
    print('Completed full config.json.');
})();



//Link up to files (without file saving) from tools/js/compile-scripts.js
(function(){
    var alert  = function(val){console.error(val);},
    print      = function(txt){console.log(txt);},
    loadJS = [],
    getText    = function(path){
		var xhr = new XMLHttpRequest();
		
		xhr.open('GET', path, false);
		xhr.send();
		if(xhr.status === 200){
			return xhr.responseText;
		} else {
			alert('Error opening "' + path + '": ' + xhr.description);
		}
    },
    getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
    checkPush  = function(list, item){
	    var itIsThere = false;
	    if(list){
		    for (var index in list){
			    if(list[index] === item) itIsThere = true;
		    }
		    if(!itIsThere) list.push(item);
	    }
	    return item;
    },
    hypPath    = function(path){
	    return path;
    },
    putInFolder= function(path){
	    return path;
    },
    buildGame = function(build, game){
	    var platformer = {}, 
	    result     = {
    	    scripts: '',
    	    styles: '',
    	    extStyles: '',
    	    extScripts: ''
	    },
	    source     = game.source,
	    path       = '',
	    aspects    = {"default": []},
	    supports   = game['client-supports'] || false,
	    section    = undefined,
	    sectionId  = '',
	    asset      = undefined,
	    assetId    = 0,
	    srcId      = '',
	    i          = 0,
	    j          = 0;

	    delete game.builds;
	    delete game['client-supports'];

	    if(supports){ // Prepare multiple manifest files
		    print('...Creating arrays to store cache.manifest file versions.');
		    game.aspects = supports;
	    	for (i in supports) for (j in supports[i]){
		    	aspects[j] = ['\n# ' + j + ':\n'];
	    	}
	    }
	    
	    //Fix up paths on Game Assets; Combine JavaScript and CSS Assets
	    for(sectionId in source){
		    print('....Handling "' + sectionId + '" section.');
	    	section = source[sectionId];
	    	if((sectionId === 'components') || (sectionId === 'classes')){
	    		platformer[sectionId] = {};
	    	}
    		game[sectionId] = {};
		    for (assetId in section){
		    	asset = section[assetId];
			    print('.....Adding "' + asset.id + '".');
			    try {
				    if(asset.src){
				    	if((typeof asset.src) == 'string'){
				    		asset.src = handleAsset(asset.id, asset.src, aspects["default"], path, result);
				    	} else {
				    		for(srcId in asset.src){
						    	if((typeof asset.src[srcId]) == 'string'){
					    			asset.src[srcId] = handleAsset(asset.id, asset.src[srcId], aspects[srcId], path, result);
						    	} else {
					    			asset.src[srcId].src = handleAsset(asset.id, asset.src[srcId].src, aspects[srcId], path, result);
						    	}
				    		}
				    	}
				    }
				    srcId = '';
			    } catch(e) {
				    alert('Error in processing ' + (srcId || 'default') + ' asset: "' + sectionId + ' ' + assetId + '": ' + e.description);
			    }
		    	if(sectionId === 'assets'){
		    		if((typeof asset.data) === 'string'){
		    			asset.data = getJSON(workingDir + asset.data);
		    		}
		    	}
	    		game[sectionId][asset.id] = asset;
		    }
	    }
	    delete game.source;
	    
	    game.debug = true;

	    window.platformer = platformer;
	    window.platformer.settings = game;
	    
	    var loadJSs = function(){
	    	if(loadJS.length){
				var domElement = document.createElement('script');
				domElement.onload = loadJSs;
				domElement.setAttribute('type', 'text/javascript');
				domElement.setAttribute('src', loadJS.splice(0,1)[0]);
				document.getElementsByTagName('body')[0].appendChild(domElement);
	    	}
	    };
	    loadJSs();
   },
   isImage    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.jpg') || (check === 'jpeg') || (check === '.png') || (check === '.gif') || (check === '.ico');
   },
   isAudio    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.ogg') || (check === '.mp3') || (check === '.m4a') || (check === '.wav') || (check === '.mp4');
   },
   isFont    = function(path){
	   var check = path.substring(path.length - 4).toLowerCase();
	   return (check === '.ttf') || (check === '.otf');
   },
    isCSS     = function(path){
	    var check = path.substring(path.length - 4).toLowerCase();
	    return (check === '.css');
    },
    isJS      = function(path){
	    var check = path.substring(path.length - 3).toLowerCase();
	    return (check === '.js');
    },
    handleAsset = function(id, src, assets, absolutePath, result){
	   
		if(isImage(src) || isAudio(src) || isFont(src)){
			return checkPush(assets, src);
		} else if(isCSS(src)) {
			domElement = document.createElement('link');
			domElement.setAttribute('rel', 'stylesheet');
			domElement.setAttribute('type', 'text/css');
			domElement.setAttribute('href', checkPush(assets, src));
			document.getElementsByTagName('head')[0].appendChild(domElement);
	 	    return src;
		} else if(isJS(src)) {
			loadJS.push(checkPush(assets, src));
	 	    return src;
		}
    },
    game       = window.config;
    workingDir = '',
    buildDir   = '',
    builds     = game.builds,
    buildIndex = 0;
   
    //Create builds
    print('Preparing to compile scripts.');
    //for (buildIndex in builds){
    	print('..Compiling scripts for build "' + builds[buildIndex].id + '".');
    	buildGame(builds[buildIndex], game);
	//}
    print('Completed script compilation. Hurrah!');
    
    console.warn('!!! This is a test build. Use the compile scripts in the /tools folder to make sure assets are correctly referenced for inclusion and to create builds for deploying.');
    console.log(' ------- End Compilation Log / Begin Game Logs ------- ');
})();
