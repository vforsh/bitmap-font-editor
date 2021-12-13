import { readPackageJson } from "../read-package.mjs"
import { getShortcut } from "./languages-map.mjs"
import { extractSheets } from "spreadsheet-to-json"
import _ from "lodash"
import loadJsonFile from "load-json-file"
import writeJsonFile from "write-json-file"

let pkg = readPackageJson()
let config = pkg.config
let sheet = await getSheetWithTexts(config)
logMissingTexts(sheet)

let languagesKeys = Object.keys(sheet[0]).slice(1)
let texts = languagesKeys.map(lang => createTexts(lang, sheet))
let languagesShortKeys = languagesKeys.map(lang => getShortcut(lang))
let content = _.zipObject(languagesShortKeys, texts)
await writeJsonFile(config.texts.file, content)

async function getSheetWithTexts(config) {
	let spreadsheetKey = config.texts["gsheets-id"]
	let credentials = await loadJsonFile(config.texts["gsheets-credentials"])
	let data = await extractSheets({ spreadsheetKey, credentials })
	let sheetKey = config.texts["gsheets-sheet"]
	return data[sheetKey]
}

function createTexts(language, sheet) {
	let rawTexts = getRawTexts(language, sheet)
	let texts = transformTexts(rawTexts)

	return texts
}

function getRawTexts(language, sheet) {
	let texts = {}

	sheet.forEach((entry, index) => {
		let key = _.trim(entry["key"])
		let value = entry[language]
		if (!key || key === "#") {
			return
		}

		let isDuplicateKey = texts.hasOwnProperty(key)
		if (isDuplicateKey) {
			console.warn(`Duplicate key "${key}" at row ${index + 2}!`)
			return
		}

		texts[key] = value
	})

	return texts
}

function transformTexts(rawTexts) {
	let texts = {}
	let indicesToSkip = []

	Object.entries(rawTexts).forEach((entry, index, entries) => {
		if (indicesToSkip.includes(index)) {
			return
		}

		let { key, value, newIndicesToSkip } = transformRawTextEntry(entry, index, entries)
		if (newIndicesToSkip) {
			indicesToSkip.push(...newIndicesToSkip)
		}

		texts[key] = value
	})

	return texts
}

function transformRawTextEntry(entry, index, entries) {
	let key = entry[0]
	let value = entry[1]

	if (key.includes("object")) {
		let objectKey = key.split(" ")[0]
		let objectEntries = getEntriesArray(objectKey, entries, index)
		if (objectEntries) {
			let obj = createObjectFromEntries(objectKey, objectEntries)
			let indices = _.range(index, index + objectEntries.length + 2)
			return { key: objectKey, value: obj, newIndicesToSkip: indices }
		}
	} else if (key.includes("array")) {
		let arrayKey = key.split(" ")[0]
		let arrayEntries = getEntriesArray(arrayKey, entries, index)
		if (arrayEntries) {
			let array = createArrayFromEntries(arrayKey, arrayEntries)
			let indices = _.range(index, index + arrayEntries.length + 2)
			return { key: arrayKey, value: array, newIndicesToSkip: indices }
		}
	}

	return { key, value }
}

function getEntriesArray(commonKey, entries, startIndex) {
	let endIndex = entries.findIndex(entry => entry[0] === `${commonKey}_end`)
	if (endIndex > -1 && endIndex > startIndex) {
		return entries.slice(startIndex + 1, endIndex)
	}

	return null
}

function createObjectFromEntries(objectKey, objectEntries) {
	let keys = objectEntries.map(entry => entry[0])
	let maxDepth = getObjectDepth(keys)
	return convertEntriesToObject(objectEntries, maxDepth)
}

function getObjectDepth(strings) {
	return strings.reduce((maxDepth, string) => {
		let depth = occurrences(string, ".") + 1
		return (depth > maxDepth) ? depth : maxDepth
	}, 0)
}

function occurrences(string, subString, allowOverlapping) {
	string += ""
	subString += ""
	if (subString.length <= 0) return (string.length + 1)

	var n = 0,
		pos = 0,
		step = allowOverlapping ? 1 : subString.length

	while (true) {
		pos = string.indexOf(subString, pos)
		if (pos >= 0) {
			++n
			pos += step
		} else break
	}
	return n
}

function convertEntriesToObject(entries, maxDepth, depth = 1, result = {}) {
	entries.forEach((entry) => {
		let key = entry[0]
		let value = entry[1]

		let path = getPropertyPath(key, depth)
		let isExist = _.has(result, path)
		if (isExist === false) {
			let isLast = occurrences(key, ".") === depth
			let newValue = isLast ? value : {}
			_.set(result, path, newValue)
		}
	})

	if (depth < maxDepth) {
		convertEntriesToObject(entries, maxDepth, ++depth, result)
	}

	return result
}

function getPropertyPath(string, level) {
	let parts = string.split(".").slice(1, level + 1)
	let path = parts.join(".")

	return path
}

function createArrayFromEntries(arrayKey, arrayEntries) {
	return arrayEntries.map((entry) => {
		return entry[1]
	})
}

function logMissingTexts(sheet, ignoreLanguages = []) {
	let missingEntries = []

	sheet.slice(1).forEach((row) => {
		let keys = Object.keys(row)
		let id = row[keys[0]]

		if (id === "#" || id.includes("[object]") || id.includes("[array]") || id.includes("_end")) {
			return
		}

		keys.forEach((key, index) => {
			if (index > 0) {
				let language = key
				let value = row[language]

				if (ignoreLanguages.includes(language)) {
					return
				}

				if (!value || value.length === 0) {
					missingEntries.push({ language, id, value })
				}
			}
		})
	})

	let grouped = _.groupBy(missingEntries, "language")
	let result = _.mapValues(grouped, (invalidEntries) => {
		return invalidEntries.map((entry) => {
			return entry.id
		})
	})

	if (missingEntries.length > 0) {
		console.warn("Please check following entries")
		console.log(result)
	}
}
