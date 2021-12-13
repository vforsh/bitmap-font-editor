import { SceneKey } from "../scenes/SceneKey"
import { Config } from "../Config"
import { ISceneTransition, SceneTransitionEvent } from "./ISceneTransition"
import SceneManager = Phaser.Scenes.SceneManager

export interface SceneTransitionConfig {
	textureKey: string
	backgroundFrameName: string
	maskFrameName: string
	fillColor: number
}

export class SceneTransition extends Phaser.GameObjects.Container implements ISceneTransition {
	
	private background: Phaser.GameObjects.Image
	private maskImage: Phaser.GameObjects.Image
	private sceneManager: SceneManager
	public instantChange: boolean = false
	public name: string = "scene_transition"
	
	public changeScene(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void {
		if (this.instantChange) {
			this.emit(SceneTransitionEvent.START, this, currentSceneKey, newSceneKey, newSceneData)
			this.emit(SceneTransitionEvent.COMPLETE, this, currentSceneKey, newSceneKey, newSceneData)
			let currenScene: Phaser.Scene = this.sceneManager.getScene(currentSceneKey)
			currenScene.scene.start(newSceneKey, newSceneData)
			return
		}
		
		this.revive()
		this.emit(SceneTransitionEvent.START, this, currentSceneKey, newSceneKey, newSceneData)
		this.resize()
		this.reApplyMask()
		this.fadeIn()
		this.hideScreen(currentSceneKey, newSceneKey, newSceneData)
	}
	
	public resize(): void {
		this.background.displayWidth = Config.GAME_WIDTH + 4
		this.background.displayHeight = Config.GAME_HEIGHT + 4
		this.background.x = Config.HALF_GAME_WIDTH
		this.background.y = Config.HALF_GAME_HEIGHT
		
		this.maskImage.x = Config.HALF_GAME_WIDTH
		this.maskImage.y = Config.HALF_GAME_HEIGHT
	}
	
	constructor(scene: Phaser.Scene, config: SceneTransitionConfig) {
		super(scene)
		
		this.sceneManager = this.scene.game.scene
		this.addMask(config)
		this.addBackground(config)
		this.resize()
	}
	
	private addMask(config: SceneTransitionConfig) {
		this.maskImage = this.scene.make.image({ add: false, key: config.textureKey, frame: config.maskFrameName })
	}
	
	private addBackground(config: SceneTransitionConfig) {
		this.background = this.scene.add.image(0, 0, config.textureKey, config.backgroundFrameName)
		this.background.setTint(config.fillColor)
		this.add(this.background)
	}
	
	private reApplyMask() {
		if (this.background.mask) {
			this.background.mask.destroy()
		}
		
		this.background.mask = this.maskImage.createBitmapMask()
		this.background.mask.invertAlpha = true
	}
	
	private fadeIn() {
		this.alpha = 0
		this.scene.tweens.add({
			targets: this,
			alpha: 1,
			duration: 270,
			ease: Phaser.Math.Easing.Cubic.Out,
		})
	}
	
	private hideScreen(currentScene: SceneKey, newScene: SceneKey, newSceneData?: object) {
		this.maskImage.scale = this.getMaskScale(this.maskImage)
		this.scene.tweens.add({
			targets: this.maskImage,
			scale: 0,
			duration: 270,
			ease: Phaser.Math.Easing.Cubic.Out,
			onComplete: () => {
				this.doChangeScenes(currentScene, newScene, newSceneData)
			},
		})
	}
	
	private doChangeScenes(currentSceneKey: SceneKey, newSceneKey: SceneKey, newSceneData?: object): void {
		let currentScene: Phaser.Scene = this.sceneManager.getScene(currentSceneKey)
		currentScene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.revealScreen.bind(this, currentSceneKey, newSceneKey, newSceneData))
		currentScene.scene.start(newSceneKey, newSceneData)
	}
	
	private revealScreen(prevSceneKey: SceneKey, newSceneKey: SceneKey) {
		this.scene.tweens.add({
			targets: this.maskImage,
			scale: this.getMaskScale(this.maskImage),
			duration: 350,
			ease: Phaser.Math.Easing.Cubic.In,
		})
		
		this.scene.tweens.add({
			targets: this,
			alpha: 0,
			delay: 250,
			duration: 100,
			ease: Phaser.Math.Easing.Cubic.Out,
			onComplete: () => {
				this.kill()
				this.emit(SceneTransitionEvent.COMPLETE, this, prevSceneKey, newSceneKey)
			},
		})
	}
	
	private getMaskScale(mask: Phaser.GameObjects.Image): number {
		let scaleX: number = Config.GAME_WIDTH / mask.width
		let scaleY: number = Config.GAME_HEIGHT / mask.height
		return Math.max(scaleX, scaleY)
	}
	
}
