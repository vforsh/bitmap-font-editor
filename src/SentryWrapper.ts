import { ISceneTransition, SceneTransitionEvent } from "./sceneTransition/ISceneTransition"
import * as Sentry from "@sentry/browser"
import { Breadcrumb, CaptureContext, Primitive, Severity } from "@sentry/types"

export interface SnapshotOptions {
	format: "image/jpeg" | "image/png"
	quality: number
}

export class SentryWrapper {
	
	public get isEnabled(): boolean {
		return this._isEnabled
	}
	
	private readonly game: Phaser.Game
	private readonly _isEnabled: boolean = false
	
	constructor(game: Phaser.Game) {
		this.game = game
		this._isEnabled = typeof Sentry.getCurrentHub().getClient() !== "undefined"
	}
	
	public addBreadcrumb(breadcrumb: Breadcrumb): void {
		if (this._isEnabled === false) {
			return
		}
		
		Sentry.addBreadcrumb(breadcrumb)
	}
	
	public setTag(tag: string, value: string) {
		if (this._isEnabled === false) {
			return
		}
		
		Sentry.setTag(tag, value)
	}
	
	public setTags(tags: Record<string, Primitive>): void {
		if (this._isEnabled === false) {
			return
		}
		
		Sentry.setTags(tags)
	}
	
	public trackGameGlobalEvents() {
		if (this._isEnabled === false) {
			return
		}
		
		let events = this.game.events
		let category = "game.global"
		
		events.on(Phaser.Core.Events.HIDDEN, () => {
			Sentry.addBreadcrumb({ category, message: "document hidden" })
		})
		
		events.on(Phaser.Core.Events.VISIBLE, () => {
			Sentry.addBreadcrumb({ category, message: "document visible" })
		})
		
		events.on(Phaser.Core.Events.CONTEXT_LOST, () => {
			Sentry.addBreadcrumb({ category, message: "WebGL context lost", level: Severity.Warning })
		})
		
		events.on(Phaser.Core.Events.CONTEXT_RESTORED, () => {
			Sentry.addBreadcrumb({ category, message: "WebGL context restored" })
		})
	}
	
	public addInitialBreadcrumb() {
		if (this._isEnabled === false) {
			return
		}
		
		this.addBreadcrumb({
			message: "sentry init",
			data: {
				"document.visibility": document.hidden === true ? "hidden" : "visible",
				"renderer.state": this.getRendererState(),
			},
		})
	}
	
	private getRendererState(): string {
		let renderer = this.game.renderer
		if (renderer instanceof Phaser.Renderer.Canvas.CanvasRenderer) {
			return "canvas_renderer"
		}
		
		return renderer.contextLost ? "webgl_context_lost" : "webgl_context_is_fine"
	}
	
	public setTagsOnStart(): void {
		if (this._isEnabled === false) {
			return
		}
		
		Sentry.setTags({
			renderer: this.game.rendererType,
			audio: this.game.audioType,
			webp: this.game.webp.toString(),
			avif: this.game.avif.toString(),
		})
	}
	
	public trackSceneChanges(transition: ISceneTransition) {
		if (this._isEnabled === false) {
			return
		}
		
		transition.on(SceneTransitionEvent.COMPLETE, this.onSceneTransitionComplete, this)
	}
	
	private onSceneTransitionComplete(transition, oldSceneKey, newSceneKey, newSceneData) {
		let scenesData = {
			currentScene: newSceneKey,
			...(newSceneData && { currentSceneData: this.prettifySceneData(newSceneData) }),
			lastScene: oldSceneKey,
		}
		
		Sentry.addBreadcrumb({
			category: "game.flow",
			message: `transition ${oldSceneKey} => ${newSceneKey}`,
			data: {
				newSceneData,
			},
		})
		
		Sentry.setContext("game", {
			...scenesData,
		})
		
		this.trackSceneInput(newSceneKey)
	}
	
	private prettifySceneData(sceneData): any {
		let prettySceneData = {}
		
		Object.keys(sceneData).forEach((key) => {
			let value = sceneData[key]
			if (typeof value === "object") {
				prettySceneData[key] = JSON.stringify(value)
			} else {
				prettySceneData[key] = value
			}
		})
		
		return prettySceneData
	}
	
	public trackSceneInput(sceneKey: SceneKey | string): void {
		if (this._isEnabled === false) {
			return
		}
		
		let scene = this.game.scene.getScene(sceneKey)
		if (scene) {
			scene.events.once(Phaser.Scenes.Events.SHUTDOWN, this.removePointerDownListener.bind(this, scene))
			scene.input?.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)
		}
	}
	
	private removePointerDownListener(scene: Phaser.Scene): void {
		scene.input?.off(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)
	}
	
	private onPointerDown(pointer, objects: Phaser.GameObjects.GameObject[]): void {
		let clicked: string[] = objects.map((obj) => {
			return obj.name || obj["frame"]?.name || obj["texture"]?.key
		})
		
		if (clicked.length === 0) {
			return
		}
		
		Sentry.addBreadcrumb({
			category: "game.click",
			data: {
				objects: clicked.join(),
				scene: objects[0].scene.scene.key,
				parent: !!objects[0].parentContainer ? objects[0].parentContainer.name : "scene",
			},
		})
	}
	
	public captureMessage(message: string, captureContext?: CaptureContext | Severity) {
		if (this._isEnabled) {
			Sentry.captureMessage(message, captureContext)
		}
	}
	
	public captureException(exception: any, captureContext?: CaptureContext) {
		if (this._isEnabled) {
			Sentry.captureException(exception, captureContext)
		}
	}
	
	public getGameSnapshotAsBlob(options: SnapshotOptions = { format: "image/jpeg", quality: 0.25 }): Promise<Blob> {
		return new Promise((resolve, reject) => {
			this.game.renderer.snapshot(async (snapshot: HTMLImageElement) => {
				let screenshotBase64 = snapshot.src
				let blob = await fetch(screenshotBase64).then(res => res.blob())
				resolve(blob)
			}, options.format, options.quality)
		})
	}
}
