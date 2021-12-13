const querystring = require("querystring")
const { saveLevels, saveSummaries, saveLevelsSeparately } = require("../../levels/save")

function saveConfigs(request, response, next) {
	if (request.method !== "POST") {
		return next()
	}

	let dataRaw = ""
	request.on("data", (chunk) => dataRaw += chunk)
	request.on("end", () => {
		let basepath = "dev/assets/configs/levels"

		let parsed = querystring.parse(dataRaw)
		let { content } = parsed
		// let contentParsed = JSON.parse(content)

		Promise.all([
			saveLevels(basepath, content),
			// saveSummaries(basepath, contentParsed),
			// ...saveLevelsSeparately(basepath, contentParsed),
		])
			.then(() => {
				response.writeHead(200, `Files were successfuly saved!`)
				response.end()
			})
			.catch((error) => {
				console.log(error)
				response.writeHead(400, JSON.stringify(error))
				response.end()
			})
	})
}

module.exports = saveConfigs
