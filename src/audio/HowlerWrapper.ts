import { Howl, Howler, HowlOptions } from "howler"
import { GameSoundKey } from "./GameSoundKey"
import { getCacheBustingUrl } from "../CacheBuster"
import { debounce } from "lodash-es"
import LoaderPlugin = Phaser.Loader.LoaderPlugin

export interface HowlerGlobal {
	_audioUnlocked?: boolean
	_muted?: boolean
	_howls?: Howl[]
}

export enum SoundFormat {
	MP3 = "mp3",
	WAV = "wav",
	WEBM = "webm",
	OGG = "ogg",
}

export type SoundLoadOptions = Omit<HowlOptions, "src" | "format"> & {
	formats?: SoundFormat[]
}

export interface SoundPlayOptions {
	loop?: boolean
	volume?: number
	rate?: number
	seek?: number
}

export enum HowlerWrapperEvent {
	SOUND_MUTE_CHANGE = "__SOUND_MUTE_CHANGE",
	MUSIC_MUTE_CHANGE = "__MUSIC_MUTE_CHANGE",
}

export interface HowlerWrapperOptions {
	muteTrigger: "hidden" | "blur"
}

export class HowlerWrapper extends Phaser.Events.EventEmitter {
	
	private game: Phaser.Game
	private options: HowlerWrapperOptions
	private sounds: Record<GameSoundKey, Howl>
	public global: Howler & HowlerGlobal
	private musicLoopVolume: number = 0.2
	private musicLoop: Howl
	private _soundMute: boolean = false
	private _musicMute: boolean = false
	private wasMuted: boolean = false
	private onPageVisibleDebounced: Function
	
	constructor(game: Phaser.Game, options: HowlerWrapperOptions) {
		super()
		
		this.game = game
		this.options = options
		this.global = Howler
		this.global.autoUnlock = true
		this.sounds = {} as Record<GameSoundKey, Howl>
		
		if (options.muteTrigger === "hidden") {
			this.game.events.on(Phaser.Core.Events.HIDDEN, this.onPageHidden, this)
			this.game.events.on(Phaser.Core.Events.VISIBLE, this.onPageVisible, this)
		} else {
			this.onPageVisibleDebounced = debounce(this.onPageVisible.bind(this), 150) as Function // on iOS focus event fires twice sometimes
			this.game.events.on(Phaser.Core.Events.BLUR, this.onPageHidden, this)
			this.game.events.on(Phaser.Core.Events.FOCUS, this.onPageVisibleDebounced)
		}
	}
	
	private onPageHidden(): void {
		this.suspendAudioContext()
	}
	
	private onPageVisible(): void {
		this.resumeAudioContext()
	}
	
	public loadSound(loader: LoaderPlugin, key: GameSoundKey, options?: SoundLoadOptions): LoaderPlugin {
		if (this.sounds[key]) {
			console.warn(`Sound ${key} was already loaded!`)
			return loader
		}
		
		return loader.rexAwait(key, {
			callback: (onSuccess, onFail) => {
				let howl = this.doLoadSound(key, options)
				howl.on("loaderror", (soundId: number, error: unknown) => onFail(soundId, error))
				howl.on("load", () => onSuccess())
			},
		})
	}
	
	public doLoadSound(key: GameSoundKey, options?: SoundLoadOptions): Howl {
		let formats = options?.formats ?? [SoundFormat.MP3]
		let src = formats.map(format => getCacheBustingUrl(`assets/audio/${key}.${format}`))
		let mute = key === GameSoundKey.MUSIC_LOOP ? this._musicMute : this._soundMute
		let sound = new Howl({
			src,
			mute,
			...options as HowlOptions,
		})
		
		this.sounds[key] = sound
		
		return sound
	}
	
	public has(key: GameSoundKey | string): boolean {
		return !!this.sounds[key]
	}
	
	public get(key: GameSoundKey | string): Howl | undefined {
		return this.sounds[key]
	}
	
	public play(key: GameSoundKey | string, options?: SoundPlayOptions, playIfLocked: boolean = false): Howl | undefined {
		if (this.isLocked() && playIfLocked === false) {
			return
		}
		
		let sound = this.get(key)
		if (sound === undefined) {
			console.warn("Sound doesn't exist!", key)
			return
		}
		
		if (sound.state() !== "loaded") {
			console.warn("Sound is not loaded!", key)
			return sound
		}
		
		if (typeof options?.volume !== "undefined") {
			sound.volume(options.volume)
		}
		
		if (typeof options?.rate !== "undefined") {
			sound.rate(options.rate)
		}
		
		if (typeof options?.seek !== "undefined") {
			sound.seek(options.seek)
		}
		
		if (typeof options?.loop !== "undefined") {
			sound.loop(options.loop)
		}
		
		sound.play()
		
		return sound
	}
	
	public stop(key: GameSoundKey | string, id?: number): void {
		let sound = this.get(key)
		if (sound) {
			sound.stop(id)
		}
	}
	
	public playClick(options?: SoundPlayOptions): Howl | undefined {
		return this.play(GameSoundKey.TAP, options, true)
	}
	
	public addMusicLooop() {
		this.musicLoop = this.get(GameSoundKey.MUSIC_LOOP)
		if (!this.musicLoop) {
			return
		}
		
		if (this.global.usingWebAudio === false) {
			this.playMusicLoop()
			return
		}
		
		this.onAudioUnlocked().then(() => {
			this.playMusicLoop()
		})
	}
	
	private onAudioUnlocked(): Promise<void> {
		return new Promise((resolve, reject) => {
			if (this.global._audioUnlocked) {
				return resolve()
			}
			
			this.musicLoop.once("unlock", () => resolve())
		})
	}
	
	private playMusicLoop() {
		if (!this.musicLoop) {
			return
		}
		
		this.musicLoop.play()
		this.musicLoop.mute(this._musicMute)
		this.musicLoop.loop(true)
		this.musicLoop.fade(0, this.musicLoopVolume, 1000)
	}
	
	public fadeInMusicLoop(duration: number): void {
		this.musicLoop?.fade(0, this.musicLoopVolume, duration)
	}
	
	public fadeOutMusicLoop(duration: number): void {
		this.musicLoop?.fade(this.musicLoop.volume(), 0, duration)
	}
	
	public suspendAudioContext(): Promise<void> {
		let audioContext = this.global.ctx
		if (!audioContext) {
			// means that we use not WebAudio but html5 audio
			this.wasMuted = Boolean(this.global._muted)
			this.global.mute(true)
			return Promise.resolve()
		}
		
		if (audioContext.state !== "running") {
			return Promise.resolve()
		}
		
		return audioContext.suspend()
	}
	
	public resumeAudioContext(): Promise<void> {
		let audioContext = this.global.ctx
		if (!audioContext) {
			this.global.mute(this.wasMuted)
			return Promise.resolve()
		}
		
		// "interrupted" is iOS specific state
		let state = audioContext.state as (AudioContextState & "interrupted")
		if (state === "suspended" || state === "interrupted") {
			return audioContext.resume()
		}
		
		return Promise.resolve()
	}
	
	public isLocked(): boolean {
		if (this.global.usingWebAudio === false) {
			return false
		}
		
		return !this.global._audioUnlocked
	}
	
	public set rate(value: number) {
		Object.values(this.sounds).forEach((sound) => {
			sound.rate(value)
		})
	}
	
	public get musicMute(): boolean {
		return this._musicMute
	}
	
	public set musicMute(value: boolean) {
		this._musicMute = value
		this.musicLoop?.mute(this._musicMute)
		this.emit(HowlerWrapperEvent.MUSIC_MUTE_CHANGE, this, this._musicMute)
	}
	
	public get soundMute(): boolean {
		return this._soundMute
	}
	
	public set soundMute(value: boolean) {
		this._soundMute = value
		
		Object.values(this.sounds).forEach((sound) => {
			if (sound !== this.musicLoop) {
				sound.mute(this._soundMute)
			}
		})
		
		this.emit(HowlerWrapperEvent.SOUND_MUTE_CHANGE, this, this._soundMute)
	}
	
}
