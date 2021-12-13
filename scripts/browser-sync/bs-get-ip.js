const getLocalIPs = require("get-ip")

function getExternalIp() {
	const ips = getLocalIPs()
	const filterIPs = (ip) => (ip.split(".")[2] === "1")
	const validIPs = ips.filter(filterIPs)
	if (validIPs.length > 0) {
		return validIPs[0]
	}

	return ips[0]
}

module.exports = getExternalIp
