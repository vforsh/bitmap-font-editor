import { UrlParams } from "./UrlParams"
import { cssAnimate } from "./robowhale/utils/css-animate"

export class LoadingOverlay {
	
	private game: Phaser.Game
	private overlay: HTMLDivElement
	private spinner: HTMLDivElement
	
	constructor(game: Phaser.Game) {
		this.game = game
		
		this.overlay = document.getElementById("loading-overlay") as HTMLDivElement
		this.overlay.classList.add("animate__animated")
		
		this.spinner = this.overlay.querySelector(".loading-spinner")
		
		window.addEventListener("resize", this.onWindowResize.bind(this))
		this.onWindowResize()
	}
	
	private onWindowResize(): void {
	
	}
	
	public showPreloader(): void {
		this.onWindowResize()
	}
	
	public hidePreloader(): void {
	}
	
	public fadeIn(): void {
		this.overlay.style.display = "flex"
		this.overlay.classList.remove("animate__fadeOut")
		cssAnimate(this.overlay, "animate__fadeIn", 300)
	}
	
	public fadeOut(): void {
		let instant = UrlParams.getBool("instantSceneChange")
		if (instant) {
			this.overlay.style.display = "none"
			return
		}
		
		this.overlay.classList.remove("animate__fadeIn")
		cssAnimate(this.overlay, "animate__fadeOut", 200).then(() => {
			this.overlay.style.display = "none"
		})
	}
	
	public isVisible(): boolean {
		return this.overlay.style.display === "flex"
	}
}
