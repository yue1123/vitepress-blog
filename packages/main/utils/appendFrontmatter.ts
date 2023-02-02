import deepmerge from 'deepmerge'
import matter from 'gray-matter'
import { frontmatterReg } from '../constants'
import { filterObject } from './filterObject'
/**
 * append frontmatter to markdown raw code
 * @param code markdown raw code
 * @param data frontmatter data
 * @returns
 */
export function appendFrontmatter(code: string, data: Record<string, any>) {
  const matterRes = matter(code)
  if (matterRes && matterRes.data) {
    data = filterObject(deepmerge(data, matterRes.data), true, (value) => {
      return Array.isArray(value) ? value.length !== 0 : !!value
    })
  }
  return matter.stringify(code.replace(frontmatterReg, ''), data)
}
