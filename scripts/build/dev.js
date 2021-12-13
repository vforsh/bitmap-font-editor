const esbuild = require("esbuild")
const { external } = require("./helpers")
const timestamp = require("time-stamp")
const chalk = require("chalk")

function getTimestamp() {
	return chalk.green(timestamp("[YYYY/MM/DD HH:mm:ss]"))
}

esbuild.build({
	entryPoints: ["../../src/startup/Startup.ts"],
	outfile: "../../dev/js/game.js",
	bundle: true,
	target: "es6",
	platform: "browser",
	external,
	sourcemap: "inline",
	watch: {
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
	console.log(getTimestamp(), "Initial build is ready")
})
