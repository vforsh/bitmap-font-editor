import { ButtonApi } from '@tweakpane/core'
import type { ExecaReturnValue } from 'execa'
import { cloneDeep, get, maxBy, merge, set } from 'lodash-es'
import { NotyfEvent } from 'notyf'
import { BoundingBox, Font, parse } from 'opentype.js'
import path from 'path-browserify'
import * as potpack from 'potpack'
import slash from 'slash'
import { BrowserSyncService } from '../../BrowserSyncService'
import { Config } from '../../Config'
import { IStartProjectConfig } from '../../IStartProjectConfig'
import { UrlParams } from '../../UrlParams'
import { GlowPostFX } from '../../robowhale/phaser3/fx/GlowPostFX'
import { parseJsonBitmapFont } from '../../robowhale/phaser3/gameObjects/bitmap-text/parse-json-bitmap-font'
import { BaseScene } from '../../robowhale/phaser3/scenes/BaseScene'
import { ScaleType } from '../../robowhale/phaser3/scenes/Scaler'
import { blobToImage } from '../../robowhale/phaser3/utils/blob-to-json'
import { getRendererSnapshot } from '../../robowhale/phaser3/utils/get-renderer-snapshot'
import { assertNever } from '../../robowhale/utils/assert-never'
import { copyToClipboard } from '../../robowhale/utils/copy-to-clipboard'
import { getBmfontProjectName } from '../../utils/get-bmfont-project-name'
import { BitmapFontEditorDepth } from './BitmapFontEditorDepth'
import { BitmapFontProjectConfig, DEFAULT_CONFIG, RGB, RGBA } from './BitmapFontProjectConfig'
import { createBmfontData } from './create-bmfont-data'
import { GetTexturePackerPathPanel } from './modals/GetTexturePackerPathPanel'
import { ModalPanelEvent } from './modals/ModalPanel'
import { OpenGamePanel, OpenGamePanelEvent } from './modals/OpenGamePanel'
import { BitmapFontEditorPanelsManager } from './panels/BitmapFontEditorPanelsManager'
import { ContentPanelEvent } from './panels/ContentPanel'
import { TextFontConfig } from './panels/FontPanel'
import { GlowPanelConfig } from './panels/GlowPanel'
import { ImportPanelConfig } from './panels/ImportPanel'
import { LayoutPanelConfig, PackingMethod } from './panels/LayoutPanel'
import { PaddingsConfig } from './panels/PaddingsPanel'
import { PreviewPanelConfig } from './panels/PreviewPanel'
import { ShadowPanelConfig } from './panels/ShadowPanel'
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer
import RoundTo = Phaser.Math.RoundTo

export type BitmapFontTexture = {
	blob: Blob
	width: number
	height: number
	padding: number
}

export type GameSettings = {
	name: string
	format: 'json' | 'xml'
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
	private glyphsBorder: Phaser.GameObjects.Graphics
	private glyphsContainer: Phaser.GameObjects.Container
	private glyphDebug: Phaser.GameObjects.Image
	private glyphsCache: Map<string, readonly [advanceWidth: number, boundingBox: BoundingBox]>
	private glyphs: Phaser.GameObjects.Text[]
	private glyphsInfo: Phaser.GameObjects.Text
	private previewBack: Phaser.GameObjects.Image & { lastClickTs?: number }
	private previewDebug: Phaser.GameObjects.Image
	private preview: Phaser.GameObjects.BitmapText
	private glowPipelineKey = 'GlowPostFX' as const

	public init(): void {
		super.init()

		this.gameDir = null
		this.fontsDir = null
		this.fontsSettingsPath = null
		this.fontsSettings = null
		this.fontsList = null
		this.projectsList = null
		this.atlasesList = null
		this.glyphsCache = new Map()
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
		let gameDir = this.game.stash.get('startProject').game || this.getStartGameDirFromUrl() || (await this.showOpenGameWindow())
		if (gameDir) {
			gameDir = slash(gameDir)
		}

		let gameDirExists = await this.doesDirExist(gameDir)
		if (!gameDirExists) {
			console.warn(`'${gameDir}' doesn't exist or not a valid directory!`)
			gameDir = ''
		}

		this.gameDir = gameDir
		this.fontsSettingsPath = this.gameDir && (await this.getPathToFontsSettings(this.gameDir))
		this.fontsSettings = this.fontsSettingsPath && (await this.loadFontsSettings(this.fontsSettingsPath))
		this.fontsDir = this.fontsSettingsPath && path.dirname(this.fontsSettingsPath)
		this.fontsList = await this.loadFontsList(this.fontsSettings?.fonts)
		this.projectsList = this.fontsDir && (await this.loadProjectsList(this.fontsDir))
		this.atlasesList = await this.loadAtlasesList(this.fontsSettings?.atlases)

		if (this.fontsSettings) {
			this.updateRecentProjects()
		}

		this.doCreate()
	}

	private getStartGameDirFromUrl(): string | null {
		let recentProjects = this.game.store.getValue('recent_projects')

		let game = UrlParams.get('game')
		if (game && game in recentProjects) {
			return Object.values(recentProjects).find((item) => item.name === game)?.path ?? null
		}

		return UrlParams.get('gamePath')
	}

	private async showOpenGameWindow(): Promise<string> {
		return new Promise((resolve, reject) => {
			let recentProjects = this.game.store.getValue('recent_projects')
			let panel = new OpenGamePanel(this, { path: '', recent: '' }, recentProjects)
			panel.once(OpenGamePanelEvent.PROJECT_SELECT, (projectPath) => {
				resolve(projectPath)
				panel.hide()
			})

			panel.once(ModalPanelEvent.HIDE, () => {
				resolve(null)
			})

			panel.show()
		})
	}

	private async doesDirExist(dirpath: string): Promise<boolean> {
		try {
			let response = await BrowserSyncService.stat(dirpath)
			let stats = (await response.json()).result
			return stats && stats.isDirectory
		} catch (e) {
			return false
		}
	}

	private async getPathToFontsSettings(dirpath: string, file = '.bmfontsrc'): Promise<string> {
		let response = await BrowserSyncService.globby(path.join(dirpath, '**', file))
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
			return files.find((file) => file.includes('bitmap')) ?? files[0]
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
			let patterns = globPatterns.map((pattern) => path.join(this.gameDir, pattern))
			let response = await BrowserSyncService.globby(patterns)
			let json = await response.json()
			return json.result
		} catch (error) {
			console.warn("Can't load atlases list!\n", error)
			return null
		}
	}

	private updateRecentProjects() {
		let projects = this.game.store.getValue('recent_projects')
		let currentProjectName = this.fontsSettings.name
		projects[currentProjectName] = { name: currentProjectName, path: this.gameDir, openedAt: Date.now() }

		this.game.store.saveValue('recent_projects', projects)
	}

	private async doCreate() {
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

		let projectPath = this.game.stash.get('startProject').project || this.getStartProjectPathFromUrl()
		let projectPathExists = projectPath && (await this.doestProjectExist(projectPath))
		if (projectPathExists) {
			await this.loadProject(projectPath)
		}

		this.game.loadingScreen.fadeOut()
	}

	private getStartProjectPathFromUrl(): string | null {
		let projectNamesMap = this.projectsList.reduce((acc, path) => ((acc[getBmfontProjectName(path)] = path), acc), {})

		let project = UrlParams.get('project')
		if (project) {
			if (!(project in projectNamesMap)) {
				this.game.notifications.warn({
					message: `'${project}' project doesn't exist!`,
					duration: 0,
				})

				return null
			}

			return projectNamesMap[project]
		}

		return UrlParams.get('projectPath')
	}

	private addPanels() {
		this.panels = new BitmapFontEditorPanelsManager(this)
		this.panels.contentPanel.on(ContentPanelEvent.CONTENT_CHANGE, this.onContentChange, this)
		this.panels.fontPanel.reloadButton.on('click', this.onReloadFontsButtonClick.bind(this))
		this.panels.fontPanel.copyTextStyleButton.on('click', this.onCopyTextStyleButtonClick.bind(this))
		this.panels.fontPanel.on('change', this.onFontChange, this)
		this.panels.paddingsPanel.on('change', this.onPaddingsChange, this)
		this.panels.strokePanel.on('change', this.onStrokeChange, this)
		this.panels.shadowPanel.on('change', this.onShadowChange, this)
		this.panels.glowPanel.on('change', this.onGlowChange, this)
		this.panels.layoutPanel.on('change', this.onLayoutChange, this)

		this.panels.gamePanel.openGameButton.on('click', this.onOpenGameButtonClick.bind(this))

		this.panels.importPanel.on('project-change', this.onProjectChange.bind(this))
		this.panels.importPanel.reloadProjectsButton.on('click', this.reloadProjectsList.bind(this))
		this.panels.importPanel.startProjectButton.on('click', this.onStartProjectButtonClick.bind(this))
		this.panels.importPanel.deleteProjectButton.on('click', this.onDeleteProjectButtonClick.bind(this))

		this.panels.exportPanel.openTpProjectButton.on('click', this.onOpenTpProjectButtonClick.bind(this, this.panels.exportPanel.openTpProjectButton))
		this.panels.exportPanel.exportButton.on('click', this.onExportButtonClick.bind(this, this.panels.exportPanel.exportButton))

		this.panels.previewPanel.on('debug-change', this.onPreviewDebugSettingsChange.bind(this))
		this.panels.previewPanel.on('change', this.onPreviewSettingsChange.bind(this))
		this.panels.previewPanel.previewButton.on('click', this.onPreviewButtonClick.bind(this))

		document.querySelectorAll('.tp-txtv_i').forEach((input: HTMLInputElement) => {
			input.addEventListener('focus', this.onTweakpaneInputFocus.bind(this))
			input.addEventListener('blur', this.onTweakpaneInputBlur.bind(this))
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
		let chars = value.split('')
		if (chars.includes(' ') === false) {
			chars.push(' ')
		}

		this.glyphs = chars.map((char) => this.createGlyph(char))
		this.updatePacking()
	}

	private onReloadFontsButtonClick(): void {
		let { familyInput, reloadButton } = this.panels.fontPanel
		reloadButton.disabled = true
		familyInput.disabled = true

		BrowserSyncService.fonts(this.fontsSettings?.fonts)
			.then((response) => response.json())
			.then((fonts) => {
				this.fontsList = fonts
				this.updateFontFamilyInput(this.fontsList)
			})
			.catch((error) => {
				console.warn("Can't load fonts list!", error)
			})
			.finally(() => {
				reloadButton.disabled = false
				familyInput.disabled = false
			})
	}

	private onCopyTextStyleButtonClick(): void {
		let { font, stroke, shadow } = this.config

		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: font.family,
			fontStyle: font.weight.toString(),
			fontSize: font.size + 'px',
			color: this.rgbaToString(font.color),
			align: 'center',
		}

		if (font.padding.x !== 0 || font.padding.y !== 0) {
			style.padding = cloneDeep(font.padding)
		}

		if (stroke.thickness > 0) {
			style.stroke = this.rgbaToString(stroke.color)
			style.strokeThickness = stroke.thickness
		}

		if (shadow.x !== 0 || shadow.y !== 0) {
			style.shadow = {
				offsetX: shadow.x,
				offsetY: shadow.y,
				blur: shadow.blur,
				color: this.rgbaToString(shadow.color),
				stroke: shadow.shadowStroke,
				fill: shadow.shadowFill,
			}
		}

		let content = JSON.stringify(style, null, '\t')
		content = content.replace(/"(\w+)": /gm, '$1: ') // remove double quotes from props

		copyToClipboard(content)
			.then(() => this.game.notifications.notyf.success('Text style was copied to the clipboard.'))
			.catch(() => this.game.notifications.notyf.error(`Can't copy text style to the clipboard!`))
	}

	private async onFontChange(config: TextFontConfig) {
		await this.loadFont(config.family)

		this.glyphs.forEach((glyph) => {
			glyph.setFontFamily(config.family)
			glyph.setFontStyle(config.weight.toString())
			glyph.setFontSize(config.size)
			glyph.setColor(this.rgbaToString(config.color))
			glyph.setPadding(this.getGlyphPadding(glyph.text))
			glyph.setResolution(config.resolution)
		})

		this.updatePacking()
	}

	private onPaddingsChange(char: string, config: PaddingsConfig): void {
		let glyph = this.glyphs.find((item) => item.text === char)
		if (glyph) {
			glyph.setPadding(this.getGlyphPadding(glyph.text))
			this.updatePacking()
		}
	}

	private getGlyphPadding(char: string): Phaser.Types.GameObjects.Text.TextPadding {
		let commonPadding = this.config.font.padding

		let customPadding: PaddingsConfig = this.config.paddings[char] ?? {
			top: 0,
			bottom: 0,
			right: 0,
			left: 0,
		}

		let { family, size } = this.config.font
		// TODO handle undefined here
		let [aw, bb] = this.getGlyphsData(family, char, size)
		let glyphPadding: PaddingsConfig = {
			top: 0,
			bottom: Math.ceil(bb.y2),
			right: bb.x2 - aw > 0 ? Math.ceil(bb.x2 - aw) : 0,
			left: Math.ceil(Math.abs(bb.x1)),
		}

		return {
			top: commonPadding.y + customPadding.top + glyphPadding.top,
			bottom: commonPadding.y + customPadding.bottom + glyphPadding.bottom,
			right: commonPadding.x + customPadding.right + glyphPadding.right,
			left: commonPadding.x + customPadding.left + glyphPadding.left,
		}
	}

	private getGlyphsData(fontFamily: string, char: string, fontSize: number): readonly [number, BoundingBox] | undefined {
		let font = this.game.stash.get('fonts').get(fontFamily)
		if (!font) {
			return
		}

		let cacheKey = fontFamily + '_' + char + '_' + fontSize
		if (this.glyphsCache.has(cacheKey)) {
			return this.glyphsCache.get(cacheKey)
		}

		let advanceWidth = font.getAdvanceWidth(char, fontSize)
		let boundingBox = font.getPath(char, 0, 0, fontSize).getBoundingBox()
		let result = [advanceWidth, boundingBox] as const

		this.glyphsCache.set(cacheKey, result)

		return result
	}

	private onStrokeChange(config: { color: RGBA; thickness: number }): void {
		this.glyphs.forEach((glyph) => glyph.setStroke(this.rgbaToString(config.color), config.thickness))
		this.updatePacking()
	}

	private onShadowChange(config: ShadowPanelConfig, property: keyof ShadowPanelConfig): void {
		let shadowColor = this.rgbaToString(config.color)

		this.glyphs.forEach((glyph) => {
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

		let pipeline = container.postPipelines.find((p) => p.name === pipelineKey) as GlowPostFX
		if (!pipeline) {
			container.setPostPipeline(pipelineKey)
			pipeline = container.postPipelines.find((p) => p.name === pipelineKey) as GlowPostFX
			pipeline.reset(config.quality, config.distance)
		}

		if (property === 'quality' || property === 'distance') {
			pipeline.reset(config.quality, config.distance)
		}

		pipeline.innerStrength = config.innerStrength
		pipeline.outerStrength = config.outerStrength
		pipeline.color = Phaser.Display.Color.GetColor(config.color.r, config.color.g, config.color.b)
	}

	private rgbaToString(rgba: RGBA): string {
		let { r, g, b, a } = rgba

		return `rgba(${r},${g},${b},${RoundTo(a, -2)})`
	}

	private rgbaToNumber(rgb: RGBA | RGB): number {
		let { r, g, b } = rgb
		let a = rgb['a'] ?? 1

		return Phaser.Display.Color.GetColor32(r, g, b, a)
	}

	private onLayoutChange(config: LayoutPanelConfig, property: keyof LayoutPanelConfig): void {
		if (property === 'method') {
			this.updatePacking(config.method)
		}

		if (property === 'bgColor') {
			let color = Phaser.Display.Color.GetColor(config.bgColor.r, config.bgColor.g, config.bgColor.b)
			this.updateBackgroundColor(color)
		}
	}

	private updatePacking(method?: PackingMethod): void {
		method ??= this.panels.layoutPanel.getPackingMethod()

		switch (method) {
			case PackingMethod.ROW:
				this.packGlyphsInRow()
				break

			case PackingMethod.ROWS:
				this.packGlyphsInRows()
				break

			case PackingMethod.COLUMN:
				this.packGlyphsInColumn()
				break

			case PackingMethod.SQUARE:
				this.packGlyphsInSquare()
				break

			default:
				assertNever(method, 'Unknown packing method!')
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
			current.x = Math.ceil(prev.x + prev.displayWidth)
			current.y = 0
		}
	}

	private packGlyphsInRows() {
		for (let i = 1; i < this.glyphs.length; i++) {
			let prev = this.glyphs[i - 1]
			let current = this.glyphs[i]

			let testX = Math.ceil(prev.x + prev.displayWidth)
			if (testX > Config.GAME_WIDTH - Math.ceil(current.displayWidth)) {
				let bottommostGlyph = maxBy(this.glyphs.slice(0, i), (glyph) => glyph.y + glyph.displayHeight)
				current.x = 0
				current.y = Math.ceil(bottommostGlyph.y + bottommostGlyph.displayHeight)
			} else {
				current.x = testX
				current.y = prev.y
			}
		}
	}

	private packGlyphsInColumn() {
		for (let i = 1; i < this.glyphs.length; i++) {
			let prev = this.glyphs[i - 1]
			let current = this.glyphs[i]
			current.x = 0
			current.y = Math.ceil(prev.y + prev.displayHeight)
		}
	}

	private packGlyphsInSquare() {
		let boxes = this.glyphs.map((glyph) => {
			return {
				w: Math.ceil(glyph.width),
				h: Math.ceil(glyph.height),
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
		let { width, height } = this.getContentSize()
		let { width: canvasWidth, height: canvasHeight } = this.game.canvas

		return width <= canvasWidth && height <= canvasHeight
	}

	private updateBackgroundColor(color: number): void {
		let { r, g, b, a } = Phaser.Display.Color.ColorToRGBA(color)
		this.game.canvas.parentElement.style.backgroundColor = `rgba(${r},${g},${b},${a})`

		this.background?.setTintFill(color)
	}

	private addBackground() {
		this.background = this.add.image(0, 0, '__WHITE')
		this.size(this.background, ScaleType.FILL)
		this.pin(this.background, 0.5, 0.5)
	}

	private addGlyphBack() {
		this.glyphDebug = this.add.image(0, 0, '__WHITE')
		this.glyphDebug.setOrigin(0)
		this.glyphDebug.setDepth(BitmapFontEditorDepth.GLYPHS_DEBUG)
		this.glyphDebug.alpha = 0.33
		this.glyphDebug.kill()
	}

	private addGlyphsContainer() {
		this.glyphsContainer = this.add.container(0, 0)
		this.glyphsContainer.name = 'glyphs'
		this.glyphsContainer.setDepth(BitmapFontEditorDepth.GLYPHS)
	}

	private addGlyphsInfo() {
		let content = ''
		let style: Phaser.Types.GameObjects.Text.TextStyle = {
			fontFamily: 'monospace',
			fontStyle: '400',
			fontSize: '28px',
			color: '#ffffff',
			align: 'right',
			resolution: 1.5,
		}

		this.glyphsInfo = this.add.text(0, 0, content, style)
		this.glyphsInfo.setOrigin(1, 1)
		this.pin(this.glyphsInfo, 1, 0.5, -10, -6)
	}

	private addPreviewBack() {
		this.previewBack = this.add.image(0, 0, '__WHITE')
		this.previewBack.lastClickTs = 0
		this.previewBack.setTintFill(0x4d4d4d)
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

		if (pointer.button === 1) {
			// middle button click
			this.preview.setScale(1)
			this.updatePreviewDebug()
		}

		let timeBetweenClicks = Date.now() - this.previewBack.lastClickTs
		let isDoubleClick = timeBetweenClicks < 300
		if (isDoubleClick) {
			this.scalePreviewOnDoubleClick()
			this.previewBack.lastClickTs = 0
		} else {
			this.previewBack.lastClickTs = Date.now()
		}
	}

	private scalePreviewOnDoubleClick(): void {
		if (this.preview.scale !== 1) {
			this.preview.setScale(1)
			this.updatePreviewDebug()
			return
		}

		let scaleX = this.previewBack.displayWidth / this.preview.width
		let scaleY = this.previewBack.displayHeight / this.preview.height
		let scale = Math.min(scaleX, scaleY)
		this.preview.setScale(scale)
		this.updatePreviewDebug()
	}

	private addPreviewDebug() {
		this.previewDebug = this.add.image(0, 0, '__WHITE')
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

	private addPreview() {}

	private addKeyboardCallbacks() {
		this.onKeyDown('S', this.makeScreenshot, this)
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
		if (ae && ae instanceof HTMLInputElement && ae.classList.contains('tp-txtv_i')) {
			ae.blur()
		}
	}

	private onPointerGameOut(): void {
		this.glyphDebug.kill()
	}

	private clearGlyphs(): void {
		this.glyphs.forEach((glyph) => glyph.destroy())
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
		glyph.setPadding(this.getGlyphPadding(content))
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

	private onStartProjectButtonClick(): void {
		let config: IStartProjectConfig = {
			game: this.gameDir,
			project: this.config.import.project,
		}

		this.panels.importPanel.startProjectButton.disabled = true

		let projectName = getBmfontProjectName(this.panels.importPanel.config.project)

		BrowserSyncService.writeJson('dev/assets/start_project.json', config, true)
			.then(() => this.onStartProjectConfigUpdateComplete(projectName))
			.catch((error) => this.onStartProjectConfigUpdateFail(projectName, error))
			.finally(() => (this.panels.importPanel.startProjectButton.disabled = false))
	}

	private onStartProjectConfigUpdateComplete(projectName: string) {
		this.game.notifications.notyf.success(`<b>${projectName}</b> is a start project now.`)
	}

	private onStartProjectConfigUpdateFail(projectName: string, error: unknown) {
		this.game.notifications.notyf.error(`Can't set <b>${projectName}</b> as a start project!`)
		console.error(error)
	}

	private async onDeleteProjectButtonClick() {
		if (!this.config.import.project) {
			return
		}

		let projectName = getBmfontProjectName(this.config.import.project)
		let doDelete = window.confirm(`Delete '${projectName}'?`)
		if (!doDelete) {
			return
		}

		this.panels.importPanel.disableInput()

		Promise.all([
			BrowserSyncService.rmFile(this.config.import.project),
			BrowserSyncService.rmFile(path.join(this.gameDir, this.config.export.texture)),
			BrowserSyncService.rmFile(path.join(this.gameDir, this.config.export.config)),
		])
			.then(() => this.onProjectDeleteComplete(projectName))
			.catch((err) => this.onProjectDeleteFail(projectName, err))
			.finally(() => this.panels.importPanel.enableInput())
	}

	private async onProjectDeleteComplete(projectName: string) {
		// TODO if font texture is embed into the texture atlas
		// then we need to remove it from there too

		await this.reloadProjectsList()
		this.applyProjectConfig(cloneDeep(DEFAULT_CONFIG))
		this.game.notifications.notyf.success(`<b>${projectName}</b> was deleted.`)
	}

	private onProjectDeleteFail(projectName: string, error: unknown): void {
		console.error(error)
		this.game.notifications.notyf.error(`Can't delete <b>${projectName}</b>!`)
	}

	private async onOpenTpProjectButtonClick(button: ButtonApi) {
		let tpProjectPath = this.config.export.texturePacker
		if (tpProjectPath) {
			await BrowserSyncService.open(tpProjectPath, { wait: true })
		}
	}

	private async onExportButtonClick(button: ButtonApi): Promise<void> {
		await this.normalizeExportPaths()

		this.panels.exportPanel.refresh()

		if (this.glyphs.length === 0) {
			this.game.notifications.warn(`Please set glyphs to export!`)
			return
		}

		let projectName = this.config.export.name
		if (!projectName) {
			this.game.notifications.warn(`Please set export name!`)
			return
		}

		let configPath = this.config.export.config
		if (!configPath) {
			this.game.notifications.warn(`Please set export path for the font's config!`)
			return
		}

		let texturePath = this.config.export.texture
		if (!texturePath) {
			this.game.notifications.warn(`Please set export path for the font's texture!`)
			return
		}

		this.panels.importPanel.disableInput()
		this.panels.exportPanel.disableInput()

		this.export(configPath, texturePath).finally(() => {
			this.panels.importPanel.enableInput()
			this.panels.exportPanel.enableInput()
		})
	}

	private async normalizeExportPaths(): Promise<void> {
		let fontsDir = this.fontsDir
		let { name, type, config, texture } = this.config.export

		if (config) {
			if (this.isAbsolutePath(config)) {
				config = await this.getRelativeToRootPath(config)
			}

			let configExtname = path.extname(config)
			if (!configExtname) {
				config = path.join(config, `${name}.${type}`)
			}
		} else {
			config = path.join(fontsDir, `${name}.${type}`)
			config = await this.getRelativeToRootPath(config)
		}

		if (texture) {
			if (this.isAbsolutePath(texture)) {
				texture = await this.getRelativeToRootPath(texture)
			}

			let textureExtname = path.extname(texture)
			if (!textureExtname) {
				texture = path.join(texture, `${name}.png`)
			}
		} else {
			texture = path.join(fontsDir, `${name}.png`)
			texture = await this.getRelativeToRootPath(texture)
		}

		this.config.export.config = config
		this.config.export.texture = texture
	}

	private async export(configPath: string, texturePath: string) {
		let texture = await this.createTexture()
		let font = await this.loadFont(this.config.font.family)
		let fontData = createBmfontData(this.config, this.glyphs, texture, font)

		if (this.config.export.texturePacker) {
			let atlasJson = await this.getAtlasDataPathFromTpConfig(this.config.export.texturePacker)
			if (atlasJson) {
				fontData.extra = {
					atlas: await this.getRelativeToRootPath(atlasJson),
					texture: texturePath,
					texturePacker: await this.getRelativeToRootPath(this.config.export.texturePacker),
				}
			}
		}

		let { width: textureW, height: textureH } = texture
		let { width: canvasW, height: canvasH } = this.game.canvas
		if (textureW > canvasW || textureH > canvasH) {
			let message = `Texture size is bigger than canvas size. Font texture will be cropped!`
			this.game.notifications.warn(message)
			console.warn(message, `[texture ${textureW}x${textureH}, canvas ${canvasW}x${canvasH}]`)
		}

		BrowserSyncService.saveBitmapFont({
			config: JSON.stringify(fontData, null, '\t'),
			configPath: path.join(this.gameDir, configPath),
			texture: texture.blob,
			texturePath: path.join(this.gameDir, texturePath),
			project: await this.getProjectConfigToExport(this.config),
		})
			.then((response) => this.onExportComplete(response))
			.catch((error) => this.onExportFail(error))
			.finally(() => {})
	}

	private async getProjectConfigToExport(config: BitmapFontProjectConfig): Promise<string> {
		let configCopy = cloneDeep(config)

		await this.adjustProjectConfigPaths(configCopy)

		return JSON.stringify(configCopy, null, '\t')
	}

	private async adjustProjectConfigPaths(config: BitmapFontProjectConfig): Promise<void> {
		let propertyPaths = ['import.project', 'import.custom', 'export.config', 'export.texture', 'export.texturePacker'] as const

		for await (const propertyPath of propertyPaths) {
			let filepath = get(config, propertyPath) as string
			if (filepath && this.isAbsolutePath(filepath)) {
				set(config, propertyPath, await this.getRelativeToRootPath(filepath))
			}
		}
	}

	public isAbsolutePath(filepath: string): boolean {
		if (path.isAbsolute(filepath)) {
			return true
		}

		// windows paths are like C:/ or D:\\
		return filepath.search(/[A-Z]:\\/g) === 0 || filepath.search(/[A-Z]:\//g) === 0
	}

	private async getRelativeToRootPath(filepath: string): Promise<string> {
		let response = await BrowserSyncService.pathRelative(this.gameDir, filepath)
		let result = await response.json()
		return slash(result.result)
	}

	// TP config = TexturePacker XML config (.tps)
	private async getAtlasDataPathFromTpConfig(pathToTpConfig: string): Promise<string | undefined> {
		try {
			let response = await BrowserSyncService.readFile(pathToTpConfig)
			let text = await response.text() // TP config file is a XML file
			let dataFile = /<struct type="DataFile">((.|\n)*?)<\/struct>/.exec(text)[1]
			let filename = /<filename>(.*?)<\/filename>/.exec(dataFile)[1]
			let dirname = path.dirname(pathToTpConfig)

			return path.resolve(dirname, '..', filename)
		} catch (e) {
			return
		}
	}
	private async createTexture(): Promise<BitmapFontTexture> {
		let addTextureBorder = !!this.config.export.texturePacker
		let padding = addTextureBorder ? 1 : 0
		let { width, height } = this.getContentSize()
		let blob = await this.makeSnapshot(0, 0, width, height, padding)

		return { blob, width, height, padding: padding + 1 }
	}

	private getContentSize(): { width: number; height: number } {
		let width = Math.max(...this.glyphs.map((glyph) => glyph.x + glyph.displayWidth))
		let height = Math.max(...this.glyphs.map((glyph) => glyph.y + glyph.displayHeight))

		return {
			width: Math.ceil(width),
			height: Math.ceil(height),
		}
	}

	private makeSnapshot(x: number, y: number, contentWidth: number, contentHeight: number, padding = 0): Promise<Blob> {
		return new Promise((resolve, reject) => {
			this.beforeSnapshot(contentWidth, contentHeight, padding)

			this.renderer.once(Phaser.Renderer.Events.POST_RENDER, () => {
				let w = contentWidth + padding * 2 + 4
				let h = contentHeight + padding * 2 + 4
				let canvas = document.createElement('canvas')
				canvas.width = w
				canvas.height = h

				let context = canvas.getContext('2d')
				context.drawImage(this.game.canvas, x, y, w, h, x, y, w, h)

				this.afterSnapshot()

				canvas.toBlob((blob) => resolve(blob))
			})
		})
	}

	private beforeSnapshot(contentWidth: number, contentHeight: number, padding = 0): void {
		this.background.kill()
		this.previewBack.kill()
		this.preview?.kill()
		this.previewDebug.kill()

		if (padding > 0) {
			this.addGlyphsBorder(contentWidth, contentHeight, padding)
		}

		this.glyphsContainer.x = padding + 2
		this.glyphsContainer.y = padding + 2
	}

	private addGlyphsBorder(width: number, height: number, thickness: number) {
		if (this.glyphsBorder) {
			this.removeGlyphsBorder()
		}

		this.glyphsBorder = this.add.graphics({
			fillStyle: {
				color: 0xff0000,
			},
		})

		let fullWidth = thickness * 2 + width + 4
		let fullHeight = thickness * 2 + height + 4

		// left
		this.glyphsBorder.fillRect(0, 0, thickness, fullHeight)

		// top
		this.glyphsBorder.fillRect(0, 0, fullWidth, thickness)

		// right
		this.glyphsBorder.fillRect(thickness + width + 4, 0, thickness, fullHeight)

		// bottom
		this.glyphsBorder.fillRect(0, height + thickness + 4, fullWidth, thickness)
	}

	private afterSnapshot(): void {
		this.background.revive()
		this.previewBack.revive()
		this.preview?.revive()

		this.removeGlyphsBorder()

		this.glyphsContainer.x = 0
		this.glyphsContainer.y = 0

		if (this.config.preview.debug) {
			this.previewDebug.revive()
		}
	}

	private removeGlyphsBorder() {
		if (!this.glyphsBorder) {
			return
		}

		this.glyphsBorder.destroy()
		this.glyphsBorder = null
	}

	private async loadFont(name: string): Promise<Font> {
		let fontsCache = this.game.stash.get('fonts')
		if (fontsCache.has(name)) {
			return fontsCache.get(name)
		}

		if (!this.fontsList) {
			return Promise.reject('Fonts list is not loaded!')
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

		console.group('Bitmap font was exported! ✔')
		console.log(`Config: ${config}`)
		console.log(`Texture: ${texture}`)
		console.log(`Project: ${project}`)

		this.game.notifications.notyf.success(`<b>${this.config.export.name}</b> was exported!`).on(NotyfEvent.Click, () => BrowserSyncService.open(path.dirname(project.slice(6))))

		if (this.config.export.texturePacker) {
			let texturePacker = await this.resolveSymlink(this.config.export.texturePacker)
			if (texturePacker) {
				let { error } = await this.updateTexturePackerProject(texturePacker)
				if (error) {
					console.warn("Can't update Texture Packer project!\n", error)
					this.game.notifications.notyf.error(`Can't update Texture Packer project! ${error}`)
				} else {
					console.log(`Texture Packer Project: file:///${texturePacker}`)
					this.game.notifications.notyf.success(`<b>${path.basename(texturePacker)}</b> was exported!`)
				}
			}
		}

		if (!this.config.import.project) {
			await this.reloadProjectsList()
			this.config.import.project = project.slice('file://'.length)
			this.panels.importPanel.refresh()
		}

		console.groupEnd()
	}

	private onExportFail(error) {
		console.log(`Can't save bitmap font!`, error)
		this.game.notifications.notyf.error(error.message)
	}

	private async resolveSymlink(path: string): Promise<string> {
		let response = await BrowserSyncService.realPath(path)
		let result = await response.json()
		return slash(result.result)
	}

	private async updateTexturePackerProject(texturePackerProjectPath: string): Promise<{ error? }> {
		try {
			let texturePackerExePath = await this.getTexturePackerExePath()
			if (!texturePackerExePath) {
				throw 'Path to the TexturePacker executable is not set!'
			}

			let command = `"${slash(texturePackerExePath)}" ${texturePackerProjectPath}`
			let response = await BrowserSyncService.command(command, { shell: true })
			let result = (await response.json()) as { success: boolean; error?; data? }
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
		let path = this.game.store.getValue('texture_packer_exe')
		if (path) {
			return path
		}

		path = await (this.getDefaultTexturePackerExePath() || this.promptTexturePackerExePath())

		if (path) {
			this.game.store.saveValue('texture_packer_exe', slash(path))
		}

		return path
	}

	private async getDefaultTexturePackerExePath(): Promise<string | undefined> {
		let defaultPath = 'TexturePacker'
		let response = await BrowserSyncService.command(`${defaultPath} --version`)
		let json = (await response.json()) as ExecaReturnValue
		if (json.failed) {
			return
		}

		return defaultPath
	}

	private promptTexturePackerExePath(): Promise<string> {
		return new Promise((resolve, reject) => {
			let panel = new GetTexturePackerPathPanel(this, { path: '' })
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

	private reloadProjectsList(): Promise<unknown> {
		if (!this.fontsDir) {
			console.warn("Can't load projects list because fonts directory is not set!")
			return
		}

		let { reloadProjectsButton, projectInput } = this.panels.importPanel
		projectInput.disabled = true
		reloadProjectsButton.disabled = true

		return BrowserSyncService.projects(this.fontsDir)
			.then((response) => response.json())
			.then((projects) => {
				this.projectsList = projects
				this.updateProjectsList(this.projectsList)
			})
			.catch((error) => {
				console.warn("Can't load projects list!", error)
			})
			.finally(() => {
				projectInput.disabled = false
				reloadProjectsButton.disabled = false
			})
	}

	private async doestProjectExist(projectPath: string): Promise<boolean> {
		try {
			let response = await BrowserSyncService.stat(projectPath)
			let stats = (await response.json()).result
			return stats && stats.isFile
		} catch (e) {
			return false
		}
	}

	private loadProject(projectFilepath: string): Promise<unknown> {
		this.panels.importPanel.disableInput()
		this.panels.exportPanel.disableInput()

		return BrowserSyncService.readFile(projectFilepath)
			.then((response) => response.json())
			.then(async (result: BitmapFontProjectConfig) => {
				result.import.project = slash(projectFilepath)

				if (result.export.texturePacker) {
					result.export.texturePacker = slash(path.join(this.gameDir, result.export.texturePacker))
				}

				await this.loadFont(result.font.family)

				this.applyProjectConfig(result)
			})
			.catch((error) => {
				console.log(`Can't load bitmap font project!`, error)
			})
			.finally(() => {
				this.panels.importPanel.enableInput()
				this.panels.exportPanel.enableInput()
			})
	}

	private applyProjectConfig(config: BitmapFontProjectConfig): void {
		merge(this.config, config)

		this.panels.contentPanel.refresh()
		this.panels.fontPanel.refresh()
		this.panels.paddingsPanel.refresh()
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

		if (property === 'content') {
			this.preview.setText(config.content)
		}

		if (property === 'align') {
			this.preview.align = config.align
			this.preview['_dirty'] = true
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

		this.glyphsCache.clear()

		this.panels.destroy()
		this.panels = null
	}
}
