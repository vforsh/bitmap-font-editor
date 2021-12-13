const getSystemFonts = require("get-system-fonts")
const ttfinfo = require("ttfinfo")
const slash = require('slash')

module.exports = function(req, res, next) {
	let data = ""
	req.on("data", chunk => data += chunk)
	req.on("end", async () => {
		let { fonts } = JSON.parse(data)

		getFontsList(fonts).then((fonts) => {
			res.writeHead(200, { "Content-Type": "application/json" })
			res.end(JSON.stringify(fonts))
		})
	})
}

async function getFontsList(fontsToInclude) {
	let fontPaths = await getSystemFonts()
	let fonts = await Promise.all(
		fontPaths
			.filter(fontPath => fontPath.endsWith(".ttf"))
			.map(fontPath => getFontData(fontPath)),
	)

	let fontsMap = fonts
		.filter(Boolean)
		.filter((font) => {
			if (!fontsToInclude || fontsToInclude.length === 0) {
				return true
			}

			let { name, fullname } = font
			return fontsToInclude.some(include => fullname.includes(include) || name.includes(include))
		})
		.reduce((acc, font) => {
			acc[font.name] = font
			return acc
		}, {})

	return fontsMap
}

function getFontData(filepath) {
	return new Promise((resolve, reject) => {
		ttfinfo(filepath, (err, fontData) => {
			if (err) {
				resolve()
				return
			}

			let info = fontData.tables.name
			if (!info) {
				resolve()
				return
			}

			resolve({
				path: slash(filepath),
				name: info["1"],
				style: info["2"],
				postScriptName: info["4"],
				fullname: info["6"],
			})
		})
	})
}
