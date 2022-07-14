import { EditorPanel } from "./EditorPanel"
import { ButtonApi, InputBindingApi, ListParamsOptions } from "@tweakpane/core"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"
import { getBmfontProjectName } from "../../../utils/get-bmfont-project-name"

export type ImportPanelConfig = BitmapFontProjectConfig["import"]

export class ImportPanel extends EditorPanel {
	
	public config: ImportPanelConfig
	public projectInput: InputBindingApi<unknown, string>
	public reloadProjectsButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ImportPanelConfig) {
		super(scene, container, "Import")
		
		this.config = config
		
		let projects = this.config.project ? [this.config.project] : []
		this.projectInput = this.createProjectInput(projects)
		this.reloadProjectsButton = this.panel.addButton({ title: "Reload Projects" })
	}
	
	private createProjectInput(projects: string[]): InputBindingApi<unknown, string> {
		return this.panel.addInput(this.config, "project", {
			index: 0,
			options: this.createProjectsListOptions(projects),
		}).on("change", (e) => this.emit("project-change", this.config, e))
	}
	
	private createProjectsListOptions(projects: string[]): ListParamsOptions<string> {
		let options = projects.map((font) => ({
			text: getBmfontProjectName(font),
			value: font,
		}))
		
		options.unshift({
			text: "-",
			value: "",
		})
		
		return options
	}
	
	public updateProjectsList(projects: string[]): void {
		this.projectInput.dispose()
		this.projectInput = this.createProjectInput(projects)
	}
}
