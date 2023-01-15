import path from 'path'
import fs from 'fs'
import type { Plugin } from 'vite'
import * as base64 from 'js-base64'
import { encode } from 'plantuml-encoder'

import { type UserThemeConfig } from '@vitepress-blog/types'
import { getFileUpdateTime, getFileCreateTime, appendFrontmatter, getSnippets, escapeVueInCode } from '../utils/index'

export default function blogHelper(userConfigResolver: () => UserThemeConfig): Plugin {
  let userConfig: UserThemeConfig
  let config: any
  const createTimeCache = new Map<string, string>()
  const updateTimeCache = new Map<string, string>()
  return {
    name: 'blog-helper',
    enforce: 'pre',
    configResolved(resolvedConfig) {
      config = resolvedConfig
      userConfig = userConfigResolver()
    },
    handleHotUpdate({ file }) {
      if (createTimeCache.get(file)) createTimeCache.delete(file)
      if (updateTimeCache.get(file)) updateTimeCache.delete(file)
    },
    async transform(code, id) {
      // For all markdown
      code = transformMermaid(code)
      // @ts-ignore
      code = transformPlantUml(code, userConfig.markdown.chart.plantuml.server)
      // code = escapeVueInCode(code)
      // Only for all post markdown
      if (!id.endsWith('.md') || !/\/posts\//.test(id)) return code
      const { themeConfig = {} } = userConfig
      let tags: string[] = []
      // get createTime
      let createTime: string | void = createTimeCache.get(id)
      if (!createTime) {
        // get file create time by git commit when build command run
        // otherwise file create time will refresh when per build on github ci environment
        if (config.command !== 'build') {
          const stat = fs.statSync(id)
          !!stat && (createTime = Math.floor(stat.birthtimeMs) + '')
        } else {
          createTime = (await getFileCreateTime(id)) + ''
        }
        createTimeCache.set(id, createTime!)
      }

      // get createTime
      let updateTime: string | void = createTimeCache.get(id)
      if (!updateTime) {
        // get file create time by git commit when build command run
        // otherwise file create time will refresh when per build on github ci environment
        if (config.command !== 'build') {
          const stat = fs.statSync(id)
          !!stat && (updateTime = Math.floor(stat.mtimeMs) + '')
        } else {
          updateTime = (await getFileUpdateTime(id)) + ''
        }
        updateTimeCache.set(id, updateTime!)
      }
      // title
      let title = path.basename(id, '.md')
      // match first title reg
      let titleReg = /\x20*\# (.+)/
      if (themeConfig.titleOrder && themeConfig.titleOrder === 'contentTitle') {
        const res = code.match(titleReg)
        if (res && res[1]) {
          title = res[1]
        }
        // remove origin code title string
        code = code.replace(titleReg, '')
      }
      // get tags
      if (themeConfig.filePathToTags) {
        tags = themeConfig.filePathToTags.reduce<string[]>((tags, { test: reg, tag }) => {
          if (reg.test(id)) {
            typeof tag === 'string' ? tags.push(tag) : tags.push.apply(tags, tag)
          }
          return tags
        }, [])
      }
      return appendFrontmatter(code, {
        createTime,
        updateTime,
        title,
        tags,
        snippets: getSnippets(code, themeConfig.snippetsLength!),
        isPost: true
      })
    }
  }
}

export function transformMermaid(md: string): string {
  return md.replace(/^```mermaid\s*?({.*?})?\n([\s\S]+?)\n```/gm, (_, options = '', code = '') => {
    code = code.trim()
    options = options.trim() || '{}'
    const encoded = base64.encode(code, true)
    return `<Mermaid :code="'${encoded}'" v-bind="${options}" />`
  })
}

export function transformPlantUml(md: string, server: string): string {
  return md.replace(/^```plantuml\s*?({.*?})?\n([\s\S]+?)\n```/gm, (_, options = '', content = '') => {
    const code = encode(content.trim())
    options = options.trim() || '{}'
    return `<PlantUML :code="'${code}'" :server="'${server}'" v-bind="${options}" />`
  })
}
