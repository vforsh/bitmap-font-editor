(function(root, factory) {
	var target = typeof module === "object" && module.exports
		? module.exports
		: root

	Object.assign(target, factory())
})(typeof self !== "undefined" ? self : this, function() {
	return {
		cacheBustingMethod: "__METHOD__",
		cacheBusters: "__HASHES__",
	}
})
