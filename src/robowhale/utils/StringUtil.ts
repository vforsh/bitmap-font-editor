export class StringUtil {
	public static formatNumber(num: number): string {
		return num.toLocaleString().replace(/,/g, ' ')
	}

	public static occurrences(string: string, subString: string, allowOverlapping: boolean): number {
		string += ''
		subString += ''
		if (subString.length <= 0) {
			return string.length + 1
		}

		let n: number = 0
		let pos: number = 0
		let step: number = allowOverlapping ? 1 : subString.length

		while (true) {
			pos = string.indexOf(subString, pos)
			if (pos >= 0) {
				++n
				pos += step
			} else break
		}

		return n
	}
}
