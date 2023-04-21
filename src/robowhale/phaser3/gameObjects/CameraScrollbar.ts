import { Config } from '../../../Config'

export class CameraScrollbar extends Phaser.GameObjects.Image {
	public isDragged: boolean = false
	public scrollTop: number = 0
	public scrollBottom: number = 0
	public scrollHeight: number = 0
	public camera: Phaser.Cameras.Scene2D.Camera

	constructor(scene: Phaser.Scene, camera: Phaser.Cameras.Scene2D.Camera, texture: string, frame?: string) {
		super(scene, 0, 0, texture, frame)

		this.camera = camera

		this.setInteractive()
		this.scene.input.setDraggable(this)
		this.input.cursor = 'pointer'
		this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart, this)
		this.on(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd, this)
	}

	private onDragStart(): void {
		this.isDragged = true

		document.onpointermove = (event: MouseEvent) => {
			let gameY: number = this.scene.scale.transformY(event.pageY)
			this.y = Phaser.Math.Clamp(gameY, this.scrollTop, this.scrollBottom)
			this.updateCameraPosition()
		}
	}

	private updateCameraPosition(): void {
		let cameraBounds: Phaser.Geom.Rectangle = this.camera.getBounds()
		let cameraTop: number = cameraBounds.y
		let cameraBottom: number = cameraBounds.bottom - Config.GAME_HEIGHT / this.camera.zoom
		let scrollPercent: number = (this.y - this.scrollTop) / this.scrollHeight
		this.camera.scrollY = (cameraBottom - cameraTop) * scrollPercent
	}

	private onDragEnd(): void {
		this.isDragged = false

		document.onpointermove = null
	}

	public onResize() {
		let scrollOffset: number = this.displayHeight / 2 + 6 * this.scaleY
		this.scrollTop = scrollOffset
		this.scrollBottom = Config.GAME_HEIGHT - scrollOffset
		this.scrollHeight = this.scrollBottom - this.scrollTop
	}

	public preUpdate(time: number, delta: number): void {
		if (this.isDragged) {
			return
		}

		let cameraBounds: Phaser.Geom.Rectangle = this.camera.getBounds()
		let cameraTop: number = cameraBounds.y
		let cameraBottom: number = cameraBounds.bottom - Config.GAME_HEIGHT / this.camera.zoom
		let cameraY: number = Math.max(0, this.camera.scrollY)
		let percent: number = Phaser.Math.Clamp(cameraY / (cameraBottom - cameraTop), 0, 1)

		this.y = this.scrollTop + (this.scrollBottom - this.scrollTop) * percent
	}

	public destroy(): void {
		document.onpointermove = null

		this.off(Phaser.Input.Events.GAMEOBJECT_DRAG_START, this.onDragStart, this)
		this.off(Phaser.Input.Events.GAMEOBJECT_DRAG_END, this.onDragEnd, this)

		super.destroy()
	}
}
