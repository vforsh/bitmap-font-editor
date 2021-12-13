import esbuild from "esbuild"
import * as fs from "fs/promises"
import chalk from "chalk"
import filesize from "filesize"

let target = "es5"
let build = createBuild()
let content = removeUnusedFeatures(build.outputFiles[0].text)
let contentMinified = minify(content)

await Promise.all([
	fs.mkdir("dist", { recursive: true }),
	saveFile(content, "dist/phaser.custom.js"),
	saveFile(contentMinified, "dist/phaser.custom.min.js"),
])

function createBuild() {
	return esbuild.buildSync({
		entryPoints: ["phaser.custom.config.js"],
		globalName: "Phaser",
		format: "iife",
		bundle: true,
		write: false,
		target: target,
		legalComments: "none",
	})
}

function removeUnusedFeatures(content) {
	let map = {
		"typeof CANVAS_RENDERER": true,
		"typeof WEBGL_RENDERER": true,
		"typeof EXPERIMENTAL": false,
		"typeof PLUGIN_3D": false,
		"typeof PLUGIN_CAMERA3D": false,
		"typeof PLUGIN_FBINSTANT": false,
		"typeof FEATURE_SOUND": false,
	}

	Object.entries(map).forEach(([key, value]) => {
		content = content.replace(new RegExp(key, "g"), value.toString())
	})

	return content
}

function minify(content) {
	let buildResult = esbuild.buildSync({
		stdin: {
			contents: content,
			loader: "js",
			sourcefile: "phaser.custom.js",
		},
		minify: true,
		write: false,
		target: target,
	})

	return buildResult.outputFiles[0].text
}

async function saveFile(content, path) {
	let file = await fs.writeFile(path, content)
	let stat = await fs.stat(path)
	console.log(path, chalk.yellow(filesize(stat.size)))
}
