type SceneKey = import("../scenes/SceneKey").SceneKey

declare module Phaser {
	
	interface Game {
		audioType: import("../create-game-config").AudioType
		rendererType: import("../create-game-config").RendererType
		sentry: import("../SentryWrapper").SentryWrapper
		texts: import("../texts/GameTexts").GameTexts
		store: import("../store/GameStore").GameStore
		globalScene: import("../scenes/global/GlobalScene").GlobalScene
		analytics: import("../GameAnalyticsWrapper").GameAnalyticsWrapper
		toasts: import("../robowhale/phaser3/gameObjects/toast/ToastsManager").ToastsManager
		audio: import("../audio/HowlerWrapper").HowlerWrapper
		ads: import("../AdsWrapper").AdsWrapper
		loadingScreen: import("../LoadingOverlay").LoadingOverlay
		scaler: import("../scale/GameScaler").GameScaler
		fpsTracker: import("../FpsTracker").FpsTracker
		stash: import("../stash/GameStash").GameStash
		webp: boolean
		avif: boolean
		
		changeScene(currentScene: SceneKey | string, newScene: SceneKey | string, data?: object): void
		restartScene(currentScene: SceneKey | string, data?: object): void
		injectIntoScenes(obj: any, key: string): void
		pause(): void
		resume(): void
	}
}


