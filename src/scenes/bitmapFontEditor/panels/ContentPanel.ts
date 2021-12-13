import { EditorPanel } from "./EditorPanel"
import { InputBindingApi, TpChangeEvent } from "@tweakpane/core"
import { uniq, without } from "lodash-es"
import { BitmapFontProjectConfig } from "../BitmapFontEditor"

export enum ContentPanelEvent {
	CONTENT_CHANGE = "ContentPanel_CONTENT_CHANGE",
}

export type ContentPanelConfig = BitmapFontProjectConfig["content"]

export class ContentPanel extends EditorPanel {
	
	private config: ContentPanelConfig
	private contentInput: InputBindingApi<unknown, string>
	
	constructor(scene: Phaser.Scene, container: HTMLElement, config: ContentPanelConfig) {
		super(scene, container, "Content")
		
		this.config = config
		
		this.contentInput = this.panel.addInput(this.config, "content").on("change", this.onContentChange.bind(this))
		
		this.panel.addButton({ title: "Numbers" }).on("click", () => {
			let chars = "0987654321"
			
			if (this.isShiftDown) {
				this.removeChars(chars)
			} else {
				this.addChars(chars)
			}
			
			this.contentInput.refresh()
		})
		
		this.panel.addButton({ title: "Lowercase" }).on("click", () => {
			let chars = "abcdefghijklmnopqrstuvwxyz"
			
			if (this.isShiftDown) {
				this.removeChars(chars)
			} else {
				this.addChars(chars)
			}
			
			this.contentInput.refresh()
		})
		
		this.panel.addButton({ title: "Uppercase" }).on("click", () => {
			let chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
			
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
