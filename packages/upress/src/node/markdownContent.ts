import path from 'path'
import * as base64 from 'js-base64'
import { encode } from 'plantuml-encoder'
import type {
  Plugin
  // ResolvedConfig
} from 'vite'
import type { SiteConfig } from './config'

import { sharedState } from './state/shared'
import {
  appendFrontmatter,
  getFileCreateTime,
  getFileUpdateTime,
  getSnippets
  // escapeVueInCode
} from './utils'
import { mermaidCodeContainerReg, plantUmlCodeContainerReg, frontmatterReg } from './constants'

export default function MarkdownContent(userConfig: SiteConfig): Plugin {
  // let config: ResolvedConfig
  // let isProd: boolean
  // TODO: get config by siteConfig
  const createTimeCache = new Map<string, number>()
  const updateTimeCache = new Map<string, number>()
  return {
    name: 'MarkdownContent',
    enforce: 'pre',
    handleHotUpdate({ file }) {
      if (createTimeCache.get(file)) createTimeCache.delete(file)
      if (updateTimeCache.get(file)) updateTimeCache.delete(file)
    },
    async transform(code, id) {
      const isMdFile = id.endsWith('.md')
      const isPostFile = /\/posts\//.test(id)

      if (!isMdFile && !isPostFile) return code
      // For all markdown
      let _code = transformMermaid(code)
      // @ts-ignore
      _code = transformPlantUml(_code, userConfig.markdown!.chart!.plantuml.server)
      // code = escapeVueInCode(code)
      // Only for all post markdown
      if (isPostFile) {
        const { themeConfig = {} } = userConfig.site
        let tags: string[] = []
        // get createTime
        let createTime: number | void = createTimeCache.get(id)
        if (!createTime) {
          createTime = await getFileCreateTime(id)
          createTimeCache.set(id, createTime!)
        }

        // get createTime
        let updateTime: number | void = createTimeCache.get(id)
        if (!updateTime) {
          updateTime = await getFileUpdateTime(id)
          updateTimeCache.set(id, updateTime!)
        }
        // title
        let title = path.basename(id, '.md')
        // match first title reg
        let titleReg = /\x20*\# (.+)/
        if (themeConfig.titleOrder && themeConfig.titleOrder === 'contentTitle') {
          const res = _code.match(titleReg)
          if (res && res[1]) {
            title = res[1]
          }
        }
        // remove origin code title string
        _code = _code.replace(titleReg, '')
        // get tags
        if (themeConfig.filePathToTags) {
          // @ts-ignore
          tags = themeConfig.filePathToTags.reduce<string[]>((tags, { test: reg, tag }: { test: RegExp; tag: any }) => {
            if (reg.test(id)) {
              typeof tag === 'string' ? tags.push(tag) : tags.push.apply(tags, tag)
            }
            return tags
          }, [])
        }
        const frontmatter = {
          createTime,
          updateTime,
          title,
          tags,
          snippets: getSnippets(code, themeConfig.snippetsLength!),
          isPost: true
        }
        const res = appendFrontmatter(_code, frontmatter)
        sharedState.set(id, {
          code: code,
          link: id,
          frontmatter: res.match(frontmatterReg)?.[0] || ''
        })
        return res
      }
    }
  }
}

export function transformMermaid(md: string): string {
  return md.replace(mermaidCodeContainerReg, (_, options = '', code = '') => {
    code = code.trim()
    options = options.trim() || '{}'
    const encoded = base64.encode(code, true)
    return `<Mermaid :code="'${encoded}'" v-bind="${options}" />`
  })
}

export function transformPlantUml(md: string, server: string): string {
  return md.replace(plantUmlCodeContainerReg, (_, options = '', content = '') => {
    const code = encode(content.trim())
    options = options.trim() || '{}'
    return `<PlantUML :code="'${code}'" :server="'${server}'" v-bind="${options}" />`
  })
}
