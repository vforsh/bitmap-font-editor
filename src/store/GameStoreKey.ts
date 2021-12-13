import { GraphicsQuality } from "../scale/GraphicsQuality"
import { getObjectKeys } from "../robowhale/utils/collection/get-object-keys"

export const GAME_STORE = {
	language: "",
	graphics_quality: GraphicsQuality.HIGH,
	graphics_quality_manually: false,
	sound_muted: false,
	music_muted: false,
	editor_zoom: 1,
	build: window.game.config.build_version,
	login_num: 0,
}

export type GameStoreKey = keyof typeof GAME_STORE

export type GameStoreNumberKey = Values<{
	[K in GameStoreKey]: GameStoreValue<K> extends number ? K : never
}>

export type GameStoreValue<K extends GameStoreKey> = typeof GAME_STORE[K]

export type SaveKey = GameStoreKey | string

export type SaveValue<K extends SaveKey> = K extends GameStoreKey ? GameStoreValue<K> : unknown

type Values<T> = T[keyof T]

export function getStoreKeys(): GameStoreKey[] {
	return getObjectKeys(GAME_STORE)
}

export function getStoreDefaultValue<K extends GameStoreKey>(key: K): GameStoreValue<K> {
	return GAME_STORE[key]
}
