import { createRequire } from "module"
const require = createRequire(import.meta.url)

export function readPackageJson() {
	return require("../package.json")
}
