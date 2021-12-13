export type UrlParam =
	| "language"
	| "lang"
	| "instantSceneChange"
	| "analytics"
	| "analyticsLog"
	| "dev"
	| "editor"
	| "stats"
	| "console"
	| "forceCanvas"
	| "clearSaveData"
	| "noWebp"
	| "noAvif"
	| "maxTextures" // WebGL param
	| "originalSize"
	| "sentry"
	| "storage"
	| "quality"
	| "throttle"
	| "noDecor"
	| "root"

export type UrlParamType = UrlParam /*| string*/

export class UrlParams {
	
	public static get(name: UrlParamType): string | null {
		let normalizedName = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]")
		let regex = new RegExp("[\\?&]" + normalizedName + "=([^&#]*)")
		let results = regex.exec(location.search)
		
		return results === null ? null : decodeURIComponent(results[1].replace(/\+/g, " "))
	}
	
	public static has(name: UrlParamType): boolean {
		return this.get(name) !== null
	}
	
	public static getNumber(name: UrlParamType, _default: number = 0): number {
		let value = this.get(name)
		if (value) {
			let num: number = parseFloat(value)
			return isNaN(num) ? _default : num
		}
		
		return _default
	}
	
	public static getNumbers(name: UrlParamType, _default?: number[]): number[] | null {
		let value = this.get(name)
		if (!value) {
			return _default ?? null
		}
		
		if (value[0] !== "[" || value[value.length - 1] !== "]") {
			console.warn("Malformed url param input", value)
			return null
		}
		
		let content = value.slice(1, value.length - 1)
		return content.split(",").map((numStr) => {
			return parseFloat(numStr)
		})
	}
	
	public static getBool(name: UrlParamType, expectedValue: string = "1"): boolean {
		let value = this.get(name)
		
		return !!(value && value === expectedValue)
	}
	
}

