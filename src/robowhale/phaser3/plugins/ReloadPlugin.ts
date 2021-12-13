import LoaderPlugin = Phaser.Loader.LoaderPlugin

export class ReloadPlugin extends Phaser.Plugins.BasePlugin {
	
	constructor(pluginManager) {
		super(pluginManager)
	}
	
	public init(data?: any) {
		super.init(data)
		
		let loader = Phaser.Loader.LoaderPlugin.prototype
		let oldStart = loader.start
		
		let onFileLoadError = function(file: Phaser.Loader.File) {
			let _this = this as LoaderPlugin
			_this.reload.failedList.push(file.key)
		}
		
		let onPostProcess = function() {
			let _this = this as LoaderPlugin
			
			if (_this.totalFailed === 0) {
				return
			}
			
			if (_this.reload.failedList.every(key => _this.reload.config.ignoreKeys.includes(key))) {
				return
			}
			
			_this.reload.attempt ??= 0
			_this.reload.attempt++
			_this.reload.scheduled = _this.reload.attempt <= _this.reload.config.attemps
			if (_this.reload.scheduled === false) {
				return
			}
			
			let reloadDelay = _this.calculateReloadDelay(_this.reload.config.intervalType, _this.reload.config.intervalMs, _this.reload.attempt)
			console.log("onPostProcess.onPostProcess", reloadDelay)
			_this.scene.time.delayedCall(reloadDelay, () => {
				_this.emit("reload", this)
			})
		}
		
		loader.calculateReloadDelay = (intervalType, intervalMs, attempt): number => {
			if (intervalType === "fixed") {
				return intervalMs
			}
			
			return intervalMs * Math.pow(attempt, 2)
		}
		
		loader.start = function() {
			if (this.reload) {
				this.reload.failedList = []
				this.reload.scheduled = false
				this.reload.config = {
					intervalType: "fixed",
					intervalMs: 1000,
					attemps: Number.MAX_VALUE,
					ignoreKeys: [],
					...this.reload.config,
				}
				
				this.off(Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError, this)
				this.on(Phaser.Loader.Events.FILE_LOAD_ERROR, onFileLoadError, this)
				
				this.off(Phaser.Loader.Events.POST_PROCESS, onPostProcess, this)
				this.once(Phaser.Loader.Events.POST_PROCESS, onPostProcess, this)
			}
			
			oldStart.call(this)
		}
	}
	
	public start() {
		super.start()
	}
	
	public stop() {
		super.stop()
	}
	
	public destroy() {
		super.destroy()
	}
}
