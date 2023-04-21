import { PhaserScreen } from '../container/screen/Screen'
import { IToastOptions, Toast } from './Toast'

export class ToastsManager extends PhaserScreen {
	private toasts: Toast[]

	constructor(scene: Phaser.Scene, backgroundKey: string, backgroundFrame?: string) {
		super(scene, {
			name: 'toasts',
			backgroundAlpha: 0,
			backgroundInteractive: false,
			backgroundKey,
			backgroundFrame,
		})

		this.toasts = []
	}

	public show(options: IToastOptions): void {
		this.dismissAll()

		let toast: Toast = new Toast(this.scene, options)
		this.toasts.push(toast)
		this.add(toast)
		this.pin(toast, 0.5, 1, 0, -toast.height / 2 + 1)
		this.pinner.align(toast, this.screenWidth, this.screenHeight, 1)

		toast.once(Phaser.GameObjects.Events.DESTROY, this.onToastDestroy, this)
		toast.show(options.lifespan)
	}

	public showVideoAdWarning() {
		this.show({
			lifespan: 3000,
			message: this.getRewardedAdsWarningText(),
		})
	}

	private getRewardedAdsWarningText() {
		let texts = this.scene.texts
		let message: string
		let language = this.scene.game.texts.language
		if (language === 'ru' || language === 'en') {
			message = texts.ads.no_rewarded_ads + ' ' + texts.ads.adblock_rewarded_ads
		} else {
			message = texts.ads.no_rewarded_ads
		}

		return message
	}

	private onToastDestroy(toast: Toast): void {
		let index = this.toasts.indexOf(toast)
		if (index > -1) {
			this.toasts.splice(index, 1)
			this.pinner.unpin(toast)
		}
	}

	public dismissAll(): void {
		this.toasts.forEach((toast) => toast.dismiss())
	}

	public resize(): void {
		super.resize()
	}
}
