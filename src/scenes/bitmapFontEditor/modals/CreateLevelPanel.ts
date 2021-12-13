import { ModalPanel } from "./ModalPanel"
import { InputBindingApi } from "@tweakpane/core"

export interface NewLevelConfig {
	levelNumber: number
	episode: number
	hard: boolean
	bonus: boolean
}

export class CreateLevelPanel extends ModalPanel<NewLevelConfig> {
	
	private hardInput: InputBindingApi<any, NewLevelConfig["hard"]>
	
	constructor(scene: Phaser.Scene, title = "Create level") {
		super(scene, title)
	}
}
