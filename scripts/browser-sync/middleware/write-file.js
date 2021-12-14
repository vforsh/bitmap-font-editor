const fs = require("fs/promises")
const { existsSync } = require("fs")
const formidable = require("formidable")
const slash = require("slash")
const isValidFilename = require("valid-filename")
const { basename } = require("path")

/**
 * @param req {http.IncomingMessage}
 * @param res {http.ServerResponse}
 * @param next
 * @return {*}
 */
module.exports = function(req, res, next) {
	if (req.method !== "POST") {
		return next()
	}

	let form = formidable()

	form.parse(req, (err, fields, files) => {
		let { filepath, overwrite } = fields
		let { content } = files

		overwrite = overwrite === "true"

		let fileExists = existsSync(filepath)
		if (fileExists && !overwrite) {
			res.writeHead(400, { "Content-Type": "application/json" })
			res.end(JSON.stringify({ success: false, error: `File ${filepath} exists already!` }))
			return
		}

		let filename = basename(filepath)
		if (!isValidFilename(filename)) {
			res.writeHead(400, { "Content-Type": "application/json" })
			res.end(JSON.stringify({ success: false, error: `Invalid file name "${filename}" !` }))
			return
		}

		fs.rename(content.filepath, filepath)
			.then(() => {
				res.writeHead(200, { "Content-Type": "application/json" })
				res.end(JSON.stringify({ success: true, filepath: slash(filepath) }))
			})
			.catch((error) => {
				res.writeHead(200, { "Content-Type": "application/json" })
				res.end(JSON.stringify({ success: false, error }))
			})
	})
}
