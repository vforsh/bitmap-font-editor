import { BmFontData } from "./create-bmfont-data"

const TEMP_INFO = `<info face="$face$" size="$size$" bold="$bold$" italic="$italic$" charset="$charset$" unicode="$unicode$" stretchH="$stretchH$" smooth="$smooth$" aa="$aa$" padding="$padding$" spacing="$spacing$" />`
const TEMP_COMMON = `<common lineHeight="$lineHeight$" base="$base$" scaleW="$scaleW$" scaleH="$scaleH$" pages="$pages$" packed="$packed$" />`
const TEMP_PAGE = `<page id="$id$" file="$file$" />`
const TEMP_CHARS = `<chars count="$count$" />`
const TEMP_CHAR = `<char id="$id$" x="$x$" y="$y$" width="$width$" height="$height$" xoffset="$xoffset$" yoffset="$yoffset$" xadvance="$xadvance$" page="$page$" chnl="$chnl$" />`
const TEMP_KERNINGS = `<kernings count="$count$" />`
const TEMP_KERNING = `<kerning first="$first$" second="$second$" amount="$amount$" />`

export function createXml(data: BmFontData): XMLDocument {
	const { info, common, pages, chars, kernings } = data
	
	const parser = new DOMParser()
	const xmlDOM = document.implementation.createDocument("", "font", null)
	
	const infoDoc = parser.parseFromString(formatStr(TEMP_INFO, info), "text/xml")
	xmlDOM.documentElement.appendChild(infoDoc.childNodes[0])
	
	const commonDoc = parser.parseFromString(
		formatStr(TEMP_COMMON, common),
		"text/xml",
	)
	xmlDOM.documentElement.appendChild(commonDoc.childNodes[0])
	
	const pagesDoc = parser.parseFromString(
		`<pages>${pages.map((p) => formatStr(TEMP_PAGE, p))}</pages>`,
		"text/xml",
	)
	xmlDOM.documentElement.appendChild(pagesDoc.childNodes[0])
	
	const charsDoc = parser.parseFromString(
		formatStr(TEMP_CHARS, chars),
		"text/xml",
	)
	
	chars.list.forEach((char) => {
		const charDoc = parser.parseFromString(
			formatStr(TEMP_CHAR, char),
			"text/xml",
		)
		charsDoc.childNodes[0].appendChild(charDoc.childNodes[0])
	})
	
	xmlDOM.documentElement.appendChild(charsDoc.childNodes[0])
	
	if (kernings.count) {
		const kerningsDoc = parser.parseFromString(
			formatStr(TEMP_KERNINGS, kernings),
			"text/xml",
		)
		
		kernings.list.forEach((kerning) => {
			const kerningDoc = parser.parseFromString(
				formatStr(TEMP_KERNING, kerning),
				"text/xml",
			)
			kerningsDoc.childNodes[0].appendChild(kerningDoc.childNodes[0])
		})
		
		xmlDOM.documentElement.appendChild(kerningsDoc.childNodes[0])
	}
	
	return xmlDOM
}

export function xmlToString(xml: XMLDocument): string {
	return new XMLSerializer().serializeToString(xml)
}

function formatStr(str: string, obj: Record<string, unknown>): string {
	return str.replace(/\$\w+\$/gi, (matchs: string): string => {
		const returns = obj[matchs.replace(/\$/g, "")]
		return `${returns}` === "undefined" ? "" : `${returns}`
	})
}
