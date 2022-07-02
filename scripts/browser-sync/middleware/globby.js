const globby = require("globby")
const { sendSuccess, sendError } = require("./utils")

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

	let data = ""
	req.on("data", chunk => data += chunk)
	req.on("end", async () => {
		let { patterns, options } = JSON.parse(data)

		globby(patterns, options)
			.then(result => sendSuccess(res, result))
			.catch(error => sendError(res, error))
	})
}
