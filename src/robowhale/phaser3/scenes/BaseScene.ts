import { IPinnable, Pinner } from "./Pinner"
import { IScaleable, ScaleOptions, Scaler, ScaleType } from "./Scaler"
import { Config } from "../../../Config"
import { FastForward } from "./FastForward"

export type Key = keyof typeof Phaser.Input.Keyboard.KeyCodes

export class BaseScene extends Phaser.Scene {
	
	public initData: any
	public pinner: Pinner
	public sizer: Scaler
	public fastForward: FastForward
	public shiftKey: Phaser.Input.Keyboard.Key
	public ctrlKey: Phaser.Input.Keyboard.Key
	
	public get keyboard(): Phaser.Input.Keyboard.KeyboardPlugin {
		return this.input.keyboard
	}
	
	public get activePointer(): Phaser.Input.Pointer {
		return this.input.activePointer
	}
	
	public init(data?: any): void {
		this.initData = data ?? undefined
		this.events.once("shutdown", this.onShutdown, this)
		this.pinner = new Pinner()
		this.sizer = new Scaler(this)
		this.fastForward = new FastForward(this)
		this.shiftKey = this.shiftKey ?? this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT)
		this.ctrlKey = this.ctrlKey ?? this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.CTRL)
	}
	
	public create(): void {
	
	}
	
	public size(obj: IScaleable, type: ScaleType = ScaleType.EXACT, options?: ScaleOptions): void {
		this.sizer.scale(obj, type, options)
	}
	
	public pin(obj: IPinnable, x: number, y: number, offsetX?: number, offsetY?: number): void {
		this.pinner.pin(obj, x, y, offsetX, offsetY)
	}
	
	public pinAround(obj: IPinnable, anchor: IPinnable, offsetX?: number, offsetY?: number): void {
		this.pinner.pinAround(obj, anchor, offsetX, offsetY)
	}
	
	public resize(): void {
		this.sizer.onResize()
		this.pinner.onResize(Config.GAME_WIDTH, Config.GAME_HEIGHT, Config.ASSETS_SCALE)
	}
	
	public restart(data?: object): void {
		this.game.restartScene(this.scene.key, data ?? this.initData)
	}
	
	public onKeyDown(key: Key, callback: Function, context?: any): void {
		this.keyboard.on(`keydown-${key}`, callback, context)
	}
	
	public onceKeyDown(key: Key, callback: Function, context?: any): void {
		this.keyboard.once(`keydown-${key}`, callback, context)
	}
	
	public changeScene(newScene: SceneKey, data?: any): void {
		this.game.changeScene(this.scene.key, newScene, data)
	}
	
	public onShutdown(): void {
		this.pinner.destroy()
		this.pinner = null
		
		this.sizer.destroy()
		this.sizer = null
		
		this.fastForward.destroy()
		this.fastForward = null
	}
	
}
