import { EditorPanel } from "./EditorPanel"
import { ButtonApi, ListParamsOptions } from "@tweakpane/core"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"

export enum BitmapTextAlign {
	LEFT = 0,
	CENTER = 1,
	RIGHT = 2,
}

export type PreviewPanelConfig = BitmapFontProjectConfig["preview"]

export class PreviewPanel extends EditorPanel {
	
	public config: PreviewPanelConfig
	public previewButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: PreviewPanelConfig) {
		super(scene, container, "Preview")
		
		this.config = config
		
		this.panel.addInput(this.config, "debug")
			.on("change", e => this.emit("debug-change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "debugColor")
			.on("change", e => this.emit("debug-change", this.config, e.presetKey))
		
		this.panel.addSeparator()
		
		this.panel.addInput(this.config, "align", {
			options: this.getAlignOptions(),
		}).on("change", e => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "maxWidth", {
			step: 10,
			min: 0,
			max: 1000,
		}).on("change", e => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "letterSpacing", {
			step: 1,
			min: -20,
			max: 20,
		}).on("change", e => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "fontSize", {
			step: 1,
			min: 1,
			max: 150,
		}).on("change", e => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "content")
			.on("change", e => this.emit("change", this.config, e.presetKey))
		
		this.previewButton = this.panel.addButton({ title: "Preview" })
	}
	
	private getAlignOptions(): ListParamsOptions<number> {
		return {
			"left": Phaser.GameObjects.BitmapText.ALIGN_LEFT,
			"center": Phaser.GameObjects.BitmapText.ALIGN_CENTER,
			"right": Phaser.GameObjects.BitmapText.ALIGN_RIGHT,
		}
	}
}
