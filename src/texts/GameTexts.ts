import EventEmitter = Phaser.Events.EventEmitter
import { UrlParams } from "../UrlParams"
import { convertLanguageCodeToGameLanguage } from "./LanguageUtil"
import { FontFamily, FontWeight, WebFonts } from "../GameFonts"

export enum GameTextsEvent {
	TEXTS_READY = "__TEXTS_READY",
	LANGUAGE_CHANGE = "__LANGUAGE_CHANGE",
}

export class GameTexts extends EventEmitter {
	
	get language(): string {
		return this._language
	}
	
	private game: Phaser.Game
	private _language: string
	private allTexts: Object
	public allLanguages: string[]
	public texts: texts.En
	
	constructor(_game: Phaser.Game) {
		super()
		
		this.game = _game
		this.allTexts = this.game.cache.json.get("texts")
		this.allLanguages = this.getSupportedLanguages()
		this._language = this.detectLanguage()
		this.texts = this.allTexts[this._language]
		this.setSentryLanguageTag()
		this.setDocumentLanguage()
		this.updateDefaultFont()
		this.sendLanguagesToAnalytics()
		
		console.info(`Language: ${this._language}`)
		
		// console.groupCollapsed("Texts")
		// console.log(this.texts)
		// console.groupEnd()
	}
	
	private getSupportedLanguages(): string[] {
		let keys = Object.keys(this.allTexts)
		
		return keys.filter((language) => {
			let value = this.allTexts[language]
			return Object.keys(value).length > 0
		})
	}
	
	private detectLanguage(): string {
		return (
			this.getLanguageFromUrlParam() ||
			this.getSavedLanguage() ||
			this.getLanguageFromBrowser() ||
			window.game.config.default_language
		)
	}
	
	private getLanguageFromUrlParam(): string | null {
		let language = UrlParams.get("language") || UrlParams.get("lang")
		if (language && this.isLanguageSupported(language)) {
			return language
		}
		
		return null
	}
	
	private getSavedLanguage(): string | null {
		let language = this.game.store.getValue("language")
		if (language && this.isLanguageSupported(language)) {
			return language
		}
		
		return null
	}
	
	private getLanguageFromBrowser(): string | null {
		let language = convertLanguageCodeToGameLanguage(navigator.language)
		if (language && this.isLanguageSupported(language)) {
			return language
		}
		
		if (typeof navigator.languages !== "undefined") {
			let languages = navigator.languages.map(code => convertLanguageCodeToGameLanguage(code))
			let supported = languages.find(language => this.isLanguageSupported(language))
			if (supported) {
				return supported
			}
		}
		
		return null
	}
	
	private isLanguageSupported(language: string): boolean {
		return this.allLanguages.includes(language)
	}
	
	public injectTextsIntoScenes(): void {
		this.game.scene.getScenes(false).forEach((scene) => {
			scene["texts"] = this.texts
		})
	}
	
	public setLanguage(language: string): boolean {
		if (!this.isLanguageSupported(language)) {
			console.warn(`Language ${language} is not supported!`)
			return false
		}
		
		this._language = language
		this.texts = this.allTexts[language]
		this.injectTextsIntoScenes()
		this.setSentryLanguageTag()
		this.setDocumentLanguage()
		this.updateDefaultFont()
		this.emit(GameTextsEvent.LANGUAGE_CHANGE, language)
		this.game.events.emit(GameTextsEvent.LANGUAGE_CHANGE, this)
		
		console.log("Current language:", this._language)
		
		return true
	}
	
	private setSentryLanguageTag(): void {
		this.game.sentry.setTag("language", this._language)
	}
	
	private setDocumentLanguage() {
		document.documentElement.lang = this._language
	}
	
	private updateDefaultFont() {
		if (this._language === "jp") {
			WebFonts.DEFAULT_FAMILY = FontFamily.SANS_SERIF
			WebFonts.DEFAULT_WEIGHT = FontWeight.BOLD
		} else {
			WebFonts.DEFAULT_FAMILY = FontFamily.POETSEN
			WebFonts.DEFAULT_WEIGHT = FontWeight.NORMAL
		}
	}
	
	private sendLanguagesToAnalytics() {
		this.game.analytics?.sendDesignEvent(`Language:browser:${navigator.language}`)
		this.game.analytics?.sendDesignEvent(`Language:game:${this._language}`)
	}
}
