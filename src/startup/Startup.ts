import { Main } from "../Main"
import { initSentry } from "./init-sentry"
import { initCacheBusters } from "../CacheBuster"
import { updateUrlQuery } from "../robowhale/utils/update-url-query"

window.addEventListener("load", () => {
	initCacheBusters()
	initSentry()
	
	createGame()
})

function createGame() {
	try {
		window["gameInstance"] = new Main()
	} catch (error) {
		if (isWebglError(error.toString())) {
			handleWebGlError(error.toString())
			return
		}
		
		throw error
	}
}

function isWebglError(error: string): boolean {
	let webgErrors = [
		"WebGL unsupported",
		"Framebuffer status",
		"Vertex Shader failed",
		"Fragment Shader failed",
		"Link Program failed",
	]
	
	return webgErrors.some(webglError => error.includes(webglError))
}

function handleWebGlError(error: string): void {
	let usingCanvasRenderer = window.location.search.includes("forceCanvas=1")
	if (usingCanvasRenderer === false) {
		location.replace(updateUrlQuery("forceCanvas", "1"))
	}
}
