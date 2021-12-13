const execa = require("execa")
const path = require("path")
const chalk = require("chalk")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("rsync", "rsync", async function() {
		const done = this.async()
		const options = {
			...this.data,
		}

		let rsync = path.normalize(options.rsync) ?? "rsync"
		let ssh = path.normalize(options.ssh)
		let sshKey = path.normalize(options.sshKey)
		let source = path.resolve(options.source)
		let destination = options.destination
		let host = options.host
		let args = options.args ?? "-a"
		let exclude = options.exclude
			? options.exclude.map(entry => `--exclude "${entry}"`).join(" ")
			: ""

		let command = `${rsync} -e "${ssh} -i ${sshKey}" ${args} . ${host}:${destination} ${exclude}`
		console.log(command)
		console.log(`Local ${chalk.bold(options.source)}`)
		console.log(`Remote ${chalk.bold(destination)}`)

		let childProcess = execa.command(command, { shell: true, cwd: source })
		childProcess.stderr.pipe(process.stderr)
		childProcess.stdout.pipe(process.stdout)
		childProcess
			.then(() => grunt.log.ok("Rsync is complete!"))
			.catch(() => grunt.log.error("Rsync has failed!"))
			.finally(() => done())
	})
}

