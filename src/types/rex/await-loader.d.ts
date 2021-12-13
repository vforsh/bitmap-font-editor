type AwaitLoaderCallback = (onSuccess: Function, onFail: Function) => void

declare namespace Phaser {
	namespace Loader {
		interface LoaderPlugin {
			rexAwait(key: string, config: { callback: AwaitLoaderCallback }): Phaser.Loader.LoaderPlugin
			rexAwait(callback: AwaitLoaderCallback): Phaser.Loader.LoaderPlugin
		}
	}
}
