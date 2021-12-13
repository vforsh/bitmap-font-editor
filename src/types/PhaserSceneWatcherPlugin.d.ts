declare class PhaserSceneWatcherPlugin extends Phaser.Plugins.BasePlugin {
	watchAll(): void
	watch(scene: Phaser.Scene)
	unwatchAll()
	unwatch(scene: Phaser.Scene)
	getSceneOutput(scene: Phaser.Scene)
}
