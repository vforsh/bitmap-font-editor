const bodyParser = require('body-parser')

const files = [
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

})

/**
 * @type {browserSync.Options}
 */
module.exports = {
	files,
	ignore,
	server: true,
	startPath: `dev/index.html?${queryString.toString()}`,
	timestamps: true,
	notify: false,
	reloadDebounce: 500,
	ui: false,
	middleware: [
		bodyParser.json({
			type: ['text/*', 'application/json'],
		}),
		bodyParser.raw({
			type: ['image/png'],
		}),
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
			handle: require("./middleware/get-ttf-fonts"),
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
			route: "/write-json",
			handle: require("./middleware/write-json"),
		},
		{
			route: "/open",
			handle: require("./middleware/open"),
		},
		{
			route: "/command",
			handle: require("./middleware/command"),
		},
		{
			route: "/globby",
			handle: require("./middleware/globby"),
		},
		{
			route: "/path-relative",
			handle: require("./middleware/path-relative"),
		},
		{
			route: "/fs-realpath",
			handle: require("./middleware/fs-realpath"),
		},
		{
			route: "/rm-file",
			handle: require("./middleware/rm-file"),
		},
	],
}
