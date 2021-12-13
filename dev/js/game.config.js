(function(root, factory) {
	if (typeof module === "object" && module.exports) {
		module.exports = factory()
	} else {
		root.game = {
			config: factory(),
		}
	}
})(typeof self !== "undefined" ? self : this, function() {
	/**
	 * @param value {{ days?: number, hours?: number, minutes?: number, seconds?: number, ms?: number }}
	 * @returns {number}
	 */
	function toMs(value) {
		Object.assign({ days: 0, hours: 0, minutes: 0, seconds: 0, ms: 0 }, value)

		var sum = 0

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

	return {
		build_time: "{{ BUILD_TIME }}",
		build_version: 1,
		publisher: "robowhale",
		game_title: "Bitmap Font Editor",
		game_slug: "bitmap-font-editor",
		default_language: "en",
		feedback_enabled: true,
		feedback_url: "", // TODO update feedback google sheet
		analytics_enabled: false
	}
})
