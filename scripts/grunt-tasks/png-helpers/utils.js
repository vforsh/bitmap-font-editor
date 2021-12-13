function addSuffix(filePaths, suffix, originalExt, newExt) {
	const fs = require("fs")
	const path = require("path")

	return Promise.all(
		filePaths.map((filePath) => {
			return new Promise(resolve => {
				let parts = filePath.split(path.sep)
				let fileName = parts.pop()
				let newFileName = fileName.replace(originalExt, `${suffix}${newExt}`)
				let newPath = path.join(...parts, newFileName)
				fs.rename(filePath, newPath, resolve)
			})
		}),
	)
}

async function getTotalFilesize(filePaths) {
	const fs = require("fs")

	let sizes = await Promise.all(filePaths.map((path) => {
		return new Promise(resolve => {
			fs.stat(path, (err, stats) => resolve(stats.size))
		})
	}))

	return sizes.reduce((acc, size) => {
		return (acc += size, acc)
	}, 0)
}

function calculateSavings(imageminResultData) {
	const sources = imageminResultData.map(result => result.sourcePath)
	const dest = imageminResultData.map(result => result.destinationPath)

	return Promise.all([
		getTotalFilesize(sources),
		getTotalFilesize(dest),
	])
}

function logSavings(originalSize, compressedSize) {
	const chalk = require("chalk")
	const filesize = require("filesize")
	const totalCompression = compressedSize / originalSize
	const totalCompressionStr = Math.round((1 - totalCompression) * 100).toFixed(0) + "%"
	const text = `Overall savings: ${filesize(originalSize - compressedSize)} | ${totalCompressionStr}`
	console.log(chalk.yellowBright(chalk.bold(text)))
}

/**
 * @param {IGrunt} grunt Grunt object
 * @param {string} hashesFilePath Path to json file with hash data
 * @param {string} originalSrc Path to files
 * @param {Object} compressionOptions Compression options - quality, speed, etc.
 */
function filterSourceFiles(grunt, hashesFilePath, originalSrc, compressionOptions) {
	const isEqual = require("lodash/isEqual")

	let hashesFileExists = grunt.file.exists(hashesFilePath)
	if (hashesFileExists === false) {
		return originalSrc
	}

	let hashes = grunt.file.readJSON(hashesFilePath)
	let files = grunt.file.expand(originalSrc).filter((path) => {
		let savedHashData = hashes[path]
		if (!savedHashData) {
			return true
		}

		return !isEqual(savedHashData, createHashData(path, compressionOptions))
	})

	return files
}

/**
 *
 * @param {string} hashesFilePath
 * @param {Array} filePaths
 * @param {Object} compressionOptions
 */
function updateHashes(hashesFilePath, filePaths, compressionOptions) {
	const fs = require("fs")
	const loadJson = require("load-json-file")

	let hashesFileExists = fs.existsSync(hashesFilePath)
	let hashes = hashesFileExists === false
		? {}
		: loadJson.sync(hashesFilePath)

	filePaths.forEach((path) => {
		hashes[path] = createHashData(path, compressionOptions)
	})

	fs.writeFileSync(hashesFilePath, JSON.stringify(hashes, null, 4))
}

function createHashData(path, compressionOptions) {
	let file = require("fs").readFileSync(path)
	let hash = require("rev-hash")(file)
	return {
		hash,
		...compressionOptions,
	}
}

exports.rename = addSuffix
exports.getTotalSize = getTotalFilesize
exports.calculateSavings = calculateSavings
exports.logSavings = logSavings
exports.filterSourceFiles = filterSourceFiles
exports.updateHashes = updateHashes
