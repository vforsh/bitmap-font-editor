const fs = require("fs")
const path = require("path")
const _ = require("lodash")
const chalk = require("chalk")
const { calculateSavings } = require("./png-helpers/utils")
const { updateHashes } = require("./png-helpers/utils")
const { getTotalSize, rename, logSavings, filterSourceFiles } = require("./png-helpers/utils")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {

	grunt.registerMultiTask("png2avif", "Convert png to avif", async function() {
		const done = this.async()
		const options = {
			jobs: 8,
			lossless: false,
			quality: 25,
			qualityAlpha: 25,
			speed: 5,
			suffix: "",
			...this.data,
		}

		options.min = _.clamp(options.quality, 0, 63) // 0 - lossless, 63 - worst quality
		options.max = options.min
		options.minalpha = _.clamp(options.qualityAlpha, 0, 63) // 0 - lossless, 63 - worst quality
		options.maxalpha = options.minalpha
		options.speed = _.clamp(options.speed, 0, 8) // 0 - slowest, 10 - fastest, !!! 9 and 10 doesn't work with current AVIF encoder !!!

		console.log(`Speed: ${options.speed} (0 is slowest, 10 is fastest)`)
		console.log(`Quality: ${options.quality}`)
		console.log(`Alpha quality: ${options.qualityAlpha}`)

		const compressionOptions = _.pick(options, "speed", "quality", "qualityAlpha")
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

		const data = await compress(source, destination, options)
		const pngs = data.map(result => result.sourcePath)
		const avifs = data.map(result => result.destinationPath)

		const [totalPngSize, totalAvifSize] = await calculateSavings(data)
		logSavings(totalPngSize, totalAvifSize)

		if (options.hashes) {
			updateHashes(hashesFilepath, pngs, compressionOptions)
		}

		await rename(avifs, options.suffix, ".png", ".avif")

		if (options.suffix) {
			await require("cpy")(destination, path.join(destination, ".."), { overwrite: true })
			fs.rmdirSync(destination, { recursive: true })
		}

		done()
	})

}

const compress = (source, destination, options) => {
	const imagemin = require("imagemin")
	const imageminAvif = require("@vheemstra/imagemin-avifenc")
	return imagemin(source, {
		destination,
		plugins: [
			imageminAvif(options),
		],
	})
}
