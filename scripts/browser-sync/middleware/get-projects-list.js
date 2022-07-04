const { existsSync } = require("fs")
const fs = require("fs/promises")
const path = require("path")
const globby = require("globby")
const slash = require("slash")
const { sendError } = require("./utils")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = async function(req, res, next) {
	let { dirpath } = req.body

	let dirExists = existsSync(dirpath)
	if (dirExists === false) {
		return sendError(res, `Directory ${dirpath} doesn't exist!`)
	}

	let stat = await fs.stat(dirpath)
	if (stat.isDirectory() === false) {
		return sendError(res, `${dirpath} is not a directory!`)
	}

	// globby doesn't allow backward slashes so we replace them
	let dirpathFixed = slash(dirpath)
	let pattern = path.posix.join(dirpathFixed, "**/*.project.json")
	let projects = await globby(pattern)
	res.writeHead(200, { "Content-Type": "application/json" })
	res.end(JSON.stringify(projects))
}
