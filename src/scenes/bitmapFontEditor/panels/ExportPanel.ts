import { EditorPanel } from "./EditorPanel"
import { ButtonApi, ListParamsOptions } from "@tweakpane/core"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"
import slash from "slash"

export type ExportPanelConfig = BitmapFontProjectConfig["export"]

export class ExportPanel extends EditorPanel {
	
	public config: ExportPanelConfig
	public locateTpProjectButton: ButtonApi
	public exportButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ExportPanelConfig) {
		super(scene, container, "Export")
		
		this.config = config
		
		this.panel.addInput(this.config, "name")
		this.panel.addInput(this.config, "type", { options: this.createExportTypeOptions() })
		this.panel.addSeparator()
		
		this.panel.addInput(this.config, "config").on("change", event => {
			this.config[event.presetKey] = slash(event.value)
			this.refresh()
		})
		
		this.panel.addInput(this.config, "texture").on("change", event => {
			this.config[event.presetKey] = slash(event.value)
			this.refresh()
		})
		
		this.panel.addInput(this.config, "texturePacker").on("change", event => {
			this.config[event.presetKey] = slash(event.value)
			this.refresh()
		})
		
		this.locateTpProjectButton = this.panel.addButton({ title: "Locate TP project" })
		
		this.panel.addSeparator()
		
		this.exportButton = this.panel.addButton({ title: "Export" })
	}
	
	private createExportTypeOptions(): ListParamsOptions<string> {
		return [
			{ text: "json", value: "json" },
			{ text: "xml", value: "xml" },
		]
	}
	
}
