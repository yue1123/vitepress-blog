import { spawn } from 'cross-spawn'
import { statSync } from 'node:fs'

/**
 * get file create time by git commit log
 * @param {string} filePath relative path
 */

export function getFileCreateTime(filePath: string): Promise<number> {
	return new Promise<number>((resolve, reject) => {
		const child = spawn('git', ['log', '--pretty=format:"%ci"', '--', filePath, '| tail -1'])
		let output = ''
		child.stdout.on('data', (d: Buffer) => {
			output = String(d)
		})
		child.on('close', () => {
			if (!output) {
				// reveal all the details
				const stat = statSync(filePath)
				return resolve(Math.floor(stat.birthtimeMs))
			}
			resolve(new Date(output).getTime())
		})
		child.on('error', reject)
	})
}
