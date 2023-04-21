import { ButtonEvent } from '../buttons/ButtonEvent'
import { SimpleButton } from '../buttons/SimpleButton'

export enum SwitchButtonEvent {
	ARROW_PRESS = '__ARROW_PRESS',
}

export interface SwitchButtonBackOptions {
	key: string
	frame?: string
	interactive?: boolean
}

export interface SwitchButtonArrowsOptions {
	leftArrow: { key: string; frame?: string }
	rightArrow: { key: string; frame?: string }
	dx: number
	dy?: number
	timeoutMs?: number
}

export interface SwitchButtonTextOptions {
	content: string
	style?: Phaser.Types.GameObjects.Text.TextStyle
	dx?: number
	dy?: number
}

export class SwitchButton extends Phaser.GameObjects.Container {
	public back: Phaser.GameObjects.Image
	public title: Phaser.GameObjects.Text
	public leftArrow: SimpleButton
	public rightArrow: SimpleButton
	public disableArrows: boolean = false
	public disableArrowsDuration: number = 0
	public text: Phaser.GameObjects.Text

	constructor(scene: Phaser.Scene, parent?: Phaser.GameObjects.Container) {
		super(scene)

		if (parent) {
			parent.add(this)
		} else {
			this.scene.add.existing(this as Phaser.GameObjects.Container)
		}
	}

	protected addBack(options: SwitchButtonBackOptions): void {
		this.back = this.scene.add.image(0, 0, options.key, options.frame)
		this.add(this.back)

		if (options.interactive) {
			this.back.setInteractive()
		}
	}

	protected addArrows(options: SwitchButtonArrowsOptions): void {
		if (typeof options.timeoutMs === 'number') {
			this.disableArrows = true
			this.disableArrowsDuration = options.timeoutMs
		}

		this.leftArrow = this.scene.add.button(options.leftArrow.key, options.leftArrow.frame, this)
		this.leftArrow.x = -options.dx
		this.leftArrow.y = options.dy ?? 0
		this.leftArrow.on(ButtonEvent.PRESS, this.onArrowClick, this)

		this.rightArrow = this.scene.add.button(options.rightArrow.key, options.rightArrow.frame, this)
		this.rightArrow.x = options.dx
		this.rightArrow.y = options.dy ?? 0
		this.rightArrow.on(ButtonEvent.PRESS, this.onArrowClick, this)
	}

	private onArrowClick(button: SimpleButton): void {
		let direction = button === this.leftArrow ? -1 : 1
		this.emit(SwitchButtonEvent.ARROW_PRESS, this, direction)

		if (this.disableArrows) {
			this.disableArrowButtons()

			this.scene.time.delayedCall(this.disableArrowsDuration, () => {
				this.enableArrowButtons()
			})
		}
	}

	protected addTitle(options: SwitchButtonTextOptions): void {
		this.title = this.scene.add.text(0, 0, options.content, options.style)
		this.title.setOrigin(0.5, 0.5)
		this.title.x = options.dx ?? 0
		this.title.y = this.back.top + (options.dy ?? 0)
		this.add(this.title)
	}

	protected addText(options: SwitchButtonTextOptions): void {
		this.text = this.scene.add.text(0, 0, options.content, options.style)
		this.text.setOrigin(0.5, 0.5)
		this.text.x = options.dx ?? 0
		this.text.y = options.dy ?? 0
		this.add(this.text)
	}

	public updateText(content: string): void {
		this.scene.tweens.killTweensOf(this.text)
		this.scene.tweens.add({
			targets: this.text,
			duration: 66,
			ease: Phaser.Math.Easing.Linear,
			alpha: 0,
			onComplete: () => {
				this.text.setText(content)
				this.adjustTextSize()
				this.scene.tweens.add({
					targets: this.text,
					duration: 150,
					ease: Phaser.Math.Easing.Cubic.Out,
					alpha: 1,
				})
			},
		})
	}

	protected adjustTextSize() {
		let left = this.leftArrow.right
		let right = this.rightArrow.left
		let width = right - left
		let maxWidth = width * 0.9
		this.text.scale = Math.min(1, maxWidth / this.text.width)
	}

	public autoSetSize(): void {
		this.setSize(this.back.displayWidth, this.back.displayHeight)
	}

	public disableArrowButtons(): void {
		this.leftArrow?.disableInput()
		this.rightArrow?.disableInput()
	}

	public enableArrowButtons(): void {
		this.leftArrow?.enableInput()
		this.rightArrow?.enableInput()
	}
}
