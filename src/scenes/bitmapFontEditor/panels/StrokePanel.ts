import { EditorPanel } from "./EditorPanel"
import { TpChangeEvent } from "@tweakpane/core"
import { BitmapFontProjectConfig, RGBA } from "../BitmapFontProjectConfig"

export type StrokePanelConfig = BitmapFontProjectConfig["stroke"]

export class StrokePanel extends EditorPanel {
	
	public config: StrokePanelConfig
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: StrokePanelConfig) {
		super(scene, container, "Stroke")
		
		this.config = config
		
		this.panel.addInput(this.config, "color", {
			input: "color.rgba",
		}).on("change", this.onColorChange.bind(this))
		
		this.panel.addInput(this.config, "thickness", {
			step: 1,
			min: 0,
			max: 30,
		}).on("change", this.onThicknessChange.bind(this))
	}
	
	private onColorChange(event: TpChangeEvent<RGBA>): void {
		this.emit("change", this.config)
	}
	
	private onThicknessChange(event: TpChangeEvent<number>): void {
		this.emit("change", this.config)
	}
}
