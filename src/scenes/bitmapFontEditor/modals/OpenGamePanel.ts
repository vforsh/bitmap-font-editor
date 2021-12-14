import { ModalPanel } from "./ModalPanel"
import { InputBindingApi, ListParamsOptions } from "@tweakpane/core"

export enum OpenGamePanelEvent {
	PROJECT_SELECT = "OpenGamePanel_PROJECT_SELECT",
}

export interface RecentProjectsConfig {
	[k: string]: { name: string, path: string, openedAt: number }
}

export interface OpenGamePanelConfig {
	recent: string
	path: string
}

export class OpenGamePanel extends ModalPanel<OpenGamePanelConfig> {
	
	private recentProjectsInput: InputBindingApi<unknown, string>
	private pathInput: InputBindingApi<unknown, OpenGamePanelConfig["path"]>
	
	constructor(scene: Phaser.Scene, config: OpenGamePanelConfig, recentProjects: RecentProjectsConfig) {
		super(scene, "Open Game")
		
		this.config = config
		
		this.recentProjectsInput = this.createRecentProjectsInput(recentProjects)
		this.recentProjectsInput.on("change", (event) => {
			if (this.config.recent === "") {
				return
			}
			
			this.emit(OpenGamePanelEvent.PROJECT_SELECT, event.value)
		})
		
		this.pathInput = this.panel.addInput(this.config, "path")
		
		this.addOkButton().on("click", () => {
			if (!this.config.path) {
				return
			}
			
			this.emit(OpenGamePanelEvent.PROJECT_SELECT, this.config.path)
		})
		
		this.addCancelButton()
	}
	
	private createRecentProjectsInput(projects: RecentProjectsConfig): InputBindingApi<unknown, string> {
		return this.panel.addInput(this.config, "recent", {
			index: 0,
			options: this.createRecentProjectsListOptions(projects),
			label: "recent",
		})
	}
	
	private createRecentProjectsListOptions(projects: RecentProjectsConfig): ListParamsOptions<string> {
		let options = Object.values(projects)
			.sort((p1, p2) => p1.openedAt - p2.openedAt)
			.map((project) => ({
				text: project.name,
				value: project.path,
			}))
		
		options.unshift({
			text: "-",
			value: "",
		})
		
		return options
	}
	
	public updateRecentProjectsList(projects: RecentProjectsConfig): void {
		this.recentProjectsInput.dispose()
		this.recentProjectsInput = this.createRecentProjectsInput(projects)
	}
	
}
