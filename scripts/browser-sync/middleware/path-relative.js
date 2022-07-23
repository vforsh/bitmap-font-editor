const globby = require("globby")
const { sendSuccess, sendError } = require("./utils")
const path = require("path")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { from, to } = req.body

	sendSuccess(res, path.relative(from, to))
}
