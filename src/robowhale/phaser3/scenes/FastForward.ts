export interface IFastForwardable extends Phaser.GameObjects.GameObject {
	timeScale: number
}

export enum FastForwardEvent {
	START = '__START',
	STOP = '__STOP',
}

export class FastForward extends Phaser.Events.EventEmitter {
	public get timeScale(): number {
		return this._timeScale
	}

	private scene: Phaser.Scene
	private isActive: boolean = false
	private _timeScale: number = 1

	constructor(scene: Phaser.Scene) {
		super()

		this.scene = scene
	}

	public start(timeScale: number): void {
		if (this.isActive) {
			return
		}

		this.isActive = true
		this.setTimeScale(timeScale)
		this.emit(FastForwardEvent.START, this, timeScale)
	}

	public stop(): void {
		if (this.isActive === false) {
			return
		}

		this.isActive = false
		this.setTimeScale(1)
		this.emit(FastForwardEvent.STOP, this)
	}

	public setTimeScale(value: number): void {
		this._timeScale = value
		this.scene.tweens.timeScale = value
		this.scene.time.timeScale = value
		this.getFastForwardables().forEach((item) => (item.timeScale = value))
	}

	private getFastForwardables(): IFastForwardable[] {
		return this.scene.sys.updateList.getActive().filter((item) => this.isFastForwardable(item)) as IFastForwardable[]
	}

	private isFastForwardable(item: Phaser.GameObjects.GameObject): item is IFastForwardable {
		return typeof item['timeScale'] === 'number'
	}

	public destroy() {
		this.stop()

		super.destroy()
	}
}
