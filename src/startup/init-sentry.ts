import { UrlParams } from "../UrlParams"
import { GameEnvironment } from "../GameEnvironment"
import * as Sentry from "@sentry/browser"
import { Event, EventHint } from "@sentry/types/dist/event"
import { Dsn } from "@sentry/types/dist/"
import { getDeviceMemory } from "../robowhale/utils/device/get-device-memory"

let gaDisabledWasSent = false

const ignoredBreadcrumbUrls = [
	"gameanalytics.com",
	"adnxs.com",
	"headerlift.com",
	"360yield.com",
	"pubmatic.com",
	"doubleclick.net",
	"smartadserver.com",
	"criteo.com",
	"id5-sync.com",
	"msgrt.gamedistribution.com",
	"tracker.gamedock.io",
]

export function initSentry() {
	let forceSentry = UrlParams.getBool("sentry")
	if (forceSentry === false && window.environment === GameEnvironment.DEVELOP) {
		return
	}
	
	Sentry.init({
		dsn: "https://8155c748f4794b15b065314c354ed274@o122971.ingest.sentry.io/5892497",
		environment: window.environment,
		release: window.game.config.build_version.toString(),
		tracesSampleRate: 1.0, // We recommend adjusting this value in production
		ignoreErrors: [
			"freed script",
			"out of memory",
			"Blocked a restricted frame",
			"NS_ERROR_NOT_INITIALIZED",
			"Non-Error promise rejection captured",
			"Permission denied to access property",
			"An attempt was made to use an object",
			"Failed to fetch",
		],
		denyUrls: [
			/adnxs\.com/,
			/improvedigital\.com/,
			/imasdk\.googleapis\.com/,
			/innovid\.com/,
		],
		beforeBreadcrumb,
		beforeSend,
	})
	
	Sentry.setTags({
		buildTime: window.game.config.build_time,
		publisher: window.game.config.publisher,
		browserLanguage: navigator.language,
		webWorker: typeof Worker === "function",
		serviceWorker: "serviceWorker" in navigator,
		engine: "Phaser",
		"engine.version": Phaser.VERSION,
		"device.memory": getDeviceMemory() ?? "unknown",
	})
	
	addSnapshotsProcessor()
	addJsonProcessor()
}

function beforeBreadcrumb(breadcrumb: Sentry.Breadcrumb, hint?: Sentry.BreadcrumbHint): Sentry.Breadcrumb | null {
	if (breadcrumb.category === "console" && breadcrumb.level === "warning") {
		delete breadcrumb.data
	}
	
	if (breadcrumb.message?.includes("https://phaser.io")) {
		return null
	}
	
	if (breadcrumb.category === "console" && breadcrumb.level === "warning") {
		let message = breadcrumb.message
		if (message?.startsWith("Warning/GameAnalytics: Event queue: Failed to send events to collector")) {
			return null
		}
		
		if (message?.includes("Warning/GameAnalytics") && message?.includes("SDK is disabled")) {
			if (gaDisabledWasSent === true) {
				return null
			}
			
			gaDisabledWasSent = true
		}
	}
	
	if (breadcrumb.category === "xhr" || breadcrumb.category === "fetch") {
		let url = breadcrumb.data?.url
		if (url) {
			let shouldBeIgnored = ignoredBreadcrumbUrls.some(ignoredUrl => url.includes(ignoredUrl))
			if (shouldBeIgnored) {
				return null
			}
		}
		
		if (breadcrumb.category === "fetch" && typeof url === "string" && url.startsWith("data:image")) {
			return null
		}
		
		if (breadcrumb.category === "xhr" && typeof url === "string") {
			let data = breadcrumb.data
			if (data && data.status_code === 200 && url.match(/^(assets\/)|(css\/)|(js\/)/g)) {
				return null
			}
		}
		
		return breadcrumb
	}
	
	return breadcrumb.category === "ui.click" ? null : breadcrumb
}

function beforeSend(event: Event, hint?: EventHint): PromiseLike<Event | null> | Event | null {
	let exception = event.exception
	if (!exception) {
		return event
	}
	
	let regexs = [
		/game(\.[a-z0-9]{10})?\.js/g,
		/game(\.[a-z0-9]{10})?\.min\.js/g,
		/vendor\.min(\.[a-z0-9]{10})?\.js/g,
		/tweakpane\.min(\.[a-z0-9]{10})?\.js/g,
	]
	
	let isValidException = event.exception.values.some((exception) => {
		let stacktrace = exception.stacktrace
		let hasStacktrace = typeof stacktrace !== "undefined"
		if (hasStacktrace === false) {
			return false
		}
		
		let frames = stacktrace.frames
		if (!frames || frames.length === 0) {
			return false
		}
		
		return frames.some((frame) => {
			return regexs.some(regex => frame.filename.match(regex))
		})
	})
	
	return isValidException ? event : null
}

function addSnapshotsProcessor() {
	Sentry.addGlobalEventProcessor((event: Event, hint?: EventHint) => {
		try {
			let key = "snapshot"
			
			if (!event.extra || !event.extra[key]) {
				return event
			}
			
			let snapshotBlob = event.extra[key] as Blob
			if (isBlob(snapshotBlob) === false) {
				console.warn("Snapshot should be a Blob!", snapshotBlob)
				return event
			}
			
			let formData = convertScreenshotBlobToFormData(snapshotBlob)
			
			upload(event.event_id, formData, "snapshot")
			
			delete event.extra[key]
			
			return event
		} catch (ex) {
			console.error(ex)
		}
	})
}

function addJsonProcessor() {
	Sentry.addGlobalEventProcessor((event: Event, hint?: EventHint) => {
		try {
			let key = "json"
			
			if (!event.extra || !event.extra[key]) {
				return event
			}
			
			let json = event.extra[key] as string
			if (typeof json !== "string") {
				console.warn("json should be a string!", json)
				return event
			}
			
			let formData = convertStringToJsonFile(json)
			
			upload(event.event_id, formData, "json")
			
			delete event.extra[key]
			
			return event
		} catch (ex) {
			console.error(ex)
		}
	})
}

function isBlob(value: any): value is Blob {
	if (typeof Blob === "undefined") {
		return false
	}
	
	return value instanceof Blob || Object.prototype.toString.call(value) === "[object Blob]"
}

function getAttachmentUrlFromDsn(dsn: Dsn, eventId: string) {
	const { host, path, projectId, port, protocol, user } = dsn
	return `${protocol}://${host}${port !== "" ? `:${port}` : ""}${
		path !== "" ? `/${path}` : ""
	}/api/${projectId}/events/${eventId}/attachments/?sentry_key=${user}&sentry_version=7&sentry_client=custom-javascript`
}

function convertScreenshotBlobToFormData(blob: Blob): FormData {
	let format = blob.type === "image/jpeg" ? "jpg" : "png"
	let formData = new FormData()
	formData.append("screenshot", blob, `screenshot.${format}`)
	
	return formData
}

function convertStringToJsonFile(value: string): FormData {
	let blob = new Blob([value], { type: "application/json" })
	let formData = new FormData()
	formData.append("data", blob, `data.json`)
	
	return formData
}

function upload(eventId: string, formData: FormData, key?: string) {
	let client = Sentry.getCurrentHub().getClient()
	let endpoint = getAttachmentUrlFromDsn(client.getDsn(), eventId)
	fetch(endpoint, {
		method: "POST",
		body: formData,
	})
		.then((response) => {
			let isSuccess = response.status >= 200 && response.status < 300
			if (isSuccess) {
				console.log("[Sentry] Upload complete!", key)
			} else {
				console.log("[Sentry] Upload failed!", response.status, response.statusText)
			}
		})
		.catch((error) => {
			console.error("[Sentry] Upload failed!", error)
		})
}
