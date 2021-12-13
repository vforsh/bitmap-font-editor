import { RuntimeStorage } from "../robowhale/storage/RuntimeStorage"
import { IStorage, StorageConstructor } from "../robowhale/storage/IStorage"
import { LocalStorageWrapper } from "../robowhale/storage/LocalStorageWrapper"
import { IdbKeyvalWrapper } from "../robowhale/storage/IdbKeyvalWrapper"
import { UrlParams } from "../UrlParams"
import { once } from "lodash-es"
import {
	GameStoreKey,
	GameStoreNumberKey,
	GameStoreValue,
	getStoreDefaultValue,
	getStoreKeys,
	SaveKey,
	SaveValue,
} from "./GameStoreKey"

export type LoadCallback = (key: string) => unknown

export enum GameStoreEvent {
	CLEAR = "__CLEAR",
	SAVE = "__SAVE"
}

export class GameStore extends Phaser.Events.EventEmitter {
	
	private game: Phaser.Game
	private _storage: IStorage
	private _runtimeStorage: RuntimeStorage
	private readonly storeName: string
	private sendSaveErrorToSentry: Function
	
	constructor(game: Phaser.Game, storeName: string) {
		super()
		
		this.game = game
		this.storeName = storeName
		
		this.sendSaveErrorToSentry = once((error, saveKey) => {
			this.game.sentry?.captureException("Save error", {
				extra: {
					error,
					saveKey,
				},
			})
		})
		
		this.initRuntimeStorage()
	}
	
	private initRuntimeStorage() {
		this._runtimeStorage = new RuntimeStorage()
		this._runtimeStorage.setNamespace(this.storeName)
	}
	
	public async initActualStorage(): Promise<void> {
		this._storage = await this.createActualStorage()
		
		let storageType = this._storage?.type ?? "none"
		if (storageType === "none") {
			console.warn("Storage:", storageType)
		} else {
			console.log("Storage:", storageType)
		}
		
		this.game.sentry?.setTag("storage", storageType)
		this.game.analytics?.sendDesignEvent(`Storage:${storageType}`)
	}
	
	private async createActualStorage(): Promise<IStorage | undefined> {
		let storageCtors = this.getStorageCtors()
		
		for (let i = 0; i < storageCtors.length; i++) {
			let ctor = storageCtors[i]
			let storage = new ctor()
			try {
				await storage.init(this.storeName)
				return storage
			} catch (e) {
				// swallow an error and continue trying storages
			}
		}
	}
	
	private getStorageCtors(): StorageConstructor[] {
		let urlParam = UrlParams.get("storage")
		if (urlParam === "idb" || urlParam === "indexedDB" || urlParam === "indexed") {
			return [IdbKeyvalWrapper, LocalStorageWrapper]
		}
		
		return [LocalStorageWrapper, IdbKeyvalWrapper]
	}
	
	public getValue<K extends SaveKey>(key: K): SaveValue<K> {
		return this._runtimeStorage.getValue(key)
	}
	
	public resetValue<K extends GameStoreKey>(key: K): GameStoreValue<K> {
		let defaultValue = getStoreDefaultValue(key)
		
		this.saveValue(key, defaultValue as SaveValue<K>)
		
		return defaultValue
	}
	
	public saveValue<K extends SaveKey>(key: K, value: SaveValue<K>): void {
		this._storage?.saveValue(key, value)
			.catch((error) => {
				this.sendSaveErrorToSentry(error, key)
				this.game.analytics?.sendError("Storage:Save_Error")
			})
		
		this._runtimeStorage.saveValue(key, value)
		
		this.emit(`${GameStoreEvent.SAVE}-${key}`, value)
	}
	
	public changeNumber(key: GameStoreNumberKey, delta: number, min: number = -Number.MAX_VALUE, max: number = Number.MAX_VALUE): number {
		let oldValue = this.getValue(key)
		let newValue = Phaser.Math.Clamp(oldValue + delta, min, max)
		
		this.saveValue(key, newValue)
		
		return newValue
	}
	
	public async loadInitialValues() {
		await Promise.all(getStoreKeys().map(key => this.loadValue(key, getStoreDefaultValue(key))))
		
		// console.groupCollapsed("Storage")
		// console.log(this._runtimeStorage.getContent(true))
		// console.groupEnd()
	}
	
	private async loadValue<K extends SaveKey>(key: K, defaultValue: SaveValue<K>, callback?: LoadCallback, callbackContext?: any) {
		if (!this._storage) {
			this._runtimeStorage.saveValue(key, defaultValue)
			return
		}
		
		const cb: LoadCallback = callback ?? this.getLoadCallbackByValueType(defaultValue)
		const cbContext = callbackContext ?? this._storage
		const loadedValue = await cb.call(cbContext, key)
		const value = loadedValue || defaultValue
		this._runtimeStorage.saveValue(key, value)
	}
	
	private getLoadCallbackByValueType(value: any): LoadCallback {
		let valueType: string = typeof value
		
		switch (valueType) {
			case "number":
				return this._storage.getNumber
			case "string":
				return this._storage.getValue
			case "boolean":
				return this._storage.getBoolean
			case "object":
				return this._storage.getObject
			
			default:
				return this._storage.getValue
		}
	}
	
	public async resetSaveData() {
		this.saveValue("login_num", 1)
		
		this.emit(GameStoreEvent.CLEAR, this)
	}
	
}
