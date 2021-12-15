const coreConfig = require("./dev")
const compress = require("compression")

const files = [
	"prod/js/**",
	"prod/index.html",
]

const queryString = new URLSearchParams({
	gdDisable: 1,
	fakeAds: 1,
})

/**
 * @type {browserSync.Options}
 */
module.exports = {
	...coreConfig,
	files,
	startPath: `prod/index.html?${queryString.toString()}`,
	middleware: [compress()],
}
