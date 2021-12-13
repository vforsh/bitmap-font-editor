import { SaveKey, SaveValue } from "../../store/GameStoreKey"

export class RuntimeStorage {
	
	get namespace(): string {
		return this._namespace
	}
	
	private storage: Object
	private _namespace: string
	
	constructor() {
		this.storage = {}
	}
	
	public setNamespace(namespace: string): void {
		this._namespace = namespace
	}
	
	public saveValue<K extends SaveKey>(key: K, value: SaveValue<K>): void {
		this.storage[this.getSaveKey(key)] = value
	}
	
	public getValue<K extends SaveKey>(key: K): SaveValue<K> {
		return this.storage[this.getSaveKey(key)]
	}
	
	public getContent(ignoreNamespace: boolean = false): Object {
		if (ignoreNamespace) {
			return this.storage
		}
		
		let keys: string[] = Object.keys(this.storage).filter((key) => {
			return key.indexOf(this._namespace) > -1
		})
		
		let content: Object = {}
		keys.forEach((key) => {
			content[key] = this.storage[key]
		})
		
		return content
	}
	
	public clear(ignoreNamespace: boolean = false): void {
		if (ignoreNamespace) {
			this.storage = {}
			return
		}
		
		Object.keys(this.storage).filter((key: string) => {
			if (key.includes(this._namespace)) {
				delete this.storage[key]
			}
		})
	}
	
	private getSaveKey(key: string): string {
		return this._namespace + "__" + key
	}
}
