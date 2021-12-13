const fs = require("fs").promises
const esbuild = require("esbuild")
const { external, getConsoleMethods, getBuildTime, concat } = require("./helpers")

const build = () => {
	return esbuild.build({
		entryPoints: ["./dev/js/temp/startup/Startup.js"],
		write: false,
		bundle: true,
		target: "es5",
		external,
		legalComments: "none",
	})
}

const minify = (contents) => {
	return esbuild.build({
		stdin: {
			contents,
			sourcefile: "game.js",
			loader: "js",
		},
		outfile: "./prod/js/game.min.js",
		minify: true,
		sourcemap: true,
		target: "es5",
		pure: getConsoleMethods(),
	})
}

Promise.all([
	build(),
	fs.readFile("./dev/js/require.js"),
	fs.readFile("./dev/js/game.config.js"),
]).then(async ([buildResult, _requireBuffer, configBuffer]) => {
	const [_require, config] = [_requireBuffer, configBuffer].map(buffer => buffer.toString())
	const updatedConfig = config.replace("{{ BUILD_TIME }}", getBuildTime())
	const game = buildResult.outputFiles[0].text
	const result = concat(_require, updatedConfig, game)

	await Promise.all([
		fs.writeFile("./prod/js/game.js", result),
		minify(result),
	])
}).catch(() => process.exit(1))
