const fetch = require("node-fetch")

/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {
	grunt.registerMultiTask("bunnyNetPurge", "bunny.net purge", async function() {
		const done = this.async()
		const options = {
			...this.data,
		}

		let results = await Promise.all(options.urls.map((url) => purgeUrl(url, options.accessKey)))
		let allComplete = results.every(value => value)
		if (allComplete) {
			grunt.log.ok("Purge is complete!")
		} else {
			grunt.log.error(`Purge has failed!`)
		}

		done()
	})
}

/**
 *
 * @param url {string}
 * @param accessKey {string}
 * @returns {Promise<boolean>}
 */
async function purgeUrl(url, accessKey) {
	let apiUrl = "https://api.bunny.net/purge"
	let fullUrl = `${apiUrl}?url=${(url)}`

	let response = await fetch(fullUrl, {
		method: "POST",
		headers: {
			"AccessKey": accessKey,
		},
	})

	if (response.ok) {
		console.log(`✔  ${url}️`)
		return true
	} else {
		console.log(`❌  ${url} ${response.statusText}`)
		return false
	}
}


