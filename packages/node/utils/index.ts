import { spawn } from 'cross-spawn'

/**
 * 通过 git 提交记录获取文件更新时间
 * @param {string} filePath 相对文件路径
 * @returns
 */
export function getFileUpdateTime(filePath: string) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn('git', ['log', '-1', '--pretty=format:"%ci"', filePath])
    let output = ''
    child.stdout.on('data', (d: Buffer) => (output += String(d)))
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}

/**
 * 通过 git 提交记录获取文件创建时间
 * @param {string} filePath 绝对文件路径
 * @returns
 */
export function getFileCreateTime(filePath: string) {
  return new Promise<number>((resolve, reject) => {
    const child = spawn('git', ['log', '--pretty=format:"%ci"', '--', filePath, '| tail -1'])
    let output = ''
    child.stdout.on('data', (d: Buffer) => {
      output = String(d)
    })
    child.on('close', () => {
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}
