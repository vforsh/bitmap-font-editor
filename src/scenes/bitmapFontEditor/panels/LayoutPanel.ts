import { EditorPanel } from "./EditorPanel"
import { ListParamsOptions } from "@tweakpane/core"
import { getObjectKeys } from "../../../robowhale/utils/collection/get-object-keys"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"

export enum PackingMethod {
	ROW = "row",
	COLUMN = "column",
	SQUARE = "square",
}

export type LayoutPanelConfig = BitmapFontProjectConfig["layout"]

export class LayoutPanel extends EditorPanel {
	
	private config: LayoutPanelConfig
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: LayoutPanelConfig) {
		super(scene, container, "Layout")
		
		this.config = config
		
		this.panel.addInput(this.config, "bgColor", { input: "color.rgb" })
			.on("change", event => this.emit("change", this.config, event.presetKey))
		
		this.panel.addInput(this.config, "padding", {
			step: 1,
			min: 0,
			max: 20,
		}).on("change", () => this.emit("change", this.config))
		
		this.panel.addInput(this.config, "method", {
			options: this.createOptions(),
			label: "packing method",
		}).on("change", event => this.emit("change", this.config, event.presetKey))
	}
	
	private createOptions(): ListParamsOptions<PackingMethod> {
		return getObjectKeys(PackingMethod).map((key) => ({ text: key, value: PackingMethod[key] }))
	}
	
	public getPackingMethod(): PackingMethod {
		return this.config.method
	}
}
