import type { Font } from "opentype.js"

const GAME_STASH = {
	webp: false,
	avif: false,
	development: false,
	editorEnabled: false,
	num: 1,
	fonts: new Map<string, Font>(),
}

type GameStashType = Partial<typeof GAME_STASH>
export type GameStashKey = keyof GameStashType
export type GameStashValue<K extends GameStashKey> = GameStashType[K]

type Values<T> = T[keyof T]

export type GameStashBooleanKey = Values<{
	[K in GameStashKey]: GameStashValue<K> extends boolean ? K : never
}>

export type GameStashNumberKey = Values<{
	[K in GameStashKey]: GameStashValue<K> extends number ? K : never
}>

export class GameStash {
	
	private readonly stash: GameStashType
	
	constructor() {
		this.stash = GAME_STASH
	}
	
	public get<K extends GameStashKey>(key: K): GameStashValue<K> | undefined {
		return this.stash[key]
	}
	
	public set<K extends GameStashKey>(key: K, value: GameStashValue<K>): void {
		this.stash[key] = value
	}
	
	public toggle<K extends GameStashBooleanKey>(key: K): boolean {
		let currentValue = Boolean(this.stash[key])
		let newValue = !currentValue
		
		this.stash[key] = newValue
		
		return newValue
	}
	
	public changeNum<K extends GameStashNumberKey>(key: K, delta: number, min = -Number.MAX_VALUE, max = Number.MAX_VALUE): number {
		let currentValue = this.stash[key] ?? 0
		let newValue = Phaser.Math.Clamp(currentValue + delta, min, max)
		
		this.stash[key] = newValue
		
		return newValue
	}
	
}
