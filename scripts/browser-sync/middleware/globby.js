const globby = require("globby")
const { sendSuccess, sendError } = require("./utils")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { patterns, options } = req.body

	globby(patterns, options)
		.then(result => sendSuccess(res, result))
		.catch(error => sendError(res, error))
}
