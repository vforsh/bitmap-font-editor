const fs = require("fs/promises")
const path = require("path")
const { pathToFileURL } = require("url")
const formidable = require("formidable")

module.exports = function(req, res, next) {
	if (req.method !== "POST") {
		return next()
	}

	let form = formidable()

	form.parse(req, (err, fields, files) => {
		let { config, configPath, texturePath } = fields
		let { texture } = files

		let project = fields.project
		let projectPath = configPath.replace(".json", ".project.json")

		Promise.all([
			fs.writeFile(path.normalize(projectPath), project),
			fs.writeFile(path.normalize(configPath), config),
			fs.rename(texture.filepath, path.normalize(texturePath)),
		])
			.then(() => {
				let payload = {
					config: pathToFileURL(path.normalize(configPath)),
					texture: pathToFileURL(path.normalize(texturePath)),
					project: pathToFileURL(path.normalize(projectPath)),
				}

				res.writeHead(200, { "Content-Type": "application/json" })
				res.end(JSON.stringify(payload))
			})
			.catch((error) => {
				console.error(error)
				res.writeHead(400, JSON.stringify(error))
				res.end()
			})
	})
}
