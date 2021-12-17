import type open from "open"
import type { Options } from "execa"

export type BrowserSyncApiEndpoint =
	| "screenshot"
	| "bm-font/save"
	| "fonts"
	| "projects"
	| "read-file"
	| "write-file"
	| "open"
	| "command"

export type SaveBitmapFontParams = {
	project: string,
	config: string,
	configPath: string,
	texture: Blob,
	texturePath: string,
}

export const BrowserSyncService = {
	
	isAvailable(): boolean {
		return typeof window["___browserSync___"] !== "undefined"
	},
	
	getUrl(apiEndpoint: BrowserSyncApiEndpoint): string {
		return `${location.protocol}//${location.host}/${apiEndpoint}`
	},
	
	saveScreenshot(blob: Blob): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("screenshot"), {
			method: "POST",
			body: blob,
		})
	},
	
	saveBitmapFont(data: SaveBitmapFontParams): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		let formData = new FormData()
		Object.entries(data).forEach(([key, value]) => formData.append(key, value))
		
		return fetch(this.getUrl("bm-font/save"), {
			method: "POST",
			body: formData,
		})
	},
	
	open(filepath: string, options?: open.Options): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("open"), {
			method: "POST",
			body: JSON.stringify({ filepath, options }),
		})
	},
	
	readFile(filepath: string): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("read-file"), {
			method: "POST",
			body: JSON.stringify({ filepath }),
		})
	},
	
	writeFile(filepath: string, content: Blob, overwrite = true): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		let formData = new FormData()
		formData.append("filepath", filepath)
		formData.append("content", content, filepath)
		formData.append("overwrite", JSON.stringify(overwrite))
		
		return fetch(this.getUrl("write-file"), {
			method: "POST",
			body: formData,
		})
	},
	
	command(command: string, options?: Options): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("command"), {
			method: "POST",
			body: JSON.stringify({ command, options }),
		})
	},
	
	fonts(fontNames: string[]): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("fonts"), {
			method: "POST",
			body: JSON.stringify({ fonts: fontNames }),
		})
	},
	
	projects(dirpath: string): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("projects"), {
			method: "POST",
			body: JSON.stringify({ dirpath }),
		})
	},
	
}
