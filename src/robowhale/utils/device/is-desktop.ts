export function isDesktop(): boolean {
	let ua = navigator.userAgent
	let OS = {
		android: false,
		chromeOS: false,
		cordova: false,
		crosswalk: false,
		desktop: false,
		ejecta: false,
		electron: false,
		iOS: false,
		iOSVersion: 0,
		iPad: false,
		iPhone: false,
		kindle: false,
		linux: false,
		macOS: false,
		node: false,
		nodeWebkit: false,
		pixelRatio: 1,
		webApp: false,
		windows: false,
		windowsPhone: false,
	}

	if (/Windows/.test(ua)) {
		OS.windows = true
	} else if (/Mac OS/.test(ua) && !/like Mac OS/.test(ua)) {
		OS.macOS = true
	} else if (/Android/.test(ua)) {
		OS.android = true
	} else if (/Linux/.test(ua)) {
		OS.linux = true
	} else if (/iP[ao]d|iPhone/i.test(ua)) {
		OS.iOS = true

		navigator.appVersion.match(/OS (\d+)/)

		OS.iOSVersion = parseInt(RegExp.$1, 10)

		OS.iPhone = ua.toLowerCase().indexOf('iphone') !== -1
		OS.iPad = ua.toLowerCase().indexOf('ipad') !== -1
	} else if (/Kindle/.test(ua) || /\bKF[A-Z][A-Z]+/.test(ua) || /Silk.*Mobile Safari/.test(ua)) {
		OS.kindle = true

		// This will NOT detect early generations of Kindle Fire, I think there is no reliable way...
		// E.g. "Mozilla/5.0 (Macintosh; U; Intel Mac OS X 10_6_3; en-us; Silk/1.1.0-80) AppleWebKit/533.16 (KHTML, like Gecko) Version/5.0 Safari/533.16 Silk-Accelerated=true"
	} else if (/CrOS/.test(ua)) {
		OS.chromeOS = true
	}

	if (/Windows Phone/i.test(ua) || /IEMobile/i.test(ua)) {
		OS.android = false
		OS.iOS = false
		OS.macOS = false
		OS.windows = true
		OS.windowsPhone = true
	}

	let silk = /Silk/.test(ua)

	if (OS.windows || OS.macOS || (OS.linux && !silk) || OS.chromeOS) {
		OS.desktop = true
	}

	//  Windows Phone / Table reset
	if (OS.windowsPhone || (/Windows NT/i.test(ua) && /Touch/i.test(ua))) {
		OS.desktop = false
	}

	// iPad reset
	if (OS.macOS && navigator.maxTouchPoints && navigator.maxTouchPoints > 2) {
		OS.desktop = false
	}

	return OS.desktop
}
