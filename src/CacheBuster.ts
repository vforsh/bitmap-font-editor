import { GameEnvironment } from "./GameEnvironment"

export type CacheBustingMethod = "query-strings" | "filenames"

export let useCacheBusting = false

export function initCacheBusters() {
	if (window.environment !== GameEnvironment.PRODUCTION) {
		return
	}
	
	if (typeof cacheBusters === "undefined") {
		console.warn("Cache busting data is missing!")
		return
	}
	
	if (typeof cacheBustingMethod === "undefined") {
		console.warn("Cache busting method is not set!")
		return
	}
	
	useCacheBusting = true
	patchLoader()
}

export function patchLoader() {
	let transformUrl = (file: Phaser.Loader.File) => {
		if (typeof file.url === "string") {
			file.url = getCacheBustingUrl(file.url)
		}
	}
	
	let methodName = Phaser.Utils.String.UUID()
	let loaderProto = Phaser.Loader.LoaderPlugin.prototype
	loaderProto[methodName] = loaderProto.addFile
	loaderProto.addFile = function(files: Phaser.Loader.File | Phaser.Loader.File[]) {
		if (Array.isArray(files)) {
			files.forEach(file => transformUrl(file))
		} else {
			transformUrl(files)
		}
		
		return this[methodName](files)
	}
}

export function getCacheBustingUrl(originalUrl: string): string {
	if (!useCacheBusting) {
		return originalUrl
	}
	
	let hash = cacheBusters[originalUrl]
	if (hash) {
		return transformUrl(originalUrl, hash)
	}
	
	return originalUrl
}

function transformUrl(originalUrl: string, hash: string): string {
	if (cacheBustingMethod === "filenames") {
		return transformFilename(originalUrl, hash)
	} else {
		return `${originalUrl}?v=${hash}`
	}
}

function transformFilename(originalUrl: string, hash: string) {
	let dotIndex = originalUrl.indexOf(".")
	let firstPart = originalUrl.slice(0, dotIndex)
	let lastPart = originalUrl.slice(dotIndex)
	
	return `${firstPart}.${hash}${lastPart}`
}
