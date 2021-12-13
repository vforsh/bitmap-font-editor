import { RenderStatsDOM } from "../../robowhale/phaser3/RenderStatsDOM"
import { ISceneTransition } from "../../sceneTransition/ISceneTransition"
import { ToastsManager } from "../../robowhale/phaser3/gameObjects/toast/ToastsManager"
import { UrlParams } from "../../UrlParams"
import { GlobalSceneDepth } from "./GlobalSceneDepth"

export class GlobalScene extends Phaser.Scene {
	
	private renderStats: RenderStatsDOM
	public blackRect: Phaser.GameObjects.Image
	public sceneTransition: ISceneTransition
	public toasts: ToastsManager
	
	public init(): void {
	}
	
	public create(): void {
		this.addRenderStats()
		
		this.resize()
	}
	
	private addRenderStats(): void {
		let showRenderStats = UrlParams.getBool("stats")
		if (showRenderStats === false) {
			return
		}
		
		this.renderStats = new RenderStatsDOM(this)
	}
	
	public addSceneTranstion(transition: ISceneTransition): void {
		this.sceneTransition = transition
		this.sceneTransition.setDepth(GlobalSceneDepth.SCENE_TRANSITION)
		this.sceneTransition.visible = false
		this.sceneTransition.active = false
		this.add.existing(this.sceneTransition)
	}
	
	public addToasts(): ToastsManager {
		this.toasts = new ToastsManager(this, "__BLACK")
		this.toasts.setDepth(GlobalSceneDepth.TOASTS)
		this.toasts.resize()
		this.add.existing(this.toasts)
		
		return this.toasts
	}
	
	public addBlackRect(): Phaser.GameObjects.Image {
		this.blackRect = this.make.image({ key: "gameplay", frame: "black_rect_big" }, false)
		this.blackRect.alpha = 0.85
		
		return this.blackRect
	}
	
	public update(time, delta): void {
		if (this.renderStats) {
			this.renderStats.update(delta)
		}
	}
	
	public resize(): void {
		this.toasts?.resize()
		this.sceneTransition?.resize()
	}
}
