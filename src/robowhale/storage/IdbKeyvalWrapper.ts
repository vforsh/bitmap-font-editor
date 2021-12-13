import { IStorage } from "./IStorage"
import { clear, createStore, del, get, set, UseStore } from "idb-keyval"

export class IdbKeyvalWrapper implements IStorage {
	
	public readonly type = "indexed-db"
	private storeName: string
	private store: UseStore
	
	constructor() {
	
	}
	
	public async init(storeName: string): Promise<void> {
		try {
			this.storeName = storeName
			this.store = createStore("robowhale", this.storeName)
			
			let key = "__test_key__"
			await set(key, key, this.store)
			await get(key, this.store)
			await del(key)
		} catch (error) {
			return Promise.reject(error)
		}
	}
	
	public saveValue(key: string, value: any): Promise<void> {
		return set(key, value, this.store)
	}
	
	public getValue(key: string): Promise<any | undefined> {
		// returns undefined if value wasn't set
		return get(key, this.store)
	}
	
	public async getNumber(key: string): Promise<number> {
		let value = await this.getValue(key)
		if (typeof value !== "number") {
			return Promise.resolve(0)
		} else {
			return value
		}
	}
	
	public async getBoolean(key: string): Promise<boolean> {
		let value = await this.getValue(key)
		if (typeof value !== "boolean") {
			return false
		} else {
			return value
		}
	}
	
	public async getString(key: string): Promise<string> {
		let value = await this.getValue(key)
		if (typeof value !== "string") {
			return ""
		} else {
			return value
		}
	}
	
	public async getObject(key: string): Promise<Object> {
		let value = await this.getValue(key)
		if (typeof value !== "object") {
			return null
		} else {
			return value
		}
	}
	
	public remove(key: string): Promise<void> {
		return del(key, this.store)
	}
	
	public clear(): Promise<void> {
		return clear(this.store)
	}
}
