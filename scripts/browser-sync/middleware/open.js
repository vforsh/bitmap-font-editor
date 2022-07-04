const { existsSync } = require("fs")
const open = require("open")
const { sendError, sendSuccess } = require("./utils")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { filepath, options } = req.body

	let fileExists = existsSync(filepath)
	if (fileExists === false) {
		return sendError(res, `Path ${filepath} doesn't exist!`)
	}

	open(filepath, options)
		.then(result => sendSuccess(res, result))
		.catch(error => sendError(res, error))
}
