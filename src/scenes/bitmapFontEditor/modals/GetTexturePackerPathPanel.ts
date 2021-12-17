import { ModalPanel } from "./ModalPanel"
import { InputBindingApi } from "@tweakpane/core"

export interface GetTexturePackerPathPanelConfig {
	path: string
}

export class GetTexturePackerPathPanel extends ModalPanel<GetTexturePackerPathPanelConfig> {
	
	private pathInput: InputBindingApi<unknown, GetTexturePackerPathPanelConfig["path"]>
	
	constructor(scene: Phaser.Scene, config: GetTexturePackerPathPanelConfig) {
		super(scene, "Path to TexturePacker executable")
		
		this.config = config
		
		this.pathInput = this.panel.addInput(this.config, "path")
		
		this.addOkButton()
	}
	
}
