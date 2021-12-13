export enum PauseHandlerEvent {
	PAUSE = "__PAUSE",
	RESUME = "__RESUME",
}

export interface PauseHandlerOptions {
	muteOnPause: boolean
}

export class PauseHandler extends Phaser.Events.EventEmitter {
	
	private readonly game: Phaser.Game
	private readonly options: PauseHandlerOptions
	private isPaused: boolean = false
	private pausedScenes: Phaser.Scene[] = []
	
	constructor(game: Phaser.Game, options: PauseHandlerOptions) {
		super()
		
		this.game = game
		this.options = options
	}
	
	public pause(): void {
		if (this.isPaused) {
			return
		}
		
		this.isPaused = true
		this.pausedScenes = this.game.scene.getScenes(true)
		this.pausedScenes.forEach(scene => scene.scene.pause())
		
		if (this.options.muteOnPause) {
			this.game.audio.global?.mute(true)
		}
		
		this.game.events.emit(PauseHandlerEvent.PAUSE, this.game)
	}
	
	public resume(): void {
		if (this.isPaused === false) {
			return
		}
		
		this.isPaused = false
		this.pausedScenes.forEach(scene => scene.scene.resume())
		this.pausedScenes.length = 0
		
		if (this.options.muteOnPause) {
			this.game.audio.global?.mute(false)
		}
		
		this.game.events.emit(PauseHandlerEvent.RESUME, this.game)
	}
}
