export interface PopoverOptions {
	back: {
		key: string
		frame?: string
		x: number
		y: number
	}
	tip?: {
		key: string
		frame?: string
		angle?: number
	}
	text: {
		content: string
		style?: Phaser.Types.GameObjects.Text.TextStyle
		maxWidth?: number
		maxHeight?: number
		advancedWrap?: boolean
		offsetX?: number
		offsetY?: number
	}
	hideOnSceneClick?: boolean
	onShow?: (popover: Popover) => any
	onHide?: (popover: Popover) => any
}

export class Popover extends Phaser.GameObjects.Container {
	protected options: PopoverOptions
	protected hideTimerEvent: Phaser.Time.TimerEvent
	public back: Phaser.GameObjects.Image
	public tip: Phaser.GameObjects.Image
	public text: Phaser.GameObjects.Text

	constructor(scene: Phaser.Scene, options: PopoverOptions, parent?: Phaser.GameObjects.Container) {
		super(scene)

		this.options = options

		this.name = 'popover'

		if (parent) {
			parent.add(this)
		}

		this.addBack()
		this.addTip()
		this.addText()
		this.adjustTextSize()
	}

	private addBack() {
		let { key, frame, x, y } = this.options.back
		this.back = this.scene.add.image(x, y, key, frame)
		this.add(this.back)
	}

	private addTip() {
		if (!this.options.tip) {
			return
		}

		let { key, frame, angle = 0 } = this.options.tip
		this.tip = this.scene.add.image(0, 0, key, frame)
		this.tip.angle = angle
		this.add(this.tip)
	}

	private addText() {
		let options = this.options.text

		if (typeof options.maxWidth === 'undefined') {
			options.maxWidth = this.back.displayWidth * 0.85
		}

		if (typeof options.maxHeight === 'undefined') {
			options.maxHeight = this.back.displayHeight * 0.85
		}

		let { content, style, maxWidth, advancedWrap = false, offsetX = 0, offsetY = 0 } = options

		this.text = this.scene.add.text(0, 0, content, style)
		this.text.setOrigin(0.5, 0.5)
		this.text.setWordWrapWidth(maxWidth, advancedWrap)
		this.text.x = this.back.x + offsetX
		this.text.y = this.back.y + offsetY
		this.add(this.text)
	}

	public adjustTextSize(): void {
		this.text.scale = Math.min(1, this.options.text.maxHeight / this.text.height)
	}

	public updateTextContent(content: string): void {
		this.text.setText(content)
		this.adjustTextSize()
	}

	public show(options: { lifespan: number }): void {
		this.scene.tweens.killTweensOf(this)

		this.hideAfter(options.lifespan)

		if (this.options.hideOnSceneClick) {
			this.removeSceneInputListeners()
			this.scene.input.once(Phaser.Input.Events.POINTER_UP, this.addSceneClickListener, this)
		}

		if (this.options.onShow) {
			this.options.onShow(this)
			return
		}

		this.revive()

		this.alpha = 0
		this.scene.tweens.add({
			targets: this,
			duration: 150,
			ease: Phaser.Math.Easing.Cubic.Out,
			alpha: 1,
		})

		this.scale = 0.8
		this.scene.tweens.add({
			targets: this,
			duration: 400,
			ease: Phaser.Math.Easing.Back.Out,
			scale: 1,
		})
	}

	public hideAfter(delay: number): void {
		this.hideTimerEvent?.remove()
		this.hideTimerEvent = this.scene.time.delayedCall(delay, () => this.hide())
	}

	public hide(): void {
		this.removeSceneInputListeners()
		this.hideTimerEvent?.remove()
		this.scene.tweens.killTweensOf(this)

		if (this.options.onHide) {
			this.options.onHide(this)
			return
		}

		this.fadeOut()
	}

	private fadeOut(): void {
		this.scene.tweens.add({
			targets: this,
			duration: 100,
			ease: Phaser.Math.Easing.Cubic.Out,
			alpha: 0,
			onComplete: () => {
				this.kill()
			},
		})
	}

	public hideInstant(): void {
		this.removeSceneInputListeners()
		this.hideTimerEvent?.remove()
		this.scene.tweens.killTweensOf(this)
		this.kill()
	}

	private addSceneClickListener(): void {
		this.scene.input.on(Phaser.Input.Events.POINTER_DOWN, this.hide, this)
	}

	protected preDestroy() {
		super.preDestroy()

		this.removeSceneInputListeners()
	}

	private removeSceneInputListeners() {
		this.scene.input.off(Phaser.Input.Events.POINTER_UP, this.addSceneClickListener, this)
		this.scene.input.off(Phaser.Input.Events.POINTER_DOWN, this.hide, this)
	}
}
