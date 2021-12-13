const config = require("../dev/js/game.config.js")
const { json2ts } = require("json-ts")
const fs = require("fs")
const path = require("path")

let result = json2ts(JSON.stringify(config), {
	rootName: "GameConfig",
})

fs.writeFile(path.normalize("./src/IGameConfig.ts"), "export " + result, { encoding: "utf8" }, (err) => {
	if (err) {
		console.warn(err)
	}
})
