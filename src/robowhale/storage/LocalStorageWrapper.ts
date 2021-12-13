import { IStorage } from "./IStorage"

export function isLocalStorageAvailable(): boolean {
	try {
		let key = "__storage_test__"
		localStorage.setItem(key, key)
		localStorage.removeItem(key)
		return true
	} catch (e) {
		return false
	}
}

export class LocalStorageWrapper implements IStorage {
	
	public readonly type = "local-storage"
	private prefix: string
	
	constructor() {
	
	}
	
	public init(storeName: string): Promise<void> {
		this.prefix = storeName
		
		return isLocalStorageAvailable()
			? Promise.resolve()
			: Promise.reject()
	}
	
	public saveValue(key: string, value: any): Promise<void> {
		try {
			let dataToSave = this.stringify(value)
			localStorage.setItem(this.getStorageKey(key), dataToSave)
			return Promise.resolve()
		} catch (error) {
			return Promise.reject(error)
		}
	}
	
	private stringify(value: any): string {
		return typeof value === "string"
			? value
			: JSON.stringify(value)
	}
	
	private getStorageKey(key: string): string {
		return `${this.prefix}__${key}`
	}
	
	public getValue(key: string): Promise<any> {
		// returns null if key is not present
		return Promise.resolve(localStorage.getItem(this.getStorageKey(key)))
	}
	
	public async getNumber(key: string): Promise<number> {
		let value = await this.getValue(key)
		if (value === null) {
			return Promise.resolve(0)
		} else {
			let num: number = parseFloat(value) || 0
			return Promise.resolve(num)
		}
	}
	
	public async getBoolean(key: string): Promise<boolean> {
		let value = await this.getValue(key)
		if (value === null) {
			return Promise.resolve(false)
		} else {
			let bool: boolean = value === "true"
			return Promise.resolve(bool)
		}
	}
	
	public async getString(key: string): Promise<string> {
		let value = await this.getValue(key)
		if (value === null) {
			return Promise.resolve("")
		} else {
			return Promise.resolve(value)
		}
	}
	
	public async getObject(key: string): Promise<Object> {
		let value = await this.getValue(key)
		let obj: Object = null
		
		try {
			obj = JSON.parse(value)
		} catch (e) {
			console.error(e)
		}
		
		return Promise.resolve(obj)
	}
	
	public remove(key: string): void {
		localStorage.removeItem(this.getStorageKey(key))
	}
	
	public clear(): Promise<void> {
		Object.keys(localStorage)
			.filter((key: string) => key.includes(this.prefix))
			.forEach((key: string) => {
				localStorage.removeItem(key)
			})
		
		return Promise.resolve()
	}
}
