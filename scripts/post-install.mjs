import fse from "fs-extra"

ensureStartProjectConfig()

function ensureStartProjectConfig() {
	/** @type {IStartProjectConfig} */
	let config = {
		game: "",
		project: "",
	}

	fse.outputJsonSync('dev/assets/start_project.json', config)
}
