import { EditorPanel, EditorPanelEvent } from "./EditorPanel"
import { ButtonApi } from "@tweakpane/core"

export type GamePanelConfig = {
	name: string
	gameDirectory: string
	fontsDirectory: string
	fonts: string
}

export class GamePanel extends EditorPanel {
	
	public config: GamePanelConfig
	public openGameButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: GamePanelConfig) {
		super(scene, container, "Game")
		
		this.config = config
		
		this.panel.addMonitor(this.config, "name")
		this.panel.addMonitor(this.config, "fonts", { multiline: true })
		
		this.panel.addMonitor(this.config, "gameDirectory")
			.controller_.view.element.addEventListener('dblclick', () => {
				this.emit(EditorPanelEvent.OPEN_DIRECTORY, this.config.gameDirectory)
			})
		
		this.panel.addMonitor(this.config, "fontsDirectory")
			.controller_.view.element.addEventListener('dblclick', () => {
				this.emit(EditorPanelEvent.OPEN_DIRECTORY, this.config.fontsDirectory)
			})
		
		this.panel.addSeparator()
		this.openGameButton = this.panel.addButton({ title: "Open Game" })
	}
}
