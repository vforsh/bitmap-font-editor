export function assertNever(x: never, message = "Didn't expect to get here"): never {
	throw new Error(message)
}
