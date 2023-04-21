import { pullFast } from '../../../../utils/collection/pull-fast'
import { Key } from '../../../scenes/BaseScene'
import { PhaserScreen } from './Screen'

interface CallbackData {
	on: Function
	off: Function
	callback: Function
	context?: any
}

export class PhaserScreenKeyboardInput {
	private readonly screen: PhaserScreen
	private readonly keyboard: Phaser.Input.Keyboard.KeyboardPlugin
	private callbacks: Map<Key, CallbackData[]>

	constructor(screen: PhaserScreen) {
		this.screen = screen
		this.keyboard = screen.scene.input.keyboard
		this.callbacks = new Map<Key, CallbackData[]>()
	}

	public onKeyDown(key: Key, callback: Function, context?: any): { on: Function; off: Function } {
		let event = `keydown-${key}`
		let on = () => this.keyboard.on(event, callback, context)
		let off = () => this.keyboard.off(event, callback, context)
		let data = { on, off, callback, context }

		this.callbacks.has(key) === false ? this.callbacks.set(key, [data]) : this.callbacks.get(key).push(data)

		return { on, off }
	}

	public offKeyDown(key: Key, callback?: Function, context?: any): void {
		let callbacks = this.callbacks.get(key)
		if (!callbacks) {
			return
		}

		this.getCallbacksToRemove(callbacks, callback, context).forEach((cbData) => {
			cbData.off()
			pullFast(callbacks, cbData)
		})
	}

	private getCallbacksToRemove(data: CallbackData[], callback?: Function, context?: any): CallbackData[] {
		if (!callback && !context) {
			return data
		}

		if (!callback && context) {
			return data.filter((cbData) => cbData.context === context)
		}

		return data.filter((cbData) => cbData.callback === callback && cbData.context === context)
	}

	public enableCallbacks(): void {
		this.callbacks.forEach((callbacks) => {
			callbacks.forEach((callback) => callback.on())
		})
	}

	public disableCallbacks(): void {
		this.callbacks.forEach((callbacks) => {
			callbacks.forEach((callback) => callback.off())
		})
	}

	public removeCallbacks(): void {
		this.disableCallbacks()
		this.callbacks.clear()
	}

	public destroy(): void {
		this.removeCallbacks()
		this.callbacks = null
	}
}
