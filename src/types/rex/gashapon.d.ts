// https://rexrainbow.github.io/phaser3-rex-notes/docs/site/gashapon/
// shuffe - pick item from box without put it back.
// random - pick item from box then put it back.

declare interface RexGashaponConfig {
	mode: "shuffle" | "random"
	items?: Record<string, number>
	reload?: boolean
	rnd?: Phaser.Math.RandomDataGenerator
}

declare interface RexGashapon {
	new(status?: any)
	next(itemType?: string): any
	eachItem(callback: (name, count) => void)
	toJSON(): any
	resetFromJSON(status: any)
}
