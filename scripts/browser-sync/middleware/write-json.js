const { existsSync } = require("fs")
const slash = require("slash")
const isValidFilename = require("valid-filename")
const { basename } = require("path")
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
	let { filepath, content, overwrite } = req.body

	if (!path.isAbsolute(filepath)) {
		filepath = path.join(process.cwd(), filepath)
	}

	let fileExists = existsSync(filepath)
	if (fileExists && !overwrite) {
		sendError(res, `File ${filepath} exists already!`)
		return
	}

	let filename = basename(filepath)
	if (!isValidFilename(filename)) {
		sendError(res, `Invalid file name "${filename}" !`)
		return
	}

	fse.outputJSON(filepath, content, { spaces: '\t' })
		.then(() => sendSuccess(res, slash(filepath)))
		.catch((error) => sendError(res, error))
}
