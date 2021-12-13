const filesize = require("filesize")
const _ = require("lodash")
const fs = require("fs/promises")
const path = require("path")
const chalk = require("chalk")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("filesize", "Print filesize", async function() {
		let done = this.async()

		let fileOptions = this.files[0]
		let options = {
			...this.options(),
			...this.data,
		}

		let files = fileOptions.src
		let fullFilePaths = files.map(file => path.join(fileOptions.cwd, file))
		let stats = await Promise.all(fullFilePaths.map((file) => fs.stat(file)))
		let readable = stats.map(stats => filesize(stats.size, { exponent: 2 }))

		let longestKey = _.maxBy(files, (file) => file.length)
		let keys = files.map(file => _.padEnd(file, longestKey.length + 5, " "))

		let longestValue = _.maxBy(readable, size => size.length)
		let values = readable.map(value => _.padStart(value, longestValue.length, " "))

		let format = options.format
		if (format === "table") {
			console.table(_.zipObject(keys, values))
		} else {
			keys
				.map((key, index) => `${key} ${values[index]}`)
				.forEach(entry => console.log(chalk.bold(entry)))
		}

		grunt.log.ok("Successful!")

		done()
	})
}
