/**
 * https://developer.mozilla.org/en-US/docs/Web/API/Navigator/deviceMemory
 * @returns {number} Device memory in megabytes
 */
export function getDeviceMemory(): number | undefined {
	try {
		if (typeof navigator['deviceMemory'] === 'number') {
			return navigator['deviceMemory'] * 1024
		}
	} catch (error) {}
}
