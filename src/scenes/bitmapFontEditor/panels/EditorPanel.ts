import EventEmitter = Phaser.Events.EventEmitter
import { Pane } from "tweakpane"
import * as EssentialsPlugin from "@tweakpane/plugin-essentials"

export class EditorPanel extends EventEmitter {
	
	protected scene: Phaser.Scene
	protected panel: Pane
	protected isShiftDown = false
	
	constructor(scene: Phaser.Scene, container: HTMLElement, title: string) {
		super()
		
		this.scene = scene
		this.scene.input.keyboard.on("keydown-SHIFT", this.onShiftDown, this)
		this.scene.input.keyboard.on("keyup-SHIFT", this.onShiftUp, this)
		
		this.panel = new Pane({ title, container })
		this.panel.registerPlugin(EssentialsPlugin)
	}
	
	private onShiftDown(): void {
		this.isShiftDown = true
	}
	
	private onShiftUp(): void {
		this.isShiftDown = false
	}
	
	public disableInput(): void {
		this.panel.element.classList.add("disable-panel-input")
	}
	
	public enableInput(): void {
		this.panel.element.classList.remove("disable-panel-input")
	}
	
	public refresh(): void {
		this.panel.refresh()
	}
	
	public collapse(): void {
		this.panel.expanded = false
	}
	
	public expand(): void {
		this.panel.expanded = true
	}
	
	public show(): void {
		this.panel.element.style.display = "block"
	}
	
	public hide(): void {
		this.panel.element.style.display = "none"
	}
	
	public destroy(): void {
		this.panel.dispose()
		
		this.scene.input.keyboard.off("keydown-SHIFT", this.onShiftDown, this)
		this.scene.input.keyboard.off("keyup-SHIFT", this.onShiftUp, this)
	}
	
}
