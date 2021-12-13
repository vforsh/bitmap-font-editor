import { SceneKey } from "./SceneKey"
import { GlobalScene } from "./global/GlobalScene"
import { GameScaler, GameScalerOptions } from "../scale/GameScaler"
import { SentryWrapper } from "../SentryWrapper"
import { UrlParams } from "../UrlParams"
import { Main } from "../Main"
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export class Boot extends Phaser.Scene {
	
	public create() {
		this.setupSentry()
		this.removeUnusedPipelines()
		this.addBlackTexture()
		this.addScaler()
		this.addCpuThrottling()
		
		this.game.injectIntoScenes(this.game.audio, "audio")
		
		this.launchGlobalScene()
	}
	
	private setupSentry() {
		this.game.sentry = new SentryWrapper(this.game)
		this.game.sentry.trackGameGlobalEvents()
		this.game.sentry.addInitialBreadcrumb()
		this.game.sentry.setTagsOnStart()
		this.game.injectIntoScenes(this.game.sentry, "sentry")
	}
	
	private removeUnusedPipelines() {
		let renderer = this.renderer
		if (!(renderer instanceof WebGLRenderer)) {
			return
		}
		
		let { pipelines: manager } = renderer
		let pipelines = Phaser.Renderer.WebGL.Pipelines
		let list = [pipelines.LIGHT_PIPELINE, pipelines.POINTLIGHT_PIPELINE, pipelines.ROPE_PIPELINE, pipelines.BITMAPMASK_PIPELINE]
		list.forEach((pipelineName) => {
			manager.get(pipelineName)?.destroy()
			manager.remove(pipelineName)
		})
	}
	
	private addBlackTexture(): void {
		let graphics = this.make.graphics({ fillStyle: { color: 0 } }, false)
		graphics.fillRect(0, 0, 1, 1)
		graphics.generateTexture("__BLACK", 1, 1)
		graphics.destroy()
	}
	
	private addScaler() {
		let resizeDebounceInterval = Main.development ? 0 : 200
		let options: GameScalerOptions = {
			resizeDebounceInterval,
		}
		
		this.game.scaler = new GameScaler(this.game, options)
	}
	
	private addCpuThrottling() {
		let throttle = UrlParams.getNumber("throttle")
		if (throttle <= 0) {
			return
		}
		
		this.events.on(Phaser.Scenes.Events.PRE_UPDATE, () => {
			let i = throttle * 1_000_000
			let a = 0
			while (--i) {
				a += Math.sqrt(i)
			}
		})
		
		console.log(`⚠ ️Throttling x${throttle} is enabled ⚠`)
	}
	
	private launchGlobalScene() {
		let globalScene = this.scene.get(SceneKey.GLOBAL)
		globalScene.events.once(Phaser.Scenes.Events.READY, this.onGlobalSceneReady.bind(this, globalScene))
		globalScene.scene.start(SceneKey.GLOBAL)
	}
	
	private onGlobalSceneReady(globalScene: Phaser.Scene): void {
		this.game.globalScene = globalScene as GlobalScene
		globalScene.scene.launch(SceneKey.PRELOADER)
		globalScene.scene.bringToTop()
	}
}
