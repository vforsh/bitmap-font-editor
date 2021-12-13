import minimist from "minimist"
import { readPackageJson } from "../read-package.mjs"
import loadJsonFile from "load-json-file"
import { trim, uniq } from "lodash-es"

let allTexts = await loadTexts()
let languages = getLanguages() ?? Object.keys(allTexts)
let texts = languages.map(lang => allTexts[lang])
let entries = getTextEntries(texts)
let chars = entries.join("").split("")
let uniqueChars = uniq(chars).sort()
console.log(uniqueChars.join(""))

/**
 *
 * @returns {Promise<JsonValue>}
 */
function loadTexts() {
	let pkg = readPackageJson()
	let pathToTextsFile = pkg.config.texts.file
	return loadJsonFile(pathToTextsFile)
}

/**
 *
 * @returns {string[]|undefined}
 */
function getLanguages() {
	let args = minimist(process.argv.slice(2))
	let languageArg = args.lang ?? args.language
	if (languageArg === true || !languageArg) {
		return
	}

	let languages = languageArg.includes(",")
		? languageArg.split(",").map(lang => trim(lang))
		: [languageArg]

	return languages.filter(lang => allTexts[lang])
}

/**
 *
 * @param {Array|Object} obj
 * @returns {string[]}
 */
function getTextEntries(obj) {
	const isObject = val => typeof val === "object" && !Array.isArray(val)
	const values = (obj = {}) => {
		return Object.values(obj)
			.reduce((product, value) => {
				return value && isObject(value)
					? product.concat(values(value))
					: product.concat(value)
			}, [])
	}

	return values(obj)
}
