import { spawn } from 'cross-spawn'
import {
  frontmatterReg,
  imgReg,
  linkReg,
  mdFrontmatter,
  snippetsReg,
  containerReg,
  codeContainerReg
} from '../constants/index'

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
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}

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
      resolve(+new Date(output))
    })
    child.on('error', reject)
  })
}

/**
 * append frontmatter to markdown raw code
 * @param code markdown raw code
 * @param data frontmatter data
 * @returns
 */
export function appendFrontmatter(code: string, data: Record<string, any>) {
  const res = code.match(frontmatterReg)
  const frontmatterStartIndex = 0
  let frontmatterEndIndex = 0
  let frontmatterOpenContent = ''
  if (res && res[0]) {
    frontmatterOpenContent = res[0].replace(/\n---[\s\n]*$/, '')
    frontmatterEndIndex = res[0].length
  }
  const dataEntry = Object.entries(data)
  const dataFrontmatter = dataEntry
    .reduce<string[]>((frontmatterArr, [key, value]) => {
      const hasSameKeyFrontMatter = frontmatterOpenContent.indexOf(key) !== -1
      const notEmptyArray = Array.isArray(value) && value.length
      if (!hasSameKeyFrontMatter) {
        typeof value !== 'object' && frontmatterArr.push([key, value].join(': '))
        if (notEmptyArray) {
          value.unshift('')
          const _value = value.join('\n  - ')
          frontmatterArr.push(`${key}: ${_value}`)
        }
      } else {
        if (notEmptyArray) {
          const reg = new RegExp(key + '\\s*:\\s*(\\n\\s\\s\\-\\s+(.+))+', 'g')
          value.unshift('')
          const _value = value.join('\n  - ')
          frontmatterOpenContent = frontmatterOpenContent.replace(reg, (str) => {
            return str + _value
          })
        }
      }
      return frontmatterArr
    }, [])
    .join('\n')
  if (frontmatterStartIndex === 0 && frontmatterEndIndex !== 0) {
    return [frontmatterOpenContent, dataFrontmatter, '---'].join('\n') + code.slice(frontmatterEndIndex)
  } else {
    return ['---', dataFrontmatter, '---', code.slice(frontmatterEndIndex), ''].join('\n')
  }
}

export function getSnippets(code: string, length: number): string {
  return (filterHTMLTag(filterMarkdown(code)).match(snippetsReg)?.join('').slice(0, length) || '') + '...'
}

// filter markdown content
export function filterMarkdown(str: string): string {
  str = str
    .replace(frontmatterReg, '')
    .replace(imgReg, '')
    .replace(mdFrontmatter, '')
    .replace(linkReg, '')
    .replace(containerReg, '')
    .replace(codeContainerReg, '')
  return str
}
// filter html tag
export function filterHTMLTag(str: string): string {
  if (!str) return ''
  return str
    .replace(/<\/?[^>]*>/g, '')
    .replace(/[|]*\n/, '')
    .replace(/&\w+;/gi, '')
}

/**
 * Escape `{{}}` in code block to prevent Vue interpret it
 */
export function escapeVueInCode(md: string) {
  return md.replace(/{{([\w\W]*?)}}/g, '&lbrace;&lbrace;$1&rbrace;&rbrace;')
}
