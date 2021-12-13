const path = require("path")
const _ = require("lodash")
const chalk = require("chalk")
const { updateHashes } = require("./png-helpers/utils")
const { filterSourceFiles } = require("./png-helpers/utils")
const { getTotalSize, logSavings } = require("./png-helpers/utils")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {

	grunt.registerMultiTask("pngquant", "Compress PNG using pngquant", async function() {
		const done = this.async()
		const options = {
			speed: 4,
			dithering: 1,
			quality: [0, 1],
			strip: true,
			...this.data,
		}

		options.speed = _.clamp(options.speed, 1, 11) // 1 - slowest, 11 - fastest
		options.dithering = _.clamp(options.dithering, 0, 1) // 0 - no dithering, 1 - full dithering
		options.quality[0] = _.clamp(options.quality[0], 0, 1) // two numbers between 0...1, for example [0.3, 0.5]
		options.quality[1] = _.clamp(options.quality[1], options.quality[0], 1)

		console.log(`Speed: ${options.speed}`)
		console.log(`Dithering: ${options.dithering}`)
		console.log(`Quality: [${options.quality.join(", ")}]`)

		const compressionOptions = _.pick(options, "speed", "dithering", "quality")
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

		const data = await compress(options, source, this.files[0].dest)
		const sourcePngs = data.map(result => result.sourcePath)
		const destPngs = data.map(result => result.destinationPath)
		const [totalSourceSize, totalResultSize] = await Promise.all([
			getTotalSize(sourcePngs),
			getTotalSize(destPngs),
		])

		if (options.hashes) {
			await updateHashes(hashesFilepath, sourcePngs, compressionOptions)
		}

		logSavings(totalSourceSize, totalResultSize)
		done()
	})

}

const compress = (options, source, destination) => {
	const imagemin = require("imagemin")
	const pngquant = require("imagemin-pngquant")

	return imagemin(source, {
		destination,
		plugins: [
			pngquant(options),
		],
	})
}

