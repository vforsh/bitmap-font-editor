import { GameEnvironment } from "../GameEnvironment"
import { IGameConfig } from "../IGameConfig"
import { Main } from "../Main"
import { CacheBustingMethod } from "../CacheBuster"

declare global {
	
	const cacheBustingMethod: CacheBustingMethod | undefined
	const cacheBusters: Record<string, string> | undefined
	
	const GameAnalytics: any
	const gameanalytics: {
		GameAnalytics: typeof GameAnalytics
	}
	
	interface Window {
		environment: GameEnvironment
		gameInstance: Main
		game: {
			config: IGameConfig
		}
	}
	
	interface Array<T> {
		at(index: number): T;
	}
}


