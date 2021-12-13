declare var eruda: IERudaConsole

declare interface IERudaConsole {
	init(options?: Partial<IErudaInitOptions>): void
	destroy()
	position(value: { x: number; y: number })
	get(toolKey: string): any
	remove(toolKey: string)
	show(toolKey?: string)
	hide()
}

declare interface IErudaInitOptions {
	container: HTMLElement
	tool: string[]
	autoScale: boolean
	useShadowDom: boolean
}
