import { uniq } from "lodash-es"

export interface GridNeighbors<T extends IGridArrayItem> {
	topLeft?: T,
	top?: T,
	topRight?: T,
	left?: T,
	bottomLeft?: T,
	bottom?: T,
	bottomRight?: T,
	right?: T,
}

export interface GridOrthoNeighbors<T extends IGridArrayItem> {
	top?: T,
	right?: T,
	bottom?: T,
	left?: T,
}

export interface IGridPosition {
	column: number
	row: number
}

export type IGridArrayItem = IGridPosition

export class GridArray<T extends IGridArrayItem> {
	
	public static from<T extends IGridArrayItem>(array: T[], rows: number, columns: number): GridArray<T> {
		let gridArray = new GridArray<T>(rows, columns)
		gridArray.addMultiple(...array)
		
		return gridArray
	}
	
	public rows: number
	public columns: number
	public items: T[]
	
	constructor(rows: number, columns: number) {
		this.rows = rows
		this.columns = columns
		this.items = this.createArray(rows * columns)
	}
	
	private createArray(length: number) {
		let arr = []
		
		for (let i = 0; i < length; i++) {
			arr.push(null)
		}
		
		return arr
	}
	
	public checkAt(column: number, row: number): boolean {
		return !!this.getAt(column, row)
	}
	
	public getAt(column: number, row: number): T | null {
		if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
			return null
		}
		
		return this.items[row * this.columns + column]
	}
	
	public pullAt(column: number, row: number): T | null {
		if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
			return null
		}
		
		let index = row * this.columns + column
		let item = this.items[index]
		
		this.items[index] = null
		
		return item
	}
	
	public removeAt(column: number, row: number): void {
		if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
			return
		}
		
		this.items[row * this.columns + column] = null
	}
	
	public removeAll() {
		for (let i = 0; i < this.items.length; i++) {
			this.items[i] = null
		}
	}
	
	public add(item: T): boolean {
		return this.addAt(item.column, item.row, item)
	}
	
	public addMultiple(...items: T[]): boolean[] {
		return items.map(item => this.addAt(item.column, item.row, item))
	}
	
	public addAt(column: number, row: number, item: T): boolean {
		if (this.checkAt(column, row)) {
			console.warn(`Slot [${column}, ${row}] is taken!`)
			return false
		}
		
		if (column < 0 || column >= this.columns || row < 0 || row >= this.rows) {
			return false
		}
		
		this.items[row * this.columns + column] = item
		
		return true
	}
	
	public remove(item: T): void {
		this.removeAt(item.column, item.row)
	}
	
	public toArray(): T[] {
		return this.items.filter(Boolean)
	}
	
	public toArrayUniq(): T[] {
		return uniq(this.items.filter(Boolean))
	}
	
	public getNeighborsAt(column: number, row: number): GridNeighbors<T> {
		return {
			topLeft: this.getAt(column - 1, row - 1),
			top: this.getAt(column, row - 1),
			topRight: this.getAt(column + 1, row - 1),
			right: this.getAt(column + 1, row),
			bottomRight: this.getAt(column + 1, row + 1),
			bottom: this.getAt(column, row + 1),
			bottomLeft: this.getAt(column - 1, row + 1),
			left: this.getAt(column - 1, row),
		}
	}
	
	public getOrthoNeighborsAt(column: number, row: number): GridOrthoNeighbors<T> {
		return {
			top: this.getAt(column, row - 1),
			right: this.getAt(column + 1, row),
			bottom: this.getAt(column, row + 1),
			left: this.getAt(column - 1, row),
		}
	}
	
	/**
	 * @param {number} column
	 * @param {number} row
	 * @param {(value: T) => void} callback Callback is called only on existing neighbors
	 */
	public forEachOrthoNeighbor(column: number, row: number, callback: (value: T) => void): void {
		let top = this.getAt(column, row - 1)
		if (top) {
			callback(top)
		}
		
		let right = this.getAt(column + 1, row)
		if (right) {
			callback(right)
		}
		
		let bottom = this.getAt(column, row + 1)
		if (bottom) {
			callback(bottom)
		}
		
		let left = this.getAt(column - 1, row)
		if (left) {
			callback(left)
		}
	}
	
	public forEach(callbackfn: (value: T, index: number, array: T[]) => void): void {
		this.items.forEach((item, index, array) => item && callbackfn(item, index, array))
	}
	
	public some(predicate: (value: T, index: number, array: T[]) => boolean): boolean {
		return this.items.some((item, index, array) => item && predicate(item, index, array))
	}
	
	public every(predicate: (value: T, index: number, array: T[]) => boolean): boolean {
		return this.items.every((item, index, array) => !item || predicate(item, index, array))
	}
	
	public filter(callbackfn: (value: T, index: number, array: T[]) => boolean): T[] {
		return this.items.filter((item, index, array) => item && callbackfn(item, index, array))
	}
	
	public find(predicate: (value: T, index?: number) => boolean): T | undefined {
		return this.items.find((item, index) => item && predicate(item, index))
	}
	
	public findLast(predicate: (value: T, index?: number) => boolean): T | undefined {
		for (let i = this.items.length - 1; i > -1; i--) {
			let item = this.items[i]
			if (item && predicate(item, i)) {
				return item
			}
		}
	}
	
	public map<U extends IGridPosition>(callbackfn: (value: T, index: number, array: T[]) => U): GridArray<U> {
		let newGridArray = new GridArray<U>(this.rows, this.columns)
		
		this.items.forEach((item, index, array) => {
			if (item) {
				newGridArray.add(callbackfn(item, index, array))
			}
		})
		
		return newGridArray
	}
	
	public getItemsByColumn(column: number): T[] {
		let items = []
		let index = 0
		
		for (let row = 0; row < this.rows; row++) {
			let item = this.getAt(column, row)
			if (item && items.includes(item) === false) {
				items[index++] = item
			}
		}
		
		return items
	}
	
	public getItemsByRow(row: number): T[] {
		let items = []
		let index = 0
		
		for (let column = 0; column < this.columns; column++) {
			let item = this.getAt(column, row)
			if (item && items.includes(item) === false) {
				items[index++] = item
			}
		}
		
		return items
	}
	
	public clone(filterCallback?: (value: T) => boolean): GridArray<T> {
		let copy = new GridArray<T>(this.rows, this.columns)
		
		filterCallback
			? this.forEach(item => filterCallback(item) && copy.add(item))
			: this.forEach(item => copy.add(item))
		
		return copy
	}
	
	public swapItems(item_1: T, item_2: T): void {
		let { column: column_1, row: row_1 } = item_1
		let { column: column_2, row: row_2 } = item_2
		
		let actualItem_1 = this.pullAt(column_1, row_1)
		let actualItem_2 = this.pullAt(column_2, row_2)
		
		item_1.column = column_2
		item_1.row = row_2
		if (item_1 === actualItem_1) {
			this.add(item_1)
		}
		
		item_2.column = column_1
		item_2.row = row_1
		if (item_2 === actualItem_2) {
			this.add(item_2)
		}
	}
	
	public moveItem(item: T, targetColumn: number, targetRow: number): boolean {
		this.remove(item)
		item.column = targetColumn
		item.row = targetRow
		return this.add(item)
	}
}
