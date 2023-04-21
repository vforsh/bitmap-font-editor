import { ButtonEvent } from './ButtonEvent'

export class SimpleButton extends Phaser.GameObjects.Image {
	private _enabled: boolean = true
	private currentPointer: Phaser.Input.Pointer
	private originalScale: number = 1
	public areTweensEnabled: boolean = true
	public checkIfOver: boolean = true
	public soundKey: string = 'tap'
	public soundVolume: number = 1

	constructor(scene: Phaser.Scene, texture: string, frame?: string, parent?: Phaser.GameObjects.Container) {
		super(scene, 0, 0, texture, frame)

		if (parent) {
			parent.add(this)
		} else {
			this.scene.add.existing(this)
		}

		this.setInteractive()
		this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this)
		this.scene.input.on(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this)
		this.input.cursor = 'pointer'
	}

	private onPointerDown(pointer: Phaser.Input.Pointer) {
		this.playPressedTween()
		this.playSound()
		this.emit(ButtonEvent.PRESS, this, pointer)

		this.currentPointer = pointer
	}

	private playPressedTween() {
		if (!this.areTweensEnabled) {
			return
		}

		this.originalScale = this.scale
		this.scene.tweens.add({
			targets: this,
			scale: this.scale * 0.9,
			ease: Phaser.Math.Easing.Cubic.Out,
			duration: 50,
		})
	}

	private playSound() {
		this.scene.audio.play(this.soundKey, { volume: this.soundVolume })
	}

	private onScenePointerUp(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[]): void {
		if (this.currentPointer && this.currentPointer === pointer) {
			this.currentPointer = null

			let isPointerOverButton: boolean = objects.includes(this)
			if (this.checkIfOver === false || isPointerOverButton) {
				this.onPointerUp()
				this.emit(ButtonEvent.RELEASE, this, pointer)
			}

			this.playReleasedTween()
		}
	}

	private playReleasedTween() {
		// button could be destroyed during up callback so we have to check for this.scene
		if (!this.scene) {
			return
		}

		if (!this.areTweensEnabled) {
			return
		}

		this.scene.tweens.add({
			targets: this,
			scale: this.originalScale,
			ease: Phaser.Math.Easing.Back.Out,
			duration: 300,
		})
	}

	protected onPointerUp(): void {}

	public enableInput(): void {
		if (this._enabled) {
			return
		}

		this._enabled = true
		this.setInteractive()
	}

	public disableInput(): void {
		if (this._enabled === false) {
			return
		}

		this._enabled = false
		this.disableInteractive()
	}

	public inflateHitArea(x: number, y: number): void {
		let hitArea = this.input.hitArea
		if (hitArea && hitArea instanceof Phaser.Geom.Rectangle) {
			Phaser.Geom.Rectangle.Inflate(hitArea, x, y)
		}
	}

	public emulatePressEvent(args: any[] = []): void {
		this.emit(ButtonEvent.PRESS, this, ...args)
	}

	public emulateReleaseEvent(args: any[] = []): void {
		this.emit(ButtonEvent.RELEASE, this, ...args)
	}

	public destroy(): void {
		if (this.scene) {
			this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this)
		}

		super.destroy()
	}
}
