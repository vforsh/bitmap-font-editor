import { EditorPanel } from "./EditorPanel"
import { ButtonApi, InputBindingApi, ListParamsOptions } from "@tweakpane/core"
import { BitmapFontProjectConfig, RGBA } from "../BitmapFontProjectConfig"
import Vector2Like = Phaser.Types.Math.Vector2Like

export type TextFontConfig = {
	family: string,
	weight: number
	size: number
	lineHeight: number
	resolution: number
	color: RGBA
	padding: Vector2Like
}

export type FontPanelConfig = BitmapFontProjectConfig["font"]

export class FontPanel extends EditorPanel {
	
	public config: FontPanelConfig
	public familyInput: InputBindingApi<unknown, string>
	public reloadButton: ButtonApi
	public copyTextStyleButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: FontPanelConfig) {
		super(scene, container, "Font")
		
		this.config = config
		
		this.familyInput = this.createFamilyInput([this.config.family])
		
		this.panel.addInput(this.config, "size", {
			step: 1,
			min: 1,
			max: 150,
		}).on("change", () => this.emit("change", this.config))
		
		/*this.panel.addInput(this.config, "lineHeight", {
			step: 0.05,
			min: 0,
			max: 2,
			format: (num) => Math.round(num * 100) + "%",
		})*/
		
		this.panel.addInput(this.config, "weight", {
			step: 100,
			min: 100,
			max: 900,
		}).on("change", () => this.emit("change", this.config))
		
		this.panel.addInput(this.config, "resolution", {
			step: 0.5,
			min: 1,
			max: 3,
		}).on("change", () => this.emit("change", this.config))
		
		this.panel.addInput(this.config, "color", {
			input: "color.rgb",
		}).on("change", () => this.emit("change", this.config))
		
		this.panel.addInput(this.config, "padding", {
			x: { step: 1, min: 0, max: 25 },
			y: { step: 1, min: 0, max: 25 },
		}).on("change", () => this.emit("change", this.config))
		
		this.panel.addInput(this.config, "spacing", {
			x: { step: 1, min: -25, max: 25 },
			y: { step: 1, min: -25, max: 25 },
		})
		
		this.reloadButton = this.panel.addButton({ title: "Reload fonts" })
		
		this.copyTextStyleButton = this.panel.addButton({ title: "Copy text style" })
	}
	
	private createFamilyInput(fonts: string[]): InputBindingApi<unknown, string> {
		return this.panel.addInput(this.config, "family", {
			index: 0,
			options: this.createFontsOptions(fonts),
		}).on("change", () => this.emit("change", this.config))
	}
	
	private createFontsOptions(fonts: string[]): ListParamsOptions<string> {
		return fonts.map((font) => ({ text: font, value: font }))
	}
	
	public updateFontsList(fonts: string[]): void {
		this.familyInput.dispose()
		this.familyInput = this.createFamilyInput(fonts)
	}
	
}
