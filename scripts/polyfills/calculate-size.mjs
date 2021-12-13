import coreJsBuilder from "core-js-builder"
import { modules } from "./modules.mjs"
import { fromPairs, mapValues, sortBy, toPairs, without, zipObject } from "lodash-es"
import filesize from "filesize"
import chalk from "chalk"
import esbuild from "esbuild"

let bundle = await coreJsBuilder({ modules })
let bundleSize = getStringSize(bundle)

let bundleMin = (await minify(bundle)).outputFiles[0].text
let bundleMinSize = getStringSize(bundleMin)

let polyfills = await Promise.all(modules.map(module => coreJsBuilder({ modules: without(modules, module) })))
let polyfillsSizes = polyfills.map(polyfill => bundleSize - getStringSize(polyfill))

let keys = [...modules]
let values = [...polyfillsSizes]
let result = zipObject(keys, values)
let sorted = fromPairs(sortBy(toPairs(result), 1).reverse())
let readable = mapValues(sorted, (bytes) => `${(bytes / 1024).toFixed(2).padStart(6, " ")} kb`)

console.table(readable)
console.log(chalk.bold(`* Bundle size: ${filesize(bundleSize)}`))
console.log(chalk.bold(`*    Minified: ${filesize(bundleMinSize)}`))

/**
 * @param str {string}
 * @returns {number}
 */
function getStringSize(str) {
	return Buffer.byteLength(str, "utf8")
}

/**
 * @param code {string}
 * @returns {Promise<BuildResult>}
 */
function minify(code) {
	return esbuild.build({
		stdin: { contents: code },
		minify: true,
		target: "es5",
		write: false,
	})
}
