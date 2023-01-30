import https from 'https'

const mustTag = 'vitepress-blog-theme'
export function checkUserInputTheme(name: string, version?: string) {
	return new Promise<boolean>((resolve, reject) => {
		https
			.get(`https://registry.npmjs.org/${name}`, (response) => {
				let res = ''
				response.on('data', (chunk) => {
					res += chunk
				})

				// called when the complete response is received.
				response.on('end', () => {
					const data = JSON.parse(res)
					if (data.error) return reject(data.error)
					if (!version) version = data['dist-tags'].latest
					if (!data.versions[version!]) {
						reject('Invalid version')
					} else if (
						!data.versions[version!].keywords ||
						data.versions[version!].keywords.indexOf(mustTag) === -1
					) {
						reject(`Invalid community theme package`)
					} else {
						resolve(true)
					}
				})
			})
			.on('error', (error) => {
				reject(error)
			})
	})
}
