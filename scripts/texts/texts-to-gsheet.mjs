import loadJsonFile from "load-json-file"
import { readPackageJson } from "../read-package.mjs"
import _ from "lodash"
import { GoogleSpreadsheet } from "google-spreadsheet"
import { getFullLanguage } from "./languages-map.mjs"

let pkg = readPackageJson()
let config = pkg.config
let texts = await loadJsonFile(config.texts.file)
let headerRow = getHeaderRow(texts)
let contentRows = getContentRows(texts)

try {
	let sheetsId = config.texts["gsheets-id"]
	let sheetTitle = config.texts["gsheets-sheet"]
	let credentials = await loadJsonFile(config.texts["gsheets-credentials"])
	let sheet = await getSheet(sheetsId, sheetTitle, credentials)
	await sheet.clear()
	await sheet.resize({ rowCount: contentRows.length, columnCount: headerRow.length })
	await sheet.setHeaderRow(headerRow)
	await sheet.addRows(contentRows)
	await boldifyObjectsAndArrays(sheet, contentRows.length)
	await boldifyHeaderRow(sheet, headerRow)
	await sheet.saveUpdatedCells()
} catch (e) {
	console.error(e)
}

async function getSheet(sheetsId, sheetTitle, credentials) {
	let doc = new GoogleSpreadsheet(sheetsId)
	let auth = await doc.useServiceAccountAuth(credentials)
	let info = await doc.loadInfo()
	let sheet = doc.sheetsByTitle[sheetTitle] ?? await doc.addSheet({ title: sheetTitle })

	return sheet
}

function getHeaderRow(texts) {
	let languages = Object.keys(texts).map((languageShort) => {
		return getFullLanguage(languageShort) || languageShort
	})

	return ["key", ...languages]
}

function getContentRows(texts) {
	let languages = _.mapValues(texts, getLanguageObject)
	let languagesArr = Object.values(languages)
	let rowKeys = Object.keys(languagesArr[0])
	let rows = rowKeys.map((key) => {
		let result = { key }

		Object.entries(languages).forEach((entry) => {
			let language = entry[0]
			let langTexts = entry[1]
			let value = langTexts[key]

			if (value && value.length > 0) {
				if (value.startsWith("+") || value.startsWith("=")) {
					value = "'" + value
				}
			}

			result[transfromLanguage(language)] = value
		})

		return result
	})

	return rows
}

function transfromLanguage(shortLanguage) {
	return getFullLanguage(shortLanguage)
}

function getLanguageObject(texts) {
	let content = {}

	Object.entries(texts).forEach((entry) => {
		let key = entry[0]
		let value = entry[1]

		if (Array.isArray(value)) {
			let object = convertArrayToObject(value, key)
			content[key + " [array]"] = ""
			content = { ...content, ...object }
			content[key + "_end"] = ""
		} else if (_.isPlainObject(value)) {
			let object = flattenObject(value, key)
			content[key + " [object]"] = ""
			content = { ...content, ...object }
			content[key + "_end"] = ""
		} else {
			content[key] = value
		}
	})

	return content
}

function convertArrayToObject(array, baseKey) {
	return _.mapKeys(array, (value, index) => {
		return `${baseKey}_${index}`
	})
}

function flattenObject(sourceObject, baseKey, newObject = {}) {
	Object.entries(sourceObject).forEach((entry) => {
		let key = `${baseKey}.${entry[0]}`
		let value = entry[1]

		if (_.isPlainObject(value)) {
			flattenObject(value, key, newObject)
		} else {
			newObject[key] = value
		}
	})

	return newObject
}

async function boldifyObjectsAndArrays(sheet, rowsNum) {
	await sheet.loadCells({
		startRowIndex: 0,
		endRowIndex: rowsNum,
		startColumnIndex: 0,
		endColumnIndex: 1,
	})

	let keywords = ["[array]", "[object]", "_end"]

	for (let i = 0; i < rowsNum; i++) {
		let cell = sheet.getCell(i, 0)
		let hasKeyword = keywords.some(keyword => cell.value.includes(keyword))
		if (hasKeyword) {
			cell.textFormat = { bold: true, italic: true }
		}
	}
}

async function boldifyHeaderRow(sheet, headerRow) {
	await sheet.loadCells({
		startRowIndex: 0,
		endRowIndex: 1,
		startColumnIndex: 0,
		endColumnIndex: headerRow.length,
	})

	for (let i = 0; i < headerRow.length; i++) {
		let cell = sheet.getCell(0, i)
		cell.textFormat = { bold: true }
	}
}

