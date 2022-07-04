const { existsSync } = require("fs")
const fs = require("fs/promises")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = async function(req, res, next) {
	let { filepath } = req.body

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
}
