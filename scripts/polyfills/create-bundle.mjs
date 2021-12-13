import coreJsBuilder from "core-js-builder"
import esbuild from "esbuild"
import * as fs from "fs"
import filesize from "filesize"
import { modules } from "./modules.mjs"

let filename = "dev/js/polyfills.js"
let code = await coreJsBuilder({
	modules,
	filename,
})

let filenameMin = "dev/js/polyfills.min.js"
esbuild.buildSync({
	stdin: { contents: code },
	minify: true,
	outfile: filenameMin,
	target: "es5",
})

let bundleStats = fs.statSync(filename)
let bundleMinStats = fs.statSync(filenameMin)
console.log("Bundle:", filesize(bundleStats.size))
console.log("Minified:", filesize(bundleMinStats.size))

