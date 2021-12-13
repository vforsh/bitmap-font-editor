import ScaleManager = Phaser.Scale.ScaleManager
import { Config } from "../Config"
import { SceneKey } from "../scenes/SceneKey"
import { ResizeSensor } from "css-element-queries"
import { getGraphicsQualityAsNumber, GraphicsQuality } from "./GraphicsQuality"
import { debounce } from "lodash-es"

export interface GameScalerOptions {
	resizeDebounceInterval: number
}

export class GameScaler {
	public get quality(): GraphicsQuality {
		return this._quality
	}
	
	public get qualityValue(): number {
		return getGraphicsQualityAsNumber(this._quality)
	}
	
	private readonly game: Phaser.Game
	private readonly options: GameScalerOptions
	private readonly scale: ScaleManager
	private readonly canvas: HTMLCanvasElement
	private readonly rotateOverlay: HTMLDivElement
	private resizeTimeoutId: number
	private _quality: GraphicsQuality = GraphicsQuality.HIGH
	
	constructor(game: Phaser.Game, options: GameScalerOptions) {
		this.game = game
		this.options = options
		this.scale = this.game.scale
		this.canvas = this.scale.canvas
		this.rotateOverlay = document.getElementById("rotate") as HTMLDivElement
		
		if (this.game.config.scaleMode === Phaser.Scale.NONE) {
			this.scale.zoom = Phaser.Scale.NO_ZOOM
			this.setupCanvasStyle()
			this.addResizeListener()
			this.updateScreenConstants()
		}
	}
	
	private setupCanvasStyle() {
		let parentStyle = this.canvas.parentElement.style
		parentStyle.width = "100%"
		parentStyle.height = "100%"
		parentStyle.position = "absolute"
		parentStyle.top = "0"
		parentStyle.bottom = "0"
	}
	
	private addResizeListener(): void {
		let onCanvasResize = this.onCanvasResize.bind(this)
		let callback = this.options.resizeDebounceInterval > 0
			? debounce(onCanvasResize, 200, { leading: false })
			: onCanvasResize
		
		let sensor = new ResizeSensor(this.canvas.parentElement, callback)
	}
	
	private onCanvasResize(size: { width: number, height: number }) {
		if (typeof this.resizeTimeoutId !== "undefined") {
			clearTimeout(this.resizeTimeoutId)
		}
		
		if (document.hidden) {
			return
		}
		
		let width = size.width
		let height = size.height
		if (width === 0 || height === 0) {
			this.scheduleResize()
			return
		}
		
		let zoom = Math.min(Config.SOURCE_GAME_WIDTH / width, 2)
		let quality = getGraphicsQualityAsNumber(this._quality)
		
		this.addResizeBreadcrumb(width, height, zoom)
		
		this.canvas.style.width = `${width}px`
		this.canvas.style.height = `${height}px`
		this.scale.resize(width * zoom * quality, height * zoom * quality)
		
		let isCorrectOrientation = this.isCorrectOrientation(width, height)
		if (isCorrectOrientation) {
			this.updateScreenConstants()
			this.resizeActiveScenes()
			this.hideRotateIcon()
		} else {
			this.showRotateIcon()
		}
	}
	
	private scheduleResize(delay: number = 1000) {
		this.resizeTimeoutId = setTimeout(() => {
			let bounds = this.canvas.getBoundingClientRect()
			this.onCanvasResize({ width: bounds.width, height: bounds.height })
		}, delay)
	}
	
	private addResizeBreadcrumb(width: number, height: number, zoom: number) {
		this.game.sentry.addBreadcrumb({
			category: "game",
			message: "resize",
			data: {
				width,
				height,
				zoom,
			},
		})
	}
	
	private isCorrectOrientation(width: number, height: number): boolean {
		let isPortrait = height > width
		let isLandscape = width > height
		let correctPortrait = Config.IS_PORTRAIT && isPortrait
		let correctLandscape = Config.IS_LANDSCAPE && isLandscape
		return correctPortrait || correctLandscape
	}
	
	private resizeActiveScenes(): void {
		let scenes = this.game.scene.getScenes(true)
		let preloader = this.game.scene.getScene(SceneKey.PRELOADER)
		if (scenes.includes(preloader) === false) {
			// manually add preloader because phaser thinks it is inactive until loading is complete
			if (preloader.scene.settings.status === Phaser.Scenes.LOADING) {
				scenes.push(preloader)
			}
		}
		
		scenes.forEach((scene) => {
			if (scene.resize) {
				scene.resize()
			}
		})
	}
	
	private updateScreenConstants(): void {
		Config.GAME_WIDTH = this.game.scale.width
		Config.GAME_HEIGHT = this.game.scale.height
		Config.HALF_GAME_WIDTH = Config.GAME_WIDTH * 0.5
		Config.HALF_GAME_HEIGHT = Config.GAME_HEIGHT * 0.5
		Config.ASPECT_RATIO = Config.GAME_WIDTH / Config.GAME_HEIGHT
		Config.ASSETS_SCALE = Config.IS_PORTRAIT
			? Config.GAME_WIDTH / Config.SOURCE_GAME_WIDTH
			: Config.GAME_HEIGHT / Config.SOURCE_GAME_HEIGHT
	}
	
	private showRotateIcon(): void {
		this.rotateOverlay.style.display = "flex"
	}
	
	private hideRotateIcon(): void {
		this.rotateOverlay.style.display = "none"
	}
	
	public setQuality(value: GraphicsQuality): void {
		if (value === this._quality) {
			return
		}
		
		this._quality = value
		let { width, height } = this.canvas.getBoundingClientRect()
		this.onCanvasResize({ width, height })
	}
}
