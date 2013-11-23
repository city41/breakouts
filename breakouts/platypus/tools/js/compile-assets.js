/*
 * Load Dependencies
 */
var include = function(path){
	var file = undefined,
	line     = '',
	text     = '';
	if (typeof ActiveXObject != 'undefined'){
		file = new ActiveXObject("Scripting.FileSystemObject").OpenTextFile(path);
		text = file.ReadAll();
		file.Close();
	} else {
    	file = new java.io.BufferedReader(new java.io.FileReader(path));
    	while ((line = file.readLine()) != null) {
		  text += new String(line) + '\n';
		}
    	file.close();
	}
	eval(text);
};
include('js/file-io.js');  // Including support for either ActiveX or Rhino file and shell support.

/*
 * Compress and move assets to builds folder
 */

(function(){
   var alert  = function(val){print(val);},
   getText    = function(path){
	   var file = fileSystem.OpenTextFile(path),
	   text     = file.ReadAll();
	   file.Close();
	   return text;
   },
   getJSON    = function(path){return eval('(' + getText(path) + ')');}, //Using "eval" to allow comments in JSON definition files
   checkPush  = function(list, item){
	   var itIsThere = false;
	   for (var index in list){
		   if(list[index] === item) itIsThere = true;
	   }
	   if(!itIsThere) list.push(item);
	   return !itIsThere;
   },
   hypPath    = function(path){
	   return path.replace(workingDir, '').replace(/\.\.\//g, '').replace(/\//g, '-').replace(/images-/, '').replace(/audio-/, '').replace(/fonts-/, '');
   },
   copyFiles  = function(assets, destination, compression){
	    var assetIndex = 0,
	    asset          = undefined,
	    fileName       = '';
	    if (!fileSystem.FolderExists(destination)) fileSystem.CreateFolder(destination);
	    fileSystem.DeleteFile(destination + '*.*');
	    for (assetIndex in assets){
		    asset = assets[assetIndex];
		    if(asset !== ''){
		    	fileName = hypPath(asset);
		        if(compression && (asset.substring(asset.length - 4).toLowerCase() === '.png')){
	                if(!fileSystem.FileExists(workingDir + 'images/compressed/q' + compression + '-' + fileName)){
				    	print('....Compressing "' + asset + '".');
	                 	if(shell.isBash){
	                 		shell.Run("pngquant/pngquant --ext -q" + compression + ".png " + compression + " " + asset, 7, true);
	                 	} else {
	                 		shell.Run("pngquant\\pngquant.exe -ext -q" + compression + ".png " + compression + " " + asset, 7, true);
	                 	}
		                fileSystem.MoveFile(asset.substring(0, asset.length - 4) + '-q' + compression + '.png', workingDir + 'images/compressed/q' + compression + '-' + fileName);
	                }
			    	print('....Copying compressed asset to "' + destination + fileName + '".');
	                fileSystem.CopyFile(workingDir + 'images/compressed/q' + compression + '-' + fileName, destination + fileName);
		        } else {
			    	print('....Copying asset to "' + destination + fileName + '".');
					fileSystem.CopyFile(asset, destination + fileName); 
		        }
		    }
	    }
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
   game       = getJSON('config.json'), // need to have run compile-json.js prior to this if assets have changed.
   workingDir = game.toolsConfig["source-folder"] || '../game/',
   buildDir   = game.toolsConfig["destination-folder"] || '../builds/',
   builds     = game.builds,
   buildIndex = 0,
   buildPath  = '',
   assets     = [],
   images     = [],
   audio      = [],
   fonts      = [],
   source     = game.source,
   section    = undefined,
   sectionId  = '',
   asset      = undefined,
   assetId    = 0,
   srcId      = '';
   
    print('Compiling list of assets.');
    for(sectionId in source){
    	section = source[sectionId];
	    for (assetId in section){
	    	asset = section[assetId];
		    try {
			    if(asset.src){
			    	if((typeof asset.src) == 'string'){
			    		if(asset.src.substring(0,4).toLowerCase() !== 'http'){
			    			checkPush(assets, asset.src);
			    		}
			    	} else {
			    		for(srcId in asset.src){
					    	if((typeof asset.src[srcId]) == 'string'){
					    		if(asset.src[srcId].substring(0,4).toLowerCase() !== 'http'){
					    			checkPush(assets, asset.src[srcId]);
					    		}
					    	} else {
					    		if(asset.src[srcId].src.substring(0,4).toLowerCase() !== 'http'){
					    			checkPush(assets, asset.src[srcId].src);
					    		}
					    	}
			    		}
			    	}
			    }
		    } catch(e) {
			    alert('Error in processing "' + sectionId + ' ' + assetId + '": ' + e.description);
		    }
	    }
    }
   
    print('Separating asset types.');
    for (var asset in assets){
	    if(isImage(assets[asset])){
	 	    images.push(assets[asset]);
	    } else if(isAudio(assets[asset])){
		    audio.push(assets[asset]);
	    } else if(isFont(assets[asset])){
		    fonts.push(assets[asset]);
	    }
    }
   
    print('Copying assets to build folders.');
    if (!fileSystem.FolderExists(buildDir)) fileSystem.CreateFolder(buildDir);
    for (buildIndex in builds){
        print('..Copying assets to build "' + builds[buildIndex].id + '".');
        
        buildPath = buildDir + builds[buildIndex].id + '/';
	    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    
	    if(builds[buildIndex].index === false){
	        buildPath += builds[buildIndex].id + '/';
		    if (!fileSystem.FolderExists(buildPath)) fileSystem.CreateFolder(buildPath);
	    }
	    
	    if (builds[buildIndex].pngCompression && !fileSystem.FolderExists(workingDir + 'images/compressed/')) fileSystem.CreateFolder(workingDir + 'images/compressed/');
    	copyFiles(images, buildPath + 'i/', builds[buildIndex].pngCompression);
    	copyFiles(audio,  buildPath + 'a/');
    	copyFiles(fonts,  buildPath + 'f/');
	}
    
    print('Completed asset compilation.');
})();