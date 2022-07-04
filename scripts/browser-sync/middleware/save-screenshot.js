const fs = require("fs/promises")
const open = require("open")
const path = require("path")
const { existsSync } = require("fs")

/**
 * @param req {http.IncomingMessage & { body: Buffer }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = async function saveScreenshot(req, res, next) {
	let directory = "screenshots"
	let filename = `${directory}/${Date.now()}.png`

	await ensureDirectoryExists(directory)
	await clearOldScreenshots(directory)

	fs.writeFile(filename, req.body).then(async () => {
		await open(filename, { wait: true })
		res.writeHead(200, `File was successfuly saved!`)
	}).catch((error) => {
		console.error(error)
		res.writeHead(400, JSON.stringify(error))
	}).finally(() => {
		res.end()
	})
}

/**
 * @param directory {string}
 * @returns {Promise<void>}
 */
async function ensureDirectoryExists(directory) {
	if (existsSync(directory)) {
		return Promise.resolve()
	}

	return fs.mkdir(directory)
}

/**
 *
 * @param directory {string}
 */
async function clearOldScreenshots(directory) {
	let threshold = toMs({ days: 5 })
	let files = await fs.readdir(path.normalize(directory))

	for await (filepath of files) {
		let fullpath = path.join(directory, filepath)
		let status = await fs.stat(fullpath)
		let msSinceCreated = Date.now() - status.birthtimeMs
		if (msSinceCreated > threshold) {
			await fs.unlink(fullpath)
		}
	}
}

function toMs(value) {
	let sum = 0

	if (typeof value.days === "number") {
		sum += value.days * 24 * 60 * 60 * 1000
	}

	if (typeof value.hours === "number") {
		sum += value.hours * 60 * 60 * 1000
	}

	if (typeof value.minutes === "number") {
		sum += value.minutes * 60 * 1000
	}

	if (typeof value.seconds === "number") {
		sum += value.seconds * 1000
	}

	if (typeof value.ms === "number") {
		sum += value.ms
	}

	return sum
}

