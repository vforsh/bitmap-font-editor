import { ButtonApi, InputBindingApi, ListParamsOptions } from '@tweakpane/core'
import path from 'path-browserify'
import slash from 'slash'
import { BitmapFontProjectConfig } from '../BitmapFontProjectConfig'
import { EditorPanel, EditorPanelEvent } from './EditorPanel'

export type ExportPanelConfig = BitmapFontProjectConfig['export']

export class ExportPanel extends EditorPanel {
	public config: ExportPanelConfig
	public texturePackerInput: InputBindingApi<unknown, string>
	public openTpProjectButton: ButtonApi
	public exportButton: ButtonApi

	constructor(scene: Phaser.Scene, container: HTMLElement, config: ExportPanelConfig) {
		super(scene, container, 'Export')

		this.config = config

		this.panel.addInput(this.config, 'name')
		this.panel.addInput(this.config, 'type', { options: this.createExportTypeOptions() })
		this.panel.addSeparator()

		this.panel
			.addInput(this.config, 'config')
			.on('change', (event) => {
				this.config[event.presetKey] = slash(event.value)
				this.refresh()
			})
			.controller_.view.element.addEventListener('dblclick', () => {
				this.emit(EditorPanelEvent.OPEN_DIRECTORY, path.dirname(this.config.config))
			})

		this.panel
			.addInput(this.config, 'texture')
			.on('change', (event) => {
				this.config[event.presetKey] = slash(event.value)
				this.refresh()
			})
			.controller_.view.element.addEventListener('dblclick', () => {
				this.emit(EditorPanelEvent.OPEN_DIRECTORY, path.dirname(this.config.texture))
			})

		let atlases = this.config.texturePacker ? [this.config.texturePacker] : []
		this.texturePackerInput = this.createTexturePackerInput(atlases)

		this.openTpProjectButton = this.panel.addButton({ title: 'Open TP project' })

		this.panel.addSeparator()

		this.exportButton = this.panel.addButton({ title: 'Export' })
	}

	private createExportTypeOptions(): ListParamsOptions<string> {
		return [
			{ text: 'json', value: 'json' },
			{ text: 'xml', value: 'xml' },
		]
	}

	private createTexturePackerInput(atlases: string[]): InputBindingApi<unknown, string> {
		let input = this.panel.addInput(this.config, 'texturePacker', {
			index: 5,
			options: this.createAtlasesListOptions(atlases),
		})

		input.controller_.view.element.addEventListener('dblclick', () => {
			if (this.config.texturePacker) {
				this.emit(EditorPanelEvent.OPEN_DIRECTORY, path.dirname(this.config.texturePacker))
			}
		})

		return input
	}

	private createAtlasesListOptions(atlases: string[]): ListParamsOptions<string> {
		let options = atlases.map((filepath) => ({
			text: path.basename(filepath, '.tps'),
			value: filepath,
		}))

		options.unshift({
			text: '-',
			value: '',
		})

		return options
	}

	public updateAtlasesList(atlases: string[]): void {
		this.texturePackerInput.dispose()
		this.texturePackerInput = this.createTexturePackerInput(atlases)
	}
}
