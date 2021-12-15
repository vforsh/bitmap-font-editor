export function getBmfontProjectName(path: string): string {
	return path.split(/(.*\/)?(.+)\.project\.json/g)[2]
}
