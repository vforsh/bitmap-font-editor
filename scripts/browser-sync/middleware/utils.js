module.exports = {
	/**
	 * @param res {http.ServerResponse}
	 * @param result {unknown}
	 */
	sendSuccess(res, result) {
		res.writeHead(200, { "Content-Type": "application/json" })
		res.end(JSON.stringify({ success: true, result }))
	},

	/**
	 * @param res {http.ServerResponse}
	 * @param error {unknown}
	 */
	sendError(res, error) {
		res.writeHead(400, { "Content-Type": "application/json" })
		res.end(JSON.stringify({ success: false, error }))
	}
}
