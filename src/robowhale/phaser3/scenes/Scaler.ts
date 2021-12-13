import { BaseScene } from "./BaseScene"
import { Config } from "../../../Config"

export enum ScaleType {
	EXACT = "EXACT",
	FIT = "FIT",
	FILL = "FILL",
	ENVELOP = "ENVELOP",
}

export type ScaleOptions = FitOptions | EnvelopOptions

export interface FitOptions {
	width: number
	height: number
}

export interface EnvelopOptions {
	width: number
	height: number
}

export interface IScaleable {
	scale: number
	width: number
	height: number
	displayWidth: number
	displayHeight: number
}

export interface IScaled {
	obj: IScaleable
	type: ScaleType
	options?: ScaleOptions
}

export class Scaler {
	
	private readonly scene: BaseScene
	private items: Map<IScaleable, IScaled>
	
	constructor(scene: BaseScene) {
		this.scene = scene
		this.items = new Map<IScaleable, IScaled>()
	}
	
	public scale(obj: IScaleable, type: ScaleType = ScaleType.EXACT, options?: ScaleOptions): void {
		
		this.items.set(obj, {
			obj,
			type,
			options,
		})
	}
	
	public onResize(): void {
		this.items.forEach((item) => {
			switch (item.type) {
				case ScaleType.FILL:
					item.obj.displayWidth = Config.GAME_WIDTH
					item.obj.displayHeight = Config.GAME_HEIGHT
					break
				
				case ScaleType.ENVELOP:
					let scaleX = (Config.GAME_WIDTH + 2) / item.obj.width
					let scaleY = (Config.GAME_HEIGHT + 2) / item.obj.height
					item.obj.scale = Math.max(scaleX, scaleY)
					break
				
				case ScaleType.FIT:
					let fitScaleX = Config.GAME_WIDTH / item.obj.width
					let fitScaleY = Config.GAME_HEIGHT / item.obj.height
					item.obj.scale = Math.min(fitScaleX, fitScaleY)
					break
				
				default:
					item.obj.scale = Config.ASSETS_SCALE
					break
			}
		})
	}
	
	public destroy(): void {
		this.items.clear()
		this.items = null
	}
	
}
