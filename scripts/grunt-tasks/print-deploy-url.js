/**
 * @param {IGrunt} grunt
 */
module.exports = function(grunt) {

	grunt.registerTask("print-deploy-url", "Print deploy URL to console", function() {
		const query = new URLSearchParams({
			unlockLevels: "all",
			gdDisable: 1,
			fakeAds: 1,
		})

		let subdir = "main/"
		let url = "https://robowhale.com/html5/papa-cherry-saga/" + subdir + "?" + query.toString()

		grunt.log.subhead(`Play: ${url}`)
	})

}

