import { resolve } from 'path'
import blogHelper from './plugins/blog-helper'
import { expandMarkdownIt } from './plugins/expand-markdown-it'
import deepmerge from 'deepmerge'
import { UserThemeConfig } from '@vitepress-blog/types'

const combineDefaultConfig = (userConfig: UserThemeConfig) => {
  let mergedConfig: UserThemeConfig
  const configResolver = () => mergedConfig
  const defaultConfig = {
    cacheDir: resolve(process.cwd(), './node_modules/.vitepress'),
    markdown: {
      config: (md: any) => expandMarkdownIt(md),
      chart: {
        mermaid: {
          theme: 'dark'
        },
        plantuml: {
          server: 'https://www.plantuml.com/plantuml'
        }
      }
    },
    vite: { plugins: [blogHelper(configResolver)] },
    themeConfig: {
      outline: [1, 5],
      sortBy: 'CREATE_TIME',
      snippetsLength: 50,
      titleOrder: 'fileName',
      pagination: {
        prevText: 'Prev page',
        nextText: 'Next page',
        size: 10,
        pagerCount: 7,
        hideOnSinglePage: true
      }
    },
    head: [
      [
        'link',
        {
          rel: 'stylesheet',
          href: 'https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.5.1/katex.min.css'
        }
      ]
    ]
  }
  mergedConfig = deepmerge(defaultConfig, userConfig)
  return mergedConfig
}

function defineConfig(config: UserThemeConfig): UserThemeConfig {
  return combineDefaultConfig(config)
}

export { defineConfig }
