import { spawn } from 'cross-spawn'
import { statSync } from 'node:fs'

/**
 * get file create time by git commit log
 * @param {string} filePath relative path
 */

export function getFileCreateTime(filePath: string): Promise<number> {
  return new Promise<number>((resolve, reject) => {
    const child = spawn('git', [
      'log',
      '--pretty=format:"%ci"',
      '--',
      filePath,
      '| tail -1'
    ])
    let output: string | void
    child.stdout.on('data', (d: Buffer) => {
      output = d
        .toString()
        .split(/\n|\n\r/)
        .pop()
    })
    child.on('close', () => {
      if (!output) {
        // reveal all the details
        const stat = statSync(filePath)
        return resolve(Math.floor(stat.birthtimeMs))
      }
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
