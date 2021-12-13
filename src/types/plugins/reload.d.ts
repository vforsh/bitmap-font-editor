type ReloadIntervalType = "fixed" | "expo"

declare namespace Phaser {
	namespace Loader {
		interface LoaderPlugin {
			calculateReloadDelay(intervalType: ReloadIntervalType, intervalMs: number, attempt?: number): number
			reload?: Partial<{
				failedList: string[]
				scheduled: boolean
				attempt: number
				config: Partial<{
					intervalType: ReloadIntervalType,
					intervalMs: number
					attemps: number
					ignoreKeys: string[]
				}>
			}>
		}
	}
}
