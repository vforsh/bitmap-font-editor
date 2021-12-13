const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const chalk = require("chalk")
const { updateHashes } = require("./png-helpers/utils")
const { filterSourceFiles } = require("./png-helpers/utils")
const { getTotalSize, rename, logSavings } = require("./png-helpers/utils")

module.exports = function(grunt) {

	grunt.registerMultiTask("png2webp", "Convert png to webp", async function() {
		const done = this.async()
		const options = {
			quality: 75,
			method: 4,
			lossless: false,
			suffix: "",
			...this.data,
		}

		options.quality = _.clamp(options.quality, 0, 100)
		options.method = _.clamp(options.method, 0, 6) // 0 - fastest, 6 - slowest

		console.log(`Method: ${options.method} (0 is fastest, 6 is slowest)`)
		console.log(`Quality: ${options.quality}`)

		const compressionOptions = _.pick(options, "quality", "method")
		const useHashes = options.hashes && !options.hashesIgnore
		const hashesFilepath = path.join(this.files[0].dest, "_hashes.json")

		const originalSource = this.files[0].orig.src
		const source = useHashes
			? filterSourceFiles(grunt, hashesFilepath, originalSource, compressionOptions)
			: originalSource

		if (useHashes && source.length === 0) {
			console.log(chalk.yellow("Nothing to compress, everything is up to date! ✔️"))
			done()
			return
		}

		const destination = options.suffix
			? path.join(this.files[0].dest, "/temp")
			: this.files[0].dest

		const data = await compressImages(source, destination, options)
		const pngs = data.map(result => result.sourcePath)
		const webps = data.map(result => result.destinationPath)
		const [totalPngSize, totalWebpSize] = await Promise.all([
			getTotalSize(pngs),
			getTotalSize(webps),
		])

		if (options.hashes) {
			await updateHashes(hashesFilepath, pngs, compressionOptions)
		}

		if (options.suffix) {
			await rename(webps, options.suffix, ".webp", ".webp")
			await copyFromTempToDest(destination)
			fs.rmdirSync(destination, { recursive: true })
		}

		logSavings(totalPngSize, totalWebpSize)
		done()
	})

}

const compressImages = (source, destination, options) => {
	const imagemin = require("imagemin")
	const imageminWebp = require("imagemin-webp")

	return imagemin(source, {
		destination,
		plugins: [
			imageminWebp(options),
		],
	})
}

const copyFromTempToDest = (filePath) => {
	const cpy = require("cpy")
	return cpy(filePath, path.join(filePath, ".."), { overwrite: true })
}

