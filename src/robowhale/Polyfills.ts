export function callAllMethods(obj: any, exclude: string[] = []) {
	Object.getOwnPropertyNames(obj).forEach((property) => {
		let isFunction: boolean = typeof obj[property] === "function"
		let isExcluded: boolean = exclude.includes(property)
		if (isFunction && isExcluded === false) {
			obj[property]()
		}
	})
}

export class Polyfills {
	
	public static polyfill(): void {
		callAllMethods(Polyfills, ["polyfill"])
	}
	
	public static nodeRemove(): void {
		let arr = [Element, CharacterData, DocumentType]
		let args = []
		
		arr.forEach(function(item) {
			if (item) {
				args.push(item.prototype)
			}
		});
		
		// from:https://github.com/jserz/js_piece/blob/master/DOM/ChildNode/remove()/remove().md
		(function(arr) {
			arr.forEach(function(item) {
				if (item.hasOwnProperty("remove")) {
					return
				}
				Object.defineProperty(item, "remove", {
					configurable: true,
					enumerable: true,
					writable: true,
					value: function remove() {
						this.parentNode.removeChild(this)
					},
				})
			})
		})(args)
	}
	
}
