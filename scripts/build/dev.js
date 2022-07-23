const esbuild = require("esbuild")
const { external } = require("./helpers")
const timestamp = require("time-stamp")
const chalk = require("chalk")
const argv = require('minimist')(process.argv.slice(2))

const watch = argv['watch']
const outfile = "dev/js/game.js"

function getTimestamp() {
	return chalk.green(timestamp("[YYYY/MM/DD HH:mm:ss]"))
}

esbuild.build({
	entryPoints: ["src/startup/Startup.ts"],
	outfile: outfile,
	bundle: true,
	target: "es2020",
	platform: "browser",
	external,
	sourcemap: "inline",
	watch: watch && {
		onRebuild(error, result) {
			let time = getTimestamp()

			if (error) {
				console.error(time, chalk.red(`Build failed: ${error}`))
			} else {
				console.log(time, "Rebuild complete")
			}
		},
	},
}).then((result) => {
	if (watch) {
		console.log(getTimestamp(), "Initial build is ready")
	} else {
		console.log(`Build is ready at ${outfile}`)
	}
})
