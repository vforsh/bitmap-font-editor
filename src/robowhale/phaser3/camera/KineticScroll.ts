export interface IKineticScrollSettings {
	camera: Phaser.Cameras.Scene2D.Camera
	kineticMovement: boolean
	timeConstantScroll: number
	horizontalScroll: boolean
	verticalScroll: boolean
	horizontalWheel: boolean
	verticalWheel: boolean
	wheelDeceleration: number
	wheelScrollAmount: number
	scrollMultiplier: number
	onUpdate: Function
}

export class KineticScroll {
	public settings: IKineticScrollSettings
	private pointerId
	private startX
	private startY

	private screenX
	private screenY

	private pressedDown
	private timestamp
	private beginTime
	private velocityY
	private velocityX
	private amplitudeY
	private amplitudeX

	// from move function
	private now
	public thresholdOfTapTime = 100
	public thresholdOfTapDistance = 10
	private tempCameraBounds: Phaser.Geom.Rectangle
	private moveTimestamp: number = 0

	// from end
	private autoScrollX
	public autoScrollY
	private velocityWheelXAbs
	private velocityWheelYAbs
	private targetX
	private targetY
	public velocityWheelX
	public velocityWheelY

	// from update
	private elapsed: number
	private scene: Phaser.Scene

	constructor(scene: Phaser.Scene, settings?: Partial<IKineticScrollSettings>) {
		this.scene = scene

		let defaultSettings = {
			camera: this.scene.cameras.main,
			kineticMovement: true,
			timeConstantScroll: 325,
			horizontalScroll: true,
			verticalScroll: true,
			horizontalWheel: false,
			verticalWheel: false,
			wheelScrollAmount: 100,
			wheelDeceleration: 0.95,
			onUpdate: null,
			scrollMultiplier: 1,
		} as IKineticScrollSettings

		this.settings = { ...defaultSettings, ...settings }
		this.tempCameraBounds = new Phaser.Geom.Rectangle()
	}

	addPointerListeners() {
		this.scene.input.on('pointerdown', this.onPointerDown, this)
		this.scene.input.on('pointerup', this.endMove, this)
		this.scene.input.on('pointermove', this.move, this)

		if (this.settings.verticalWheel || this.settings.horizontalWheel) {
			this.scene.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onPointerWheel, this)
		}
	}

	public onPointerDown(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[]): void {
		if (objects.length > 0) {
			return
		}

		this.beginMove(pointer)
	}

	private onPointerWheel(pointer, objects: Phaser.GameObjects.GameObject[], dx, dy: number): void {
		if (this.settings.verticalWheel) {
			this.velocityWheelY = -Phaser.Math.Sign(dy) * this.settings.wheelScrollAmount
		}
	}

	removePointerListeners(): void {
		this.scene.input.off('pointerdown', this.onPointerDown, this)
		this.scene.input.off('pointerup', this.endMove, this)
		this.scene.input.off('pointermove', this.move, this)

		this.scene.input.off(Phaser.Input.Events.POINTER_WHEEL, this.onPointerWheel, this)
	}

	beginMove(pointer) {
		this.pointerId = pointer.id
		this.startX = this.scene.input.x
		this.startY = this.scene.input.y

		this.screenX = pointer.screenX
		this.screenY = pointer.screenY

		this.pressedDown = true

		// the time of press down
		this.timestamp = this.getNow()
		this.beginTime = this.timestamp

		this.velocityY = this.amplitudeY = this.velocityX = this.amplitudeX = 0
	}

	canCameraMoveY() {
		let camera = this.settings.camera
		camera.getBounds(this.tempCameraBounds)

		return camera.scrollY > 0 && camera.scrollY + camera.height < this.tempCameraBounds.height
	}

	canCameraMoveX() {
		let camera = this.settings.camera
		camera.getBounds(this.tempCameraBounds)

		return camera.scrollX > 0 && camera.scrollX + camera.width < this.tempCameraBounds.right
	}

	move(pointer) {
		let x = pointer.x
		let y = pointer.y

		if (!this.pressedDown) {
			return
		}

		if (this.pointerId !== pointer.id) {
			return
		}

		this.now = this.getNow()
		let elapsed = this.now - this.timestamp
		this.timestamp = this.now

		let deltaX = 0
		let deltaY = 0

		if (this.isTap(pointer)) {
			return
		}

		let cam = this.settings.camera
		if (this.settings.horizontalScroll) {
			deltaX = x - this.startX
			this.startX = x
			this.velocityX = 0.8 * ((1000 * deltaX) / (1 + elapsed)) + 0.2 * this.velocityX
			cam.setScroll(cam.scrollX - deltaX, cam.scrollY)
		}

		if (this.settings.verticalScroll) {
			deltaY = (y - this.startY) * this.settings.scrollMultiplier
			this.startY = y
			this.velocityY = 0.8 * ((1000 * deltaY) / (1 + elapsed)) + 0.2 * this.velocityY
			cam.setScroll(cam.scrollX, cam.scrollY - deltaY)
		}

		this.callCustomUpdate(deltaX, deltaY)

		this.moveTimestamp = this.getNow()
	}

	private callCustomUpdate(deltaX: number, deltaY: number) {
		if (typeof this.settings.onUpdate !== 'function') {
			return
		}

		let updateX = this.canCameraMoveX() ? deltaX : 0
		let updateY = this.canCameraMoveY() ? deltaY : 0
		this.settings.onUpdate(updateX, updateY)
	}

	private isTap(pointer) {
		return (
			this.now - this.beginTime < this.thresholdOfTapTime &&
			Math.abs(pointer.screenY - this.screenY) < this.thresholdOfTapDistance &&
			Math.abs(pointer.screenX - this.screenX) < this.thresholdOfTapDistance
		)
	}

	endMove() {
		this.pointerId = null
		this.pressedDown = false
		this.autoScrollX = false
		this.autoScrollY = false

		if (!this.settings.kineticMovement) {
			return
		}

		this.now = this.getNow()

		let cam = this.settings.camera
		if (this.withinGame()) {
			if (this.velocityX > 10 || this.velocityX < -10) {
				this.amplitudeX = 0.8 * this.velocityX
				this.targetX = Math.round(cam.scrollX - this.amplitudeX)
				this.autoScrollX = true
			}

			if (this.velocityY > 10 || this.velocityY < -10) {
				this.amplitudeY = 0.8 * this.velocityY
				this.targetY = Math.round(cam.scrollY - this.amplitudeY)
				this.autoScrollY = true
			}
		}

		if (!this.withinGame()) {
			this.velocityWheelXAbs = Math.abs(this.velocityWheelX)
			this.velocityWheelYAbs = Math.abs(this.velocityWheelY)
			if (this.settings.horizontalScroll && (this.velocityWheelXAbs < 0.1 || !this.withinGame())) {
				this.autoScrollX = true
			}
			if (this.settings.verticalScroll && (this.velocityWheelYAbs < 0.1 || !this.withinGame())) {
				this.autoScrollY = true
			}
		}
	}

	update() {
		let timeSinceMove = this.getNow() - this.moveTimestamp
		if (timeSinceMove > 20) {
			this.velocityX = 0
			this.velocityY = 0
		}

		this.elapsed = this.getNow() - this.timestamp
		this.velocityWheelXAbs = Math.abs(this.velocityWheelX)
		this.velocityWheelYAbs = Math.abs(this.velocityWheelY)

		let delta = 0
		let cam = this.settings.camera
		if (this.autoScrollX && this.amplitudeX !== 0) {
			delta = -this.amplitudeX * Math.exp(-this.elapsed / this.settings.timeConstantScroll)
			if (this.canCameraMoveX() && (delta > 0.5 || delta < -0.5)) {
				cam.setScroll(this.targetX - delta, cam.scrollY)
			} else {
				this.autoScrollX = false
				cam.setScroll(this.targetX, cam.scrollY)
			}
		}

		if (this.autoScrollY && this.amplitudeY !== 0) {
			delta = -this.amplitudeY * Math.exp(-this.elapsed / this.settings.timeConstantScroll)
			if (this.canCameraMoveY() && (delta > 0.5 || delta < -0.5)) {
				cam.setScroll(cam.scrollX, this.targetY - delta)
			} else {
				this.autoScrollY = false
				cam.setScroll(cam.scrollX, this.targetY)
			}
		}

		if (this.settings.horizontalWheel && this.velocityWheelXAbs > 0.1) {
			this.amplitudeX = 0
			this.autoScrollX = false
			cam.setScroll(cam.scrollX - this.velocityWheelX, cam.scrollY)
			this.velocityWheelX *= this.settings.wheelDeceleration
		}

		if (this.settings.verticalWheel && this.velocityWheelYAbs > 0.1) {
			this.autoScrollY = false
			cam.setScroll(cam.scrollX, cam.scrollY - this.velocityWheelY)
			this.velocityWheelY *= this.settings.wheelDeceleration
		}
	}

	getNow(): number {
		if (performance && performance.now) {
			return performance.now()
		}

		return Date.now()
	}

	withinGame() {
		return true
	}

	public resetScroll() {
		this.autoScrollX = false
		this.autoScrollY = false

		this.velocityWheelX = 0
		this.velocityWheelY = 0
	}
}
