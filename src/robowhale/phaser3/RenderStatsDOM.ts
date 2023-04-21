import CanvasRenderer = Phaser.Renderer.Canvas.CanvasRenderer

type WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export class RenderStatsDOM {
	private scene: Phaser.Scene
	private span: HTMLSpanElement
	private gameLoop: Phaser.Core.TimeStep
	private renderer: WebGLRenderer | CanvasRenderer

	constructor(scene: Phaser.Scene) {
		this.scene = scene
		this.gameLoop = this.scene.game.loop
		this.renderer = this.scene.game.renderer

		this.span = document.createElement('span')
		this.span.id = 'stats'
		this.span.addEventListener('click', this.toggleVisibility.bind(this))
		document.body.appendChild(this.span)

		this.scene.scale.on(Phaser.Scale.Events.RESIZE, this.onResize, this)
		this.onResize()
	}

	private toggleVisibility(): void {
		if (this.span.style.opacity === '0') {
			this.span.style.opacity = '1'
		} else {
			this.span.style.opacity = '0'
		}
	}

	private onResize(): void {
		if (this.scene.scale.scaleMode === Phaser.Scale.FIT) {
			let canvasBounds: Phaser.Geom.Rectangle = this.scene.scale.canvasBounds
			this.span.style.left = canvasBounds.left + 'px'
			// this.span.style.bottom = (canvasBounds.top + canvasBounds.height) + "px"
		}
	}

	public update(delta: number): void {
		// this.timer += delta
		// if (this.timer >= this.updateInterval) {
		// 	this.timer -= this.updateInterval
		this.updateStats(delta)
		// }
	}

	private updateStats(delta: number): void {
		let fps: string = `FPS: ${Math.round(this.gameLoop.actualFps)}`
		let ms: string = `MS: ${this.gameLoop.delta.toFixed(1)}`
		let drawCalls: string = `DC: ${this.getDrawCallsNum()}`
		let result: string = `${fps} | ${ms} | ${drawCalls}`
		this.span.innerText = result
	}

	private getDrawCallsNum() {
		if (this.renderer instanceof CanvasRenderer) {
			return 0
		} else {
			return this.renderer.textureFlush
		}
	}
}
