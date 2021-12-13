const fs = require("fs").promises
const esbuild = require("esbuild")
const { external, getConsoleMethods, getBuildTime, concat } = require("./helpers")
const { default: ifdef } = require("esbuild-ifdef")

function build() {
	return esbuild.build({
		entryPoints: ["./src/startup/Startup.ts"],
		bundle: true,
		target: "es6",
		platform: "browser",
		write: false,
		external,
		legalComments: "none",
		plugins: [
			ifdef({
				variables: {
					EDITOR: false,
					DEV: false,
				}
			})
		],
	})
}

function minify(contents) {
	return esbuild.build({
		stdin: {
			contents,
			sourcefile: "game.js",
			loader: "js",
		},
		outfile: "./prod/js/game.min.js",
		minify: true,
		sourcemap: true,
		target: "es6",
		pure: getConsoleMethods(),
	})
}

Promise.all([
	build(),
	fs.readFile("./dev/js/require.js"),
	fs.readFile("./dev/js/game.config.js"),
]).then(async ([buildResult, ...buffers]) => {
	const game = buildResult.outputFiles[0].text
	const [_require, config] = buffers.map(buffer => buffer.toString())
	const updatedConfig = config.replace("{{ BUILD_TIME }}", getBuildTime())
	const result = concat(_require, updatedConfig, game)

	await Promise.all([
		fs.writeFile("./prod/js/game.js", result),
		minify(result),
	])
}).catch(() => process.exit(1))
