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
	let { filepath } = req.body

	if (!path.isAbsolute(filepath)) {
		filepath = path.join(process.cwd(), filepath)
	}

	fse.stat(filepath)
		.then((stats) => {
			sendSuccess(res, {
				...stats,
				isFile: stats.isFile(),
				isDirectory: stats.isDirectory(),
				isSymbolicLink: stats.isSymbolicLink(),
			})
		})
		.catch((error) => sendError(res, error))
}
