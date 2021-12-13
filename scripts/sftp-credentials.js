const fs = require("fs")
const path = require("path")

module.exports = function() {
	let pathToJson = path.join(process.cwd(), "./scripts/sftp.json")

	let jsonExists = fs.existsSync(pathToJson)
	if (jsonExists === false) {
		let defaultCredentials = {
			username: "USERNAME",
			password: "PASSWORD",
		}

		fs.writeFileSync(pathToJson, JSON.stringify(defaultCredentials, null, 4), { encoding: "utf8" })
	}

	return require("load-json-file").sync(pathToJson)
}
