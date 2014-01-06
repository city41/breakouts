/*global jQuery, friGame, G */
/*jslint white: true, browser: true */

(function ($, fg) {
	'use strict';

	var
		IMAGE_PATH = 'resources',
		SOUND_PATH = 'resources/sfx'
	;

	$(function () {
		var
			LOADING_BAR_WIDTH = $('#loadingBarB').width()
		;

		// Initialize resources
		fg.resourceManager
			.addAnimation('bg_prerendered', [IMAGE_PATH, 'bg_prerendered.png'].join('/'))
			.addAnimation('logo', [IMAGE_PATH, 'logo.png'].join('/'))
			//Q.animations("block", {
			//	appear: { frames: [ 4,3,2,1,0], rate: 1/3, loop: false },
			//	hit: { frames: [ 1,2,3,4], rate: 1/4, loop: false, trigger: "destroy" }
			//});
			.addAnimation('block1', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 32,
				frameHeight: 16
			})
			.addAnimation('block2', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 32,
				frameHeight: 16,
				offsety: 16
			})
			.addAnimation('block3', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 32,
				frameHeight: 16,
				offsety: 32
			})
			.addAnimation('block4', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 32,
				frameHeight: 16,
				offsety: 48
			})
			.addAnimation('paddlelg', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 48,
				frameHeight: 16,
				offsety: 64
			})
			.addAnimation('ball', [IMAGE_PATH, 'tiles.png'].join('/'), {
				numberOfFrame: 5,
				rate: 250,
				frameWidth: 16,
				frameHeight: 16,
				offsetx: 48,
				offsety: 64
			})
			.addAnimation('paddlesm', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 32,
				frameHeight: 16,
				offsety: 80
			})
			.addAnimation('count', [IMAGE_PATH, 'tiles.png'].join('/'), {
				type: fg.ANIMATION_VERTICAL,
				rate: 1000,
				once: true,
				frameWidth: 32,
				frameHeight: 48,
				offsety: 96
			})
			.addAnimation('powerup', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 16,
				frameHeight: 16,
				offsetx: 96,
				offsety: 96
			})
			.addAnimation('powerdown', [IMAGE_PATH, 'tiles.png'].join('/'), {
				frameWidth: 16,
				frameHeight: 16,
				offsetx: 112,
				offsety: 96
			})
			.addSound('brickDeath', [
				[SOUND_PATH, 'brickDeath.ogg'].join('/'),
				[SOUND_PATH, 'brickDeath.mp3'].join('/'),
				[SOUND_PATH, 'brickDeath.wav'].join('/')
			])
			.addSound('countdownBlip', [
				[SOUND_PATH, 'countdownBlip.ogg'].join('/'),
				[SOUND_PATH, 'countdownBlip.mp3'].join('/'),
				[SOUND_PATH, 'countdownBlip.wav'].join('/')
			])
			.addSound('sndPowerdown', [
				[SOUND_PATH, 'powerdown.ogg'].join('/'),
				[SOUND_PATH, 'powerdown.mp3'].join('/'),
				[SOUND_PATH, 'powerdown.wav'].join('/')
			])
			.addSound('sndPowerup', [
				[SOUND_PATH, 'powerup.ogg'].join('/'),
				[SOUND_PATH, 'powerup.mp3'].join('/'),
				[SOUND_PATH, 'powerup.wav'].join('/')
			])
			.addSound('recover', [
				[SOUND_PATH, 'recover.ogg'].join('/'),
				[SOUND_PATH, 'recover.mp3'].join('/'),
				[SOUND_PATH, 'recover.wav'].join('/')
			])
		;

		// Initialize loadCallback
		fg.loadCallback(function (percent) {
			$('#loadingBar').width(LOADING_BAR_WIDTH * percent);
		});

		// Start the game
		fg.startGame(function () {
			$('#welcomeScreen').fadeTo(1000, 0, function () {
				$(this).remove();
			});

			// Initialize the playground
			fg.playground()
				.setBackground({background: 'bg_prerendered'})
			;

			$('<div id="overlay"></div>')
				.css({
					width: fg.s.playground.width,
					height: fg.s.playground.height
				})
				.appendTo('#playground')
			;

			G.initLevelSkipping();

			// Go Time
			G.Scene.title();
		});
	});
}(jQuery, friGame));

