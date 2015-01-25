(function() {
	function getAudioAssets(audioFiles) {
		var assets = {};
		audioFiles.forEach(function(audioFile) {
			assets[audioFile] = [
			  'media/sfx/' + audioFile + '.mp3',
				'media/sfx/' + audioFile + '.ogg',
				'media/sfx/' + audioFile + '.wav'
			];
		});

		return assets;
	}

	Crafty.scene('loading', function() {
		var audioFiles = [
			'bounce',
			'brickDeath',
			'countdownBlip',
			'powerdown',
			'powerup',
			'recover'
		];

		var assets = {
			images: {
				tiles: 'media/tiles.png',
				logo: 'media/logo.png'
			},
			audio: getAudioAssets(audioFiles)
		};

		Crafty.load(assets, function() {
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
		})
		.textFont({size: '30px', weight: 'bold'});
	});
})();
