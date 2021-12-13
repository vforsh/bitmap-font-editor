import SceneManager = Phaser.Scenes.SceneManager
import { Config } from "../Config"
import { ISceneTransition, SceneTransitionEvent } from "./ISceneTransition"

export class CanvasSceneTransition extends Phaser.GameObjects.Image implements ISceneTransition {
	
	public instantChange: boolean
	private sceneManager: SceneManager
	
	constructor(scene: Phaser.Scene, key: string, frame?: string) {
		super(scene, 0, 0, key, frame)
		
		this.sceneManager = this.scene.game.scene
	}
	
	public changeScene(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void {
		if (this.instantChange) {
			this.emit(SceneTransitionEvent.START, this, currentSceneKey, newSceneKey, newSceneData)
			this.emit(SceneTransitionEvent.COMPLETE, this, currentSceneKey, newSceneKey, newSceneData)
			let currenScene: Phaser.Scene = this.sceneManager.getScene(currentSceneKey)
			currenScene.scene.start(newSceneKey, newSceneData)
			return
		}
		
		this.emit(SceneTransitionEvent.START, this, currentSceneKey, newSceneKey, newSceneData)
		this.resize()
		this.fadeIn(currentSceneKey, newSceneKey, newSceneData)
	}
	
	private fadeIn(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object) {
		this.revive()
		
		this.alpha = 0
		this.scene.tweens.add({
			targets: this,
			duration: 200,
			ease: Phaser.Math.Easing.Quadratic.In,
			alpha: 1,
			onComplete: () => {
				this.doChangeScenes(currentSceneKey, newSceneKey, newSceneData)
			},
		})
	}
	
	private doChangeScenes(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void {
		let currentScene: Phaser.Scene = this.sceneManager.getScene(currentSceneKey)
		currentScene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.fadeOut.bind(this, currentSceneKey, newSceneKey))
		currentScene.scene.start(newSceneKey, newSceneData)
		
		this.emit(SceneTransitionEvent.COMPLETE, this, currentSceneKey, newSceneKey, newSceneData)
	}
	
	private fadeOut(): void {
		this.scene.tweens.add({
			targets: this,
			duration: 400,
			ease: Phaser.Math.Easing.Quadratic.In,
			alpha: 0,
			onComplete: () => {
				this.kill()
			},
		})
	}
	
	public resize(): void {
		this.setDisplaySize(Config.GAME_WIDTH + 4, Config.GAME_HEIGHT + 4)
		this.x = Config.HALF_GAME_WIDTH
		this.y = Config.HALF_GAME_HEIGHT
	}
	
	public destroy(): void {
		super.destroy()
	}
}
