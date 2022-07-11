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
import { cloneDeep, get, merge, set } from "lodash-es"
import { GlowPanelConfig } from "./panels/GlowPanel"
import { GlowPostFX } from "../../robowhale/phaser3/fx/GlowPostFX"
import { PreviewPanelConfig } from "./panels/PreviewPanel"
import { ButtonApi } from "@tweakpane/core"
import { UrlParams } from "../../UrlParams"
import { ImportPanelConfig } from "./panels/ImportPanel"
import { blobToImage } from "../../robowhale/phaser3/utils/blob-to-json"
import { parseJsonBitmapFont } from "../../robowhale/phaser3/gameObjects/bitmap-text/parse-json-bitmap-font"
import { OpenGamePanel, OpenGamePanelEvent } from "./modals/OpenGamePanel"
import { ModalPanelEvent } from "./modals/ModalPanel"
import { BitmapFontProjectConfig, DEFAULT_CONFIG, RGB, RGBA } from "./BitmapFontProjectConfig"
import { GetTexturePackerPathPanel } from "./modals/GetTexturePackerPathPanel"
import { getRendererSnapshot } from "../../robowhale/phaser3/utils/get-renderer-snapshot"
import { BitmapFontEditorDepth } from "./BitmapFontEditorDepth"
import type { ExecaReturnValue } from "execa"
import * as potpack from "potpack"
import slash from "slash"
import path from "path-browserify"
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export type BitmapFontTexture = { blob: Blob, width: number, height: number }

export type GameSettings = {
	name: string
	format: "json" | "xml"
	atlases: string[]
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
	
	public gameDir: string
	public fontsDir: string
	public fontsSettingsPath: string
	public fontsSettings: GameSettings
	public fontsList: FontsList
	public projectsList: ProjectsList
	public atlasesList: string[] // TexturePacker projects (.tps files)
	
	public isReady: boolean
	public config: BitmapFontProjectConfig
	private panels: BitmapFontEditorPanelsManager
	private background: Phaser.GameObjects.Image
	private glyphsContainer: Phaser.GameObjects.Container
	private glyphDebug: Phaser.GameObjects.Image
	private glyphs: Phaser.GameObjects.Text[]
	private glyphsInfo: Phaser.GameObjects.Text
	private previewBack: Phaser.GameObjects.Image
	private previewDebug: Phaser.GameObjects.Image
	private preview: Phaser.GameObjects.BitmapText
	private glowPipelineKey = "GlowPostFX" as const
	
	public init(): void {
		super.init()
		
		this.gameDir = null
		this.fontsDir = null
		this.fontsSettingsPath = null
		this.fontsSettings = null
		this.fontsList = null
		this.projectsList = null
		this.atlasesList = null
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
		let gameDir = UrlParams.get("game") ?? await this.showOpenGameWindow()
		if (gameDir) {
			gameDir = slash(gameDir)
		}
		
		this.gameDir = gameDir
		this.fontsSettingsPath = this.gameDir && await this.getPathToFontsSettings(this.gameDir)
		this.fontsSettings = this.fontsSettingsPath && await this.loadFontsSettings(this.fontsSettingsPath)
		this.fontsDir = this.fontsSettingsPath && path.dirname(this.fontsSettingsPath)
		this.fontsList = await this.loadFontsList(this.fontsSettings?.fonts)
		this.projectsList = this.fontsDir && await this.loadProjectsList(this.fontsDir)
		this.atlasesList = await this.loadAtlasesList(this.fontsSettings?.atlases)
		
		if (this.fontsSettings) {
			this.updateRecentProjects()
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
	
	private async getPathToFontsSettings(dirpath: string, file = '.bmfontsrc'): Promise<string> {
		let response = await BrowserSyncService.globby(path.join(dirpath, "**", file))
		let json = await response.json()
		if (!json.success) {
			throw new Error(json.error)
		}
		
		let files = json.result as string[]
		if (!files.length) {
			throw new Error(`Can't find '${file}' file in '${dirpath}'!`)
		}
		
		if (files.length > 1) {
			console.warn(`There are several '${file}' files in '${dirpath}'!`, files)
			return files.find(file => file.includes('bitmap')) ?? files[0]
		}
		
		return files[0]
	}
	
	private async loadFontsSettings(filepath: string): Promise<GameSettings> {
		try {
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
	
	private async loadAtlasesList(globPatterns: string[] = []): Promise<string[]> {
		try {
			let patterns = globPatterns.map(pattern => path.join(this.gameDir, pattern))
			let response = await BrowserSyncService.globby(patterns)
			let json = await response.json()
			return json.result
		} catch (error) {
			console.warn("Can't load atlases list!\n", error)
			return null
		}
	}
	
	private updateRecentProjects() {
		let projects = this.game.store.getValue("recent_projects")
		let currentProjectName = this.fontsSettings.name
		projects[currentProjectName] = { name: currentProjectName, path: this.gameDir, openedAt: Date.now() }
		
		this.game.store.saveValue("recent_projects", projects)
	}
	
	private doCreate() {
		this.addPanels()
		this.addBackground()
		this.addGlyphBack()
		this.addGlyphsContainer()
		this.addGlyphsInfo()
		this.addPreviewBack()
		this.addPreviewDebug()
		this.addPreview()
		
		this.updateBackgroundColor(this.rgbaToNumber(this.config.layout.bgColor))
		
		this.addKeyboardCallbacks()
		
		this.addPointerCallbacks()
		
		this.isReady = true
		this.resize()
		
		let projectPath = UrlParams.get("project")
		if (projectPath) {
			this.loadProject(projectPath)
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
		
		this.panels.exportPanel.openTpProjectButton.on("click", this.onOpenTpProjectButtonClick.bind(this, this.panels.exportPanel.openTpProjectButton))
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
		
		if (this.atlasesList) {
			this.panels.exportPanel.updateAtlasesList(this.atlasesList)
		}
	}
	
	private onTweakpaneInputFocus(): void {
		this.input.keyboard.enabled = false
	}
	
	private onTweakpaneInputBlur(): void {
		this.input.keyboard.enabled = true
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
		
		BrowserSyncService.fonts(this.fontsSettings?.fonts)
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
		
		if (!this.doGlyphsFitIntoCanvas()) {
			console.warn(`Glyphs don't fit into the canvas! Forcing to use "SQUARE" packing method.`)
			this.config.layout.method = PackingMethod.SQUARE
			this.panels.layoutPanel.refresh()
			this.packGlyphsInSquare()
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
	
	private doGlyphsFitIntoCanvas(): boolean {
		let { width, height } = this.getTextureSize()
		let { width: canvasWidth, height: canvasHeight } = this.game.canvas
		
		return width <= canvasWidth && height <= canvasHeight
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
		this.glyphDebug = this.add.image(0, 0, "__WHITE")
		this.glyphDebug.setOrigin(0)
		this.glyphDebug.setDepth(BitmapFontEditorDepth.GLYPHS_DEBUG)
		this.glyphDebug.alpha = 0.33
		this.glyphDebug.kill()
	}
	
	private addGlyphsContainer() {
		this.glyphsContainer = this.add.container(0, 0)
		this.glyphsContainer.name = "glyphs"
		this.glyphsContainer.setDepth(BitmapFontEditorDepth.GLYPHS)
	}
	
	private addGlyphsInfo() {
		let content = ""
		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: "monospace",
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
	
	private addPreviewBack() {
		this.previewBack = this.add.image(0, 0, "__WHITE")
		this.previewBack.setTintFill(0x4D4D4D)
		this.previewBack.setOrigin(0, 0)
		this.previewBack.setInteractive()
		this.previewBack.on(Phaser.Input.Events.GAMEOBJECT_POINTER_WHEEL, this.onPreviewPointerWheel, this)
		this.previewBack.on(Phaser.Input.Events.GAMEOBJECT_POINTER_DOWN, this.onPreviewPointerDown, this)
		this.pin(this.previewBack, 0, 0.5)
	}
	
	private onPreviewPointerWheel(pointer, dx, dy: number): void {
		if (!this.preview) {
			return
		}
		
		// TODO we should zoom camera here instead of doing this
		let sign = Phaser.Math.Sign(dy)
		let deltaScale = -sign * 0.1
		this.preview.scale += deltaScale
		this.updatePreviewDebug()
	}
	
	private onPreviewPointerDown(pointer: Phaser.Input.Pointer): void {
		if (!this.preview) {
			return
		}
		
		if (pointer.button === 1) { // middle button click
			this.preview.setScale(1)
			this.updatePreviewDebug()
		}
	}
	
	private addPreviewDebug() {
		this.previewDebug = this.add.image(0, 0, "__WHITE")
		this.previewDebug.kill()
		this.previewDebug.alpha = 0.33
	}
	
	private updatePreviewDebug(): void {
		if (!this.preview || !this.preview.visible || !this.config.preview.debug) {
			this.previewDebug.kill()
		} else {
			this.previewDebug.revive()
		}
		
		if (this.previewDebug.visible) {
			this.previewDebug.displayWidth = this.preview.width
			this.previewDebug.displayHeight = this.preview.height
			this.previewDebug.x = this.preview.x
			this.previewDebug.y = this.preview.y
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
		this.input.on(Phaser.Input.Events.POINTER_DOWN, this.blurFocusedTweakpaneInput, this)
		this.input.on(Phaser.Input.Events.GAME_OUT, this.onPointerGameOut, this)
	}
	
	private blurFocusedTweakpaneInput(): void {
		let ae = document.activeElement
		if (ae && ae instanceof HTMLInputElement && ae.classList.contains("tp-txtv_i")) {
			ae.blur()
		}
	}
	
	private onPointerGameOut(): void {
		this.glyphDebug.kill()
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
		this.glyphDebug.revive()
		this.glyphDebug.x = this.glyphsContainer.x + glyph.x
		this.glyphDebug.y = this.glyphsContainer.y + glyph.y
		this.glyphDebug.setDisplaySize(glyph.displayWidth, glyph.height)
		
		let glyphId = glyph.text.charCodeAt(0)
		let glyphWidth = Phaser.Math.RoundTo(glyph.displayWidth, -1)
		let glyphHeight = Phaser.Math.RoundTo(glyph.displayHeight, -1)
		let info = `"${glyph.text}" (id ${glyphId}): ${glyphWidth}x${glyphHeight}`
		this.glyphsInfo.revive()
		this.glyphsInfo.setText(info)
	}
	
	private onGlyphPointerOut(pointer): void {
		this.glyphDebug.kill()
		this.glyphsInfo.kill()
	}
	
	private async onOpenTpProjectButtonClick(button: ButtonApi) {
		let tpProjectPath = this.config.export.texturePacker
		if (tpProjectPath) {
			await BrowserSyncService.open(tpProjectPath, { wait: true })
		}
	}
	
	private onExportButtonClick(button: ButtonApi): void {
		this.normalizeExportPaths()
		this.panels.exportPanel.refresh()
		
		if (this.glyphs.length === 0) {
			console.warn("Nothing to export!")
			return
		}
		
		let configPath = this.config.export.config
		if (!configPath) {
			console.warn("Please set export path for the font's config!")
			return
		}
		
		let texturePath = this.config.export.texture
		if (!texturePath) {
			console.warn("Please set export path for the font's texture!")
			return
		}
		
		button.disabled = true
		
		this.export(configPath, texturePath)
			.finally(() => button.disabled = false)
	}
	
	private normalizeExportPaths(): void {
		let fontsDir = this.fontsDir
		let { name, type, config, texture } = this.config.export
		
		if (config) {
			if (path.isAbsolute(config)) {
				config = this.getRelativeToRootPath(config)
			}
			
			let configExtname = path.extname(config)
			if (!configExtname) {
				config = path.join(config, `${name}.${type}`)
			}
		} else {
			config = path.join(fontsDir, `${name}.${type}`)
			config = this.getRelativeToRootPath(config)
		}
		
		if (texture) {
			if (path.isAbsolute(texture)) {
				texture = this.getRelativeToRootPath(texture)
			}
			
			let textureExtname = path.extname(texture)
			if (!textureExtname) {
				texture = path.join(texture, `${name}.png`)
			}
		} else {
			texture = path.join(fontsDir, `${name}.png`)
			texture = this.getRelativeToRootPath(texture)
		}
		
		this.config.export.config = config
		this.config.export.texture = texture
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
			configPath: path.join(this.gameDir, configPath),
			texture: texture.blob,
			texturePath: path.join(this.gameDir, texturePath),
			project: this.getProjectConfigToExport(this.config),
		})
			.then(response => this.onExportComplete(response))
			.catch(error => console.log(`Can't save bitmap font!`, error))
			.finally(() => {
			})
	}
	
	private getProjectConfigToExport(config: BitmapFontProjectConfig): string {
		let configCopy = cloneDeep(config)
		
		this.adjustProjectConfigPaths(configCopy)
		
		return JSON.stringify(configCopy, null, "\t")
	}
	
	private adjustProjectConfigPaths(configCopy: BitmapFontProjectConfig): void {
		let propertyPaths = [
			"import.project",
			"import.custom",
			"export.config",
			"export.texture",
			"export.texturePacker",
		]
		
		propertyPaths.forEach((propertyPath) => {
			let filepath = get(configCopy, propertyPath)
			if (filepath && path.isAbsolute(filepath)) {
				set(configCopy, propertyPath, slash(this.getRelativeToRootPath(filepath)))
			}
		})
	}
	
	private getRelativeToRootPath(filepath: string): string {
		return path.relative(this.gameDir, filepath)
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
		let { width, height } = this.getTextureSize()
		let blob = await this.makeSnapshot(0, 0, width, height)
		
		return { blob, width, height }
	}
	
	private getTextureSize(): { width: number, height: number } {
		return {
			width: Math.max(...this.glyphs.map(glyph => glyph.x + glyph.displayWidth)),
			height: Math.max(...this.glyphs.map(glyph => glyph.y + glyph.displayHeight)),
		}
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
		this.previewBack.kill()
		this.preview?.kill()
		this.previewDebug.kill()
	}
	
	private afterSnapshot(): void {
		this.background.revive()
		this.previewBack.revive()
		this.preview?.revive()
		
		if (this.config.preview.debug) {
			this.previewDebug.revive()
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
			return Promise.reject(`Path for this font (${name}) doesn't exist!`)
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
		// TODO check via nodejs if TexturePackers exists in path
		
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
			let defaultConfig = cloneDeep(DEFAULT_CONFIG)
			let defaultFont = Object.keys(this.fontsList).sort()[0]
			defaultConfig.font.family = defaultFont
			
			this.applyProjectConfig(defaultConfig)
			return
		}
		
		this.loadProject(config.project)
	}
	
	private onLoadProjectsButtonClick(): void {
		if (!this.fontsDir) {
			console.warn("Can't load projects list because fonts directory is not set!")
			return
		}
		
		let { loadProjectsButton, projectInput } = this.panels.importPanel
		projectInput.disabled = true
		loadProjectsButton.disabled = true
		
		BrowserSyncService.projects(this.fontsDir)
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
				
				if (result.export.texturePacker) {
					result.export.texturePacker = path.join(this.gameDir, result.export.texturePacker)
				}
				
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
		this.previewDebug.setTintFill(Phaser.Display.Color.GetColor(r, g, b))
		this.previewDebug.alpha = a
		this.updatePreviewDebug()
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
		
		this.updatePreviewDebug()
	}
	
	private async onPreviewButtonClick() {
		this.preview?.destroy()
		this.preview = null
		
		this.previewDebug.kill()
		
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
		let { x, y } = this.previewBack.getCenter()
		let config = this.panels.previewPanel.config
		
		let content = config.content || this.config.content.content
		this.preview = this.add.bitmapText(x, y, fontKey, content, config.fontSize, config.align)
		this.preview.setOrigin(0.5)
		this.preview.setMaxWidth(config.maxWidth)
		this.preview.setLetterSpacing(config.letterSpacing)
		
		this.updatePreviewDebug()
	}
	
	public resize(): void {
		super.resize()
		
		if (!this.isReady) {
			return
		}
		
		this.alignPreviewBack()
		this.alignPreview()
	}
	
	private alignPreviewBack() {
		this.previewBack.displayWidth = Config.GAME_WIDTH
		this.previewBack.displayHeight = Config.HALF_GAME_HEIGHT
	}
	
	private alignPreview() {
		if (!this.preview) {
			return
		}
		
		let { x, y } = this.previewBack.getCenter()
		this.preview.x = x
		this.preview.y = y
		this.updatePreviewDebug()
	}
	
	public onShutdown() {
		super.onShutdown()
		
		this.panels.destroy()
		this.panels = null
	}
}
