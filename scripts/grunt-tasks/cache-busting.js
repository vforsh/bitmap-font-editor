const revHash = require("rev-hash")
const Joi = require("joi")
const _ = require("lodash")
const fs = require("fs/promises")
const fsSync = require("fs")
const path = require("path")

const CACHE_BUSTING_METHOD = Object.freeze({
	QUERY_STRINGS: "query-strings",
	FILENAMES: "filenames",
})

/**
 * @param filePath {string}
 * @returns {Promise<string>}
 */
async function getRevisionHash(filePath) {
	return revHash(await fs.readFile(filePath))
}

/**
 * Takes url and transforms it depending on the method
 * FILENAMES: game.js => game.0fa4a3b7e0.js
 * QUERY_STRINGS: game.js => game.js?v=0fa4a3b7e0
 * @param {string} originalUrl
 * @param {string} hash
 * @param {string} method
 * @returns {string} Transformed file name / url
 */
function transformUrl(originalUrl, hash, method) {
	if (method === CACHE_BUSTING_METHOD.QUERY_STRINGS) {
		return `${originalUrl}?v=${hash}`
	}

	let dotIndex = originalUrl.indexOf(".")
	let firstPart = originalUrl.slice(0, dotIndex)
	let lastPart = originalUrl.slice(dotIndex)

	return `${firstPart}.${hash}${lastPart}`
}

/**
 * @param path {string}
 * @param searchValue {RegExp|string}
 * @param replaceValue {string}
 * @returns {Promise<void>}
 */
async function transformFileContent(path, searchValue, replaceValue) {
	let file = (await fs.readFile(path)).toString()
	file = file.replace(new RegExp(searchValue, "g"), replaceValue)
	return fs.writeFile(path, file)
}

/**
 *
 * @param options {Object}
 * @param cacheBusters {Object}
 * @param method {string}
 * @returns {Promise<void>}
 */
async function saveCacheBusters(options, cacheBusters, method) {
	let fileContent = (await fs.readFile(options.template)).toString()

	fileContent = fileContent.replace(/__METHOD__/g, method)
	fileContent = fileContent.replace(/"__HASHES__"/g, JSON.stringify(cacheBusters, null, "\t\t\t"))

	return fs.writeFile(options.dest, fileContent)
}

async function transformGameJs(options, baseDir, gameJsHash, method) {
	let game = path.join(baseDir, options.game)
	let gameMin = path.join(baseDir, options.min)
	let gameMinMap = path.join(baseDir, options.map)
	let index = path.join(baseDir, options.index)

	await Promise.all([
		transformFileContent(gameMin, "game.min.js.map", transformUrl("game.min.js.map", gameJsHash, method)),
		transformFileContent(gameMinMap, "game.js", transformUrl("game.js", gameJsHash, method)),
		transformFileContent(index, "game.min.js", transformUrl("game.min.js", gameJsHash, method)),
	])

	if (method === CACHE_BUSTING_METHOD.FILENAMES) {
		await Promise.all([
			fs.rename(game, transformUrl(game, gameJsHash, method)),
			fs.rename(gameMin, transformUrl(gameMin, gameJsHash, method)),
			fs.rename(gameMinMap, transformUrl(gameMinMap, gameJsHash, method)),
		])
	}
}

/**
 * @returns {Joi.ObjectSchema<any>|*}
 */
function createValidationSchema() {
	return Joi.object({
		method: Joi.any().allow(CACHE_BUSTING_METHOD.FILENAMES, CACHE_BUSTING_METHOD.QUERY_STRINGS).required(),
		gameJs: Joi.object({
			game: Joi.string().required(),
			min: Joi.string().required(),
			map: Joi.string().required(),
			index: Joi.string().required(),
		}).required(),
		transformContent: Joi.object({
			files: Joi.array().items(Joi.string()).required(),
			ignoreEntries: Joi.array().items(Joi.string()).required(),
		}).required(),
		cache_busters: Joi.object({
			template: Joi.string().required(),
			dest: Joi.string().required(),
		}).required(),
	}).unknown(true)
}

/**
 * @param options {Object}
 * @param baseDir {string}
 * @param cacheBusters {Object}
 * @param method {string}
 * @returns {Promise<void[]>}
 */
async function transformFiles(options, baseDir, cacheBusters, method) {
	let { files, ignoreEntries } = options
	let keys = _.without(Object.keys(cacheBusters), ...ignoreEntries)

	return Promise.all(
		files.map(async (file) => {
			let filePath = path.join(baseDir, file)
			let content = (await fs.readFile(filePath)).toString()

			keys.forEach((key) => {
				let hash = cacheBusters[key]
				let newValue = transformUrl(key, hash, method)
				content = content.replace(new RegExp(key, "g"), newValue)
			})

			return fs.writeFile(filePath, content)
		}),
	)
}

async function renameFiles(baseDir, cacheBusters, method) {
	if (method === CACHE_BUSTING_METHOD.QUERY_STRINGS) {
		return
	}

	return Promise.all(
		Object.entries(cacheBusters)
			.map(([oldFile, hash]) => {
				let oldFilename = path.join(baseDir, oldFile)
				let newFilename = transformUrl(oldFilename, hash, method)
				return [oldFilename, newFilename]
			})
			.filter(([oldFile]) => fsSync.existsSync(oldFile))
			.map(([oldFile, newFile]) => fs.rename(oldFile, newFile)),
	)
}

/**
 * @param files {string[]}
 * @param baseDir {string}
 * @returns {Promise<Dictionary<unknown>>}
 */
async function createCacheBusters(files, baseDir) {
	let fullFilePaths = files.map(file => path.join(baseDir, file))
	let keys = files
	let values = await Promise.all(fullFilePaths.map(file => getRevisionHash(file)))
	let cacheBusters = _.zipObject(keys, values)
	cacheBusters["js/cache-busters.js"] = revHash(JSON.stringify(cacheBusters))

	return cacheBusters
}

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("cache_busting", "cache busting", async function() {
		let done = this.async()

		let fileOptions = this.files[0]
		let options = {
			...this.options(),
			...this.data,
		}

		let validationSchema = createValidationSchema()
		let validationResult = validationSchema.validate(options)
		if (validationResult.error) {
			grunt.log.error(validationResult.error.message)
			return done()
		}

		let wasCacheBusted = fsSync.existsSync(options.cache_busters.dest)
		if (wasCacheBusted) {
			grunt.log.error(`This directory is already cache busted! ${fileOptions.cwd}`)
			return done()
		}

		let cacheBusters = await createCacheBusters(fileOptions.src, fileOptions.cwd)
		let method = options.method

		grunt.log.writeln(`Method: ${method}`)

		await saveCacheBusters(options.cache_busters, cacheBusters, method)
		await transformGameJs(options.gameJs, fileOptions.cwd, cacheBusters["js/game.js"], method)
		await transformFiles(options.transformContent, fileOptions.cwd, cacheBusters, method)
		await renameFiles(fileOptions.cwd, cacheBusters, method)

		grunt.log.ok("Cache busting is complete!")
		done()
	})
}
