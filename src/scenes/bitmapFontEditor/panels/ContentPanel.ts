import { EditorPanel } from "./EditorPanel"
import { InputBindingApi, TpChangeEvent } from "@tweakpane/core"
import { uniq, without } from "lodash-es"
import { BitmapFontProjectConfig } from "../BitmapFontProjectConfig"
import { getObjectKeys } from "../../../robowhale/utils/collection/get-object-keys"

export enum ContentPanelEvent {
	CONTENT_CHANGE = "ContentPanel_CONTENT_CHANGE",
}

export type ContentPanelConfig = BitmapFontProjectConfig["content"]

export class ContentPanel extends EditorPanel {
	
	private config: ContentPanelConfig
	private contentInput: InputBindingApi<unknown, string>
	private contentPresets = {
		"a-z": "abcdefghijklmnopqrstuvwxyz",
		"A-Z": "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
		"0-9": "0123456789",
		"?!.,": "?!.,-:()",
	} as const
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ContentPanelConfig) {
		super(scene, container, "Content")
		
		this.config = config
		
		this.contentInput = this.panel.addInput(this.config, "content").on("change", this.onContentChange.bind(this))
		
		let buttonTitles = getObjectKeys(this.contentPresets)
		let gridSize = { width: 2, height: 2 }
		let grid = this.panel.addBlade({
			view: "buttongrid",
			label: "presets",
			size: [gridSize.width, gridSize.height],
			cells: (x, y) => ({
				title: buttonTitles[y * gridSize.width + x],
			}),
		})
		
		// @ts-ignore
		grid.on("click", (event: TpButtonGridEvent) => {
			let cell = event.cell
			let title = cell.title
			let chars = this.contentPresets[title]
			if (!chars) {
				return
			}
			
			if (this.isShiftDown) {
				this.removeChars(chars)
			} else {
				this.addChars(chars)
			}
			
			this.contentInput.refresh()
		})
		
		this.panel.addSeparator()
		
		this.panel.addButton({ title: "Clear" }).on("click", () => {
			this.config.content = ""
			this.refresh()
		})
	}
	
	private addChars(chars: string): void {
		this.config.content = this.removeNonUniqChars(this.config.content + chars)
	}
	
	private removeChars(chars: string): void {
		let newContent = without(this.config.content.split(""), ...chars.split("")).join("")
		this.config.content = this.removeNonUniqChars(newContent)
	}
	
	private removeNonUniqChars(content: string): string {
		return uniq(content.split("")).join("")
	}
	
	private onContentChange(event: TpChangeEvent<string>): void {
		this.config.content = this.removeNonUniqChars(this.config.content)
		this.contentInput.refresh()
		this.emit(ContentPanelEvent.CONTENT_CHANGE, this.config.content)
	}
	
	public setContent(content: string): void {
		this.config.content = this.removeNonUniqChars(content)
		this.contentInput.refresh()
		this.emit(ContentPanelEvent.CONTENT_CHANGE, this.config.content)
	}
}
