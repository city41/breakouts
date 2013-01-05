(function() {
	var audioFiles = [
		'bounce',
		'brickDeath',
		'countdownBlip',
		'powerdown',
		'powerup',
		'recover'
	];

	function getAudioPaths(files) {
		var isFirefox = navigator.userAgent.toLowerCase().indexOf('firefox') > -1;
		var paths = [];
		files = files || audioFiles;

		for(var i = 0; i < files.length; ++i) {
			var file = files[i];
			paths.push('media/sfx/' + file + '.mp3');
			paths.push('media/sfx/' + file + '.ogg');
			if(!isFirefox) {
				paths.push('media/sfx/' + file + '.wav');
			}
		}

		return paths;
	}

	function installAudio() {
		for(var i = 0; i < audioFiles.length; ++i) {
			var file = audioFiles[i];
			Crafty.audio.add(file, getAudioPaths([file]));
		}
	}
	
	Crafty.scene('loading', function() {
		Crafty.load(['media/tiles.png', 'media/logo.png'].concat(getAudioPaths())
		, function() {
			installAudio();
			Crafty.scene('menu'); 
		});

		Crafty.background('#000');
		Crafty.e('2D, DOM, Text').attr({
			w: Crafty.stage.elem.clientWidth,
			h: 20,
			x: 0,
			y: 120
		}).text('Loading').css({
			'text-align': 'center'
		});
	});
})();


