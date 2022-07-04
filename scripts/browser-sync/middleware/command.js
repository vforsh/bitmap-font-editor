const { command: execaCommand } = require("execa")

/**
 * @param req {http.IncomingMessage & { body: unknown }}
 * @param res {http.ServerResponse}
 * @param next {() => void}
 * @return {*}
 */
module.exports = function(req, res, next) {
	let { command, options } = req.body
	
	console.log(`===========================================`)
	console.log(`Executing command...`)
	console.log(`${command}\n`)

	let childProcess = execaCommand(command, options)
	childProcess.stderr.pipe(process.stderr)
	childProcess.stdout.pipe(process.stdout)

	childProcess.then((result) => {
		res.writeHead(200, { "Content-Type": "application/json" })
		res.end(JSON.stringify({ success: true, data: result }, null, 2))
	})

	childProcess.catch((error) => {
		res.writeHead(500, { "Content-Type": "application/json" })
		res.end(JSON.stringify({ success: false, error }, null, 2))
	})

	childProcess.finally(() => {
		console.log(`===========================================`)
	})
}
