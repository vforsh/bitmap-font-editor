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
import { BrowserSyncService } from "../../../BrowserSyncService"
import path from "path-browserify"
import { EditorPanelEvent } from "./EditorPanel"

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
		let gamePanelConfig = this.createGamePanelConfig()
		this.gamePanel = new GamePanel(this.scene, this.rightPanels, gamePanelConfig)
		this.importPanel = new ImportPanel(this.scene, this.rightPanels, config.import)
		this.exportPanel = new ExportPanel(this.scene, this.rightPanels, config.export)
		this.previewPanel = new PreviewPanel(this.scene, this.rightPanels, config.preview)
		
		this.addOpenDirectoryCallbacks()
		
		this.addKeyboardCallbacks()
	}
	
	private createGamePanelConfig(): GamePanelConfig {
		let fontsSettings = this.scene.fontsSettings
		if (!fontsSettings) {
			return {
				name: "",
				gameDirectory: "",
				fontsDirectory: "",
				fonts: "",
			}
		}
		
		return {
			name: fontsSettings.name ?? "",
			gameDirectory: this.scene.gameDir,
			fontsDirectory: this.scene.fontsDir,
			fonts: fontsSettings.fonts.join("\n"),
		}
	}
	
	private addPanelContainers() {
		this.leftPanels = this.getPanelsContainer("left-sidebar")
		this.rightPanels = this.getPanelsContainer("right-sidebar")
		
		let zoom = this.scene.game.store.getValue("editor_zoom")
		this.setZoom(zoom)
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
	
	private addOpenDirectoryCallbacks() {
		[this.gamePanel, this.importPanel, this.exportPanel].forEach(panel => {
			panel.on(EditorPanelEvent.OPEN_DIRECTORY, this.openDirectory, this)
		})
	}
	
	private openDirectory(dirpath: string): void {
	    if (!dirpath) {
			return
	    }
		
		if (!this.scene.isAbsolutePath(dirpath)) {
			dirpath = path.join(this.scene.gameDir, dirpath)
		}
		
		BrowserSyncService.open(dirpath)
	}
	
	public enablePanels(): void {
		this.leftPanels.classList.remove("disable-panel-input")
		this.rightPanels.classList.remove("disable-panel-input")
	}
	
	public disablePanels(): void {
		this.leftPanels.classList.add("disable-panel-input")
		this.rightPanels.classList.add("disable-panel-input")
	}
	
	private addKeyboardCallbacks() {
		this.scene.onKeyDown("PLUS", (e: KeyboardEvent) => {
			if (e.shiftKey) {
				this.changeZoom(0.05)
			}
		})
		
		this.scene.onKeyDown("MINUS", (e: KeyboardEvent) => {
			if (e.shiftKey) {
				this.changeZoom(-0.05)
			}
		})
		
		this.scene.onKeyDown("ZERO", (e: KeyboardEvent) => {
			if (e.shiftKey) {
				this.setZoom(1)
			}
		})
	}
	
	public changeZoom(delta = 0.1): void {
		let currentZoom = this.scene.game.store.getValue("editor_zoom")
		currentZoom = Math.max(0.2, currentZoom + delta)
		currentZoom = Phaser.Math.RoundTo(currentZoom, -2)
		this.setZoom(currentZoom)
	}
	
	public setZoom(value: number): void {
		let transform = `scale(${value})`
		let width = `${(100 / value).toFixed(0)}%`
		this.rightPanels.style.transform = transform
		this.rightPanels.style.width = width
		this.leftPanels.style.transform = transform
		this.leftPanels.style.width = width
		this.scene.game.store.saveValue("editor_zoom", value)
	}
	
	public destroy(): void {
		super.destroy()
		
		this.contentPanel.destroy()
		this.fontPanel.destroy()
		this.strokePanel.destroy()
		this.shadowPanel.destroy()
		this.glowPanel.destroy()
		this.layoutPanel.destroy()
		
		this.gamePanel.destroy()
		this.importPanel.destroy()
		this.exportPanel.destroy()
		this.previewPanel.destroy()
	}
}
