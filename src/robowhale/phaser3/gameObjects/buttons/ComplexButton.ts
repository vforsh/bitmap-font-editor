import { ButtonEvent } from "./ButtonEvent"

export class ComplexButton extends Phaser.GameObjects.Container {
	
	private currentPointer: Phaser.Input.Pointer
	public soundKey: string = "tap"
	public soundVolume: number = 1
	public areTweensEnabled: boolean = true
	public checkIfOver: boolean = true
	public originalScale: number = 1
	
	public back: Phaser.GameObjects.Image
	public icon: Phaser.GameObjects.Image
	public bitmapText: Phaser.GameObjects.BitmapText
	public text: Phaser.GameObjects.Text
	
	constructor(scene: Phaser.Scene, atlas: string, frame: string, parent?: Phaser.GameObjects.Container) {
		super(scene)
		
		if (parent) {
			parent.add(this)
		} else {
			this.scene.add.existing(this)
		}
		
		this.name = "button_" + frame
		this.addBack(atlas, frame)
		this.setSize(this.back.width, this.back.height)
		this.setInteractive()
		this.input.cursor = "pointer"
		this.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPointerDown, this)
		this.scene.input.on(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this)
	}
	
	public enableInput(): void {
		this.setInteractive()
	}
	
	public disableInput(): void {
		this.disableInteractive()
	}
	
	private addBack(atlas: string, frame: string) {
		this.back = this.scene.add.image(0, 0, atlas, frame)
		this.add(this.back)
	}
	
	private onPointerDown(pointer: Phaser.Input.Pointer): void {
		this.currentPointer = pointer
		this.playSound()
		this.playPressedTween()
		this.emit(ButtonEvent.PRESS, this, ...Array.from(arguments))
	}
	
	private playSound() {
		this.scene.audio.play(this.soundKey, { volume: this.soundVolume })
	}
	
	private playPressedTween() {
		if (!this.areTweensEnabled) {
			return
		}
		
		this.scene.tweens.add({
			targets: this,
			scale: this.originalScale * 0.9,
			ease: Phaser.Math.Easing.Cubic.Out,
			duration: 50,
		})
	}
	
	private onScenePointerUp(pointer: Phaser.Input.Pointer, objects: Phaser.GameObjects.GameObject[]): void {
		if (!this.currentPointer || this.currentPointer !== pointer) {
			return
		}
		
		this.currentPointer = null
		
		let isPointerOverButton: boolean = objects.includes(this)
		if (this.checkIfOver === false || isPointerOverButton) {
			this.onPointerUp()
			this.emit(ButtonEvent.RELEASE, this, ...Array.from(arguments))
		}
		
		this.playReleasedTween()
	}
	
	protected onPointerUp(): void {
	
	}
	
	private playReleasedTween() {
		if (this.areTweensEnabled) {
			this.scene?.tweens.add({
				targets: this,
				scale: this.originalScale,
				ease: Phaser.Math.Easing.Back.Out,
				duration: 300,
			})
		}
	}
	
	public addIcon(atlasKey: string, frame?: string, offsetX: number = 0, offsetY: number = 0): Phaser.GameObjects.Image {
		this.icon = this.scene.make.image({ key: atlasKey, frame }, false)
		this.icon.x = offsetX
		this.icon.y = offsetY
		this.add(this.icon)
		
		return this.icon
	}
	
	public addBitmapText(content: string, font: string, fontSize: number, offsetX: number = 0, offsetY: number = 0): Phaser.GameObjects.BitmapText {
		this.bitmapText = this.scene.make.bitmapText({
			font,
			size: fontSize,
			text: content,
			add: false,
		})
		
		this.bitmapText.align = Phaser.Display.Align.CENTER
		this.bitmapText.setOrigin(0.5, 0.5)
		this.bitmapText.x = this.back.x + offsetX
		this.bitmapText.y = this.back.y + offsetY
		
		this.add(this.bitmapText)
		
		return this.bitmapText
	}
	
	public addText(content: string, style: Phaser.Types.GameObjects.Text.TextStyle, offsetX: number = 0, offsetY: number = 0): Phaser.GameObjects.Text {
		this.text = this.scene.make.text({
			text: content,
			style,
		})
		
		this.text.setOrigin(0.5, 0.5)
		this.text.x = this.back.x + offsetX
		this.text.y = this.back.y + offsetY
		
		this.add(this.text)
		
		return this.text
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
	
	protected preDestroy() {
		this.scene?.input.off(Phaser.Input.Events.POINTER_UP, this.onScenePointerUp, this)
		
		super.preDestroy()
	}
}
