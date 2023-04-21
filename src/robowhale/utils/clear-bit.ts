export function clearBit(n: number, bit: 1 | 2 | 4 | 8 | 16 | 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096): number {
	return n & ~bit
}
