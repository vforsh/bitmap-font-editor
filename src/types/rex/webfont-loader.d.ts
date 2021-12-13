interface GoogleWebFontConfig {
	google: {
		// https://github.com/typekit/webfontloader#google
		families: string[]
	}
	textString?: string | object
	testInterval?: number
}

interface CustomWebFontConfig {
	custom: {
		// https://github.com/typekit/fvd
		// https://github.com/typekit/webfontloader#custom
		families: string[]
		urls: string[]
	}
	textString?: string | object
	testInterval?: number
}

type WebFontConfig = GoogleWebFontConfig | CustomWebFontConfig

declare namespace Phaser {
	namespace Loader {
		interface LoaderPlugin {
			rexWebFont(config: WebFontConfig): Phaser.Loader.LoaderPlugin
		}
	}
}
