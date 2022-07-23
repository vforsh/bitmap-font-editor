const { sendSuccess, sendError } = require("./utils")
const fs = require("fs/promises")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { path } = req.body

	fs.realpath(path)
		.then(result => sendSuccess(res, result))
		.catch(error => sendError(res, error))
}
