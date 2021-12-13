function getConsoleMethods() {
	const consoleMethods = [
		"log",
		"info",
		"warn",
		"error",
		"assert",
		"group",
		"groupCollapsed",
		"groupEnd",
		"time",
		"timeEnd",
		"count",
		"countReset",
		"dir",
		"dirxml",
		"table",
	]

	return consoleMethods.map(method => `console.${method}`)
}

/**
 * @returns {string}
 */
function getBuildTime() {
	let date = new Date()
	let firstPart = date.toLocaleDateString()
	let secondPart = date.toTimeString().slice(0, 8)
	return `${firstPart} ${secondPart}`
}

/**
 * @param items {...string}
 * @returns {string}
 */
function concat(...items) {
	return items
		.map(content => {
			let newContent = content.trim()
			if (newContent.endsWith(";") === false) {
				newContent += ";"
			}

			return newContent
		})
		.join("\n\n")
}

exports.external = ["howler", "@sentry", "css-element-queries", "idb-keyval"]
exports.getConsoleMethods = getConsoleMethods
exports.getBuildTime = getBuildTime
exports.concat = concat
