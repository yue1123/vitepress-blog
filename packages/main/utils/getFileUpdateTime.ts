import { spawn } from 'cross-spawn'
import { statSync } from 'fs'
/**
 * get file update time by git commit log
 * @param {string} filePath relative path
 */

export function getFileUpdateTime(filePath: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const child = spawn('git', ['log', '-1', '--pretty=format:"%ci"', filePath])
		let output = ''
		child.stdout.on('data', (d: Buffer) => (output += String(d)))
		child.on('close', () => {
			if (!output) {
				// reveal all the details
				const stat = statSync(filePath)
				return resolve(Math.floor(stat.mtimeMs))
			}
			resolve(+new Date(output))
		})
		child.on('error', reject)
	})
}
