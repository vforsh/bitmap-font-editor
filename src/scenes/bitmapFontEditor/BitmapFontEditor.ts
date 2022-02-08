import { BaseScene } from "../../robowhale/phaser3/scenes/BaseScene"
import { ScaleType } from "../../robowhale/phaser3/scenes/Scaler"
import { BitmapFontEditorPanelsManager } from "./panels/BitmapFontEditorPanelsManager"
import { ContentPanelEvent } from "./panels/ContentPanel"
import { LayoutPanelConfig, PackingMethod } from "./panels/LayoutPanel"
import { TextFontConfig } from "./panels/FontPanel"
import { Font, parse } from "opentype.js"
import { createBmfontData } from "./create-bmfont-data"
import { BrowserSyncService } from "../../BrowserSyncService"
import { Config } from "../../Config"
import { ShadowPanelConfig } from "./panels/ShadowPanel"
import { cloneDeep, merge } from "lodash-es"
import { GlowPanelConfig } from "./panels/GlowPanel"
import { GlowPostFX } from "../../robowhale/phaser3/fx/GlowPostFX"
import { PreviewPanelConfig } from "./panels/PreviewPanel"
import * as potpack from "potpack"
import { ButtonApi } from "@tweakpane/core"
import { UrlParams } from "../../UrlParams"
import { ImportPanelConfig } from "./panels/ImportPanel"
import { blobToImage } from "../../robowhale/phaser3/utils/blob-to-json"
import { parseJsonBitmapFont } from "../../robowhale/phaser3/gameObjects/bitmap-text/parse-json-bitmap-font"
import slash from "slash"
import { OpenGamePanel, OpenGamePanelEvent } from "./modals/OpenGamePanel"
import { ModalPanelEvent } from "./modals/ModalPanel"
import { BitmapFontProjectConfig, DEFAULT_CONFIG, RGB, RGBA } from "./BitmapFontProjectConfig"
import type { ExecaReturnValue } from "execa"
import { GetTexturePackerPathPanel } from "./modals/GetTexturePackerPathPanel"
import path from "path-browserify"
import { getRendererSnapshot } from "../../robowhale/phaser3/utils/get-renderer-snapshot"
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export type BitmapFontTexture = { blob: Blob, width: number, height: number }

export type GameSettings = {
	name: string
	format: "json" | "xml"
	fonts: string[]
}

export type ProjectsList = string[]

export type FontsList = Record<string, FontListEntry>

export type FontListEntry = {
	name: string
	fullname: string
	path: string
	style: string
}

export class BitmapFontEditor extends BaseScene {
	
	public rootDir: string
	public gameSettings: GameSettings
	public fontsList: FontsList
	public projectsList: ProjectsList
	
	public isReady: boolean
	public config: BitmapFontProjectConfig
	private panels: BitmapFontEditorPanelsManager
	private background: Phaser.GameObjects.Image
	private glyphsContainer: Phaser.GameObjects.Container
	private glyphBack: Phaser.GameObjects.Image
	private glyphs: Phaser.GameObjects.Text[]
	private glyphsInfo: Phaser.GameObjects.Text
	private separator: Phaser.GameObjects.Image
	private previewBack: Phaser.GameObjects.Image
	private preview: Phaser.GameObjects.BitmapText
	private glowPipelineKey = "GlowPostFX" as const
	
	public init(): void {
		super.init()
		
		this.rootDir = null
		this.gameSettings = null
		this.fontsList = null
		this.projectsList = null
		this.glyphs = []
		this.isReady = false
		this.config = cloneDeep(DEFAULT_CONFIG)
		this.initGlowPipeline()
	}
	
	private initGlowPipeline() {
		let renderer = this.renderer as WebGLRenderer
		let pipelineKey = this.glowPipelineKey
		let pipeline = renderer.pipelines.getPostPipeline(pipelineKey) as GlowPostFX
		if (!pipeline) {
			renderer.pipelines.addPostPipeline(pipelineKey, GlowPostFX)
		}
	}
	
	public async create() {
		let rootDir = UrlParams.get("game") ?? await this.showOpenGameWindow()
		if (rootDir) {
			rootDir = slash(rootDir)
		}
		
		this.rootDir = rootDir
		this.gameSettings = this.rootDir && await this.loadGameSettings(this.rootDir)
		this.fontsList = await this.loadFontsList(this.gameSettings?.fonts)
		this.projectsList = this.rootDir && await this.loadProjectsList(this.rootDir)
		
		if (this.gameSettings) {
			this.updateRecentProjects()
		}
		
		let project = UrlParams.get("project")
		if (project) {
			project = slash(project)
		}
		
		if (this.projectsList?.includes(project)) {
			this.config.import.project = project
		}
		
		this.doCreate()
	}
	
	private async showOpenGameWindow(): Promise<string> {
		return new Promise((resolve, reject) => {
			let recentProjects = this.game.store.getValue("recent_projects")
			let panel = new OpenGamePanel(this, { path: "", recent: "" }, recentProjects)
			panel.once(OpenGamePanelEvent.PROJECT_SELECT, projectPath => {
				resolve(projectPath)
				panel.hide()
			})
			
			panel.once(ModalPanelEvent.HIDE, () => {
				resolve(null)
			})
			
			panel.show()
		})
	}
	
	private async loadGameSettings(dirpath: string): Promise<GameSettings> {
		try {
			let filepath = `${dirpath}/.bmfontsrc`
			let response = await BrowserSyncService.readFile(filepath)
			let json = await response.json()
			
			return json
		} catch (error) {
			console.warn(`Can't load game settings!\n`, error)
			return null
		}
	}
	
	private async loadFontsList(fonts: string[] = []): Promise<FontsList> {
		try {
			let response = await BrowserSyncService.fonts(fonts)
			return response.json()
		} catch (error) {
			console.warn("Can't load fonts list!\n", error)
			return null
		}
	}
	
	private async loadProjectsList(dirpath: string): Promise<ProjectsList> {
		try {
			let response = await BrowserSyncService.projects(dirpath)
			return response.json()
		} catch (error) {
			console.warn("Can't load projects list!\n", error)
			return null
		}
	}
	
	private updateRecentProjects() {
		let projects = this.game.store.getValue("recent_projects")
		let currentProjectName = this.gameSettings.name
		projects[currentProjectName] = { name: currentProjectName, path: this.rootDir, openedAt: Date.now() }
		
		this.game.store.saveValue("recent_projects", projects)
	}
	
	private doCreate() {
		this.addPanels()
		this.addBackground()
		this.addGlyphBack()
		this.addGlyphsContainer()
		this.addGlyphsInfo()
		this.addSeparator()
		this.addPreviewBack()
		this.addPreview()
		
		this.updateBackgroundColor(this.rgbaToNumber(this.config.layout.bgColor))
		
		this.addKeyboardCallbacks()
		
		this.addPointerCallbacks()
		
		this.isReady = true
		this.resize()
		
		if (this.config.import.project) {
			this.loadProject(this.config.import.project)
		}
	}
	
	private addPanels() {
		this.panels = new BitmapFontEditorPanelsManager(this)
		this.panels.contentPanel.on(ContentPanelEvent.CONTENT_CHANGE, this.onContentChange, this)
		this.panels.fontPanel.reloadButton.on("click", this.onReloadFontsButtonClick.bind(this))
		this.panels.fontPanel.on("change", this.onFontChange, this)
		this.panels.strokePanel.on("change", this.onStrokeChange, this)
		this.panels.shadowPanel.on("change", this.onShadowChange, this)
		this.panels.glowPanel.on("change", this.onGlowChange, this)
		this.panels.layoutPanel.on("change", this.onLayoutChange, this)
		
		this.panels.gamePanel.openGameButton.on("click", this.onOpenGameButtonClick.bind(this))
		
		this.panels.importPanel.on("project-change", this.onProjectChange.bind(this))
		this.panels.importPanel.loadProjectsButton.on("click", this.onLoadProjectsButtonClick.bind(this))
		this.panels.importPanel.loadButton.on("click", this.onLoadCustomProjectButtonClick.bind(this))
		
		this.panels.exportPanel.locateTpProjectButton.on("click", this.onLocateTpProjectButtonClick.bind(this, this.panels.exportPanel.locateTpProjectButton))
		this.panels.exportPanel.exportButton.on("click", this.onExportButtonClick.bind(this, this.panels.exportPanel.exportButton))
		
		this.panels.previewPanel.on("debug-change", this.onPreviewDebugSettingsChange.bind(this))
		this.panels.previewPanel.on("change", this.onPreviewSettingsChange.bind(this))
		this.panels.previewPanel.previewButton.on("click", this.onPreviewButtonClick.bind(this))
		
		document.querySelectorAll(".tp-txtv_i").forEach((input: HTMLInputElement) => {
			input.addEventListener("focus", this.onTweakpaneInputFocus.bind(this))
			input.addEventListener("blur", this.onTweakpaneInputBlur.bind(this))
		})
		
		if (this.fontsList) {
			this.updateFontFamilyInput(this.fontsList)
		}
		
		if (this.projectsList) {
			this.updateProjectsList(this.projectsList)
		}
	}
	
	private onTweakpaneInputFocus(): void {
		this.panels.keyboardCallbacksEnabled = false
	}
	
	private onTweakpaneInputBlur(): void {
		this.panels.keyboardCallbacksEnabled = true
	}
	
	private updateFontFamilyInput(data: FontsList): void {
		let fonts = Object.keys(data).sort()
		this.panels.fontPanel.updateFontsList(fonts)
	}
	
	private updateProjectsList(projectsList: string[]) {
		this.panels.importPanel.updateProjectsList(projectsList)
	}
	
	private onContentChange(value: string): void {
		this.clearGlyphs()
		
		// add whitespace
		let chars = value.split("")
		if (chars.includes(" ") === false) {
			chars.push(" ")
		}
		
		this.glyphs = chars.map(char => this.createGlyph(char))
		this.updatePacking()
	}
	
	private onReloadFontsButtonClick(): void {
		let { familyInput, reloadButton } = this.panels.fontPanel
		reloadButton.disabled = true
		familyInput.disabled = true
		
		BrowserSyncService.fonts(this.gameSettings?.fonts)
			.then(response => response.json())
			.then(fonts => {
				this.fontsList = fonts
				this.updateFontFamilyInput(this.fontsList)
			})
			.catch(error => {
				console.warn("Can't load fonts list!", error)
			})
			.finally(() => {
				reloadButton.disabled = false
				familyInput.disabled = false
			})
	}
	
	private onFontChange(config: TextFontConfig) {
		this.glyphs.forEach(glyph => {
			glyph.setFontFamily(config.family)
			glyph.setFontStyle(config.weight.toString())
			glyph.setFontSize(config.size)
			glyph.setColor(this.rgbaToString(config.color))
			glyph.setPadding({ x: config.padding.x, y: config.padding.y })
			glyph.setResolution(config.resolution)
		})
		
		this.updatePacking()
	}
	
	private onStrokeChange(config: { color: RGBA, thickness: number }): void {
		this.glyphs.forEach(glyph => glyph.setStroke(this.rgbaToString(config.color), config.thickness))
		this.updatePacking()
	}
	
	private onShadowChange(config: ShadowPanelConfig, property: keyof ShadowPanelConfig): void {
		let shadowColor = this.rgbaToString(config.color)
		
		this.glyphs.forEach(glyph => {
			glyph.setShadow(config.x, config.y, shadowColor, config.blur, config.shadowStroke, config.shadowFill)
		})
		
		this.updatePacking()
	}
	
	private onGlowChange(config: GlowPanelConfig, property: keyof GlowPanelConfig): void {
		let container = this.glyphsContainer
		let pipelineKey = this.glowPipelineKey
		
		if (!config.enabled) {
			container.removePostPipeline(pipelineKey)
			return
		}
		
		let pipeline = container.postPipelines.find(p => p.name === pipelineKey) as GlowPostFX
		if (!pipeline) {
			container.setPostPipeline(pipelineKey)
			pipeline = container.postPipelines.find(p => p.name === pipelineKey) as GlowPostFX
			pipeline.reset(config.quality, config.distance)
		}
		
		if (property === "quality" || property === "distance") {
			pipeline.reset(config.quality, config.distance)
		}
		
		pipeline.innerStrength = config.innerStrength
		pipeline.outerStrength = config.outerStrength
		pipeline.color = Phaser.Display.Color.GetColor(config.color.r, config.color.g, config.color.b)
	}
	
	private rgbaToString(rgba: RGBA): string {
		let { r, g, b, a } = rgba
		
		return `rgba(${r},${g},${b},${a})`
	}
	
	private rgbaToNumber(rgb: RGBA | RGB): number {
		let { r, g, b } = rgb
		let a = rgb["a"] ?? 1
		
		return Phaser.Display.Color.GetColor32(r, g, b, a)
	}
	
	private onLayoutChange(config: LayoutPanelConfig, property: keyof LayoutPanelConfig): void {
		if (property === "method") {
			this.updatePacking(config.method)
		}
		
		if (property === "bgColor") {
			let color = Phaser.Display.Color.GetColor(config.bgColor.r, config.bgColor.g, config.bgColor.b)
			this.updateBackgroundColor(color)
		}
	}
	
	private updatePacking(method?: PackingMethod): void {
		switch (method ?? this.panels.layoutPanel.getPackingMethod()) {
			case PackingMethod.ROW:
				this.packGlyphsInRow()
				break
			
			case PackingMethod.COLUMN:
				this.packGlyphsInColumn()
				break
			
			case PackingMethod.SQUARE:
				this.packGlyphsInSquare()
				break
			
			default:
				break
		}
	}
	
	private packGlyphsInRow() {
		for (let i = 1; i < this.glyphs.length; i++) {
			let prev = this.glyphs[i - 1]
			let current = this.glyphs[i]
			current.x = prev.x + prev.displayWidth
			current.y = 0
		}
	}
	
	private packGlyphsInColumn() {
		for (let i = 1; i < this.glyphs.length; i++) {
			let prev = this.glyphs[i - 1]
			let current = this.glyphs[i]
			current.x = 0
			current.y = prev.y + prev.displayHeight
		}
	}
	
	private packGlyphsInSquare() {
		let boxes = this.glyphs.map((glyph) => {
			return {
				w: glyph.width,
				h: glyph.height,
				glyph,
			}
		})
		
		potpack.default(boxes)
		
		boxes.forEach((box) => {
			let { x, y, glyph } = box as any
			glyph.x = x
			glyph.y = y
		})
	}
	
	private updateBackgroundColor(color: number): void {
		let { r, g, b, a } = Phaser.Display.Color.ColorToRGBA(color)
		this.game.canvas.parentElement.style.backgroundColor = `rgba(${r},${g},${b},${a})`
		
		this.background?.setTintFill(color)
	}
	
	private addBackground() {
		this.background = this.add.image(0, 0, "__WHITE")
		this.size(this.background, ScaleType.FILL)
		this.pin(this.background, 0.5, 0.5)
	}
	
	private addGlyphBack() {
		this.glyphBack = this.add.image(0, 0, "__WHITE")
		this.glyphBack.setOrigin(0)
		this.glyphBack.alpha = 0.33
		this.glyphBack.kill()
	}
	
	private addGlyphsContainer() {
		this.glyphsContainer = this.add.container(0, 0)
		this.glyphsContainer.name = "glyphs"
	}
	
	private addGlyphsInfo() {
		let content = ""
		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: "Verdana",
			fontStyle: "400",
			fontSize: "28px",
			color: "#ffffff",
			align: "right",
			resolution: 1.5,
		}
		
		this.glyphsInfo = this.add.text(0, 0, content, style)
		this.glyphsInfo.setOrigin(1, 1)
		this.pin(this.glyphsInfo, 1, 0.5, -10, -6)
	}
	
	private addSeparator() {
		this.separator = this.add.image(0, 0, "__WHITE")
		this.separator.displayHeight = 2
		this.separator.alpha = 0.5
		this.pin(this.separator, 0.5, 0.5)
	}
	
	private addPreviewBack() {
		this.previewBack = this.add.image(0, 0, "__WHITE")
		this.previewBack.kill()
		this.previewBack.alpha = 0.33
		this.previewBack.setOrigin(0, 0)
	}
	
	private updatePreviewBack(): void {
		if (!this.preview || !this.preview.visible || !this.config.preview.debug) {
			this.previewBack.kill()
		} else {
			this.previewBack.revive()
		}
		
		if (this.previewBack.visible) {
			this.previewBack.displayWidth = this.preview.width
			this.previewBack.displayHeight = this.preview.height
			this.previewBack.x = this.preview.x
			this.previewBack.y = this.preview.y
		}
	}
	
	private addPreview() {
	
	}
	
	private addKeyboardCallbacks() {
		this.onKeyDown("S", this.makeScreenshot, this)
	}
	
	private async makeScreenshot() {
		if (BrowserSyncService.isAvailable() === false) {
			return
		}
		
		try {
			let blob = await getRendererSnapshot(this.renderer)
			await BrowserSyncService.saveScreenshot(blob)
		} catch (error) {
			console.error("Can't save screenshot!", error)
		}
	}
	
	private addPointerCallbacks() {
		this.input.on(Phaser.Input.Events.POINTER_DOWN, this.onPointerDown, this)
		this.input.on(Phaser.Input.Events.POINTER_WHEEL, this.onPointerWheel, this)
		this.input.on(Phaser.Input.Events.GAME_OUT, this.onPointerGameOut, this)
	}
	
	private onPointerDown(pointer: Phaser.Input.Pointer): void {
		if (!this.preview) {
			return
		}
		
		if (pointer.button === 1) { // middle button click
			this.preview.setScale(1)
			this.updatePreviewBack()
		}
	}
	
	private onPointerWheel(pointer, objects, dx, dy: number): void {
		if (!this.preview) {
			return
		}
		
		let sign = Phaser.Math.Sign(dy)
		let deltaScale = -sign * 0.1
		this.preview.scale += deltaScale
		this.updatePreviewBack()
	}
	
	private onPointerGameOut(): void {
		this.glyphBack.kill()
	}
	
	private clearGlyphs(): void {
		this.glyphs.forEach(glyph => glyph.destroy())
		this.glyphs.length = 0
	}
	
	private createGlyph(content: string): Phaser.GameObjects.Text {
		let { font, stroke, shadow } = this.config
		
		let glyph = this.add.text(0, 0, content)
		glyph.setFontFamily(font.family)
		glyph.setFontStyle(font.weight.toString())
		glyph.setFontSize(font.size)
		glyph.setResolution(font.resolution)
		glyph.setColor(this.rgbaToString(font.color))
		glyph.setPadding({ x: font.padding.x, y: font.padding.y })
		glyph.setStroke(this.rgbaToString(stroke.color), stroke.thickness)
		glyph.setShadow(shadow.x, shadow.y, this.rgbaToString(shadow.color), shadow.blur, shadow.shadowStroke, shadow.shadowFill)
		glyph.setInteractive()
		glyph.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OVER, this.onGlyphPointerOver.bind(this, glyph))
		glyph.on(Phaser.Input.Events.GAMEOBJECT_POINTER_OUT, this.onGlyphPointerOut.bind(this))
		
		this.glyphsContainer.add(glyph)
		
		return glyph
	}
	
	private onGlyphPointerOver(glyph: Phaser.GameObjects.Text): void {
		this.glyphBack.revive()
		this.glyphBack.x = this.glyphsContainer.x + glyph.x
		this.glyphBack.y = this.glyphsContainer.y + glyph.y
		this.glyphBack.setDisplaySize(glyph.displayWidth, glyph.height)
		
		let glyphId = glyph.text.charCodeAt(0)
		let info = `"${glyph.text}" (id ${glyphId}): ${glyph.displayWidth}x${glyph.displayHeight}`
		this.glyphsInfo.revive()
		this.glyphsInfo.setText(info)
	}
	
	private onGlyphPointerOut(pointer): void {
		this.glyphBack.kill()
		this.glyphsInfo.kill()
	}
	
	private async onLocateTpProjectButtonClick(button: ButtonApi) {
		let tpProjectPath = this.config.export.texturePacker
		if (tpProjectPath) {
			await BrowserSyncService.open(tpProjectPath, { wait: true })
			return
		}
		
		// TODO find TP project file
		// let [tpProjectFile] = await promptFiles({ fileTypes: ".tps" })
	}
	
	private onExportButtonClick(button: ButtonApi): void {
		if (this.glyphs.length === 0) {
			console.warn("Nothing to export!")
			return
		}
		
		let { configPath, texturePath } = this.getExportPaths()
		
		if (!configPath) {
			console.warn("Please set export path for the font's config!")
			return
		}
		
		if (!texturePath) {
			console.warn("Please set export path for the font's texture!")
			return
		}
		
		button.disabled = true
		
		this.export(configPath, texturePath)
			.finally(() => button.disabled = false)
	}
	
	private getExportPaths(): { configPath: string, texturePath: string } {
		let exportConfig = this.panels.exportPanel.config
		
		let customConfigPath = exportConfig.config
		let customTexturePath = exportConfig.texture
		let useCustomPaths = customConfigPath || customTexturePath
		if (useCustomPaths) {
			return { configPath: customConfigPath, texturePath: customTexturePath }
		}
		
		let rootDir = this.rootDir
		if (!rootDir) {
			console.warn("Root directory is not set!")
			return { configPath: "", texturePath: "" }
		}
		
		let name = exportConfig.name
		if (!name) {
			console.warn(`"name" is not set!`)
			return { configPath: "", texturePath: "" }
		}
		
		// remove trailing slash if present
		if (rootDir.endsWith("/")) {
			rootDir = rootDir.slice(0, -1)
		}
		
		let format = exportConfig.type
		return {
			configPath: `${this.rootDir}/${name}.${format}`,
			texturePath: `${this.rootDir}/${name}.png`,
		}
	}
	
	private async export(configPath: string, texturePath: string) {
		let texture = await this.createTexture()
		let font = await this.loadFont(this.config.font.family)
		let fontData = createBmfontData(this.config, this.glyphs, texture, font)
		
		if (this.config.export.texturePacker) {
			let atlas = await this.getAtlasDataPathFromTpConfig(this.config.export.texturePacker)
			if (atlas) {
				fontData.extra = {
					atlas: atlas,
					texture: texturePath,
					texturePacker: this.config.export.texturePacker,
				}
			}
		}
		
		let { width: textureW, height: textureH } = texture
		let { width: canvasW, height: canvasH } = this.game.canvas
		if (textureW > canvasW || textureH > canvasH) {
			console.warn(`Texture size is bigger than canvas size. Font texture will be cropped! [texture ${textureW}x${textureH}, canvas ${canvasW}x${canvasH}]`)
		}
		
		BrowserSyncService.saveBitmapFont({
			config: JSON.stringify(fontData),
			configPath: configPath,
			texture: texture.blob,
			texturePath: texturePath,
			project: JSON.stringify(this.config, null, "\t"),
		})
			.then(response => this.onExportComplete(response))
			.catch(error => console.log(`Can't save bitmap font!`, error))
			.finally(() => {
			})
	}
	
	// TP config = TexturePacker XML config (.tps)
	private async getAtlasDataPathFromTpConfig(pathToTpConfig: string): Promise<string | undefined> {
		try {
			let response = await BrowserSyncService.readFile(pathToTpConfig)
			let text = await response.text() // TP config file is a XML file
			let dataFile = /<struct type="DataFile">((.|\n)*?)<\/struct>/.exec(text)[1]
			let filename = /<filename>(.*?)<\/filename>/.exec(dataFile)[1]
			
			return path.join(pathToTpConfig, filename)
		} catch (e) {
			return
		}
	}
	
	private async createTexture(): Promise<BitmapFontTexture> {
		let width = Math.max(...this.glyphs.map(glyph => glyph.x + glyph.displayWidth))
		let height = Math.max(...this.glyphs.map(glyph => glyph.y + glyph.displayHeight))
		let blob = await this.makeSnapshot(0, 0, width, height)
		
		return { blob, width, height }
	}
	
	private makeSnapshot(x: number, y: number, width: number, height: number): Promise<Blob> {
		return new Promise((resolve, reject) => {
			this.beforeSnapshot()
			
			this.renderer.once(Phaser.Renderer.Events.POST_RENDER, () => {
				let canvas = document.createElement("canvas")
				canvas.width = width
				canvas.height = height
				
				let context = canvas.getContext("2d")
				context.drawImage(this.game.canvas, x, y, width, height, x, y, width, height)
				
				this.afterSnapshot()
				
				canvas.toBlob(blob => resolve(blob))
			})
		})
	}
	
	private beforeSnapshot(): void {
		this.background.kill()
		this.separator.kill()
		this.preview?.kill()
		this.previewBack.kill()
	}
	
	private afterSnapshot(): void {
		this.background.revive()
		this.separator.revive()
		this.preview?.revive()
		
		if (this.config.preview.debug) {
			this.previewBack.revive()
		}
	}
	
	private async loadFont(name: string): Promise<Font> {
		let fontsCache = this.game.stash.get("fonts")
		if (fontsCache.has(name)) {
			return fontsCache.get(name)
		}
		
		if (!this.fontsList) {
			return Promise.reject("Fonts list is not loaded!")
		}
		
		let path = this.fontsList[name]?.path
		if (!path) {
			return Promise.reject("Path for this font name doesn't exist!")
		}
		
		let response = await BrowserSyncService.readFile(path)
		let blob = await response.blob()
		let arrayBuffer = await blob.arrayBuffer()
		let font = parse(arrayBuffer)
		
		fontsCache.set(name, font)
		
		return font
	}
	
	private async onExportComplete(response: Response) {
		let { config, texture, project } = await response.json()
		
		console.group("Bitmap font was exported! ✔")
		console.log(`Config: ${config}`)
		console.log(`Texture: ${texture}`)
		console.log(`Project: ${project}`)
		
		let texturePacker = this.config.export.texturePacker
		if (texturePacker) {
			let { error } = await this.updateTexturePackerProject(texturePacker)
			if (error) {
				console.warn("Can't update Texture Packer project!\n", error)
			} else {
				console.log(`Texture Packer Project: file:///${texturePacker}`)
			}
		}
		
		console.groupEnd()
	}
	
	private async updateTexturePackerProject(texturePackerProjectPath: string): Promise<{ error? }> {
		try {
			let texturePackerExePath = await this.getTexturePackerExePath()
			if (!texturePackerExePath) {
				throw "Path to the TexturePacker executable is not set!"
			}
			
			let command = `"${slash(texturePackerExePath)}" ${texturePackerProjectPath}`
			let response = await BrowserSyncService.command(command, { shell: true })
			let result = (await response.json()) as { success: boolean, error?, data? }
			if (!result.success) {
				throw result.error
			}
			
			let data = result.data as ExecaReturnValue
			if (data.exitCode !== 0) {
				throw data
			}
			
			return {}
		} catch (error) {
			return { error }
		}
	}
	
	private async getTexturePackerExePath(): Promise<string> {
		let path = this.game.store.getValue("texture_packer_exe")
		if (path) {
			return path
		}
		
		path = await this.promptTexturePackerExePath()
		
		if (path) {
			this.game.store.saveValue("texture_packer_exe", slash(path))
		}
		
		return path
	}
	
	private promptTexturePackerExePath(): Promise<string> {
		return new Promise((resolve, reject) => {
			let panel = new GetTexturePackerPathPanel(this, { path: "" })
			panel.once(ModalPanelEvent.OK_CLICK, () => {
				resolve(panel.config.path)
				panel.hide()
			})
			
			panel.once(ModalPanelEvent.HIDE, () => {
				resolve(null)
			})
			
			panel.show()
		})
	}
	
	private onOpenGameButtonClick(): void {
		this.restart()
	}
	
	private onProjectChange(config: ImportPanelConfig): void {
		if (!config.project) {
			// create new empty project
			this.applyProjectConfig(cloneDeep(DEFAULT_CONFIG))
			return
		}
		
		this.loadProject(config.project)
	}
	
	private onLoadProjectsButtonClick(): void {
		if (!this.rootDir) {
			console.warn("Can't load projects list because root directory is not set!")
			return
		}
		
		let { loadProjectsButton, projectInput } = this.panels.importPanel
		projectInput.disabled = true
		loadProjectsButton.disabled = true
		
		BrowserSyncService.projects(this.rootDir)
			.then(response => response.json())
			.then((projects) => {
				this.projectsList = projects
				this.updateProjectsList(this.projectsList)
			})
			.catch((error) => {
				console.warn("Can't load projects list!", error)
			})
			.finally(() => {
				projectInput.disabled = false
				loadProjectsButton.disabled = false
			})
	}
	
	private onLoadCustomProjectButtonClick(): void {
		let { custom: projectFilepath } = this.config.import
		if (!projectFilepath) {
			console.warn("Path to custom project file is not set!")
			return
		}
		
		this.loadProject(projectFilepath)
	}
	
	private loadProject(projectFilepath: string) {
		let { projectInput, loadButton } = this.panels.importPanel
		projectInput.disabled = true
		loadButton.disabled = true
		
		BrowserSyncService.readFile(projectFilepath)
			.then(response => response.json())
			.then((result: BitmapFontProjectConfig) => {
				result.import.project = projectFilepath
				this.applyProjectConfig(result)
			})
			.catch(error => console.log(`Can't load bitmap font projects!`, error))
			.finally(() => {
				projectInput.disabled = false
				loadButton.disabled = false
			})
	}
	
	private applyProjectConfig(config: BitmapFontProjectConfig): void {
		merge(this.config, config)
		
		this.panels.contentPanel.refresh()
		this.panels.fontPanel.refresh()
		this.panels.strokePanel.refresh()
		this.panels.shadowPanel.refresh()
		this.panels.glowPanel.refresh()
		this.panels.layoutPanel.refresh()
		this.panels.importPanel.refresh()
		this.panels.exportPanel.refresh()
		this.panels.previewPanel.refresh()
	}
	
	private onPreviewDebugSettingsChange(config: PreviewPanelConfig): void {
		if (!this.preview) {
			return
		}
		
		let { r, g, b, a } = config.debugColor
		this.previewBack.setTintFill(Phaser.Display.Color.GetColor(r, g, b))
		this.previewBack.alpha = a
		this.updatePreviewBack()
	}
	
	private onPreviewSettingsChange(config: PreviewPanelConfig, property: keyof PreviewPanelConfig): void {
		if (!this.preview) {
			return
		}
		
		if (property === "content") {
			this.preview.setText(config.content)
		}
		
		if (property === "align") {
			this.preview.align = config.align
			this.preview["_dirty"] = true
		}
		
		this.preview.setFontSize(config.fontSize)
		this.preview.setMaxWidth(config.maxWidth)
		this.preview.setLetterSpacing(config.letterSpacing)
		
		this.updatePreviewBack()
	}
	
	private async onPreviewButtonClick() {
		this.preview?.destroy()
		this.preview = null
		
		this.previewBack.kill()
		
		if (!this.glyphs || this.glyphs.length === 0) {
			return
		}
		
		let fontKey = Phaser.Math.RND.uuid()
		let texture = await this.createTexture()
		let image = await blobToImage(texture.blob)
		let font = await this.loadFont(this.config.font.family)
		let config = createBmfontData(this.config, this.glyphs, texture, font)
		this.addBitmapFontToCache(fontKey, image, config)
		this.updatePreview(fontKey)
	}
	
	private addBitmapFontToCache(fontKey: string, texture: HTMLImageElement, config) {
		this.textures.addImage(fontKey, texture)
		
		let frame = this.textures.getFrame(fontKey)
		let data = parseJsonBitmapFont(config, frame)
		this.cache.bitmapFont.add(fontKey, { data, texture: fontKey, frame: null })
	}
	
	private updatePreview(fontKey: string): void {
		let y = this.separator.y
		let config = this.panels.previewPanel.config
		
		let content = config.content || this.config.content.content
		this.preview = this.add.bitmapText(0, y, fontKey, content, config.fontSize, config.align)
		this.preview.setOrigin(0, 0)
		this.preview.setMaxWidth(config.maxWidth)
		this.preview.setLetterSpacing(config.letterSpacing)
		
		this.updatePreviewBack()
	}
	
	public resize(): void {
		super.resize()
		
		if (!this.isReady) {
			return
		}
		
		this.separator.displayWidth = Config.GAME_WIDTH
	}
	
	public onShutdown() {
		super.onShutdown()
		
		this.panels.destroy()
		this.panels = null
	}
}
