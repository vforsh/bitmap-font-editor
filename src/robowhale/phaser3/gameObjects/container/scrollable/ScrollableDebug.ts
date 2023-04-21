import { Scrollable } from './Scrollable'

export class ScrollableDebug<T extends Phaser.GameObjects.GameObject> {
	private scene: Phaser.Scene
	private parent: Scrollable<T>
	private hitArea: Phaser.GameObjects.Image
	private scrollLimits: Phaser.GameObjects.Container
	private scrollLimitMinText: Phaser.GameObjects.Text
	private scrollLimitMin: Phaser.GameObjects.Image
	private scrollLimitMaxText: Phaser.GameObjects.Text
	private scrollLimitMax: Phaser.GameObjects.Image

	constructor(parent: Scrollable<T>) {
		this.parent = parent
		this.scene = this.parent.scene
	}

	public displayHitArea(options?: { color?: number; alpha?: number; index?: number }): Phaser.GameObjects.Image {
		let hitArea = this.parent.input.hitArea
		let hitAreaX = hitArea.x + hitArea.width / 2
		let hitAreaY = hitArea.y + hitArea.height / 2

		this.hitArea ??= this.addHitArea()
		this.hitArea.displayWidth = hitArea.width
		this.hitArea.displayHeight = hitArea.height
		this.hitArea.x = hitAreaX
		this.hitArea.y = hitAreaY
		this.hitArea.tint = options?.color ?? 0xffffff
		this.hitArea.alpha = options?.alpha ?? 0.5
		this.parent.moveTo(this.hitArea, options?.index)

		return this.hitArea
	}

	private addHitArea(): Phaser.GameObjects.Image {
		this.hitArea = this.scene.add.image(0, 0, '__WHITE')
		this.parent.add(this.hitArea)

		return this.hitArea
	}

	public displayScrollLimits(options?: { thickness?: number; color?: number; alpha?: number; index?: number }): Phaser.GameObjects.Container {
		let color = options?.color ?? 0xff0000
		let textColor = '#' + color.toString(16)
		let thickness = options?.thickness ?? 2

		this.scrollLimits ??= this.addScrollLimits()
		this.scrollLimits.alpha = options?.alpha ?? 1
		this.parent.moveTo(this.scrollLimits, options?.index)

		this.scrollLimitMin.setTintFill(color)
		this.scrollLimitMax.setTintFill(color)

		let { scrollDirection, scrollMin, scrollMax, hitArea } = this.parent.options
		if (scrollDirection === 'vertical') {
			this.scrollLimitMin.y = scrollMin
			this.scrollLimitMin.displayWidth = hitArea.width
			this.scrollLimitMin.displayHeight = thickness

			this.scrollLimitMinText.setOrigin(0, 1)
			this.scrollLimitMinText.setColor(textColor)
			this.scrollLimitMinText.setText(`min (${scrollMin})`)
			this.scrollLimitMinText.x = this.scrollLimitMin.x - this.scrollLimitMin.displayWidth / 2
			this.scrollLimitMinText.y = this.scrollLimitMin.y - 5

			this.scrollLimitMax.y = scrollMax
			this.scrollLimitMax.displayWidth = hitArea.width
			this.scrollLimitMax.displayHeight = thickness

			this.scrollLimitMaxText.setOrigin(1, 0)
			this.scrollLimitMaxText.setColor(textColor)
			this.scrollLimitMaxText.setText(`max (${scrollMax})`)
			this.scrollLimitMaxText.x = this.scrollLimitMax.x + this.scrollLimitMax.displayWidth / 2
			this.scrollLimitMaxText.y = this.scrollLimitMax.y + 5
		} else {
			this.scrollLimitMin.x = scrollMin
			this.scrollLimitMin.displayWidth = thickness
			this.scrollLimitMin.displayHeight = hitArea.height

			this.scrollLimitMax.x = scrollMax
			this.scrollLimitMax.displayWidth = thickness
			this.scrollLimitMax.displayHeight = hitArea.height
		}

		return this.scrollLimits
	}

	private addScrollLimits(): Phaser.GameObjects.Container {
		this.scrollLimitMin = this.scene.add.image(0, 0, '__WHITE')
		this.scrollLimitMinText = this.createScrollLimitText('min')

		this.scrollLimitMax = this.scene.add.image(0, 0, '__WHITE')
		this.scrollLimitMaxText = this.createScrollLimitText('max')

		let container = this.scene.add.container(0, 0, [this.scrollLimitMin, this.scrollLimitMax, this.scrollLimitMinText, this.scrollLimitMaxText])
		this.parent.add(container)

		return container
	}

	private createScrollLimitText(content: string): Phaser.GameObjects.Text {
		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: 'monospace',
			fontStyle: '400',
			fontSize: '20px',
			color: '#ffffff',
			align: 'center',
		}

		let text = this.scene.add.text(0, 0, content, style)

		return text
	}

	public kill(): void {
		this.hitArea?.kill()
		this.scrollLimits?.kill()
	}

	public revive(): void {
		this.hitArea?.revive()
		this.scrollLimits?.revive()
	}
}
