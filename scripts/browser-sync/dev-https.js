const coreConfig = require("./dev")
const fs = require("fs")

const keyPath = "scripts/browser-sync/key.pem"
const certPath = "scripts/browser-sync/cert.pem"
const keyExists = fs.existsSync(keyPath)
const certExists = fs.existsSync(certPath)

let https = keyExists && certExists
	? { https: { key: keyPath, cert: certPath } }
	: { https: true }

/**
 * @type {browserSync.Options}
 */
module.exports = {
	...coreConfig,
	...https,
	xip: true,
}
