import { Config } from './Config'
import { Main } from './Main'
import { UrlParams } from './UrlParams'

export enum RendererType {
	WEBGL = 'webgl',
	CANVAS = 'canvas',
}

export enum AudioType {
	NO_AUDIO = 'no_audio',
	HTML5_AUDIO = 'html5_audio',
	WEB_AUDIO = 'web_audio',
}

export function createGameConfig(): Phaser.Types.Core.GameConfig {
	return {
		scale: getScaleConfig(),
		parent: 'canvas-container',
		type: getRenderType(),
		fps: {
			deltaHistory: 20,
		},
		render: {
			clearBeforeRender: false,
			transparent: true,
			failIfMajorPerformanceCaveat: true,
			maxTextures: getMaxTexturesNum(),
			roundPixels: true,
			mipmapFilter: 'LINEAR_MIPMAP_LINEAR',
		},
		banner: {
			background: ['rgba(0,0,255,0.4)'],
		},
		audio: {
			noAudio: true,
		},
		plugins: {
			global: [
				{
					key: 'rexWebfontLoader',
					plugin: rexwebfontloaderplugin,
					start: true,
				},
				{
					key: 'rexawaitloaderplugin',
					plugin: rexawaitloaderplugin,
					start: true,
				},
			],
		},
		callbacks: {
			preBoot: preBootCallback.bind(this),
			postBoot: postBootCallback.bind(this),
		},
	}
}

function getMaxTexturesNum(): number {
	if (UrlParams.has('maxTextures')) {
		return UrlParams.getNumber('maxTextures', 0)
	}

	return undefined
}

function getScaleConfig(): Phaser.Types.Core.ScaleConfig {
	return {
		width: Config.SOURCE_GAME_WIDTH,
		height: Config.SOURCE_GAME_HEIGHT,
		mode: Phaser.Scale.NONE,
		autoRound: true,
	}
}

function getRenderType(): number {
	let canvas = UrlParams.getBool('forceCanvas')
	if (canvas) {
		return Phaser.CANVAS
	}

	return Phaser.AUTO
}

function preBootCallback(game: Main): void {}

function postBootCallback(game: Main): void {}
