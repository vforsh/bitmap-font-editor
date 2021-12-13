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
		ftue: import("../FtueAnalytics").FtueAnalytics
		toasts: import("../robowhale/phaser3/gameObjects/toast/ToastsManager").ToastsManager
		levelConfigs: import("../levelConfigs/LevelConfigsManager").LevelConfigsManager
		gifts: import("../GiftsManager").GiftsManager
		lives: import("../lives/LivesManager").LivesManager
		boosters: import("../boosters/BoostersManager").BoostersManager
		pregameBoosters: import("../pregameBoosters/PregameBoostersManager").PregameBoostersManager
		adsHelper: import("../ads/AdsHelper").AdsHelper
		audio: import("../audio/HowlerWrapper").HowlerWrapper
		ads: import("../AdsWrapper").AdsWrapper
		loadingScreen: import("../LoadingOverlay").LoadingOverlay
		feedbackWidget: import("../feedback/FeedbackWidget").FeedbackWidget
		scaler: import("../scale/GameScaler").GameScaler
		fpsTracker: import("../FpsTracker").FpsTracker
		purchases: import("../purchases/PurchasesManager").PurchasesManager
		piggyBank: import("../PiggyBank").PiggyBank
		webp: boolean
		avif: boolean
		
		changeScene(currentScene: SceneKey | string, newScene: SceneKey | string, data?: object): void
		restartScene(currentScene: SceneKey | string, data?: object): void
		injectIntoScenes(obj: any, key: string): void
		pause(): void
		resume(): void
	}
}


