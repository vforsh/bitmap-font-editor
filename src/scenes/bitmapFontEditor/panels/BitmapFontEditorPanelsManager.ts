import { BitmapFontEditor } from "../BitmapFontEditor"
import { ContentPanel } from "./ContentPanel"
import { StrokePanel } from "./StrokePanel"
import { ShadowPanel } from "./ShadowPanel"
import { LayoutPanel } from "./LayoutPanel"
import { FontPanel } from "./FontPanel"
import { ExportPanel } from "./ExportPanel"
import { PreviewPanel } from "./PreviewPanel"
import { ImportPanel } from "./ImportPanel"
import { GlowPanel } from "./GlowPanel"
import { GamePanel, GamePanelConfig } from "./GamePanel"

export class BitmapFontEditorPanelsManager extends Phaser.Events.EventEmitter {
	
	private readonly scene: BitmapFontEditor
	public leftPanels: HTMLElement
	public rightPanels: HTMLElement
	
	public contentPanel: ContentPanel
	public fontPanel: FontPanel
	public strokePanel: StrokePanel
	public shadowPanel: ShadowPanel
	public glowPanel: GlowPanel
	public layoutPanel: LayoutPanel
	
	public gamePanel: GamePanel
	public importPanel: ImportPanel
	public exportPanel: ExportPanel
	public previewPanel: PreviewPanel
	
	constructor(scene: BitmapFontEditor) {
		super()
		
		this.scene = scene
		
		this.addPanelContainers()
		
		let config = this.scene.config
		
		// left panel
		this.contentPanel = new ContentPanel(this.scene, this.leftPanels, config.content)
		this.fontPanel = new FontPanel(this.scene, this.leftPanels, config.font)
		this.strokePanel = new StrokePanel(this.scene, this.leftPanels, config.stroke)
		this.shadowPanel = new ShadowPanel(this.scene, this.leftPanels, config.shadow)
		this.glowPanel = new GlowPanel(this.scene, this.leftPanels, config.glow)
		this.layoutPanel = new LayoutPanel(this.scene, this.leftPanels, config.layout)
		
		// right panels
		let gameSettings = this.scene.gameSettings
		let gamePanelConfig: GamePanelConfig = {
			name: gameSettings?.name ?? "",
			fontsDirectory: this.scene.rootDir ?? "",
			fonts: gameSettings?.fonts.join("\n") ?? "",
		}
		
		this.gamePanel = new GamePanel(this.scene, this.rightPanels, gamePanelConfig)
		this.importPanel = new ImportPanel(this.scene, this.rightPanels, config.import)
		this.exportPanel = new ExportPanel(this.scene, this.rightPanels, config.export)
		this.previewPanel = new PreviewPanel(this.scene, this.rightPanels, config.preview)
	}
	
	private addPanelContainers() {
		let zoom = this.scene.game.store.getValue("editor_zoom")
		
		this.leftPanels = this.getPanelsContainer("editor-panels-left")
		this.leftPanels.style.visibility = "visible"
		this.leftPanels.style.zoom = zoom.toString()
		
		this.rightPanels = this.getPanelsContainer("editor-panels-right")
		this.rightPanels.style.visibility = "visible"
		this.rightPanels.style.zoom = zoom.toString()
	}
	
	private getPanelsContainer(elementId: string): HTMLDivElement {
		return document.getElementById(elementId) as HTMLDivElement ?? this.createPanelsContainer(elementId)
	}
	
	private createPanelsContainer(elementId: string): HTMLDivElement {
		let container = document.createElement("div")
		container.id = elementId
		container.classList.add("editor-panels")
		
		this.scene.game.canvas.parentNode.insertBefore(container, this.scene.game.canvas.nextSibling)
		
		return container
	}
	
	public enablePanels(): void {
		this.leftPanels.classList.remove("disable-panel-input")
		this.rightPanels.classList.remove("disable-panel-input")
	}
	
	public disablePanels(): void {
		this.leftPanels.classList.add("disable-panel-input")
		this.rightPanels.classList.add("disable-panel-input")
	}
	
	public changeZoom(sign: number = 1): void {
		let zoom = parseFloat(this.rightPanels.style.zoom) || 1
		let newZoom = zoom + Phaser.Math.Sign(sign) * 0.1
		newZoom = Math.max(0.2, newZoom)
		
		this.leftPanels.style.zoom = newZoom.toString()
		this.rightPanels.style.zoom = newZoom.toString()
		this.scene.game.store.saveValue("editor_zoom", newZoom)
	}
	
	public resetZoom(): void {
		let zoom: number = 1
		this.rightPanels.style.zoom = zoom.toString()
		this.scene.game.store.saveValue("editor_zoom", zoom)
	}
	
	public destroy(): void {
		super.destroy()
		
		this.leftPanels.style.visibility = "hidden"
		this.rightPanels.style.visibility = "hidden"
		
		this.contentPanel.destroy()
	}
}
