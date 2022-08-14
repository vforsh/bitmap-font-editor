const slash = require("slash")
const path = require("path")
const { sendSuccess, sendError } = require("./utils")
const fse = require("fs-extra")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { filepath, force } = req.body

	if (!path.isAbsolute(filepath)) {
		filepath = path.join(process.cwd(), filepath)
	}

	fse.rm(filepath, { force })
		.then(() => sendSuccess(res, slash(filepath)))
		.catch((error) => sendError(res, error))
}
