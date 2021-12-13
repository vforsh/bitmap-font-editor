import { UrlParams } from "../../../UrlParams"
import { GameEnvironment } from "../../../GameEnvironment"

export function isAvifSupported(localStorage?: Storage): Promise<boolean> {
	let disableAvif = UrlParams.getBool("noAvif")
	if (disableAvif) {
		return Promise.resolve(false)
	}
	
	let isDevelop = window.environment === GameEnvironment.DEVELOP
	if (isDevelop) {
		return Promise.resolve(false)
	}
	
	let localStorageKey = "robowhale__avif"
	if (localStorage?.getItem(localStorageKey) === "true") {
		return Promise.resolve(true)
	}
	
	return new Promise<boolean>(resolve => {
		let callback = () => {
			if (image.height === 2) {
				localStorage?.setItem(localStorageKey, "true")
				resolve(true)
			} else {
				resolve(false)
			}
		}
		
		let image = new Image()
		image.onload = callback
		image.onerror = callback
		image.src = "data:image/avif;base64,AAAAIGZ0eXBhdmlmAAAAAGF2aWZtaWYxbWlhZk1BMUIAAADybWV0YQAAAAAAAAAoaGRscgAAAAAAAAAAcGljdAAAAAAAAAAAAAAAAGxpYmF2aWYAAAAADnBpdG0AAAAAAAEAAAAeaWxvYwAAAABEAAABAAEAAAABAAABGgAAAB0AAAAoaWluZgAAAAAAAQAAABppbmZlAgAAAAABAABhdjAxQ29sb3IAAAAAamlwcnAAAABLaXBjbwAAABRpc3BlAAAAAAAAAAIAAAACAAAAEHBpeGkAAAAAAwgICAAAAAxhdjFDgQ0MAAAAABNjb2xybmNseAACAAIAAYAAAAAXaXBtYQAAAAAAAAABAAEEAQKDBAAAACVtZGF0EgAKCBgANogQEAwgMg8f8D///8WfhwB8+ErK42A="
	})
}
