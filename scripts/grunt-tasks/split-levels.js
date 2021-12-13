const loadJsonFile = require("load-json-file")
const { createLevelsSummaries } = require("../levels/create-summary")
const { saveSummaries, saveLevelsSeparately } = require("../levels/save")
const { fromPairs } = require("lodash")
const globby = require("globby")
const { unlink } = require("fs/promises")
const { pathToFileURL } = require("url")
const Joi = require("joi")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("split_levels", "split levels", async function() {
		const done = this.async()
		const options = {
			...this.options(),
			...this.data,
		}

		let validationSchema = createValidationSchema()
		let validationResult = validationSchema.validate(options)
		if (validationResult.error) {
			grunt.log.error(validationResult.error.message)
			return done()
		}

		let levelsJson = await loadJsonFile(options.source)
		let cleanedUp = cleanupLevelsJson(levelsJson)
		let levelsSummary = createLevelsSummaries(cleanedUp)

		await cleanDirectory(options.outDir)

		await Promise.all([
			saveSummaries(options.outDir, levelsSummary),
			...saveLevelsSeparately(options.outDir, cleanedUp),
		])

		let levelNumbers = Object.keys(levelsSummary)
		let fileUri = pathToFileURL(options.outDir).href
		grunt.log.ok(`${levelNumbers.length} levels created at ${fileUri}`)

		done()
	})
}

function createValidationSchema() {
	return Joi.object({
		source: Joi.string().required(),
		outDir: Joi.string().required(),
	}).unknown(true)
}

/**
 *
 * @param levelsJson {Record<string, ILevelConfig>}
 * @return {Record<string, ILevelConfig>}
 */
function cleanupLevelsJson(levelsJson) {
	Object.values(levelsJson).forEach((config) => {
		let weights = Object.entries(config.generator.weights).filter(([type, value]) => value > 0)
		config.generator.weights = fromPairs(weights)

		let goals = Object.entries(config.goals).filter(([type, value]) => value > 0)
		config.goals = fromPairs(goals)

		let mysteryBoxes = Object.entries(config.mysteryBoxes).filter(([type, value]) => value > 0)
		config.mysteryBoxes = fromPairs(mysteryBoxes)
	})

	return levelsJson
}

/**
 * @param dirPath {string}
 * @return {Promise<void>}
 */
async function cleanDirectory(dirPath) {
	let patterns = ["/level_*.json", "_summaries.json"].map(pattern => dirPath + "/" + pattern)
	let files = await globby(patterns)
	return files.map(file => unlink(file))
}
