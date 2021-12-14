import ScaleManager = Phaser.Scale.ScaleManager
import { Config } from "../Config"
import { SceneKey } from "../scenes/SceneKey"
import { ResizeSensor } from "css-element-queries"
import { getGraphicsQualityAsNumber, GraphicsQuality } from "./GraphicsQuality"

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
	private _quality: GraphicsQuality = GraphicsQuality.HIGH
	
	constructor(game: Phaser.Game, options: GameScalerOptions) {
		this.game = game
		this.options = options
		this.scale = this.game.scale
		this.canvas = this.scale.canvas
		
		this.scale.zoom = Phaser.Scale.NO_ZOOM
		this.addResizeListener()
		this.updateScreenConstants()
	}
	
	private addResizeListener(): void {
		let sensor = new ResizeSensor(this.canvas.parentElement, (size) => {
			this.scale.resize(size.width, size.height - 3)
			this.updateScreenConstants()
			this.resizeActiveScenes()
		})
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
	
}
