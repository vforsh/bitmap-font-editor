const { existsSync } = require("fs")
const fs = require("fs/promises")
const path = require("path")
const globby = require("globby")
const slash = require("slash")

module.exports = function(req, res, next) {
	if (req.method !== "POST") {
		return next()
	}

	let data = ""
	req.on("data", chunk => data += chunk)
	req.on("end", async () => {
		let { dirpath } = JSON.parse(data)

		let dirExists = existsSync(dirpath)
		if (dirExists === false) {
			res.writeHead(400, `Directory ${dirpath} doesn't exist!`)
			res.end()
			return
		}

		let stat = await fs.stat(dirpath)
		if (stat.isDirectory() === false) {
			res.writeHead(400, `${dirpath} is not a directory!`)
			res.end()
			return
		}

		// globby doesn't allow backward slashes so we replace them
		let dirpathFixed = slash(dirpath)
		let pattern = path.posix.join(dirpathFixed, "**/*.project.json")
		let projects = await globby(pattern)
		res.writeHead(200, { "Content-Type": "application/json" })
		res.end(JSON.stringify(projects))
	})
}
