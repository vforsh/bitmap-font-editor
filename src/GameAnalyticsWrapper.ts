import GameAnalytics from "gameanalytics"
import { isWasmSupported } from "./robowhale/utils/device/is-wasm-supported"
import { pickBy } from "lodash-es"
import { inIframe } from "./robowhale/utils/in-iframe"
import { getDeviceMemory } from "./robowhale/utils/device/get-device-memory"
import ScaleModes = Phaser.Scale.ScaleModes
import WebGLRenderer = Phaser.Renderer.WebGL.WebGLRenderer

export enum ResourceCurrency {
	COINS = "coins",
	BOOSTERS = "boosters",
	PREGAME_BOOSTERS = "pregameBoosters",
}

export enum ResourceItemType {
	COIN = "coin",
	STRIPES = "stripes",
	BOMB = "bomb",
	SUPER_SPHERE = "super_sphere",
	UNDO = "undo",
	GLOVE = "glove",
	ROLLING_PIN = "rolling_pin",
	LOLLIPOP = "lollipop",
}

export enum EGAAdAction {
	Clicked = 1,
	Show = 2,
	FailedShow = 3,
	RewardReceived = 4
}

export enum EGAAdType {
	Video = 1,
	RewardedVideo = 2,
	Playable = 3,
	Interstitial = 4,
	OfferWall = 5,
	Banner = 6
}

export enum EGAAdError {
	Undefined = 0,
	Unknown = 1,
	Offline = 2,
	NoFill = 3,
	InternalError = 4,
	InvalidRequest = 5,
	UnableToPrecache = 6
}

export enum EGAErrorSeverity {
	Undefined = 0,
	Debug = 1,
	Info = 2,
	Warning = 3,
	Error = 4,
	Critical = 5
}

enum EGAResourceFlowType {
	Source = 1,
	Sink = 2
}

enum EGAProgressionStatus {
	Start = 1,
	Complete = 2,
	Fail = 3
}

export enum RemoteConfigKey {
	SKIP_FIRST_INTERSTITIAL = "skip_1st_ad",
	LIVES_NUM = "lives_num",
	MOVES_DELTA = "moves_delta",
}

export const REMOTE_CONFIG: Record<RemoteConfigKey, string> = {
	[RemoteConfigKey.SKIP_FIRST_INTERSTITIAL]: "true",
	[RemoteConfigKey.LIVES_NUM]: "5",
	[RemoteConfigKey.MOVES_DELTA]: "0",
}

export class GameAnalyticsWrapper extends Phaser.Events.EventEmitter {
	
	private game: Phaser.Game
	private isEnabled: boolean = false
	private loadingTimes: Record<string, number>
	private ga: typeof GameAnalytics
	
	constructor(game: Phaser.Game) {
		super()
		
		this.game = game
		
		if (typeof gameanalytics === "undefined") {
			this.isEnabled = false
			return
		}
		
		this.ga = gameanalytics.GameAnalytics
		this.isEnabled = true
		this.loadingTimes = {}
		this.setCustomDimensions()
		this.checkRemoteConfigKeys()
	}
	
	private setCustomDimensions() {
		this.ga.setCustomDimension01(window.game.config.publisher)
		this.ga.setCustomDimension02(this.game.rendererType)
		// custom dimention #3 is adblocks status, it is set in GdSdkWrapper
	}
	
	private checkRemoteConfigKeys() {
		Object.values(RemoteConfigKey).forEach((key) => {
			let length = key.length
			if (length < 1 || length > 12) {
				console.warn(`Invalid remote config key "${key}". Length should be 1 to 12, current is ${length}!`)
			}
		})
	}
	
	public sendLevelStart(level: number): void {
		this.sendProgressionEvent(EGAProgressionStatus.Start, level)
	}
	
	public sendLevelComplete(level: number, movesNum: number): void {
		this.sendProgressionEvent(EGAProgressionStatus.Complete, level, movesNum)
	}
	
	public sendLevelFail(level: number, score: number): void {
		this.sendProgressionEvent(EGAProgressionStatus.Fail, level, score)
	}
	
	private sendProgressionEvent(type: EGAProgressionStatus, level: number, score?: number): void {
		if (this.isEnabled === false) {
			return
		}
		
		let levelKey: string = "level_" + level.toString().padStart(3, "0")
		this.ga.addProgressionEvent(type, levelKey, "", "", score)
	}
	
	public sendAdEvent(action: EGAAdAction, type: EGAAdType, placement?: string, adProvider?: string): void {
		if (this.isEnabled === false) {
			return
		}
		
		this.ga.addAdEvent(action, type, adProvider, placement)
	}
	
	public sendAdFailedEvent(type: EGAAdType, placement?: string, adProvider?: string, reason?: EGAAdError): void {
		if (this.isEnabled === false) {
			return
		}
		
		if (typeof reason === "undefined") {
			this.ga.addAdEvent(EGAAdAction.FailedShow, type, adProvider, placement)
		} else {
			this.ga.addAdEventWithNoAdReason(EGAAdAction.FailedShow, type, adProvider, placement, reason)
		}
	}
	
	public sendBusinessEvent(currency?: string, amount?: number, itemType?: string, itemId?: string, cartType?: string): void {
		if (this.isEnabled === false) {
			return
		}
		
		this.ga.addBusinessEvent(currency, amount, itemType, itemId, cartType)
	}
	
	public sendLoadingEvent(place: string, type: "start" | "complete"): void {
		if (this.isEnabled === false) {
			return
		}
		
		if (type === "start") {
			this.loadingTimes[place] = Date.now()
			this.ga.addDesignEvent(`Loading:${place}:${type}`)
		}
		
		if (type === "complete") {
			let durationMs: number = Date.now() - this.loadingTimes[place]
			let duration: number = Phaser.Math.RoundTo(durationMs / 1000, -1)
			this.ga.addDesignEvent(`Loading:${place}:${type}`, duration)
		}
	}
	
	public sendDesignEvent(event: string, value?: any) {
		if (this.isEnabled === false) {
			return
		}
		
		this.ga.addDesignEvent(event, value)
	}
	
	public sendError(message: string, severity: EGAErrorSeverity = EGAErrorSeverity.Error): void {
		if (this.isEnabled === false) {
			return
		}
		
		this.ga.addErrorEvent(severity, message)
	}
	
	public sendBrowser() {
		if (this.isEnabled === false) {
			return
		}
		
		let browsers = ["chrome", "edge", "firefox", "ie", "mobileSafari", "opera", "safari", "silk", "trident", "other"]
		let browser = this.getCurrentBrowser(browsers)
		this.sendDesignEvent(`Browser:${browser}`)
	}
	
	private getCurrentBrowser(browsers: string[]) {
		let browser: string
		
		let deviceInfo = this.game.device
		if (deviceInfo.os.android && deviceInfo.browser.chrome) {
			browser = "chrome-android"
		} else {
			browser = browsers.find(browser => deviceInfo.browser[browser] === true) ?? "other"
		}
		
		if (browser === "mobileSafari") {
			browser = "safari-mobile"
		}
		
		return browser
	}
	
	public sendAvifStatus(avif: boolean) {
		let event = avif ? "avif:supported" : "avif:not_supported"
		this.sendDesignEvent(event)
	}
	
	public sendWebpStatus(webp: boolean) {
		let event = webp ? "webp:supported" : "webp:not_supported"
		this.sendDesignEvent(event)
	}
	
	public sendDesktopScreenResolution() {
		let isDesktop = this.game.scale.scaleMode === ScaleModes.FIT
		if (isDesktop === false) {
			return
		}
		
		try {
			let { width, height } = screen
			if (width > 0 && height > 0) {
				this.sendDesignEvent(`Screen:Resolution:${width}x${height}`)
			}
		} catch (error) {
		}
	}
	
	public sendWebWorkerStatus() {
		let isSupported = typeof Worker === "function"
		let event = isSupported ? "WebWorker:supported" : "WebWorker:not_supported"
		this.sendDesignEvent(event)
	}
	
	public sendServiceWorkerStatus() {
		let isEnabled = "serviceWorker" in navigator
		let event = isEnabled ? "ServiceWorker:supported" : "ServiceWorker:not_supported"
		this.sendDesignEvent(event)
	}
	
	public sendDeviceMemory() {
		let value = getDeviceMemory()
		let event = `DeviceMemory:${value ?? "Unknown"}`
		this.sendDesignEvent(event)
	}
	
	public sendWebAssemblyStatus() {
		let isSupported = isWasmSupported()
		let event = isSupported ? "WebAssembly:supported" : "WebAssembly:not_supported"
		this.sendDesignEvent(event)
	}
	
	public sendWebGlParams() {
		let renderer = this.game.renderer
		if (!(renderer instanceof WebGLRenderer)) {
			return
		}
		
		this.sendDesignEvent(`WebGL:MaxTextures:${renderer.maxTextures}`)
		this.sendDesignEvent(`WebGL:TextureSize:${renderer.getMaxTextureSize()}`)
		this.sendTextureCompressionInfo(renderer.gl)
	}
	
	private sendTextureCompressionInfo(gl: WebGLRenderingContext) {
		let extString = "WEBGL_compressed_texture_"
		let wkExtString = "WEBKIT_" + extString
		let getExtension = (format: string) => gl.getExtension(extString + format) || gl.getExtension(wkExtString + format)
		
		let formats = {
			ETC1: getExtension("etc1"),
			PVRTC: getExtension("pvrtc"),
			S3TC: getExtension("s3tc"),
			ASTC: getExtension("astc"),
		}
		
		let supportedFormats = pickBy(formats, value => value !== null)
		let isAnyFormatSupported = Object.keys(supportedFormats).length > 0
		if (isAnyFormatSupported === false) {
			this.sendDesignEvent(`WebGL:TextureCompression:not_supported`)
			return
		}
		
		Object.keys(supportedFormats).forEach((key) => {
			this.sendDesignEvent(`WebGL:TextureCompression:${key}`)
		})
	}
	
	public sendReferrer() {
		let referrer = this.getReferrer() || "unknown"
		
		let index = referrer.indexOf("?")
		if (index > -1) {
			referrer = referrer.slice(0, index)
		}
		
		let protocolIndex = referrer.indexOf("//")
		if (protocolIndex > -1) {
			referrer = referrer.slice(protocolIndex + 2)
		}
		
		referrer = referrer.replace(new RegExp("(:|\/|\#)", "g"), "_")
		
		let maxLength = 64
		if (referrer.length > maxLength) {
			referrer = referrer.slice(0, maxLength + 1)
		}
		
		this.sendDesignEvent(`Referrer:${referrer}`)
	}
	
	private getReferrer(): string {
		if (inIframe()) {
			return document.referrer
		}
		
		return location.host + location.pathname
	}
	
	public getRemoteConfigValue(key: RemoteConfigKey, defaultValue?: string): string {
		defaultValue ??= REMOTE_CONFIG[key]
		
		if (this.isEnabled === false) {
			return defaultValue
		}
		
		return this.ga.getRemoteConfigsValueAsString(key, defaultValue)
	}
	
	public loadRemoteConfig(): Promise<void> {
		if (this.isEnabled === false) {
			return Promise.reject()
		}
		
		if (this.ga.isRemoteConfigsReady()) {
			this.onRemoteConfigsReady()
			return Promise.resolve()
		}
		
		return new Promise((resolve) => {
			this.ga.addRemoteConfigsListener({
				onRemoteConfigsUpdated: () => {
					this.onRemoteConfigsReady()
					resolve()
				},
			})
		})
	}
	
	private onRemoteConfigsReady(): void {
		console.groupCollapsed("Remote config")
		console.log("Config:", this.ga.getRemoteConfigsContentAsString())
		console.log("AB Testing Id:", this.ga.getABTestingId())
		console.log("AB Variant Id:", this.ga.getABTestingVariantId())
		console.groupEnd()
	}
}
