import { EditorPanel } from "./EditorPanel"
import { ButtonApi, ListParamsOptions } from "@tweakpane/core"
import { BitmapFontProjectConfig } from "../BitmapFontEditor"

export type ExportPanelConfig = BitmapFontProjectConfig["export"]

export class ExportPanel extends EditorPanel {
	
	public config: ExportPanelConfig
	public exportButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ExportPanelConfig) {
		super(scene, container, "Export")
		
		this.config = config
		
		this.panel.addInput(this.config, "name")
		this.panel.addInput(this.config, "type", { options: this.createExportTypeOptions() })
		this.panel.addSeparator()
		this.panel.addInput(this.config, "config")
		this.panel.addInput(this.config, "texture")
		
		this.exportButton = this.panel.addButton({ title: "Export" })
	}
	
	private createExportTypeOptions(): ListParamsOptions<string> {
		return [
			{ text: "json", value: "json" },
			{ text: "xml", value: "xml" },
		]
	}
	
}
