export enum ProgressBarDirection {
	HORIZONTAL = 'HORIZONTAL',
	VERTICAL = 'VERTICAL',
}

export class ProgressBar extends Phaser.GameObjects.Image {
	private cropRect: Phaser.Geom.Rectangle
	private direction: ProgressBarDirection
	private cropTween: Phaser.Tweens.Tween

	constructor(scene: Phaser.Scene, direction: ProgressBarDirection, texture: string, frame?: string) {
		super(scene, 0, 0, texture, frame)

		this.direction = direction
		this.cropRect = new Phaser.Geom.Rectangle(0, 0, this.width, this.height)
		this.setCrop(this.cropRect)
	}

	/**
	 * @param value number from 0 to 1 (it will be clamped anyway)
	 */
	public setProgressInstant(value: number): void {
		value = Phaser.Math.Clamp(value, 0.001, 1)

		if (this.direction === ProgressBarDirection.HORIZONTAL) {
			let width: number = this.width * value
			this.cropRect.width = width
			this.updateCrop()
		} else {
			let height = this.height * value
			let y = this.height - height
			this.cropRect.y = y
			this.cropRect.height = height
			this.updateCrop()
		}
	}

	/**
	 * @param value number from 0 to 1 (it will be clamped anyway)
	 */
	public setProgress(value: number): void {
		value = Phaser.Math.Clamp(value, 0.001, 1)

		if (this.direction === ProgressBarDirection.HORIZONTAL) {
			let width: number = this.width * value
			this.tweenCropRect({ width })
		} else {
			let height = this.height * value
			let y = this.height - height
			this.tweenCropRect({ y, height })
		}
	}

	private tweenCropRect(properties: { width: number } | { height: number; y: number }): void {
		this.cropTween?.remove()
		this.cropTween = this.scene.tweens.add({
			targets: this.cropRect,
			duration: 200,
			ease: Phaser.Math.Easing.Linear,
			...properties,
			onUpdate: () => {
				this.updateCrop()
			},
		})
	}

	private updateCrop(): void {
		this.setCrop(this.cropRect)
	}

	public stopProgressTween(): void {
		this.cropTween?.remove()
	}

	public destroy(fromScene?: boolean): void {
		super.destroy(fromScene)
	}
}
