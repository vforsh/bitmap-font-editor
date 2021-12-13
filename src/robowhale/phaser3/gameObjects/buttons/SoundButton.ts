import { SimpleButton } from "./SimpleButton"
import { GameStore } from "../../../../store/GameStore"
import { HowlerWrapper, HowlerWrapperEvent } from "../../../../audio/HowlerWrapper"

export class SoundButton extends SimpleButton {
	
	private store: GameStore
	private soundManager: HowlerWrapper
	private frame_1: string
	private frame_2: string
	
	constructor(scene: Phaser.Scene, texture: string, frame_1: string, frame_2: string, parent?: Phaser.GameObjects.Container) {
		super(scene, texture, frame_1, parent)
		
		this.frame_1 = frame_1
		this.frame_2 = frame_2
		this.store = this.scene.game.store
		this.soundManager = this.scene.audio
		this.soundManager.on(HowlerWrapperEvent.SOUND_MUTE_CHANGE, this.onMuteChange, this)
		this.updateFrame(this.soundManager.soundMute)
	}
	
	private onMuteChange(soundManager, mute: boolean): void {
		this.updateFrame(mute)
	}
	
	private updateFrame(mute: boolean): void {
		this.setFrame(mute ? this.frame_2 : this.frame_1)
	}
	
	protected onPointerUp(): void {
		super.onPointerUp()
		
		this.soundManager.soundMute = !this.soundManager.soundMute
		this.store.saveValue("sound_muted", this.soundManager.soundMute)
	}
	
	public destroy(): void {
		this.soundManager.off(HowlerWrapperEvent.SOUND_MUTE_CHANGE, this.onMuteChange, this)
		super.destroy()
	}
}
