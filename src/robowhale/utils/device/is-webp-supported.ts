import { UrlParams } from "../../../UrlParams"
import { GameEnvironment } from "../../../GameEnvironment"

export async function isWebpSupported(localStorage?: Storage): Promise<boolean> {
	let disableWebP = UrlParams.getBool("noWebp")
	if (disableWebP) {
		return false
	}
	
	let isDevelop = window.environment === GameEnvironment.DEVELOP
	if (isDevelop) {
		return false
	}
	
	let localStorageKey = "robowhale__webp"
	if (localStorage?.getItem(localStorageKey) === "true") {
		return true
	}
	
	let isSupported = await doCheckWebpAsync()
	if (isSupported) {
		localStorage?.setItem(localStorageKey, "true")
	}
	
	return isSupported
}

function doCheckWebp(): boolean {
	let match = navigator.userAgent.match(/(Edge|Firefox)\/(\d+)\.(\d*)/)
	if (match && match[1] === "Firefox" && +match[2] >= 65) {
		return true
	}
	
	// https://web.archive.org/web/20190626051700/https://developer.microsoft.com/en-us/microsoft-edge/platform/issues/19618851/
	if (match && match[1] === "Edge" && +match[2] === 18 && +match[3] === 17763) {
		return false
	}
	
	let canvas = Phaser.Display.Canvas.CanvasPool.create(document)
	let supported: boolean = canvas.toDataURL
		? canvas.toDataURL("image/webp").indexOf("data:image/webp") == 0
		: false
	
	Phaser.Display.Canvas.CanvasPool.remove(canvas)
	
	return supported
}

// https://developers.google.com/speed/webp/faq#how_can_i_detect_browser_support_for_webp
function doCheckWebpAsync(): Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		let img = new Image()
		
		img.onload = function() {
			let isSupported = (img.width > 0) && (img.height > 0)
			resolve(isSupported)
		}
		
		img.onerror = function() {
			resolve(false)
		}
		
		img.src = "data:image/webp;base64,UklGRkoAAABXRUJQVlA4WAoAAAAQAAAAAAAAAAAAQUxQSAwAAAARBxAR/Q9ERP8DAABWUDggGAAAABQBAJ0BKgEAAQAAAP4AAA3AAP7mtQAAAA=="
	})
}
