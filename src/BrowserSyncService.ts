import type open from "open"
import type { Options } from "execa"
import type { GlobbyOptions } from "globby"

export type BrowserSyncResponse =
	| { success: true, result: unknown }
	| { success: false, error: unknown }

export type BrowserSyncApiEndpoint =
	| "screenshot"
	| "bm-font/save"
	| "fonts"
	| "projects"
	| "read-file"
	| "write-file"
	| "write-json"
	| "open"
	| "command"
	| "globby"
	| "path-relative"
	| "fs-realpath"
	| "rm-file"
	| "stat"

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
	
	writeJson(filepath: string, content: unknown, overwrite = true): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("write-json"), {
			method: "POST",
			body: JSON.stringify({
				filepath,
				content,
				overwrite,
			})
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
	
	globby(patterns: string | string[], options?: GlobbyOptions): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("globby"), {
			method: "POST",
			body: JSON.stringify({ patterns, options }),
		})
	},
	
	pathRelative(from: string, to: string): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("path-relative"), {
			method: "POST",
			body: JSON.stringify({ from, to }),
		})
	},
	
	realPath(path: string): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("fs-realpath"), {
			method: "POST",
			body: JSON.stringify({ path }),
		})
	},
	
	rmFile(filepath: string, force = false): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("rm-file"), {
			method: "POST",
			body: JSON.stringify({ filepath, force }),
		})
	},
	
	stat(filepath: string): Promise<Response> {
		if (this.isAvailable() === false) {
			throw new Error("BrowserSync is not available!")
		}
		
		return fetch(this.getUrl("stat"), {
			method: "POST",
			body: JSON.stringify({ filepath }),
		})
	},
	
}
