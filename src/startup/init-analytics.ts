import { UrlParams } from "../UrlParams"
import { ResourceCurrency, ResourceItemType } from "../GameAnalyticsWrapper"
import { Publisher } from "../Publishers"
import { RendererType } from "../create-game-config"
import { NetUtil } from "../robowhale/utils/NetUtil"
import { GameEnvironment } from "../GameEnvironment"

interface GameAnalyticsKeys {
	gameKey: string
	secret: string
}

export function initAnalytics() {
	window["GameAnalytics"] ??= function() {
		(GameAnalytics.q = GameAnalytics.q || []).push(arguments)
	}
	
	let isLoggingEnabled = UrlParams.getBool("analyticsLog")
	GameAnalytics("setEnabledInfoLog", isLoggingEnabled)
	
	GameAnalytics("configureBuild", window.game.config.build_version.toString())
	GameAnalytics("configureAvailableResourceCurrencies", Object.values(ResourceCurrency))
	GameAnalytics("configureAvailableResourceItemTypes", Object.values(ResourceItemType))
	GameAnalytics("configureAvailableCustomDimensions01", Object.values(Publisher))
	GameAnalytics("configureAvailableCustomDimensions02", [RendererType.CANVAS, RendererType.WEBGL])
	GameAnalytics("configureAvailableCustomDimensions03", ["adblock_enabled", "adblock_disabled"])
	
	let { gameKey, secret } = getAnalyticsKeys()
	GameAnalytics("initialize", gameKey, secret)
	GameAnalytics("addDesignEvent", "Startup")
}

function getAnalyticsKeys(): GameAnalyticsKeys {
	let currentHost = NetUtil.getCurrentHost()
	let isTestHost = ["robowhale.com", "localhost", "192.168"].some(testHost => currentHost.includes(testHost))
	let isTesting = UrlParams.getBool("dev")
	let useDevKeys = window.environment === GameEnvironment.DEVELOP || isTestHost || isTesting
	if (useDevKeys) {
		return {
			gameKey: "a3bef38f8d6f806f9e82d95c5372ab8d",
			secret: "065467ce1790a9a891e5ceb07bb695d3bb1b38c4",
		}
	}
	
	return {
		gameKey: "39cc03509731bff78f56ac3df452387a",
		secret: "9837cc71274790b27002f348006ea23331f4fd2b",
	}
}
