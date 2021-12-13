import { SceneKey } from "../SceneKey"
import { ISceneTransition } from "../../sceneTransition/ISceneTransition"
import { CanvasSceneTransition } from "../../sceneTransition/CanvasSceneTransition"
import { BaseScene } from "../../robowhale/phaser3/scenes/BaseScene"
import { UrlParams } from "../../UrlParams"
import { isGraphicsQualityOption } from "../../scale/GraphicsQuality"
import { getCacheBustingUrl } from "../../CacheBuster"
import { GameStore } from "../../store/GameStore"

export class Preloader extends BaseScene {
	
	public init(data?: any) {
		super.init(data)
		
		this.decoratePage()
		this.game.loadingScreen.showPreloader()
	}
	
	private decoratePage() {
		let isDesktopScaling = this.game.config.scaleMode === Phaser.Scale.FIT
		if (isDesktopScaling === false) {
			return
		}
		
		let noDecor = UrlParams.getBool("noDecor")
		if (noDecor) {
			return
		}
		
		let canvas = this.game.canvas
		canvas.parentElement.style.backgroundImage = this.getBackgroundImageUrl()
		canvas.parentElement.style.backgroundColor = "#EB8F4E"
		canvas.style.boxShadow = "0px 0px 16px 16px rgba(0, 0, 0, 0.1)"
		this.surroundCanvasWithSidebars(canvas)
		this.scale.updateBounds()
	}
	
	private getBackgroundImageUrl(): string {
		let format = this.getDefaultImageFormat()
		let url = getCacheBustingUrl(`assets/graphics/page_background.${format}`)
		
		return `url('${url}')`
	}
	
	private getDefaultImageFormat() {
		if (this.game.avif) {
			return "avif"
		} else if (this.game.webp) {
			return "webp"
		} else {
			return "jpg"
		}
	}
	
	private surroundCanvasWithSidebars(canvas: HTMLCanvasElement) {
		let leftSidebar = document.createElement("div")
		leftSidebar.className = "sidebar"
		leftSidebar.id = "left-sidebar"
		canvas.parentNode.insertBefore(leftSidebar, canvas)
		
		let rightSidebar = document.createElement("div")
		rightSidebar.className = "sidebar"
		rightSidebar.id = "right-sidebar"
		canvas.parentNode.insertBefore(rightSidebar, canvas.nextSibling)
	}
	
	public preload() {
		this.loadSaveData()
	}
	
	private loadSaveData() {
		this.load.rexAwait("init_game_store", {
			callback: (onSuccess) => {
				this.game.store = new GameStore(this.game, `bmfont-editor`)
				this.game.store.initActualStorage()
					.catch((error) => {
						this.game.analytics.sendError(`Storage:Not_Available`)
					})
					.finally(async () => {
						await this.game.store.loadInitialValues()
						onSuccess()
					})
			},
		})
	}
	
	public create() {
		this.initStore()
		this.initGraphicsQuality()
		this.addScenesTransition()
		this.addToasts()
		
		this.startScene(SceneKey.BITMAP_FONT_EDITOR)
	}
	
	private initStore() {
		this.game.store.changeNumber("login_num", 1)
	}
	
	private initGraphicsQuality() {
		let qualityUrlParam = UrlParams.get("quality")
		if (isGraphicsQualityOption(qualityUrlParam)) {
			this.game.scaler.setQuality(qualityUrlParam)
			return
		}
		
		let savedQuality = this.game.store.getValue("graphics_quality")
		if (isGraphicsQualityOption(savedQuality)) {
			this.game.scaler.setQuality(savedQuality)
			return
		}
	}
	
	private addScenesTransition() {
		let transition: ISceneTransition = new CanvasSceneTransition(this.game.globalScene, "__BLACK")
		this.game.globalScene.addSceneTranstion(transition)
		this.game.globalScene.sceneTransition.instantChange = UrlParams.getBool("instantSceneChange")
		
		this.game.sentry.trackSceneChanges(transition)
	}
	
	private addToasts() {
		this.game.toasts = this.game.globalScene.addToasts()
	}
	
	private startScene(scene: SceneKey | string, data?: any): void {
		this.game.changeScene(this.scene.key, scene, data)
	}
	
	public resize(): void {
		super.resize()
	}
	
	public onShutdown() {
		super.onShutdown()
		
		this.game.loadingScreen.fadeOut()
	}
}
