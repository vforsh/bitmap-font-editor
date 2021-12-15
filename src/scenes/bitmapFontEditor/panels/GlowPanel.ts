import { EditorPanel } from "./EditorPanel"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"

export type GlowPanelConfig = BitmapFontProjectConfig["glow"]

export class GlowPanel extends EditorPanel {
	
	public config: GlowPanelConfig
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: GlowPanelConfig) {
		super(scene, container, "Glow")
		
		this.config = config
		
		this.panel.addInput(this.config, "enabled")
			.on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "distance", {
			step: 1,
			min: 1,
			max: 20,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "quality", {
			step: 0.05,
			min: 0.05,
			max: 1,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "innerStrength", {
			step: 0.5,
			min: 0,
			max: 30,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "outerStrength", {
			step: 0.5,
			min: 0,
			max: 30,
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
		
		this.panel.addInput(this.config, "color", {
			input: "color.rgb",
		}).on("change", (e) => this.emit("change", this.config, e.presetKey))
	}
}
