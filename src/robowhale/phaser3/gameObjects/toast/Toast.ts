import { Config } from '../../../../Config'
import { WebFonts } from '../../../../GameFonts'

export interface IToastOptions {
	message: string
	lifespan: number
}

export class Toast extends Phaser.GameObjects.Container {
	private readonly options: IToastOptions
	private back: Phaser.GameObjects.Graphics & { width?: number; height?: number }
	private text: Phaser.GameObjects.Text
	private dismissTimerEvent: Phaser.Time.TimerEvent

	constructor(scene: Phaser.Scene, options: IToastOptions) {
		super(scene)

		this.name = 'toast'
		this.options = options
		this.addBack()
		this.addText(options.message)

		this.setSize(this.back.width, this.back.height)
		this.setInteractive()
		this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.dismiss, this)
		this.input.cursor = 'pointer'
	}

	private addBack() {
		this.back = this.scene.add.graphics({
			fillStyle: {
				color: 0x000000,
				alpha: 0.8,
			},
			lineStyle: {
				width: 0,
				color: 0,
				alpha: 1,
			},
		})

		let width = Config.SOURCE_GAME_WIDTH * 0.7
		let height = 110
		this.back.fillRoundedRect(-width / 2, -height / 2, width, height, { tl: 20, bl: 0, br: 0, tr: 20 })
		this.back.stroke()
		this.back.width = width
		this.back.height = height
		this.add(this.back)
	}

	private addText(textContent: string) {
		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: WebFonts.DEFAULT_FAMILY,
			fontStyle: WebFonts.DEFAULT_WEIGHT,
			fontSize: '28px',
			color: '#ffffff',
			align: 'center',
			padding: { x: 0, y: 4 },
		}

		this.text = this.scene.add.text(0, 0, textContent, style)
		this.text.setOrigin(0.5, 0.5)
		this.text.setLineSpacing(0)
		this.text.setWordWrapWidth(this.back.width * 0.85, true)
		this.text.setShadow(0, 3, 'rgba(0,0,0,0.5)', 0)
		this.add(this.text)
		this.adjustTextSize()
	}

	private adjustTextSize() {
		let maxHeight: number = this.back.height * 0.8
		this.text.scale = Math.min(1, maxHeight / this.text.height)
	}

	public show(lifespan: number): void {
		let deltaY: number = 20
		this.alpha = 0
		this.y += deltaY

		this.scene.tweens.add({
			targets: this,
			duration: 150,
			ease: Phaser.Math.Easing.Cubic.Out,
			alpha: 1,
			y: this.y - deltaY,
			onComplete: this.onShowCompelete.bind(this, lifespan),
		})
	}

	private onShowCompelete(lifespan: number): void {
		this.dismissTimerEvent = this.scene.time.delayedCall(lifespan, () => {
			this.dismiss()
		})
	}

	public dismiss() {
		this.dismissTimerEvent?.remove()

		this.scene?.tweens.add({
			targets: this,
			duration: 150,
			ease: Phaser.Math.Easing.Linear,
			alpha: 0,
			y: '+=15',
			onComplete: () => this.destroy(false),
		})
	}

	protected preDestroy() {
		this.dismissTimerEvent?.remove()
		this.scene.tweens.killTweensOf(this)
	}
}
