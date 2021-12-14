const { existsSync } = require("fs")
const fs = require("fs/promises")

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
		let { filepath } = JSON.parse(data)

		let fileExists = existsSync(filepath)
		if (fileExists === false) {
			res.writeHead(400, `File ${filepath} doesn't exist!`)
			res.end()
			return
		}

		let stat = await fs.stat(filepath)
		if (stat.isFile() === false) {
			res.writeHead(400, `${filepath} is not a file!`)
			res.end()
			return
		}

		let file = await fs.readFile(filepath)
		res.writeHead(200, { "Content-Type": "application/octet-stream" })
		res.end(file)
	})
}
