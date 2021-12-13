declare var gdsdk: GameDistribtion.SDK
declare var GD_OPTIONS: {
	gameId: string
	onEvent: (event: GameDistribtion.GdsdkEvent) => any
}

declare namespace GameDistribtion {
	interface SDK {
		openConsole(): void
		showAd(type?: string): Promise<any>
		preloadAd(type?: string): Promise<any>
		getSession(): Promise<Session>
	}
	
	interface Session {
		ads: any
		location: {
			depth: number
			parentDomain: string
			parentURL: string
			topDomain: string
			loadedByGameZone: boolean
		}
	}
	
	interface GdsdkEvent {
		name: string
		message: string
		status?: string
	}
}
