import DegToRad = Phaser.Math.DegToRad

export enum CircularProgressBarDirection {
	CLOCKWISE = 'CLOCKWISE',
	ANTI_CLOCKWISE = 'ANTI_CLOCKWISE',
}

export interface CircularProgressBarOptions {
	atlas: string
	frame?: string
	direction?: CircularProgressBarDirection
	startAngle?: number
	endAngle?: number
}

export class CircularProgressBar extends Phaser.GameObjects.RenderTexture {
	private readonly options: CircularProgressBarOptions
	private readonly totalRange: number
	private readonly radius: number
	private currentProgress: number = 1
	private slice: Phaser.GameObjects.Graphics
	private tween: Phaser.Tweens.Tween

	constructor(scene: Phaser.Scene, options: CircularProgressBarOptions) {
		super(scene, 0, 0)

		let frame = this.scene.textures.getFrame(options.atlas, options.frame)
		this.setSize(frame.width, frame.height)

		this.options = { startAngle: 0, endAngle: 360, direction: CircularProgressBarDirection.CLOCKWISE, ...options }
		this.options.startAngle = Phaser.Math.Angle.Normalize(DegToRad(this.options.startAngle))
		this.options.endAngle = Phaser.Math.Angle.Normalize(DegToRad(this.options.endAngle))
		this.totalRange = Math.PI * 2 - Math.abs(Phaser.Math.Angle.ShortestBetween(this.options.startAngle, this.options.endAngle))
		this.radius = Math.max(this.width, this.height)

		this.slice = this.scene.make.graphics()
		this.slice.setDefaultStyles({ fillStyle: { color: 0xff0000 } })
	}

	/**
	 *
	 * @param {number} value from 0 to 1
	 */
	public setProgressInstant(value: number): void {
		this.currentProgress = Phaser.Math.Clamp(value, 0, 1)

		if (this.currentProgress === 0) {
			this.clear()
			return
		}

		this.slice.clear()
		this.slice.beginPath()
		this.slice.moveTo(0, 0)
		this.slice.arc(0, 0, this.radius, this.options.endAngle, this.options.startAngle)

		if (this.currentProgress < 1) {
			let sliceStart
			let sliceEnd

			if (this.options.direction === CircularProgressBarDirection.CLOCKWISE) {
				sliceStart = Phaser.Math.Angle.Normalize(this.options.startAngle + this.totalRange * value)
				sliceEnd = this.options.endAngle
			} else {
				sliceStart = this.options.startAngle
				sliceEnd = Phaser.Math.Angle.Normalize(this.options.endAngle - this.totalRange * value)
			}

			this.slice.moveTo(0, 0)
			this.slice.arc(0, 0, this.radius, sliceStart, sliceEnd)
		}

		this.slice.closePath()
		this.slice.fillPath()

		this.clear()
		this.drawFrame(this.options.atlas, this.options.frame)
		this.erase(this.slice, this.width / 2, this.height / 2)
	}

	public setProgress(value: number): void {
		this.tween?.remove()
		this.tween = this.scene.tweens.add({
			targets: this,
			duration: 200,
			ease: Phaser.Math.Easing.Linear,
			currentProgress: Phaser.Math.Clamp(value, 0, 1),
			onUpdate: () => {
				this.setProgressInstant(this.currentProgress)
			},
		})
	}

	public destroy(fromScene?: boolean): void {
		super.destroy(fromScene)
	}
}
