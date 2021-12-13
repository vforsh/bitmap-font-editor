const Joi = require("joi")

/**
 * @returns {Joi.ObjectSchema<any>}
 */
function createValidationSchema() {
	return Joi.object({
		query: Joi.object().optional(),
		base: Joi.string().uri().required(),
		text: Joi.string().required(),
	}).unknown(true)
}

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("print_url", "Print URL to console", async function() {
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

		let fullUrl = options.query
			? options.base + `?${new URLSearchParams(options.query).toString()}`
			: options.base

		grunt.log.subhead(`${options.text}: ${fullUrl}`)
	})
}

