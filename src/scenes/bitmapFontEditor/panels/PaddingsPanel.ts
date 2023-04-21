import { EditorPanel } from './EditorPanel'
import { ButtonApi, FolderApi} from '@tweakpane/core'
import { BitmapFontProjectConfig } from '../BitmapFontProjectConfig'
import { getObjectKeys } from '../../../robowhale/utils/collection/get-object-keys'

export type PaddingsPanelConfig = BitmapFontProjectConfig['paddings']

export type PaddingsConfig = PaddingsPanelConfig[keyof PaddingsPanelConfig]

export class PaddingsPanel extends EditorPanel {
	
	public config: PaddingsPanelConfig
	private folders: Map<string, FolderApi>
	public addButton: ButtonApi
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: PaddingsPanelConfig) {
		super(scene, container, 'Paddings')
		
		this.config = config
		
		this.folders = new Map<string, FolderApi>()
		
		this.addButton = this.panel.addButton({ title: '+' })
		this.addButton.on('click', this.onAddButtonClick.bind(this))
	}
	
	private onAddButtonClick(): void {
		let char = prompt(`Enter char like 'a' or '1' to set paddings for`)
		if (!char) {
			return
		}
		
		if (char in this.config) {
			this.scene.game.notifications.warn(`Paddings for '${char}' already exist!`)
			return
		}
		
		this.config[char] = {
			top: 0,
			right: 0,
			bottom: 0,
			left: 0,
		}
		
		this.addFolder(char)
	}
	
	private addFolder(char: string): void {
		let folder = this.panel.addFolder({
			title: char,
			index: this.panel.children.length - 1,
		})
		
		getObjectKeys(this.config[char]).forEach((key) => {
			folder.addInput(this.config[char], key, {
				step: 1,
				min: 0,
				max: 15,
			}).on('change', () => this.emit('change', char, this.config[char]))
		})
		
		folder.addButton({ title: 'Remove' }).on('click', () => {
			delete this.config[char]
			this.folders.delete(char)
			this.panel.remove(folder)
			this.emit('change', char, this.config[char])
		})
		
		this.folders.set(char, folder)
	}
	
	public refresh() {
		super.refresh()
		
		this.folders.forEach(item => this.panel.remove(item))
		this.folders.clear()
		
		getObjectKeys(this.config).sort().forEach((char) => this.addFolder(char.toString()))
	}
}
