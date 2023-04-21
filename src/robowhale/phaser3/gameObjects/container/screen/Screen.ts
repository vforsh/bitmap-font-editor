import { Config } from '../../../../../Config'
import { Key } from '../../../scenes/BaseScene'
import { IPinnable, Pinner } from '../../../scenes/Pinner'
import { PhaserScreenKeyboardInput } from './PhaserScreenKeyboardInput'

type Vector2Like = Phaser.Types.Math.Vector2Like

export interface PhaserScreenOptions {
	backgroundKey?: string
	backgroundPadding?: number
	backgroundFrame?: string
	backgroundAlpha?: number
	backgroundInteractive?: boolean
	name?: string
}

export enum PhaserScreenEvent {
	SHOW = '__SHOW',
	HIDE_START = '__HIDE_START',
	HIDE_COMPLETE = '__HIDE_COMPLETE',
}

export class PhaserScreen extends Phaser.GameObjects.Container {
	protected readonly options: PhaserScreenOptions
	public pinner: Pinner
	public background: Phaser.GameObjects.Image
	public screenHeight: number
	public screenWidth: number
	public screenCenter: Vector2Like
	public keyboard: PhaserScreenKeyboardInput

	constructor(scene: Phaser.Scene, options: PhaserScreenOptions) {
		super(scene)

		this.name = options.name ?? 'screen'

		this.options = {
			backgroundKey: '__BLACK',
			backgroundAlpha: 0.8,
			backgroundPadding: 4,
			backgroundInteractive: true,
			...options,
		}

		this.pinner = new Pinner()
		this.keyboard = new PhaserScreenKeyboardInput(this)
		this.setSize(Config.SOURCE_GAME_WIDTH, Config.SOURCE_GAME_HEIGHT)
		this.addBackground()
		this.updateScreenSize()
	}

	private addBackground() {
		this.background = this.scene.add.image(0, 0, this.options.backgroundKey, this.options.backgroundFrame)
		this.background.alpha = this.options.backgroundAlpha
		this.background.name = this.name + '_bg'
		this.background.setOrigin(0.5, 0.5)
		this.background.displayWidth = this.width + this.options.backgroundPadding
		this.background.displayHeight = this.height + this.options.backgroundPadding
		this.add(this.background)

		if (this.options.backgroundInteractive) {
			this.background.setInteractive()
		}
	}

	private updateScreenSize() {
		if (Config.IS_PORTRAIT) {
			this.screenWidth = this.width
			this.screenHeight = Config.GAME_HEIGHT / this.scale
		} else {
			this.screenWidth = Config.GAME_WIDTH / this.scale
			this.screenHeight = this.height
		}

		this.screenCenter = { x: this.screenWidth / 2, y: this.screenHeight / 2 }
	}

	public resize(): void {
		if (Config.IS_PORTRAIT) {
			this.scale = Config.GAME_WIDTH / this.width
			this.background.displayHeight = (Config.GAME_HEIGHT + this.options.backgroundPadding) / this.scale
		} else {
			this.scale = Config.GAME_HEIGHT / this.height
			this.background.displayWidth = (Config.GAME_WIDTH + this.options.backgroundPadding) / this.scale
		}

		this.updateScreenSize()
		this.pinner.onResize(this.screenWidth, this.screenHeight, 1)
		this.background.x = this.screenCenter.x
		this.background.y = this.screenCenter.y
	}

	public pin(obj: IPinnable, x: number, y: number, offsetX?: number, offsetY?: number): void {
		this.pinner.pin(obj, x, y, offsetX, offsetY)
	}

	public pinAround(obj: IPinnable, anchor: IPinnable, offsetX?: number, offsetY?: number): void {
		this.pinner.pinAround(obj, anchor, offsetX, offsetY)
	}

	protected emitShowEvent(...args): void {
		this.emit(PhaserScreenEvent.SHOW, this, ...args)
	}

	protected emitHideStartEvent(...args): void {
		this.emit(PhaserScreenEvent.HIDE_START, this, ...args)
	}

	protected emitHideCompleteEvent(...args): void {
		this.emit(PhaserScreenEvent.HIDE_COMPLETE, this, ...args)
	}

	protected showBackground(props: { targetAlpha?: number; duration?: number; ease?: string | Function } = {}): void {
		this.background.alpha = 0

		this.scene.tweens.add({
			targets: this.background,
			duration: props.duration ?? 150,
			ease: props.ease ?? Phaser.Math.Easing.Cubic.Out,
			alpha: props.targetAlpha ?? this.options.backgroundAlpha,
		})
	}

	public onKeyDown(key: Key, callback: Function, context?: any): ReturnType<PhaserScreenKeyboardInput['onKeyDown']> {
		return this.keyboard.onKeyDown(key, callback, context)
	}

	public offKeyDown(key: Key, callback: Function, context?: any): void {
		this.keyboard.offKeyDown(key, callback, context)
	}

	protected preDestroy() {
		this.keyboard.destroy()
		this.keyboard = null

		super.preDestroy()
	}
}
