import { createHtmlElement } from './create-html-element'

export type FilePromptAccept = string | 'application/json' | 'image/*' | 'audio/*' | 'video/*'

export interface FilePromptOptions {
	fileTypes: FilePromptAccept | FilePromptAccept[]
	allowMultiple?: boolean
}

export function promptFiles(options: FilePromptOptions): Promise<File[]> {
	return new Promise<File[]>((resolve, reject) => {
		let uploadInput = createHtmlElement(`<input type="file">`) as HTMLInputElement
		uploadInput.style.display = 'none'
		uploadInput.addEventListener(
			'change',
			() => {
				let filesArr = Array.from(uploadInput.files)
				uploadInput.remove()
				resolve(filesArr)
			},
			{ once: true }
		)

		let accept = Array.isArray(options.fileTypes) ? options.fileTypes.join(', ') : options.fileTypes

		uploadInput.setAttribute('accept', accept)

		if (options.allowMultiple) {
			uploadInput.setAttribute('multiple', '')
		}

		uploadInput.click()
	})
}
