import { EditorPanel } from "./EditorPanel"
import { ButtonApi } from "@tweakpane/core"

export type GamePanelConfig = {
	name: string
	fontsDirectory: string
	fonts: string
}

export class GamePanel extends EditorPanel {
	
	public config: GamePanelConfig
	public loadButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: GamePanelConfig) {
		super(scene, container, "Game")
		
		this.config = config
		
		this.panel.addMonitor(this.config, "name")
		this.panel.addMonitor(this.config, "fonts", { multiline: true })
		this.panel.addSeparator()
		this.panel.addInput(this.config, "fontsDirectory")
		this.loadButton = this.panel.addButton({ title: "Load" })
	}
}
