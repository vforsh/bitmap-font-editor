import { GridArray, IGridArrayItem } from "./GridArray"
import { countSetBits } from "../utils/count-set-bits"
import { Direction } from "../utils/Direction"
import { assertNever } from "../utils/assert-never"

export const GridArrayUtils = {
	
	getNeighborAtDirection<T extends IGridArrayItem>(array: GridArray<T>, column: number, row: number, direction: Direction): T | undefined {
		switch (direction) {
			case Direction.UP_LEFT:
				return array.getAt(column - 1, row - 1)
			
			case Direction.UP:
				return array.getAt(column, row - 1)
			
			case Direction.UP_RIGHT:
				return array.getAt(column + 1, row - 1)
			
			case Direction.RIGHT:
				return array.getAt(column + 1, row)
			
			case Direction.DOWN_RIGHT:
				return array.getAt(column + 1, row + 1)
			
			case Direction.DOWN:
				return array.getAt(column, row + 1)
			
			case Direction.DOWN_LEFT:
				return array.getAt(column - 1, row + 1)
			
			case Direction.LEFT:
				return array.getAt(column - 1, row)
			
			default:
				assertNever(direction, "Unknown direction!")
		}
	},
	
	getNeighborsArrayAt<T extends IGridArrayItem>(array: GridArray<T>, column: number, row: number): T[] {
		return Object.values(array.getNeighborsAt(column, row))
	},
	
	getOrthoNeighborsArrayAt<T extends IGridArrayItem>(array: GridArray<T>, column: number, row: number): T[] {
		return [
			array.getAt(column, row - 1),
			array.getAt(column + 1, row),
			array.getAt(column, row + 1),
			array.getAt(column - 1, row),
		]
	},
	
	/**
	 * Bitmask in a format 0xnnnnnnnn (8 bits)
	 * The order of bits is top-left, top, top-right, right, bottom-right, bottom, bottom-left, left
	 * @return {number} Bitmask in a format 0xnnnnnnnn (8 bits)
	 */
	getNeighborsBitmask(array: GridArray<IGridArrayItem>, column: number, row: number): number {
		let mask = 0
		
		// top left
		if (array.checkAt(column - 1, row - 1)) {
			mask |= 128
		}
		
		// top
		if (array.checkAt(column, row - 1)) {
			mask |= 64
		}
		
		// top right
		if (array.checkAt(column + 1, row - 1)) {
			mask |= 32
		}
		
		// right
		if (array.checkAt(column + 1, row)) {
			mask |= 16
		}
		
		// bottom right
		if (array.checkAt(column + 1, row + 1)) {
			mask |= 8
		}
		
		// bottom
		if (array.checkAt(column, row + 1)) {
			mask |= 4
		}
		
		// bottom left
		if (array.checkAt(column - 1, row + 1)) {
			mask |= 2
		}
		
		// left
		if (array.checkAt(column - 1, row)) {
			mask |= 1
		}
		
		return mask
	},
	
	getNeighborsNum(array: GridArray<IGridArrayItem>, column: number, row: number): number {
		return countSetBits(this.getNeighborsBitmask(array, column, row))
	},
	
	/**
	 * Bitmask in a format 0xnnnn (4 bits)
	 * The order of bits is top, right, bottom, left
	 * @return {number} Bitmask in a format 0xnnnn (4 bits)
	 */
	getOrthoNeighborsBitmask(array: GridArray<IGridArrayItem>, column: number, row: number): number {
		let mask = 0
		
		// top
		if (array.checkAt(column, row - 1)) {
			mask |= 8
		}
		
		// right
		if (array.checkAt(column + 1, row)) {
			mask |= 4
		}
		
		// bottom
		if (array.checkAt(column, row + 1)) {
			mask |= 2
		}
		
		// left
		if (array.checkAt(column - 1, row)) {
			mask |= 1
		}
		
		return mask
	},
	
	getOrthoNeighborsNum(array: GridArray<IGridArrayItem>, column: number, row: number): number {
		return countSetBits(this.getOrthoNeighborsNum(array, column, row))
	},
}
