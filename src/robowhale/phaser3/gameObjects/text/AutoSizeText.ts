import { fitText } from "./fit-text"

export interface AutoSizeTextOptions {
	maxWidth: number
	maxHeight: number
	iterations?: number
	useAdvancedWrap?: boolean
	applyOnTextUpdate?: boolean
}

export class AutoSizeText extends Phaser.GameObjects.Text {
	
	private options: AutoSizeTextOptions
	private ignoreTextUpdates: boolean = false
	
	constructor(scene: Phaser.Scene, x: number, y: number, text: string | string[], style: Phaser.Types.GameObjects.Text.TextStyle, options?: AutoSizeTextOptions) {
		super(scene, x, y, text, style)
		
		this.setAutoSize(options)
	}
	
	public setAutoSize(options: AutoSizeTextOptions): this {
		this.options = options
		
		return this.applyAutoSize()
	}
	
	public applyAutoSize(): this {
		this.ignoreTextUpdates = true
		
		fitText(this, this.options)
		
		this.ignoreTextUpdates = false
		
		return this
	}
	
	public updateText(): this {
		super.updateText()
		
		if (this.options && this.options.applyOnTextUpdate && this.ignoreTextUpdates === false) {
			this.applyAutoSize()
		}
		
		return this
	}
	
}
