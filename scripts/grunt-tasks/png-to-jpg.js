const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const chalk = require("chalk")
const { updateHashes } = require("./png-helpers/utils")
const { filterSourceFiles } = require("./png-helpers/utils")
const { getTotalSize, rename, logSavings } = require("./png-helpers/utils")

module.exports = function(grunt) {

	grunt.registerMultiTask("png2jpg", "Convert png to jpg", async function() {
		const done = this.async()
		const options = {
			quality: 95,
			suffix: "",
			...this.data,
		}

		options.quality = _.clamp(options.quality, 1, 100)

		console.log(`Quality: ${options.quality}`)

		const compressionOptions = _.pick(options, "quality")
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

		const originalDestination = this.files[0].dest
		const destination = options.suffix
			? path.join(originalDestination, "/temp")
			: originalDestination

		const data = await compress(options, source, destination)
		const pngs = data.map(result => result.sourcePath)
		const jpgs = data.map(result => result.destinationPath)
		const [totalPngSize, totalJpegSize] = await Promise.all([
			getTotalSize(pngs),
			getTotalSize(jpgs),
		])

		if (options.hashes) {
			await updateHashes(hashesFilepath, pngs, compressionOptions)
		}

		await rename(jpgs, options.suffix, ".png", ".jpg")

		if (options.suffix) {
			await require("cpy")(destination, path.join(destination, ".."), { overwrite: true })
			fs.rmdirSync(destination, { recursive: true })
		}

		await require("cpy")(originalDestination + "*.jpg", path.join(originalDestination, ".."), { overwrite: true })

		logSavings(totalPngSize, totalJpegSize)
		done()
	})

}

const compress = (options, source, destination) => {
	const imagemin = require("imagemin")
	const encoder = require("png-to-jpeg")

	return imagemin(source, {
		destination,
		plugins: [
			encoder(options),
		],
	})
}

