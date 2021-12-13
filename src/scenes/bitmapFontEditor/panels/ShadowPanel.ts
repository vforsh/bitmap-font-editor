import { EditorPanel } from "./EditorPanel"
import { BitmapFontProjectConfig } from "../BitmapFontEditor"

export type ShadowPanelConfig = BitmapFontProjectConfig["shadow"]

export class ShadowPanel extends EditorPanel {
	
	public config: ShadowPanelConfig
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ShadowPanelConfig) {
		super(scene, container, "Shadow")
		
		this.config = config
		
		this.panel.addInput(this.config, "x", {
			step: 1,
			min: -20,
			max: 20,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "y", {
			step: 1,
			min: -20,
			max: 20,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "blur", {
			step: 1,
			min: 0,
			max: 20,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "color", {
			input: "color.rgba",
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "shadowStroke").on("change", (e) => this.emit("change", this.config, e.presetKey))
		this.panel.addInput(this.config, "shadowFill").on("change", (e) => this.emit("change", this.config, e.presetKey))
	}
}
