import _ from "lodash"
import chalk from "chalk"
import loadJsonFile from "load-json-file"
import writeJsonFile from "write-json-file"
import { readPackageJson } from "../read-package.mjs"

let pkg = readPackageJson()
let pathToTextsFile = pkg.config.texts.file
let texts = await loadJsonFile(pathToTextsFile)
let englishTexts = texts["en"]
let englishKeys = Object.keys(englishTexts)

Object.entries(texts).forEach(([key, value]) => {
	let keys = Object.keys(value)
	let diffKeys = _.difference(englishKeys, keys)
	if (diffKeys.length > 0) {
		console.log(chalk.red("Missing keys:"), chalk.bold.red(key))
		console.log(diffKeys, "\n")
	}

	_.defaults(value, englishTexts)
})

await writeJsonFile(pathToTextsFile, texts)

