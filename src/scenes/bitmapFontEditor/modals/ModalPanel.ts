import EventEmitter = Phaser.Events.EventEmitter
import { Pane } from "tweakpane"
import { cssAnimate } from "../../../robowhale/utils/css-animate"
import { ButtonApi } from "@tweakpane/core"

export enum ModalPanelEvent {
	CANCEL_CLICK = "__CANCEL_CLICK",
	OK_CLICK = "__OK_CLICK",
	HIDE = "__HIDE"
}

export class ModalPanel<T extends object> extends EventEmitter {
	
	public scene: Phaser.Scene
	private hideOnBgClick: boolean = true
	protected container: HTMLDivElement
	protected containerInner: HTMLDivElement
	protected panel: Pane
	public config: T
	
	constructor(scene: Phaser.Scene, title: string) {
		super()
		
		this.scene = scene
		this.addContainers()
		this.addPanel(title, this.containerInner)
		this.disableTitleButton()
	}
	
	private addContainers() {
		this.container = document.createElement("div")
		this.container.classList.add("editor-panels-modals")
		this.container.style.display = "none"
		this.container.style.visibility = "visible"
		this.container.addEventListener("pointerdown", this.onContainerPointerDown.bind(this), { capture: true })
		this.scene.game.canvas.parentNode.insertBefore(this.container, this.scene.game.canvas.nextSibling)
		
		this.containerInner = document.createElement("div")
		this.containerInner.classList.add("editor-panels-modals-inner")
		this.container.appendChild(this.containerInner)
	}
	
	private onContainerPointerDown(event: MouseEvent | TouchEvent): void {
		if (!this.hideOnBgClick) {
			return
		}
		
		if (event.target === this.container) {
			event.preventDefault()
			this.hide()
		}
	}
	
	private addPanel(title: string, container: HTMLElement) {
		this.panel = new Pane({ title, container })
	}
	
	private disableTitleButton() {
		let titleElement = this.panel.element.querySelector(".tp-rotv_b") as HTMLButtonElement
		titleElement.style.pointerEvents = "none"
		
		let collapseIcon = titleElement.querySelector(".tp-rotv_m") as HTMLDivElement
		collapseIcon.style.display = "none"
	}
	
	protected addCancelButton(): ButtonApi {
		return this.panel.addButton({ title: "Cancel" }).on("click", this.onCancelButtonClick.bind(this))
	}
	
	protected addOkButton(): ButtonApi {
		return this.panel.addButton({ title: "Ok" }).on("click", this.onOkButtonClick.bind(this))
	}
	
	private onCancelButtonClick(): void {
		this.hide()
	}
	
	private onOkButtonClick(): void {
		this.emit(ModalPanelEvent.OK_CLICK, this, this.config)
	}
	
	public refreshConfig(config: Partial<T>): void {
		Object.assign(this.config, config)
		this.panel.refresh()
	}
	
	public show(): void {
		this.container.style.display = "flex"
		cssAnimate(this.container, "animate__fadeIn", 100)
	}
	
	public hide() {
		this.container.style.display = "none"
		this.emit(ModalPanelEvent.HIDE, this)
	}
	
	public setZoom(zoom: number): void {
		this.container.style.zoom = zoom.toString()
	}
	
	public destroy(): void {
		this.container.remove()
		this.panel.dispose()
	}
}
