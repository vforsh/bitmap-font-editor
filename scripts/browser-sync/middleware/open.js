const { existsSync } = require("fs")
const open = require("open")

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
		let { filepath, options } = JSON.parse(data)

		let fileExists = existsSync(filepath)
		if (fileExists === false) {
			res.writeHead(400, { "Content-Type": "application/json" })
			res.end(JSON.stringify({ success: false, error: `Path ${filepath} doesn't exist!` }))
			return
		}

		open(filepath, options)
			.then((result) => {
				res.writeHead(200, { "Content-Type": "application/json" })
				res.end(JSON.stringify({ success: true, result }))
			})
			.catch((error) => {
				res.writeHead(400, { "Content-Type": "application/json" })
				res.end(JSON.stringify({ success: false, error }))
			})
	})
}
