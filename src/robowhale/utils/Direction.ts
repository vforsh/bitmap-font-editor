export enum Direction {
	UP_LEFT = 'UP_LEFT',
	UP = 'UP',
	UP_RIGHT = 'UP_RIGHT',
	RIGHT = 'RIGHT',
	DOWN_RIGHT = 'DOWN_RIGHT',
	DOWN = 'DOWN',
	DOWN_LEFT = 'DOWNM_LEFT',
	LEFT = 'LEFT',
}

export type DirectionOrtho = Direction.UP | Direction.RIGHT | Direction.DOWN | Direction.LEFT

export function getOrthoDirection(angleDeg: number): DirectionOrtho {
	if (angleDeg > -135 && angleDeg <= -45) {
		return Direction.UP
	} else if (angleDeg > -45 && angleDeg <= 45) {
		return Direction.RIGHT
	} else if (angleDeg > 45 && angleDeg <= 135) {
		return Direction.DOWN
	} else {
		return Direction.LEFT
	}
}

export function getDirection(angleDeg: number): Direction {
	// TODO implement more granular direction detection

	/*if (angleDeg > -135 && angleDeg <= -45) {
		return Direction.UP
	} else if (angleDeg > -45 && angleDeg <= 45) {
		return Direction.RIGHT
	} else if (angleDeg > 45 && angleDeg <= 135) {
		return Direction.DOWN
	} else {
		return Direction.LEFT
	}*/

	return Direction.UP
}

export function getAngleByDirection(direction: Direction): number {
	switch (direction) {
		case Direction.UP:
			return 0

		case Direction.UP_RIGHT:
			return 45

		case Direction.RIGHT:
			return 90

		case Direction.DOWN_RIGHT:
			return 135

		case Direction.DOWN:
			return 180

		case Direction.DOWN_LEFT:
			return 225

		case Direction.LEFT:
			return -90

		case Direction.UP_LEFT:
			return -45

		default:
			let x: never = direction
			break
	}
}

export function getOppositeDirection(direction: Direction): Direction {
	switch (direction) {
		case Direction.UP:
			return Direction.DOWN

		case Direction.UP_RIGHT:
			return Direction.DOWN_LEFT

		case Direction.RIGHT:
			return Direction.LEFT

		case Direction.DOWN_RIGHT:
			return Direction.UP_LEFT

		case Direction.DOWN:
			return Direction.UP

		case Direction.DOWN_LEFT:
			return Direction.UP_RIGHT

		case Direction.LEFT:
			return Direction.RIGHT

		case Direction.UP_LEFT:
			return Direction.DOWN_RIGHT

		default:
			let x: never = direction
			break
	}
}
