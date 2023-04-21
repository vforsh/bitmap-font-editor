export function toMs(value: { days?: number; hours?: number; minutes?: number; seconds?: number; ms?: number }): number {
	let sum = 0

	if (typeof value.days === 'number') {
		sum += value.days * 24 * 60 * 60 * 1000
	}

	if (typeof value.hours === 'number') {
		sum += value.hours * 60 * 60 * 1000
	}

	if (typeof value.minutes === 'number') {
		sum += value.minutes * 60 * 1000
	}

	if (typeof value.seconds === 'number') {
		sum += value.seconds * 1000
	}

	if (typeof value.ms === 'number') {
		sum += value.ms
	}

	return sum
}
