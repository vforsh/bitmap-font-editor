export interface IPinnable {
	x: number
	y: number
	originalX?: number
	originalY?: number
}

export interface IPinnedObject {
	obj: IPinnable
	x: number
	y: number
	offsetX: number
	offsetY: number
}

export class Pinner {
	private pins: Map<IPinnable, IPinnedObject>

	constructor() {
		this.pins = new Map<IPinnable, IPinnedObject>()
	}

	public pin(obj: IPinnable, x: number, y: number, offsetX?: number, offsetY?: number): void {
		this.pins.set(obj, {
			obj,
			x: Phaser.Math.Clamp(x, 0, 1),
			y: Phaser.Math.Clamp(y, 0, 1),
			offsetX: offsetX ?? 0,
			offsetY: offsetY ?? 0,
		})
	}

	public pinAround(obj: IPinnable, anchor: IPinnable, offsetX?: number, offsetY?: number): void {
		let pin = this.getPin(anchor)
		if (!pin) {
			console.warn(`Can't pin around this anchor. Pin anchor first!`, anchor)
			return
		}

		this.pins.set(obj, {
			obj,
			x: pin.x,
			y: pin.y,
			offsetX: offsetX ?? 0,
			offsetY: offsetY ?? 0,
		})
	}

	public unpin(item: IPinnable): void {
		this.pins.delete(item)
	}

	public getPin(item: IPinnable): IPinnedObject | undefined {
		return this.pins.get(item)
	}

	public align(item: IPinnable, width: number, height: number, scale: number) {
		let pin = this.getPin(item)
		if (pin) {
			this.usePin(pin, width, height, scale)
		}
	}

	public onResize(width: number, height: number, scale: number): void {
		this.pins.forEach((pin) => {
			this.usePin(pin, width, height, scale)
		})
	}

	private usePin(pin: IPinnedObject, width: number, height: number, scale: number) {
		pin.obj.x = width * pin.x + pin.offsetX * scale
		pin.obj.y = height * pin.y + pin.offsetY * scale

		if (typeof pin.obj.originalX !== 'undefined') {
			pin.obj.originalX = pin.obj.x
		}

		if (typeof pin.obj.originalY !== 'undefined') {
			pin.obj.originalY = pin.obj.y
		}
	}

	public destroy(): void {
		this.pins.clear()
		this.pins = null
	}
}
