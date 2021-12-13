export interface IStorage {
	readonly type: string
	
	init(storeName: string): Promise<void>
	clear(): Promise<void>
	
	saveValue(key: string, value: any): Promise<any>
	getValue(key: string): Promise<any>
	getNumber(key: string): Promise<number>
	getBoolean(key: string): Promise<boolean>
	getString(key: string): Promise<string>
	getObject(key: string): Promise<Object>
}

export type StorageConstructor = new (...args: any[]) => IStorage
