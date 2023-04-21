export class NetUtil {
	public static getCurrentHost(): string {
		if (window.location && window.location.hostname) {
			return window.location.hostname
		}

		return null
	}

	public static isLocalhost(...localhostAliases: string[]): boolean {
		return NetUtil.isHostAllowed([...localhostAliases, 'localhost'])
	}

	public static isHostAllowed(allowedHosts: string[]): boolean {
		let currentHost: string = NetUtil.getCurrentHost()
		if (currentHost) {
			return allowedHosts.some((host: string) => {
				return currentHost.includes(host)
			})
		}

		return false
	}

	public static inIFrame(): boolean {
		try {
			return window.self !== window.top
		} catch (e) {
			return true
		}
	}
}
