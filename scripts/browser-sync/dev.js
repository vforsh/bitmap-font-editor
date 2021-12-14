const files = [
	"dev/assets/configs/shop_offers.json",
	"dev/assets/graphics/*.json",
	"dev/assets/graphics/*.jpg",
	"dev/assets/audio/**",
	"dev/js/game.config.js",
	"dev/js/game.js",
	"dev/js/phaser.custom.js",
	"dev/css/*.css",
	"dev/index.html",
]

const ignore = []

const queryString = new URLSearchParams({
	dev: 1,
	instantSceneChange: 1,
	stats: 0,
	analytics: 0,
	editor: 1,
	noDecor: 1,
	originalSize: 1,
})

module.exports = {
	files,
	ignore,
	server: true,
	startPath: `dev/index.html?${queryString.toString()}`,
	open: "external",
	host: require("./bs-get-ip")(),
	timestamps: true,
	notify: false,
	reloadDebounce: 500,
	ui: false,
	middleware: [
		{
			route: "/screenshot",
			handle: require("./middleware/save-screenshot"),
		},
		{
			route: "/bm-font/save",
			handle: require("./middleware/save-bmfont"),
		},
		{
			route: "/fonts",
			handle: require("./middleware/get-fonts-list"),
		},
		{
			route: "/projects",
			handle: require("./middleware/get-projects-list"),
		},
		{
			route: "/read-file",
			handle: require("./middleware/read-file"),
		},
		{
			route: "/write-file",
			handle: require("./middleware/write-file"),
		},
		{
			route: "/open",
			handle: require("./middleware/open"),
		},
	],
}
